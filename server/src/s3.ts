import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  Part,
  PutObjectCommand,
  CompleteMultipartUploadCommandOutput,
} from '@aws-sdk/client-s3';
import { server } from './server';

type PutObjectParams = {
  Bucket: string;
  Key: string;
  Body: string | Buffer;
};

type InitS3LikeClientParams = {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  name: string;
};

type Chunk = {
  data: Buffer; // or another appropriate type depending on how you fetch the data
};

type UploadChunksParams = {
  bucketName: string;
  key: string;
  uploadId: string;
  totalChunks: number;
  getChunkData: (chunk_index: number) => Promise<Chunk>;
};

type CompleteMultipartUploadParams = {
  bucketName: string;
  key: string;
  uploadId: string;
  parts: Part[];
};

export type S3LikeClient = {
  client: S3Client;
  putFile: (params: PutObjectParams) => Promise<void>;
  initiateMultipartUpload: (bucketName: string, key: string) => Promise<string>;
  completeMultipartUpload: (
    params: CompleteMultipartUploadParams,
  ) => Promise<CompleteMultipartUploadCommandOutput>;
  uploadChunks: (params: UploadChunksParams) => Promise<Part[]>;
  name: string;
};

export const initS3LikeClient = (params: InitS3LikeClientParams): S3LikeClient => {
  const { region, accessKeyId, secretAccessKey, endpoint, name } = params;
  const client = new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const putFile = async (params: PutObjectParams) => {
    try {
      const data = await client.send(new PutObjectCommand(params));
      console.log(`File uploaded successfully. ${JSON.stringify(data)}`);
    } catch (err) {
      console.error(`Error uploading file. ${err}`);
    }
  };

  const initiateMultipartUpload = async (bucketName: string, key: string): Promise<string> => {
    const command = new CreateMultipartUploadCommand({
      Bucket: bucketName,
      Key: key,
    });
    const response = await client.send(command);
    return response.UploadId as string;
  };

  async function completeMultipartUpload(params: CompleteMultipartUploadParams) {
    const { bucketName, key, uploadId, parts } = params;
    const command = new CompleteMultipartUploadCommand({
      Bucket: bucketName,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    });
    const response = await client.send(command);
    return response;
  }

  async function uploadChunks(params: UploadChunksParams) {
    const { bucketName, key, uploadId, totalChunks, getChunkData } = params;
    const parts: Part[] = [];
    try {
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const chunk = await getChunkData(chunkIndex);
        server.log.info(`got chunk data: ${uploadId}, index: ${chunkIndex}`);
        const command = new UploadPartCommand({
          Bucket: bucketName,
          Key: key,
          PartNumber: chunkIndex + 1,
          UploadId: uploadId,
          Body: chunk.data,
        });
        const output = await client.send(command);
        server.log.info(`successfully uploaded part: ${chunkIndex}, ${key}`);
        parts.push({
          PartNumber: chunkIndex + 1,
          ETag: output.ETag!,
        });
      }
    } catch (error) {
      console.error(error);
      const abortCommand = new AbortMultipartUploadCommand({
        Bucket: bucketName,
        Key: key,
        UploadId: uploadId,
      });
      await client.send(abortCommand);
      throw error;
    }
    return parts;
  }

  return { client, putFile, initiateMultipartUpload, completeMultipartUpload, uploadChunks, name };
};
