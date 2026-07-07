// src/lib/db.ts

import { Pool } from 'pg';

if (!import.meta.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing');
}

export const pool = new Pool({
  connectionString: import.meta.env.DATABASE_URL,
});