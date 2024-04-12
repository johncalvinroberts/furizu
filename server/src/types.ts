import { InferSelectModel } from 'drizzle-orm';
import { jobs, JobCommands } from './schema';

export type JobCommand = (typeof JobCommands)[number];

export type Job<C = JobCommand, P = unknown, R = unknown> = InferSelectModel<typeof jobs> & {
  payload: P;
  result: R;
  command: C;
};

export type SignupJob = Job<
  'signup',
  { password: string; email: string; id: string },
  { accepted: boolean }
>;
