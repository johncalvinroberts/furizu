import 'dotenv/config';
import { z } from 'zod';
import { NEW_USER_DEFAULT_QUOTA_BYTES } from '@shared/constants';

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
  DEFAULT_QUOTA_BYTES: z.coerce.number().default(NEW_USER_DEFAULT_QUOTA_BYTES),
  TIGRIS: z.object({
    ACCESS_KEY_ID: z.string(),
    ENDPOINT_URL_S3: z.string().url(),
    REGION: z.string(),
    SECRET_ACCESS_KEY: z.string(),
    BUCKET_NAME: z.string(),
    PROVIDER_NAME: z.string().default('tigris'),
  }),
  AWS: z.object({
    ACCESS_KEY_ID: z.string(),
    SECRET_ACCESS_KEY: z.string(),
    ENDPOINT_URL_S3: z.string().url(),
    REGION: z.string(),
    BUCKET_NAME: z.string(),
    PROVIDER_NAME: z.string().default('aws_s3'),
  }),
});

export const env = envSchema.parse({
  ...process.env,
  TIGRIS: parseEnvNamespace('TIGRIS', process.env),
  AWS: parseEnvNamespace('AWS', process.env),
});
