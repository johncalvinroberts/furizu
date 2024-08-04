import { InferSelectModel } from 'drizzle-orm';
import { jobs } from './schema';
import { JobCommands } from '@shared/types';

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

export type FileCreatedJob = Job<'file_created', { id: string }>;
export type CreateDownloadJob = Job<
  'create_download',
  { fileId: string; locationId: string },
  { downloadURL?: string }
>;
