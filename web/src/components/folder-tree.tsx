import { FolderNode, useFolders } from '@/hooks/useFolders';

export const FolderTree = ({ folders = [] }: { folders: FolderNode[] | undefined }) => {
  return (
    <ul className="list-none ml-4">
      {folders.map((folder) => (
        <li key={folder.id}>
          <div className="cursor-pointer py-1">{folder.name}</div>
          {folder.children && folder.children.length > 0 && (
            <FolderTree folders={folder.children} />
          )}
        </li>
      ))}
    </ul>
  );
};

export const FolderTreeRoot = () => {
  const { folderTree } = useFolders();
  return <FolderTree folders={folderTree} />;
};
