import type { APIRoute } from "astro";
import type { PoolClient } from "pg";
import { pool } from "../../lib/db";
import type { PlaceRole, PlaceSelection, PlaceType } from "../../types/places";

export const prerender = false;

const ALLOWED_ROLES = new Set<PlaceRole>(["base", "project", "activity_area"]);

const ALLOWED_PLACE_TYPES = new Set<PlaceType>([
  "poi",
  "neighbourhood",
  "district",
  "city",
  "region",
  "country",
  "continent",
  "unknown",
]);

export const GET: APIRoute = async () => {
  if (!pool) {
    return json(
      {
        ok: false,
        error: "DB_URL is missing",
        results: [],
      },
      503,
    );
  }

  try {
    const { rows } = await pool.query(`
      select
        tr.id,
        tr.created_at,
        tr.lang,
        tr.collective_name,
        tr.website,
        tr.instagram,
        tr.location,
        tr.region,
        tr.country,
        tr.consent_public,
        tr.answers,
        tr.result,
        coalesce(place_rows.places, '[]'::jsonb) as places
      from public.test_results tr
      left join lateral (
        select jsonb_agg(
          jsonb_build_object(
            'provider', p.provider,
            'providerPlaceId', p.provider_place_id,
            'displayName', p.display_name,
            'placeType', p.place_type,
            'postalCode', coalesce(p.postal_code, ''),
            'neighbourhood', coalesce(p.neighbourhood, ''),
            'district', coalesce(p.district, ''),
            'city', coalesce(p.city, ''),
            'region', coalesce(p.region, ''),
            'country', coalesce(p.country, ''),
            'countryCode', coalesce(p.country_code, ''),
            'latitude', p.latitude,
            'longitude', p.longitude,
            'role', trp.role,
            'isPrimary', trp.is_primary
          )
          order by
            case trp.role
              when 'base' then 1
              when 'project' then 2
              else 3
            end,
            trp.is_primary desc,
            p.display_name
        ) as places
        from public.test_result_places trp
        join public.places p on p.id = trp.place_id
        where trp.test_result_id = tr.id
      ) place_rows on true
      where tr.consent_public = true
      order by tr.created_at desc
      limit 500
    `);

    return json({
      ok: true,
      count: rows.length,
      results: rows.map((row) => ({
        id: row.id,
        createdAt: row.created_at,
        lang: row.lang,
        collectiveName: row.collective_name,
        website: row.website,
        instagram: row.instagram,
        location: row.location,
        region: row.region,
        country: row.country,
        places: row.places,
        consentPublic: row.consent_public,
        answers: row.answers,
        result: row.result,
      })),
    });
  } catch (error) {
    console.error("[api/test-results GET] database error", error);
    return json(
      {
        ok: false,
        error: "Could not load test results",
        results: [],
      },
      500,
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  if (!pool) {
    return json({ ok: false, error: "DB_URL is missing" }, 503);
  }

  let client: PoolClient | null = null;

  try {
    const body: unknown = await request.json();

    if (!isRecord(body)) {
      return json({ ok: false, error: "Invalid JSON body" }, 400);
    }

    const lang = body.lang === "en" ? "en" : body.lang === "de" ? "de" : null;
    const answers = isRecord(body.answers) ? body.answers : null;
    const result = isRecord(body.result) ? body.result : null;

    if (!lang || !answers || !result) {
      return json({ ok: false, error: "Missing required fields" }, 400);
    }

    const places = sanitizePlaces(body.places);
    const clientSubmissionId = optionalText(body.id, 100);
    const collectiveName = optionalText(body.collectiveName, 240);
    const website = optionalText(body.website, 500);
    const instagram = optionalText(body.instagram, 500);
    const location = optionalText(body.location, 300);
    const region = optionalText(body.region, 300);
    const country = optionalText(body.country, 200);
    const consentPublic = body.consentPublic === true;

    client = await pool.connect();
    await client.query("begin");

    const resultInsert = await client.query(
      `
        insert into public.test_results (
          client_submission_id,
          lang,
          collective_name,
          website,
          instagram,
          location,
          region,
          country,
          consent_public,
          answers,
          result
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb)
        on conflict (client_submission_id)
          where client_submission_id is not null
        do update set
          client_submission_id = excluded.client_submission_id
        returning id, created_at
      `,
      [
        clientSubmissionId,
        lang,
        collectiveName,
        website,
        instagram,
        location,
        region,
        country,
        consentPublic,
        JSON.stringify(answers),
        JSON.stringify(result),
      ],
    );

    const savedResult = resultInsert.rows[0];

    for (const place of places) {
      const placeId = await upsertPlace(client, place);

      await client.query(
        `
          insert into public.test_result_places (
            test_result_id,
            place_id,
            role,
            is_primary
          )
          values ($1, $2, $3, $4)
          on conflict (test_result_id, place_id, role) do update set
            is_primary = excluded.is_primary
        `,
        [savedResult.id, placeId, place.role, place.isPrimary],
      );
    }

    await client.query("commit");

    return json(
      {
        ok: true,
        result: {
          id: savedResult.id,
          createdAt: savedResult.created_at,
        },
      },
      201,
    );
  } catch (error) {
    if (client) {
      await client.query("rollback").catch(() => undefined);
    }

    console.error("[api/test-results POST] transaction failed", error);
    return json(
      {
        ok: false,
        error: "Could not save test result",
      },
      500,
    );
  } finally {
    client?.release();
  }
};

async function upsertPlace(
  client: PoolClient,
  place: PlaceSelection,
): Promise<string> {
  const { rows } = await client.query(
    `
      insert into public.places (
        provider,
        provider_place_id,
        display_name,
        place_type,
        postal_code,
        neighbourhood,
        district,
        city,
        region,
        country,
        country_code,
        latitude,
        longitude
      )
      values (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13
      )
      on conflict (provider, provider_place_id) do update set
        display_name = excluded.display_name,
        place_type = excluded.place_type,
        postal_code = excluded.postal_code,
        neighbourhood = excluded.neighbourhood,
        district = excluded.district,
        city = excluded.city,
        region = excluded.region,
        country = excluded.country,
        country_code = excluded.country_code,
        latitude = excluded.latitude,
        longitude = excluded.longitude,
        updated_at = now()
      returning id
    `,
    [
      place.provider,
      place.providerPlaceId,
      place.displayName,
      place.placeType,
      nullable(place.postalCode),
      nullable(place.neighbourhood),
      nullable(place.district),
      nullable(place.city),
      nullable(place.region),
      nullable(place.country),
      nullable(place.countryCode.toUpperCase()),
      place.latitude,
      place.longitude,
    ],
  );

  return rows[0].id as string;
}

function sanitizePlaces(value: unknown): PlaceSelection[] {
  if (!Array.isArray(value)) return [];

  const places: PlaceSelection[] = [];
  let hasPrimaryBase = false;

  for (const item of value.slice(0, 30)) {
    if (!isRecord(item)) continue;

    const provider = requiredText(item.provider, 80);
    const providerPlaceId = requiredText(item.providerPlaceId, 180);
    const displayName = requiredText(item.displayName, 800);
    const role = ALLOWED_ROLES.has(item.role as PlaceRole)
      ? (item.role as PlaceRole)
      : null;
    const placeType = ALLOWED_PLACE_TYPES.has(item.placeType as PlaceType)
      ? (item.placeType as PlaceType)
      : "unknown";

    if (!provider || !providerPlaceId || !displayName || !role) continue;

    const wantsPrimary = role === "base" && item.isPrimary === true;
    const isPrimary = wantsPrimary && !hasPrimaryBase;
    if (isPrimary) hasPrimaryBase = true;

    places.push({
      provider,
      providerPlaceId,
      displayName,
      placeType,
      postalCode: optionalText(item.postalCode, 40) ?? "",
      neighbourhood: optionalText(item.neighbourhood, 240) ?? "",
      district: optionalText(item.district, 240) ?? "",
      city: optionalText(item.city, 240) ?? "",
      region: optionalText(item.region, 240) ?? "",
      country: optionalText(item.country, 240) ?? "",
      countryCode: optionalText(item.countryCode, 2) ?? "",
      latitude: coordinate(item.latitude, -90, 90),
      longitude: coordinate(item.longitude, -180, 180),
      role,
      isPrimary,
    });
  }

  if (!hasPrimaryBase) {
    const firstBase = places.find((place) => place.role === "base");
    if (firstBase) firstBase.isPrimary = true;
  }

  return deduplicatePlaces(places);
}

function deduplicatePlaces(places: PlaceSelection[]): PlaceSelection[] {
  const known = new Set<string>();

  return places.filter((place) => {
    const key = `${place.provider}:${place.providerPlaceId}:${place.role}`;
    if (known.has(key)) return false;
    known.add(key);
    return true;
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requiredText(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function optionalText(value: unknown, maxLength: number): string | null {
  const text = requiredText(value, maxLength);
  return text || null;
}

function coordinate(value: unknown, min: number, max: number): number | null {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
    ? value
    : null;
}

function nullable(value: string): string | null {
  return value.trim() || null;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
