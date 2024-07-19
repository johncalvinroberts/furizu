import { useLiveQuery } from 'electric-sql/react';
import { genUUID } from 'electric-sql/util';
import { Logger, TimerFactory } from 'guu';
import pMap from 'p-map';
import { useCallback } from 'react';
import { toast } from 'sonner';

import { File_locations, Files } from '@/generated/client';
import {
  encryptAsymmetricallyWithPublicKey,
  encryptSymmetrically,
  exportSymmetricKey,
  generateSymmetricKey,
  getRandomBytes,
} from '@/lib/crypto';
import { useElectric } from '@/lib/electric';
import { arrayBufferToBase64String } from '@/lib/utils';

import { useAsymmetricCryptoKeysState } from './useCryptoKeys';
import { useJobs } from './useJobs';
import { useUserId } from './useUser';

const logger = new Logger('useFiles', 'teal');
const timer = new TimerFactory('useFiles');

const CHUNK_SIZE = 250 * 1024 * 1024; // 250mb chunk size

export const useFiles = () => {
  const { createJob } = useJobs();
  const { id: userId } = useUserId();
  const { db } = useElectric()!;

  const createFile = useCallback(
    async (rawFile: File, folderId: string, fileId?: string) => {
      const { keypair, id: public_key_id } = useAsymmetricCryptoKeysState.getState();
      console.log({ keypair, public_key_id });
      timer.start();
      if (!fileId) {
        fileId = genUUID();
      }

      try {
        if (!keypair) {
          throw new Error(`expected public keypair to be initialized, got: ${keypair}`);
        }
        if (!userId) {
          throw new Error(`expected userId to be defined, got: ${userId}`);
        }
        if (!public_key_id) {
          throw new Error(`expected publicKeyId to be defined, got: ${public_key_id}`);
        }
        logger.log(['starting to create file', { fileId, folderId }]);
        const fileIv = getRandomBytes();
        const fileInstance = await db.files.create({
          data: {
            id: fileId,
            name: rawFile.name,
            size: rawFile.size,
            folder_id: folderId,
            type: rawFile.type,
            created_at: new Date(),
            updated_at: new Date(),
            electric_user_id: userId,
            state: 'created',
            locations: [],
            iv: fileIv.toString(),
          },
        });
        logger.log(['created file in files table', fileId]);
        const symmetricKey = await generateSymmetricKey();
        const exportedSymmetricKey = await exportSymmetricKey(symmetricKey);
        const keyIv = getRandomBytes();
        const encryptedSymmetricKey = await encryptAsymmetricallyWithPublicKey(
          exportedSymmetricKey,
          keypair.publicKey,
          keyIv,
        );
        await db.file_keys.create({
          data: {
            id: genUUID(),
            file_id: fileId,
            encrypted_symmetric_key: arrayBufferToBase64String(encryptedSymmetricKey),
            electric_user_id: userId,
            iv: keyIv.toString(),
            public_key_id,
          },
        });
        toast.success(`Created file "${rawFile.name}"`);
        // works is an array of awaitable functions
        const works: (() => Promise<void>)[] = [];
        // "start" at 0, "start" here is where the current chunk starts in the file
        let start = 0;
        // "end" also represents a point in the raw file blob
        let end = Math.min(start + CHUNK_SIZE - 1, rawFile.size - 1);
        // index = which chunk index we're at
        let index = 0;
        // loop through the file by chunk size
        await db.files.update({ data: { state: 'encrypting' }, where: { id: fileId } });
        while (start < rawFile.size) {
          const chunk = rawFile.slice(start, end);
          start = end + 1;
          end = Math.min(start + CHUNK_SIZE - 1, rawFile.size - 1);
          const work = async () => {
            const chunkId = genUUID();
            const encryptedData = await encryptSymmetrically(
              await chunk.arrayBuffer(),
              symmetricKey,
              fileIv,
            );
            const data = new Uint8Array(encryptedData);
            const id = await db.file_chunks.create({
              data: {
                id: chunkId,
                file_id: fileId,
                electric_user_id: userId as string,
                created_at: new Date(),
                updated_at: new Date(),
                data: data,
                chunk_index: index,
                size: chunk.size,
              },
            });
            logger.log(['successfully created file chunk', { id, fileId, index }]);
            index++;
          };
          works.push(work);
        }
        await pMap(works, (work) => work(), { concurrency: 100 });
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
    [userId, db.file_chunks, db.files, db.file_keys, createJob],
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

  const fetchDecryptDownloadFile = useCallback(
    async (id: string) => {
      /**
       * TODO:
       * - Create presigned URL
       * - Download from object storage
       * - Break into chunks (based on ???)
       * - Decrypt chunk by chunk
       * - Stream decrypted chunk to caller
       */
      console.log({ id });
    },
    [db],
  );

  return { createFile, fetchDecryptDownloadFile, updateFile, deleteFile };
};

export const useFileById = (
  id: string,
): { file: (Files & { file_locations?: File_locations[] }) | null | undefined } => {
  const { db } = useElectric()!;
  const results = useLiveQuery(
    db.files.liveFirst({ where: { id }, include: { file_locations: true } }),
  );
  return { file: results.results };
};

export const useFilesByFolderId = (folder_id: string) => {
  const { db } = useElectric()!;

  const results = useLiveQuery(
    db.files.liveMany({
      where: { folder_id },
      orderBy: { updated_at: 'desc' },
    }),
  );

  return { files: results };
};
