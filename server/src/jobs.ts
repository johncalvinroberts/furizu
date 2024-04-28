import { eq, count, and } from 'drizzle-orm';
import { db } from './db';
import { file_chunks, jobs, files, quotas, users } from './schema';
import bcrypt from 'bcrypt';
import { Job, SignupJob, FileCreatedJob } from './types';
import { env } from './env';
import { genUUID } from 'electric-sql/util';
import { initS3LikeClient } from './s3';
import { server } from './server';

const tigrisClient = initS3LikeClient({
  region: env.TIGRIS.REGION,
  accessKeyId: env.TIGRIS.ACCESS_KEY_ID,
  secretAccessKey: env.TIGRIS.SECRET_ACCESS_KEY,
  endpoint: env.TIGRIS.ENDPOINT_URL_S3,
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
  const [file] = await db.select().from(files).where(eq(files.id, fileId));
  server.log.info('fetched file from db', file);
  const [{ count: chunkCount }] = await db
    .select({ count: count() })
    .from(file_chunks)
    .where(eq(file_chunks.file_id, fileId));
  const bucketName = env.TIGRIS.BUCKET_NAME;
  server.log.info(
    `initializing iterative multipart chunk upload: ${JSON.stringify({
      file_id: file.id,
      chunkCount,
    })}`,
  );
  const uploadId = await tigrisClient.initiateMultipartUpload(bucketName, file.name);
  server.log.info(`created multipart upload: ${uploadId}`);
  const parts = await tigrisClient.uploadChunks({
    bucketName,
    key: fileId,
    uploadId,
    totalChunks: chunkCount,
    getChunkData: async (index: number) => {
      const [chunk] = await db
        .select()
        .from(file_chunks)
        .where(and(eq(file_chunks.file_id, fileId), eq(file_chunks.chunk_index, index)));
      if (!chunk) throw new Error('chunk not found');
      return { data: chunk.data };
    },
  });
  await tigrisClient.completeMultipartUpload({ parts, uploadId, bucketName, key: file.name });
  // TODO: delete chunks? or upload to other clouds?
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
      default:
        throw new Error('unknown job type crated');
        break;
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
