// src/pages/api/test-results.ts

import type { APIRoute } from 'astro';
import { pool } from '../../lib/db';

export const prerender = false;

export const GET: APIRoute = async () => {
  console.log('[api/test-results GET] route reached');
   if (!pool) {
    return new Response(
      JSON.stringify({ error: 'DB_URL is missing' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const { rows } = await pool.query(
      `
      select
        id,
        created_at,
        lang,
        collective_name,
        website_or_instagram,
        location,
        consent_public,
        answers,
        result
      from public.test_results
      where consent_public = true
      order by created_at desc
      limit 200
      `
    );

    console.log('[api/test-results GET] database connected', {
      count: rows.length,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        count: rows.length,
        results: rows.map((row) => ({
          id: row.id,
          createdAt: row.created_at,
          lang: row.lang,
          collectiveName: row.collective_name,
          websiteOrInstagram: row.website_or_instagram,
          location: row.location,
          consentPublic: row.consent_public,
          answers: row.answers,
          result: row.result,
        })),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[api/test-results GET] database error', error);

    return new Response(
      JSON.stringify({ error: 'Could not load test results' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  console.log('[api/test-results POST] route reached');

  if (!pool) {
  return new Response(
    JSON.stringify({ error: 'DB_URL is missing' }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

  try {
    const body = await request.json();

    console.log('[api/test-results POST] body received', {
      hasLang: Boolean(body.lang),
      hasAnswers: Boolean(body.answers),
      hasResult: Boolean(body.result),
      collectiveName: body.collectiveName,
      websiteOrInstagram: body.websiteOrInstagram,
      location: body.location,
      consentPublic: body.consentPublic,
    });

    const {
      lang,
      collectiveName,
      websiteOrInstagram,
      location,
      consentPublic,
      answers,
      result,
    } = body;

    if (!lang || !answers || !result) {
      console.error('[api/test-results POST] missing required fields');

      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const query = `
      insert into public.test_results (
        lang,
        collective_name,
        website_or_instagram,
        location,
        consent_public,
        answers,
        result
      )
      values ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb)
      returning id, created_at
    `;

    const values = [
      lang,
      collectiveName?.trim() || null,
      websiteOrInstagram?.trim() || null,
      location?.trim() || null,
      Boolean(consentPublic),
      JSON.stringify(answers),
      JSON.stringify(result),
    ];

    console.log('[api/test-results POST] inserting into database');

    const { rows } = await pool.query(query, values);

    console.log('[api/test-results POST] saved successfully', {
      id: rows[0]?.id,
      createdAt: rows[0]?.created_at,
    });

    return new Response(
      JSON.stringify({ ok: true, result: rows[0] }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[api/test-results POST] database or insert error', error);

    return new Response(
      JSON.stringify({ error: 'Could not save test result' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};