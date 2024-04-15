import { Folder, Workflow } from 'lucide-react';

import { useFolders } from '@/hooks/useFolders';

import { Tree } from './ui/tree';

export const FolderTreeRoot = ({ className }: { className?: string }) => {
  const { folderTree } = useFolders();
  return <Tree data={folderTree} className={className} folderIcon={Folder} itemIcon={Workflow} />;
};
