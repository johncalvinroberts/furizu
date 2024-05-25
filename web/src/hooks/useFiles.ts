import { useLiveQuery } from 'electric-sql/react';
import { genUUID } from 'electric-sql/util';
import { Logger, TimerFactory } from 'guu';
import pMap from 'p-map';
import { useCallback } from 'react';

import { Files } from '@/generated/client';
import { useElectric } from '@/lib/electric';

import { useJobs } from './useJobs';
import { useUserId } from './useUser';

const logger = new Logger('useFiles', 'teal');
const timer = new TimerFactory('useFiles');

const CHUNK_SIZE = 250 * 1024 * 1024;

export const FileStates = [
  'created',
  'encrypting',
  'chunking',
  'propagating',
  'done',
  'error',
] as const;

export const useFiles = () => {
  const { createJob } = useJobs();
  const { id: userId } = useUserId();
  const { db } = useElectric()!;

  const createFile = useCallback(
    async (rawFile: File, folderId: string, fileId?: string) => {
      timer.start();
      if (!fileId) {
        fileId = genUUID();
      }
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
            state: 'created',
            locations: [],
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
        await db.files.update({ data: { state: 'chunking' }, where: { id: fileId } });
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
        logger.log(['fileInstance', fileInstance]);
        createJob({ command: 'file_created', payload: fileInstance, userId: userId as string });
      } catch (error) {
        logger.error(['Failed to create file', error]);
        await db.files.update({ data: { state: 'error' }, where: { id: fileId } });
      }
    },
    [userId, db.file_chunks, db.files, createJob],
  );

  const updateFile = useCallback(
    async (id: string, args: Partial<Files>) => {
      const res = await db.files.update({ data: args, where: { id } });
      return res;
    },
    [db],
  );

  const deleteFile = useCallback(
    async (id: string) => {
      const res = await db.files.delete({ where: { id } });
      return res;
    },
    [db],
  );

  return { createFile, updateFile, deleteFile };
};

export const useFileById = (id: string) => {
  const { db } = useElectric()!;
  const results = useLiveQuery(db.files.liveFirst({ where: { id } }));
  return { file: results.results };
};

export const useFilesByFolderId = (folder_id: string) => {
  const { db } = useElectric()!;

  const results = useLiveQuery(
    db.files.liveMany({ where: { folder_id }, orderBy: { updated_at: 'desc' } }),
  );
  return { files: results };
};
