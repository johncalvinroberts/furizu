import { genUUID } from 'electric-sql/util';
import { server } from './server';
import { eq, and } from 'drizzle-orm';
import { db } from './db';
import { file_chunks, file_locations } from './schema';
import { initS3LikeClient } from './s3';
import { env } from './env';
import { S3LikeProviderName } from '@shared/types';

const tigrisClient = initS3LikeClient({
  region: env.TIGRIS.REGION,
  accessKeyId: env.TIGRIS.ACCESS_KEY_ID,
  secretAccessKey: env.TIGRIS.SECRET_ACCESS_KEY,
  endpoint: env.TIGRIS.ENDPOINT_URL_S3,
  name: 'tigris',
});
const s3Client = initS3LikeClient({
  region: env.AWS.REGION,
  accessKeyId: env.AWS.ACCESS_KEY_ID,
  secretAccessKey: env.AWS.SECRET_ACCESS_KEY,
  endpoint: env.AWS.ENDPOINT_URL_S3,
  name: 'aws_s3',
});

type PropagateParams = {
  fileId: string;
  chunkCount: number;
  bucketName: string;
  providerName: S3LikeProviderName;
  providerDisplayName: string;
  userId: string;
};

const getS3LikeClient = (providerName: S3LikeProviderName) => {
  switch (providerName) {
    case 'tigris':
      return tigrisClient;
    case 'aws_s3':
      return s3Client;
    default:
      throw new Error('unknown s3like storage provider');
  }
};

export const propagateToS3likeObjectStore = async (params: PropagateParams) => {
  const { fileId, chunkCount, bucketName, userId, providerName } = params;
  server.log.info(
    `initializing iterative multipart chunk upload: ${JSON.stringify({
      file_id: fileId,
      chunkCount,
    })}`,
  );
  const client = getS3LikeClient(providerName);
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
    provider_display_name: params.providerDisplayName,
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

export const createDownloadURL = async (fileId: string, locationId: string): Promise<string> => {
  const [location] = await db
    .select()
    .from(file_locations)
    .where(eq(file_locations.id, locationId));
  if (!location) throw new Error('location not found');
  switch (location.provider_name) {
    case 'tigris':
      if (!location.bucket_name) {
        throw new Error('expected bucket name to be defined for tigris object');
      }
      return tigrisClient.createPresignedURL({
        key: location.key,
        bucketName: location.bucket_name,
      });
    case 'aws_s3':
      if (!location.bucket_name) {
        throw new Error('expected bucket name to be defined for tigris object');
      }
      return s3Client.createPresignedURL({
        key: location.key,
        bucketName: location.bucket_name,
      });
    default:
      throw new Error('unknown s3like storage provider');
  }
};
