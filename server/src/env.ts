import 'dotenv/config';
import { z } from 'zod';

Error.stackTraceLimit = 1000;

const parseEnvNamespace = (namespace: string, rawEnv: Record<string, unknown>) => {
  return Object.keys(rawEnv).reduce((memo, key) => {
    if (!key.startsWith(namespace)) return memo;
    const massagedKey = key.replace(`${namespace}_`, '');
    return {
      ...memo,
      [massagedKey]: rawEnv[key],
    };
  }, {});
};
const envSchema = z.object({
  DATABASE_URL: z.string().default('postgresql://postgres:proxy_password@localhost:65432/furizu'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('127.0.0.1'),
  DEFAULT_QUOTA_BYTES: z.coerce.number().default(107_374_182_400),
  TIGRIS: z.object({
    ACCESS_KEY_ID: z.string(),
    ENDPOINT_URL_S3: z.string().url(),
    REGION: z.string(),
    SECRET_ACCESS_KEY: z.string(),
    BUCKET_NAME: z.string(),
    PROVIDER_NAME: z.string().default('tigris'),
  }),
});

export const env = envSchema.parse({
  ...process.env,
  TIGRIS: parseEnvNamespace('TIGRIS', process.env),
});
