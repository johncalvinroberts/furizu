import { insecureAuthToken } from 'electric-sql/auth';
import { makeElectricContext } from 'electric-sql/react';
import { uniqueTabId } from 'electric-sql/util';
import { LIB_VERSION } from 'electric-sql/version';
import { ElectricDatabase, electrify } from 'electric-sql/wa-sqlite';

import { DEBUG, ELECTRIC_URL } from '@/config';
import { Electric, schema } from '@/generated/client';

export const { ElectricProvider, useElectric } = makeElectricContext<Electric>();

const discriminator = 'furizu';

export let dbName: string;

export const initElectric = async (userId: string) => {
  const { tabId } = uniqueTabId();
  const electricUrl = ELECTRIC_URL;
  dbName = `${discriminator}-${LIB_VERSION}-${tabId}.db`;

  const config = {
    url: electricUrl,
    debug: DEBUG,
  };
  const authToken = insecureAuthToken({ sub: userId });

  const conn = await ElectricDatabase.init(dbName);
  if (DEBUG) {
    console.log('initElectric');
    console.log('dbName', dbName);
    console.log(conn);
    console.log(schema);
    console.log(config);
  }
  const electric = await electrify(conn, schema, config);
  await electric.connect(authToken);
  return electric;
};
