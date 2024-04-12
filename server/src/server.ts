import fastify, { type FastifyInstance } from 'fastify';
import { env } from './env';
import { db, sql } from './db';
import { processJob } from './jobs';

const API_VERSION = 'v1';

export const healthRoutes = (fastify: FastifyInstance, _: unknown, done: () => void) => {
  fastify.get('/', async (_, response) => {
    response.send({
      success: true,
    });
  });
  done();
};

export const main = async () => {
  const server = fastify({
    bodyLimit: 1_000_000,
    trustProxy: true,
  });

  server.register(healthRoutes, {
    prefix: `/${API_VERSION}/health`,
  });

  server.listen({ host: env.HOST, port: env.PORT }, (error, address) => {
    if (error) {
      console.error('INIT', error.message);
      throw new Error(error.message);
    }
    console.info(`Server listening at ${address}`);
  });

  sql.listen('process_job', (job) => processJob(job));

  return server;
};

main();
