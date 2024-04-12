import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { env } from './env';

if (!env.DATABASE_URL) {
  console.error('process.env.DATABASE_URL is not defined');
  process.exit(1);
}
export const sql = postgres(env.DATABASE_URL, { max: 2 });

export const db = drizzle(sql);
