import { useMemo } from 'react';

import { useFolders } from '@/hooks/useFolders';
import { useToggle } from '@/hooks/useToggle';

import { Folders } from '../generated/client';
import { FolderContextMenu } from './folder-context-menu';
import { InlineFolderForm } from './forms/inline-folder-form';
import { Link } from './link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from './ui/breadcrumb';

export const FolderBreadCrumbs = ({ id }: { id: string }) => {
  const { isOpen: isRenameOpen, toggle: toggleRename } = useToggle(false);
  const { folders } = useFolders();
  const { parents, currentFolder } = useMemo(() => {
    const all: Omit<Folders, 'Please either choose `select` or `include`'>[] = [];
    const recurse = (id: string): void => {
      const item = folders?.find((item) => item.id === id);
      if (!item) {
        return;
      }
      all.push(item);
      if (item?.parent_id) {
        return recurse(item.parent_id);
      }
    };
    recurse(id);
    const [currentFolder, ...parents] = all;
    return { parents: parents.reverse(), currentFolder };
  }, [id, folders]);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {parents.map((item) => (
          <BreadcrumbItem key={item.id} className="text-foreground hover:text-foreground/50">
            <BreadcrumbLink asChild>
              <Link href={`/folder/${item.id}`}>{item.name}</Link>
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
        ))}
        <BreadcrumbItem className="group text-foreground gap-[2px]">
          {!isRenameOpen && (
            <>
              <BreadcrumbLink asChild>
                <Link href={`/folder/${currentFolder?.id}`}>{currentFolder?.name}</Link>
              </BreadcrumbLink>
              {currentFolder && (
                <FolderContextMenu
                  folder={currentFolder}
                  className="opacity-0 group-hover:opacity-100"
                  onClickRename={toggleRename}
                />
              )}
            </>
          )}
          {isRenameOpen && currentFolder && (
            <InlineFolderForm folder={currentFolder} onSuccess={toggleRename} />
          )}
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
