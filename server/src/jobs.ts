import { eq, count, sql } from 'drizzle-orm';
import { genUUID } from 'electric-sql/util';
import bcrypt from 'bcrypt';
import { db } from './db';
import { file_chunks, jobs, files, quotas, users } from './schema';
import { Job, SignupJob, FileCreatedJob, CreateDownloadJob } from './types';
import { env } from './env';

import { server } from './server';
import { createDownloadURL, propagateToS3likeObjectStore } from './files';

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
  server.log.info('handleProvisionalUserCreated: inserting user quoats');
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
  server.log.info('handleProvisionalUserCreated: inserted user quota');
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
      server.log.error('handleFileCreated: cannot propagate file, user quota no space left');
      db.update(files).set({ state: 'propagation_backlogged' }).where(eq(files.id, fileId));
      return;
    }
    await db.update(files).set({ state: 'propagating' }).where(eq(files.id, fileId));
    server.log.info('fetched file from db', file);
    const [{ count: chunkCount }] = await db
      .select({ count: count() })
      .from(file_chunks)
      .where(eq(file_chunks.file_id, fileId));
    // start with tigris + aws s3
    // TODO: this should be extended to use location providers as a DB table, and/or each individual location as a separate background job
    await Promise.all([
      propagateToS3likeObjectStore({
        providerName: 'tigris',
        bucketName: env.TIGRIS.BUCKET_NAME,
        fileId,
        chunkCount,
        userId: file.electric_user_id,
        providerDisplayName: `Tigris - ${env.TIGRIS.REGION}`,
      }),
      propagateToS3likeObjectStore({
        providerName: 'aws_s3',
        providerDisplayName: `AWS S3 - ${env.AWS.REGION}`,
        bucketName: env.AWS.BUCKET_NAME,
        fileId,
        chunkCount,
        userId: file.electric_user_id,
      }),
    ]);
    server.log.info(`handleFileCreated: Finished propagating`);
    await Promise.all([
      db.update(quotas).set({ bytes_used: sql`${quotas.bytes_used} + ${file.size}` }),
      db.update(files).set({ state: 'done' }).where(eq(files.id, fileId)),
      db.delete(file_chunks).where(eq(file_chunks.file_id, fileId)),
    ]);
    server.log.info('handleFileCreated: completed propagation and deleting file chunks');
  } catch (error) {
    server.log.error(error);
    await db.update(files).set({ state: 'error' }).where(eq(files.id, fileId));
    throw error;
  }
};

const handleCreateDownload = async (job: CreateDownloadJob) => {
  const { fileId, locationId } = job.payload;
  server.log.info('handleCreateDownload: creating a signed download URL', { fileId, locationId });
  const downloadURL = await createDownloadURL(fileId, locationId);
  await db
    .update(jobs)
    .set({
      progress: 100,
      completed_at: new Date(),
      result: {
        downloadURL,
      },
    })
    .where(eq(jobs.id, job.id));
  server.log.info(
    'handleCreateDownload: finished creating a signed download URL and updated job in db',
    { fileId, locationId },
  );
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
      case 'create_download':
        await handleCreateDownload(job as CreateDownloadJob);
        break;
      default:
        throw new Error('unknown job type created');
    }
  } catch (error) {
    server.log.error('processJob: failed to process job');
    server.log.error(error);
    const message = error.message as string;
    await db
      .update(jobs)
      .set({ errored_at: new Date(), errored_reason: message })
      .where(eq(jobs.id, job.id));
  }
};
