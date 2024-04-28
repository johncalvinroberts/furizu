import { genUUID } from 'electric-sql/util';
import { Logger, TimerFactory } from 'guu';
import pMap from 'p-map';
import { useCallback } from 'react';

import { useElectric } from '@/lib/electric';

import { useJobs } from './useJobs';
import { useUserId } from './useUser';

const logger = new Logger('useFiles', 'teal');
const timer = new TimerFactory('useFiles');

const CHUNK_SIZE = 250 * 1024 * 1024;

export const useFiles = () => {
  const { createJob } = useJobs();
  const { id: userId } = useUserId();
  const { db } = useElectric()!;

  const createFile = useCallback(
    async (rawFile: File, folderId: string) => {
      timer.start();
      const fileId = genUUID();
      try {
        logger.log(['starting to create file', { fileId, folderId }]);
        const fileInstance = await db.files.create({
          data: {
            id: fileId,
            name: rawFile.name,
            size: rawFile.size,
            folder_id: folderId,
            type: rawFile.type,
            created_at: new Date(),
            updated_at: new Date(),
            electric_user_id: userId as string,
          },
        });
        logger.log(['created file in files table', fileId]);
        // works is an array of awaitable functions
        const works: (() => Promise<void>)[] = [];
        // "start" at 0, "start" here is where the current chunk starts in the file
        let start = 0;
        // "end" also represents a point in the raw file blob
        let end = Math.min(start + CHUNK_SIZE - 1, rawFile.size - 1);
        // index = which chunk index we're at
        let index = 0;
        // loop through the file by chunk size
        while (start < rawFile.size) {
          const chunk = rawFile.slice(start, end);
          start = end + 1;
          end = Math.min(start + CHUNK_SIZE - 1, rawFile.size - 1);
          const work = async () => {
            const chunkId = genUUID();
            const buffer = new Uint8Array(await chunk.arrayBuffer());
            const id = await db.file_chunks.create({
              data: {
                id: chunkId,
                file_id: fileId,
                electric_user_id: userId as string,
                created_at: new Date(),
                updated_at: new Date(),
                data: buffer,
                chunk_index: index,
                size: chunk.size,
              },
            });
            logger.log(['successfully created file chunk', { id, fileId, index }]);
            index++;
          };
          works.push(work);
        }

        await pMap(works, (work) => work(), { concurrency: 10 });
        // break file into chunks + save
        const time = timer.stop();
        logger.log(['Finished creating file + chunks', { time }]);
        console.log({ fileInstance });
        createJob({ command: 'file_created', payload: fileInstance, userId: userId as string });
      } catch (error) {
        logger.error(['Failed to create file', error]);
      }
    },
    [userId, db.file_chunks, db.files, createJob],
  );

  return { createFile };
};
