import { useLiveQuery } from 'electric-sql/react';
import { genUUID } from 'electric-sql/util';
import { Logger } from 'guu';
import { useCallback } from 'react';

import { useElectric } from '@/lib/electric';

import { Folders } from '../generated/client';
import { useActiveFolder } from './useActiveFolder';

const logger = new Logger('useFolders', 'goldenrod');

export type FolderNode = Folders & { children: FolderNode[] };

const massageFolders = (folders: Folders[] | undefined): FolderNode[] => {
  if (!folders) {
    return [];
  }
  // Create a map of all folders by their IDs for easy lookup
  const folderMap = new Map<string, FolderNode>();
  folders.forEach((folder) => {
    folderMap.set(folder.id, { ...folder, children: [] });
  });

  // Populate children arrays
  const rootFolders: FolderNode[] = [];
  folders.forEach((folder) => {
    const item = folderMap.get(folder.id);
    if (folder.parent_id) {
      // If a folder has a parent_id, find the parent and add this folder to its children
      const parent = folderMap.get(folder.parent_id);
      if (parent) {
        parent.children.push(item as FolderNode);
      }
    } else {
      // If a folder doesn't have a parent_id, it is a root folder
      rootFolders.push(item as FolderNode);
    }
  });

  return rootFolders;
};

export const useFolders = () => {
  const { db } = useElectric()!;
  const { id: activeFolderId } = useActiveFolder();

  const createFolder = useCallback(
    async (name: string, userId: string, parent_id: string | null) => {
      const id = genUUID();
      await db.folders.create({
        data: {
          id,
          name,
          electric_user_id: userId,
          parent_id,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      logger.log([`created folder with name: ${name}, id: ${id}`]);
      return id;
    },
    [db],
  );

  const updateFolder = useCallback(
    async (id: string, args: Partial<Folders>) => {
      const res = await db.folders.update({ data: args, where: { id } });
      return res;
    },
    [db],
  );

  const deleteFolder = useCallback(
    async (id: string) => {
      const res = await db.folders.delete({ where: { id } });
      return res;
    },
    [db],
  );

  const { results: folders } = useLiveQuery(
    db.folders.liveMany({ orderBy: { created_at: 'asc' } }),
  );
  const folderTree = massageFolders(folders);

  return { createFolder, folders, folderTree, activeFolderId, deleteFolder, updateFolder };
};
