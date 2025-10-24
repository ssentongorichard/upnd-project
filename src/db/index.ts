import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a Neon HTTP client for serverless Postgres
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
