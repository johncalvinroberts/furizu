import { eq } from 'drizzle-orm';
import { db } from './db';
import { jobs, quotas, users } from './schema';
import bcrypt from 'bcrypt';
import { Job, SignupJob } from './types';
import { env } from './env';
import { genUUID } from 'electric-sql/util';

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

export const processJob = async (rawJobString: string) => {
  const job = JSON.parse(rawJobString) as Job;
  job.payload = JSON.parse(job.payload as string);
  try {
    switch (job.command) {
      case 'provisional_user_created':
        await handleProvisionalUserCreated(job);
        break;
      case 'signup':
        console.log('user signed up');
        await handleSignUp(job as SignupJob);
        break;
      default:
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
