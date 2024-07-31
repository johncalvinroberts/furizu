import { S3LikeClient } from './s3';
import { server } from './server';
import { eq, and, sql } from 'drizzle-orm';
import { db } from './db';
import { file_chunks, file_locations } from './schema';
import { genUUID } from 'electric-sql/util';

type PropagateParams = {
  fileId: string;
  chunkCount: number;
  client: S3LikeClient;
  bucketName: string;
  userId: string;
};

export const propagateToS3likeObjectStore = async (params: PropagateParams) => {
  const { fileId, chunkCount, client, bucketName, userId } = params;
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
  const { total_size, chunk_sizes } = parts.reduce(
    (memo, current) => {
      return {
        total_size: memo.total_size + (current.Size || 0),
        chunk_sizes: [...memo.chunk_sizes, current.Size || 0],
      };
    },
    { total_size: 0, chunk_sizes: [] } as { total_size: number; chunk_sizes: number[] },
  );

  await db.insert(file_locations).values({
    provider_name: client.name,
    provider_type: 's3like_object_storage',
    key: fileId,
    id: genUUID(),
    bucket_name: bucketName,
    electric_user_id: userId,
    file_id: fileId,
    chunk_sizes,
    size: BigInt(total_size),
  });
  server.log.info(`completed multipart upload: ${fileId}`);
};
