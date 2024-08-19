import { useLiveQuery } from 'electric-sql/react';
import { genUUID } from 'electric-sql/util';
import { Logger, TimerFactory } from 'guu';
import pMap from 'p-map';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { File_locations, Files } from '@/generated/client';
import {
  createIv,
  decryptAsymmetricallyWithPublicKey,
  decryptSymmetrically,
  encryptAsymmetricallyWithPublicKey,
  encryptSymmetrically,
  exportSymmetricKey,
  generateSymmetricKey,
  importIv,
  importSymmetricKey,
} from '@/lib/crypto';
import { useElectric } from '@/lib/electric';
import {
  arrayBufferToBase64String,
  base64StringToArrayBuffer,
  fetchByteRange,
  streamBlobToDownload,
} from '@/lib/utils';

import { usePersistedCryptoKeysState } from './useCryptoKeys';
import { useJobById, useJobs } from './useJobs';
import { useUserId } from './useUser';

const logger = new Logger('useFiles', 'teal');
const timer = new TimerFactory('useFiles');

export type FileWithLocations = Files & { file_locations?: File_locations[] };

const CHUNK_SIZE = 250 * 1024 * 1024; // 250mb chunk size

export const useFiles = () => {
  const { createJob } = useJobs();
  const { id: userId } = useUserId();
  const { db } = useElectric()!;

  const createFile = useCallback(
    async (rawFile: File, folderId: string, fileId?: string) => {
      logger.log(['createFile: starting']);
      const { keypair, id: public_key_id } = usePersistedCryptoKeysState.getState();
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
        const fileIv = createIv();
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
            iv: fileIv.base64,
          },
        });
        logger.log(['created file in files table', fileId]);
        const symmetricKey = await generateSymmetricKey();
        const exportedSymmetricKey = await exportSymmetricKey(symmetricKey);
        const keyIv = createIv();
        const encryptedSymmetricKey = await encryptAsymmetricallyWithPublicKey(
          exportedSymmetricKey,
          keypair.publicKey,
          keyIv.iv,
        );

        await db.file_keys.create({
          data: {
            id: genUUID(),
            file_id: fileId,
            encrypted_symmetric_key: arrayBufferToBase64String(encryptedSymmetricKey),
            electric_user_id: userId,
            iv: keyIv.base64,
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
              fileIv.iv,
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

  return { createFile, updateFile, deleteFile };
};

export const useFileById = (id: string): { file: FileWithLocations | null | undefined } => {
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

export const useFileFetchDecryptDownload = (
  fileId: string,
  location: File_locations | undefined | null,
) => {
  const [jobId, setJobId] = useState<string>();
  const [isPreparingDownload, setIsPreparingDownload] = useState(false);
  const { id: userId } = useUserId();
  const { createJob } = useJobs();
  const { job } = useJobById(jobId);
  const { db } = useElectric()!;
  const { file } = useFileById(fileId);

  const startDownloadAndDecrypt = useCallback(async () => {
    logger.log(['startDownloadAndDecrypt: starting']);
    setIsPreparingDownload(true);
    if (!userId) {
      throw new Error('user id not defined, expected it to be defined');
    }
    if (!location) {
      throw new Error('locationid is not defined, expected it to be defined');
    }
    const jobId = await createJob({
      command: 'create_download',
      payload: { fileId, locationId: location.id },
      userId,
    });
    setJobId(jobId);
    logger.log([`startDownloadAndDecrypt: created job for generating download URL: ${jobId}`]);
  }, [createJob, userId, fileId, location]);

  const getDecryptedFileKey = async (): Promise<CryptoKey> => {
    const { keypair, id: public_key_id } = usePersistedCryptoKeysState.getState();
    if (!public_key_id || !keypair) {
      throw new Error(
        `Expected public_key_id and keypair to be defined, got ${public_key_id} and ${keypair}`,
      );
    }
    const fileKey = await db.file_keys.findFirst({ where: { file_id: fileId, public_key_id } });
    if (!fileKey) {
      throw new Error(`fileKey not found for given file + public_key_id`);
    }
    if (!fileKey.encrypted_symmetric_key) {
      throw new Error(`fileKey.encrypted_symmetric_key not defined`);
    }

    const data = base64StringToArrayBuffer(fileKey.encrypted_symmetric_key);
    const iv = importIv(fileKey.iv);
    const decrypted = await decryptAsymmetricallyWithPublicKey(data, keypair.privateKey, iv);
    const imported = await importSymmetricKey(decrypted);
    return imported;
  };

  const fetchChunksAndStreamToDownload = async (url: string) => {
    if (!file) {
      throw new Error(`fetchChunksAndStreamToDownload: Expected file to be defined, got ${file}`);
    }
    try {
      const chunks = typeof location?.chunk_sizes === 'string' && JSON.parse(location.chunk_sizes);
      if (!location || !chunks) {
        throw new Error('fetchChunksAndStreamToDownload: expected file location to be defined');
      }
      const decryptedSymmetricKey = await getDecryptedFileKey();
      const iv = importIv(file.iv);
      const stream = new ReadableStream({
        start(controller) {
          let start = 0;
          async function pushChunk() {
            for (const chunkSize of chunks) {
              const res = await fetchByteRange(url, start, chunkSize);
              const arrayBuffer = await res.arrayBuffer();
              const decrypted = await decryptSymmetrically(arrayBuffer, decryptedSymmetricKey, iv);
              controller.enqueue(new Uint8Array(decrypted));
              start += chunkSize + 1;
            }
            controller.close();
          }
          pushChunk();
        },
      });
      await streamBlobToDownload(stream, file.name);
      setIsPreparingDownload(false);
      setJobId(undefined);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    logger.log([`job.progress: ${job?.progress}`]);
    if (job && job.progress == 100 && typeof job.result === 'string') {
      try {
        const results: { downloadURL?: string } = JSON.parse(job.result);
        if (!results.downloadURL) {
          throw new Error('malformed download job: progress is 100 but no download URL');
        }
        fetchChunksAndStreamToDownload(results.downloadURL);
      } catch (error) {
        console.error(error);
      }

      if (job && job.progress == 100 && typeof job.result !== 'string') {
        console.error('malformed download job: progress is 100 but no job.result', job);
      }
    }
    // eslint-disable-next-line
  }, [job]);

  return { startDownloadAndDecrypt, isPreparingDownload };
};
