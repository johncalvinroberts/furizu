import { S3LikeClient } from './s3';
import { server } from './server';
import { eq, and, sql } from 'drizzle-orm';
import { db } from './db';
import { file_chunks } from './schema';
import { LocationPointer } from '@shared/types';

type PropagateParams = {
  fileId: string;
  chunkCount: number;
  client: S3LikeClient;
  bucketName: string;
};

export const propagateToS3likeObjectStore = async (params: PropagateParams) => {
  const { fileId, chunkCount, client, bucketName } = params;
  server.log.info(
    `initializing iterative multipart chunk upload: ${JSON.stringify({
      file_id: fileId,
      chunkCount,
    })}`,
  );
  const uploadId = await client.initiateMultipartUpload(bucketName, fileId);
  server.log.info(`created multipart upload: ${uploadId}`);
  const parts = await client.uploadChunks({
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
  server.log.info(`finished uploading chunks: ${fileId}`);
  await client.completeMultipartUpload({ parts, uploadId, bucketName, key: fileId });
  const location: LocationPointer = {
    providerName: client.name,
    providerType: 's3like_object_storage',
    key: fileId,
    bucketName,
  };
  // let db concat the array of locations, for better concurrency safety of propagations
  const statement = sql`UPDATE files
                        SET locations = COALESCE(locations, '[]'::jsonb) || ${JSON.stringify([location])}::jsonb
                        WHERE id = ${fileId}; `;

  await db.execute(statement);
  server.log.info(`completed multipart upload: ${fileId}`);
};
