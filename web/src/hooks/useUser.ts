import { useLiveQuery } from 'electric-sql/react';
import { genUUID } from 'electric-sql/util';
import { useCallback } from 'react';
import { create } from 'zustand';

import { USER_ID_LOCALSTORAGE_KEY } from '@/config';
import { useElectric } from '@/lib/electric';

type UserIdState = {
  id: string | null;
  setId: (nextId: string | null) => void;
};

let initialUserId = localStorage.getItem(USER_ID_LOCALSTORAGE_KEY);
if (!initialUserId) {
  initialUserId = genUUID();
  localStorage.setItem(USER_ID_LOCALSTORAGE_KEY, initialUserId);
}

export const useUserId = create<UserIdState>((set) => ({
  id: initialUserId,
  setId: (nextId: string | null) => {
    if (!nextId) {
      nextId = genUUID();
    }
    localStorage.setItem(USER_ID_LOCALSTORAGE_KEY, nextId);
    set({ id: nextId });
  },
}));

export const useUser = () => {
  const { id, setId } = useUserId();
  const { db } = useElectric()!;
  const { results: user, updatedAt } = useLiveQuery(
    db.users.liveFirst({ where: { id: id as string } }),
  );
  const isUnprovisional = Boolean(user?.unprovisional_at);
  const createInitialUser = useCallback(
    async (id: string) => {
      await db.users.create({
        data: {
          id,
          created_at: new Date(),
          updated_at: new Date(),
          full_name: '',
        },
      });
      setId(id);
    },
    [db, setId],
  );

  return { user, id, updatedAt, createInitialUser, isUnprovisional };
};
