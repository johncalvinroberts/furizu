import { drizzle } from "drizzle-orm/postgres-js";
import * as dotenv from "dotenv";
import postgres from "postgres";

Error.stackTraceLimit = 1000;

dotenv.config();
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("process.env.DATABASE_URL is not defined");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 1 });

export const db = drizzle(sql);
