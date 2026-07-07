// src/lib/db.ts

import { Pool } from 'pg';

const connectionString = import.meta.env.DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is missing');
}

export const pool = new Pool({
  connectionString,
});
