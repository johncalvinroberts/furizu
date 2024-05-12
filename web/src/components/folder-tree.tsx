import { Folder, Plus, Workflow } from 'lucide-react';

import { useFolders } from '@/hooks/useFolders';

import { Tree } from './ui/tree';

const FolderTreeAddButton = () => {
  // const { createFolder } = useFolders();
  const addFolder = () => {};
  return (
    <button
      className="w-full text-sm flex items-center justify-center hover:bg-accent"
      onClick={addFolder}
    >
      <Plus size={10} className="mr-2" />
      New Folder
    </button>
  );
};

export const FolderTreeRoot = ({ className }: { className?: string }) => {
  const { folderTree } = useFolders();

  return (
    <Tree
      data={folderTree}
      className={className}
      folderIcon={Folder}
      itemIcon={Workflow}
      AddButton={FolderTreeAddButton}
    />
  );
};
