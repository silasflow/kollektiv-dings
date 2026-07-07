// src/pages/api/test-results.ts

import type { APIRoute } from 'astro';
import { pool } from '../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

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
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
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

    const { rows } = await pool.query(query, values);

    return new Response(
      JSON.stringify({ ok: true, result: rows[0] }),
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({ error: 'Could not save test result' }),
      { status: 500 }
    );
  }
};