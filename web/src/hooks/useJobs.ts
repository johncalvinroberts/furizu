import { genUUID } from 'electric-sql/util';
import { useCallback } from 'react';

import { useElectric } from '@/lib/electric';

const JobCommands = ['provisional_user_created', 'signup', 'file_created'] as const;

export type JobCommand = (typeof JobCommands)[number];

export const useJobs = () => {
  const { db } = useElectric()!;

  const createJob = useCallback(
    async (cmd: { command: JobCommand; payload: unknown; userId: string }) => {
      const { command, payload, userId } = cmd;
      const id = genUUID();
      console.log('@@@@@@@@@@@@@@@@@@@@@@@@@');
      console.log(JSON.stringify(payload));
      await db.jobs.create({
        data: {
          id,
          created_at: new Date(),
          updated_at: new Date(),
          payload: JSON.stringify(payload),
          command,
          progress: 0,
          electric_user_id: userId as string,
        },
      });
      return id;
    },
    [db],
  );

  return { createJob };
};
