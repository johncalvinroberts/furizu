import { genUUID } from 'electric-sql/util';
import { useCallback } from 'react';

import { useElectric } from '@/lib/electric';

export const useFolders = () => {
  const { db } = useElectric()!;

  const createFolder = useCallback(
    async (name: string, userId: string) => {
      const id = genUUID();
      await db.folders.create({
        data: {
          id,
          name,
          electric_user_id: userId,
          parent_id: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      return id;
    },
    [db],
  );

  return { createFolder };
};
