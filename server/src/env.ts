import 'dotenv/config';
import { z } from 'zod';

Error.stackTraceLimit = 1000;

const envSchema = z.object({
  DATABASE_URL: z.string().default('postgresql://postgres:proxy_password@localhost:65432/furizu'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('127.0.0.1'),
  DEFAULT_QUOTA_BYTES: z.coerce.number().default(107_374_182_400),
});

export const env = envSchema.parse(process.env);
