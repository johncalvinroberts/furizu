import { FolderIcon } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';

import { DEFAULT_LAYOUT } from '@/config';
import { cn } from '@/lib/utils';

import { AccountPreview } from './account-preview';
import { FolderTreeRoot } from './folder-tree';
import { Lockup } from './lockup';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable';
import { Separator } from './ui/separator';

type PanelProps = React.ComponentProps<typeof ResizablePanel> & {
  top?: React.ReactNode;
  children?: React.ReactNode;
  classNames?: { root?: string; top?: string };
  withHandle?: boolean;
};

type Props = {
  initialized: boolean;
};

export const Panel = ({ children, top, classNames = {}, withHandle, ...props }: PanelProps) => {
  return (
    <>
      <ResizablePanel className={classNames.root} {...props}>
        {top && (
          <>
            <div className={cn(`flex h-[52px] items-center px-2 py-4`, classNames.top)}>{top}</div>
            <Separator />
          </>
        )}
        {children}
      </ResizablePanel>
      {withHandle && <ResizableHandle withHandle />}
    </>
  );
};

export const PanelLayout = ({ children, initialized }: PropsWithChildren<Props>) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };
  return (
    <div className="flex flex-col flex-1">
      <ResizablePanelGroup direction="horizontal" className="flex-1 items-stretch">
        <Panel
          defaultSize={DEFAULT_LAYOUT[0]}
          collapsedSize={4}
          // collapsible={true}
          minSize={22}
          maxSize={30}
          onCollapse={toggleCollapsed}
          classNames={{
            root: cn(isCollapsed && 'min-w-[50px] transition-all duration-300 ease-in-out'),
            top: 'items-center justify-between',
          }}
          withHandle
          top={
            <>
              <Lockup variant={isCollapsed ? 'compact' : 'full'} className="w-full" />
            </>
          }
        >
          <div className="min-h-full flex flex-col space-between">
            <div className="flex-1">
              {!isCollapsed && initialized && (
                <FolderTreeRoot className="flex-shrink-0 w-full h-[calc(100vh-52px-120px)]" />
              )}
              {isCollapsed && (
                <div className="w-full flex justify-center p-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="relative flex items-center justify-center"
                      >
                        <FolderIcon
                          className="absolute h-4 w-4 top-1 left-1"
                          fill="var(--background)"
                        />
                        <FolderIcon
                          className="absolute h-4 w-4 top-2 left-2"
                          fill="var(--background)"
                        />
                        <FolderIcon
                          className="absolute h-4 w-4 top-3 left-3"
                          fill="var(--background)"
                        />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <FolderTreeRoot className="flex-shrink-0 w-full h-[calc(100vh-52px-120px)]" />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
            <div className="border-t flex-none h-[120px] flex justify-between p-2">
              {initialized && <AccountPreview variant={isCollapsed ? 'compact' : 'full'} />}
            </div>
          </div>
        </Panel>
        {children}
      </ResizablePanelGroup>
    </div>
  );
};
