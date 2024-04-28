import { insecureAuthToken } from 'electric-sql/auth';
import { makeElectricContext } from 'electric-sql/react';
import { uniqueTabId } from 'electric-sql/util';
import { LIB_VERSION } from 'electric-sql/version';
import { ElectricDatabase, electrify } from 'electric-sql/wa-sqlite';
import { Logger } from 'guu';

import { DEBUG, ELECTRIC_URL } from '@/config';
import { Electric, schema } from '@/generated/client';

const logger = new Logger('electric', 'pink');

export const { ElectricProvider, useElectric } = makeElectricContext<Electric>();

const discriminator = 'furizu';

export let dbName: string;

export const initElectric = async (userId: string) => {
  const { tabId } = uniqueTabId();
  dbName = `${discriminator}-${LIB_VERSION}-${tabId}.db`;

  const config = {
    url: ELECTRIC_URL,
    debug: DEBUG,
  };
  const authToken = insecureAuthToken({ sub: userId });

  const conn = await ElectricDatabase.init(dbName);
  if (DEBUG) {
    logger.log(['initElectric']);
    logger.log(['dbName', dbName]);
    logger.log([conn]);
    logger.log([schema]);
    logger.log([config]);
  }
  const electric = await electrify(conn, schema, config);
  await electric.connect(authToken);
  return electric;
};
