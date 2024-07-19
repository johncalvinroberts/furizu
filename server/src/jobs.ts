import { eq, count, sql } from 'drizzle-orm';
import { genUUID } from 'electric-sql/util';
import bcrypt from 'bcrypt';
import { db } from './db';
import { file_chunks, jobs, files, quotas, users } from './schema';
import { Job, SignupJob, FileCreatedJob } from './types';
import { env } from './env';
import { initS3LikeClient } from './s3';
import { server } from './server';
import { propagateToS3likeObjectStore } from './files';

const tigrisClient = initS3LikeClient({
  region: env.TIGRIS.REGION,
  accessKeyId: env.TIGRIS.ACCESS_KEY_ID,
  secretAccessKey: env.TIGRIS.SECRET_ACCESS_KEY,
  endpoint: env.TIGRIS.ENDPOINT_URL_S3,
  name: 'tigris',
});

const handleSignUp = async (job: SignupJob) => {
  const { password, email, id } = job.payload;
  // Generate a salt and hash the password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const results = await db.select().from(users).where(eq(users.id, id));
  const user = results[0];
  if (!user) {
    throw new Error(`User not found: ${id}`);
  }
  if (user.unprovisional_at != null) {
    throw new Error(`User already not provisional`);
  }

  const update = {
    password: hashedPassword,
    email,
    unprovisional_at: new Date(),
    updated_at: new Date(),
  };

  await db.update(users).set(update).where(eq(users.id, id));
  await db
    .update(jobs)
    .set({
      progress: 100,
      completed_at: new Date(),
      result: {},
      payload: 'redacted',
    })
    .where(eq(jobs.id, job.id));
};

const handleProvisionalUserCreated = async (job: Job) => {
  const userId = job.electric_user_id;
  const id = genUUID();
  await db.insert(quotas).values({
    id,
    electric_user_id: userId,
    bytes_total: BigInt(env.DEFAULT_QUOTA_BYTES),
    bytes_used: BigInt(0),
    created_at: new Date(),
    updated_at: new Date(),
  });
};

const handleFileCreated = async (job: FileCreatedJob) => {
  const fileId = job.payload.id;
  try {
    const [quota] = await db
      .select()
      .from(quotas)
      .where(eq(quotas.electric_user_id, job.electric_user_id));
    const [file] = await db.select().from(files).where(eq(files.id, fileId));
    const bytes_remaining = quota.bytes_total - quota.bytes_used;
    if (file.size > bytes_remaining) {
      server.log.error('cannot propagate file, user quota no space left');
      db.update(files).set({ state: 'propagation_backlogged' }).where(eq(files.id, fileId));
      return;
    }
    await db.update(files).set({ state: 'propagating' }).where(eq(files.id, fileId));
    server.log.info('fetched file from db', file);
    const [{ count: chunkCount }] = await db
      .select({ count: count() })
      .from(file_chunks)
      .where(eq(file_chunks.file_id, fileId));
    // start with tigris
    await propagateToS3likeObjectStore({
      client: tigrisClient,
      bucketName: env.TIGRIS.BUCKET_NAME,
      fileId,
      chunkCount,
      userId: file.electric_user_id,
    });
    await Promise.all([
      db.update(quotas).set({ bytes_used: sql`${quotas.bytes_used} + ${file.size}` }),
      db.update(files).set({ state: 'done' }).where(eq(files.id, fileId)),
      db.delete(file_chunks).where(eq(file_chunks.file_id, fileId)),
    ]);
    server.log.info('completed propagation and deleting file chunks');
  } catch (error) {
    server.log.error(error);
    await db.update(files).set({ state: 'error' }).where(eq(files.id, fileId));
  }
};

export const processJob = async (rawJobString: string) => {
  const job = JSON.parse(rawJobString) as Job;
  server.log.info(`received ${job.command} job`);
  job.payload = JSON.parse(job.payload as string);
  server.log.info(job);
  try {
    switch (job.command) {
      case 'provisional_user_created':
        await handleProvisionalUserCreated(job);
        break;
      case 'signup':
        await handleSignUp(job as SignupJob);
        break;
      case 'file_created':
        await handleFileCreated(job as FileCreatedJob);
        break;
      default:
        throw new Error('unknown job type created');
    }
  } catch (error) {
    console.error(error);
    const message = error.message as string;
    await db
      .update(jobs)
      .set({ errored_at: new Date(), errored_reason: message })
      .where(eq(jobs.id, job.id));
  }
};
