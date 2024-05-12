import { insecureAuthToken } from 'electric-sql/auth';
import { useLiveQuery } from 'electric-sql/react';
import { genUUID } from 'electric-sql/util';
import { useCallback } from 'react';
import { create } from 'zustand';

import { USER_ID_LOCALSTORAGE_KEY, WELCOME_FILE, WELCOME_FOLDER } from '@/config';
import { useElectric } from '@/lib/electric';

import { useFiles } from './useFiles';
import { useFolders } from './useFolders';
import { useJobs } from './useJobs';

type UserIdState = {
  id: string | null;
  setId: (nextId: string | null) => string;
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
    return nextId;
  },
}));

export const useUser = () => {
  const { id, setId } = useUserId();
  const electric = useElectric()!;
  const { db } = electric;
  const { createJob } = useJobs();
  const { createFolder } = useFolders();
  const { results: user, updatedAt } = useLiveQuery(
    db.users.liveFirst({ where: { id: id as string } }),
  );
  const { createFile } = useFiles();
  const { results: quota } = useLiveQuery(
    db.quotas.liveFirst({ where: { electric_user_id: id as string } }),
  );

  const isUnprovisional = Boolean(user?.unprovisional_at);

  const createProvisionalUser = useCallback(
    async (id: string) => {
      await db.users.create({
        data: {
          id,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      setId(id);
      await createJob({ userId: id, command: 'provisional_user_created', payload: {} });
      const folderId = await createFolder(WELCOME_FOLDER, id, null);
      await createFile(WELCOME_FILE, folderId);
      await db.users.update({
        where: { id },
        data: {
          default_folder_id: folderId,
        },
      });
    },
    [db, setId, createJob, createFolder, createFile],
  );

  const signup = useCallback(
    async (email: string, password: string) => {
      await createJob({
        command: 'signup',
        payload: { email, password, id },
        userId: id as string,
      });
    },
    [id, createJob],
  );

  const login = useCallback((email: string, password: string) => {
    // publish message
    // wait for backend validation
    // call setId
    console.log({ email, password });
  }, []);

  const logout = useCallback(() => {
    const nextId = setId(null);
    electric.disconnect();
    const token = insecureAuthToken({ sub: nextId });
    electric.connect(token);
  }, [setId, electric]);

  return {
    user,
    id,
    updatedAt,
    isUnprovisional,
    createProvisionalUser,
    signup,
    login,
    logout,
    quota,
  };
};
