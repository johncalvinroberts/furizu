import { useLiveQuery } from 'electric-sql/react';
import { genUUID } from 'electric-sql/util';
import { Logger } from 'guu';
import { useCallback } from 'react';

import { useElectric } from '@/lib/electric';

import { Folders } from '../generated/client';

const logger = new Logger('useFolders', 'goldenrod');

export type FolderNode = Folders & { children: FolderNode[] };

const massageFolders = (folders: Folders[] | undefined): FolderNode[] => {
  if (!folders) {
    return [];
  }
  // Create a map of all folders by their IDs for easy lookup
  const folderMap: Record<string, FolderNode> = {};
  folders.forEach((folder) => {
    folderMap[folder.id] = { ...folder, children: [] };
  });

  // Populate children arrays
  const rootFolders: FolderNode[] = [];
  folders.forEach((folder) => {
    if (folder.parent_id) {
      // If a folder has a parent_id, find the parent and add this folder to its children
      folderMap[folder.parent_id]?.children.push(folderMap[folder.id]);
    } else {
      // If a folder doesn't have a parent_id, it is a root folder
      rootFolders.push(folderMap[folder.id]);
    }
  });

  return rootFolders;
};

export const useFolders = () => {
  const { db } = useElectric()!;

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

  const { results: folders } = useLiveQuery(db.folders.liveMany());
  const folderTree = massageFolders(folders);

  return { createFolder, folders, folderTree };
};
