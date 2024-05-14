import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { CornerDownRight, FolderIcon, Plus } from 'lucide-react';
import useResizeObserver from 'use-resize-observer';

import { FolderNode, useFolders } from '@/hooks/useFolders';
import { useLocation } from '@/hooks/useLocation';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';

import { Dot } from './Dot';
import { Empty } from './empty-tip';
import { AccordionContent, AccordionTrigger } from './ui/accordion';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

const FolderTreeItem = ({ data, parent_id }: { data: FolderNode[]; parent_id: string | null }) => {
  const { createFolder, activeFolderId } = useFolders();
  const { setAbsoluteLocation } = useLocation();
  const { user } = useUser();

  const createNewFolder = () => {
    createFolder('new folder', user?.id as string, parent_id);
  };

  return (
    <div role="tree">
      <ul>
        {data.map((item) => {
          const isActiveFolder = activeFolderId === item.id;
          return (
            <li key={item.id}>
              <AccordionPrimitive.Item value={item.id}>
                <AccordionTrigger
                  className={cn(
                    'w-full flex px-2 items-center group',
                    isActiveFolder && 'bg-accent text-accent-foreground',
                  )}
                  onClick={() => setAbsoluteLocation(`/folder/${item.id}`)}
                >
                  <FolderIcon
                    className="h-4 w-4 shrink-0 mr-2 text-accent-foreground/50"
                    aria-hidden="true"
                  />
                  <span className="text-sm truncate">{item.name}</span>
                  {isActiveFolder && <Dot />}
                </AccordionTrigger>
                <AccordionContent className="pl-6 relative pb-0">
                  <CornerDownRight
                    color="currentColor"
                    size={10}
                    className="absolute top-0 left-5 text-accent-foreground/50"
                  />
                  <FolderTreeItem data={item.children} parent_id={item.id} />
                </AccordionContent>
              </AccordionPrimitive.Item>
            </li>
          );
        })}
      </ul>
      {data.length < 1 && <Empty />}
      <Button
        onClick={createNewFolder}
        size="tiny"
        variant="ghost"
        className="w-full text-accent-foreground/50"
        tooltip="Add a folder"
      >
        <Plus size={15} />
      </Button>
    </div>
  );
};

export const FolderTreeRoot = ({ className }: { className?: string }) => {
  const { folderTree } = useFolders();
  const { ref: refRoot, width, height } = useResizeObserver();

  return (
    <div ref={refRoot} className={cn('overflow-hidden', className)}>
      <ScrollArea style={{ width, height }}>
        <div className="relative p-2">
          <AccordionPrimitive.Root type="multiple" defaultValue={[]}>
            <FolderTreeItem data={folderTree} parent_id={null} />
          </AccordionPrimitive.Root>
        </div>
      </ScrollArea>
    </div>
  );
};
