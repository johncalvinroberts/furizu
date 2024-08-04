import { JobCommands } from '@shared/types';
import { useLiveQuery } from 'electric-sql/react';
import { genUUID } from 'electric-sql/util';
import { useCallback } from 'react';

import { Jobs } from '@/generated/client';
import { useElectric } from '@/lib/electric';

export type JobCommand = (typeof JobCommands)[number];

export const useJobs = () => {
  const { db } = useElectric()!;

  const createJob = useCallback(
    async (cmd: { command: JobCommand; payload: unknown; userId: string }) => {
      const { command, payload, userId } = cmd;
      const id = genUUID();
      await db.jobs.create({
        data: {
          id,
          created_at: new Date(),
          updated_at: new Date(),
          payload: JSON.stringify(payload),
          command,
          progress: 0,
          electric_user_id: userId,
        },
      });
      return id;
    },
    [db],
  );

  return { createJob };
};

export const useJobById = (id: string | undefined): { job: Jobs | null | undefined } => {
  const { db } = useElectric()!;
  // TODO: if id is null, can we just...not make a query?
  const results = useLiveQuery(db.jobs.liveFirst({ where: { id } }));
  if (!id) return { job: null };
  return { job: results.results };
};
