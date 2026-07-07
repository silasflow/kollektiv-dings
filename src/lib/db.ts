// src/lib/db.ts

import { Pool } from 'pg';

const connectionString = import.meta.env.DB_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DB_URL is missing');
}

export const pool = new Pool({
  connectionString,
});
