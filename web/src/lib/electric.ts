import { insecureAuthToken } from 'electric-sql/auth';
import { makeElectricContext } from 'electric-sql/react';
import { uniqueTabId } from 'electric-sql/util';
import { LIB_VERSION } from 'electric-sql/version';
import { Logger } from 'guu';

import { CLIENT_DB, DEBUG, ELECTRIC_URL } from '@/config';
import { Electric, schema } from '@/generated/client';

const logger = new Logger('electric', 'pink');

export const { ElectricProvider, useElectric } = makeElectricContext<Electric>();

const discriminator = 'furizu';
const tabId = uniqueTabId().tabId.slice(0, 8);

export let dbName: string;

const initPGlite = async () => {
  const { electrify } = await import('electric-sql/pglite');
  const { PGlite } = await import('@electric-sql/pglite');

  dbName = `idb://${discriminator}-${LIB_VERSION}-${tabId}.db`;

  const config = {
    url: ELECTRIC_URL,
    debug: DEBUG,
  };

  const conn = new PGlite(dbName);
  const electric = await electrify(conn, schema, config);
  return {
    electric,
    conn,
    config,
  };
};

export const initWaSqlite = async () => {
  const { electrify, ElectricDatabase } = await import('electric-sql/wa-sqlite');

  dbName = `${discriminator}-${LIB_VERSION}-${tabId}.db`;

  const config = {
    url: ELECTRIC_URL,
    debug: DEBUG,
  };

  const conn = await ElectricDatabase.init(dbName);
  const electric = await electrify(conn, schema, config);
  return {
    electric,
    conn,
    config,
  };
};

export const initElectric = async (userId: string) => {
  const { electric, conn, config } =
    CLIENT_DB === 'wa-sqlite' ? await initWaSqlite() : await initPGlite();
  const authToken = insecureAuthToken({ sub: userId });
  if (DEBUG) {
    logger.log(['initElectric']);
    logger.log(['dbName', dbName]);
    logger.log([schema]);
    logger.log([conn]);
    logger.log([config]);
  }

  await electric.connect(authToken);
  return electric;
};
