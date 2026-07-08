// src/lib/db.ts

import { Pool } from 'pg';

const connectionString = import.meta.env.DB_URL ?? process.env.DB_URL;

export const hasDatabaseUrl = Boolean(connectionString);

export const pool = connectionString
  ? new Pool({
      connectionString,
    })
  : null;