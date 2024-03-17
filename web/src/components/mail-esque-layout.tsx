import { useState } from 'react';

import { cn } from '@/lib/utils';

import { AccountPreview } from './account-preview';
import { Lockup } from './lockup';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable';
import { Separator } from './ui/separator';

const defaultLayout = [310, 440, 655];

type MailPanelProps = React.ComponentProps<typeof ResizablePanel> & {
  top?: React.ReactNode;
  children?: React.ReactNode;
  classNames?: { root?: string; top?: string };
  withHandle?: boolean;
};

const MailLayoutPanel = ({
  children,
  top,
  classNames = {},
  withHandle,
  ...props
}: MailPanelProps) => {
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

export const MailEsqueLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
    document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(!isCollapsed)}`;
  };
  return (
    <div className="flex flex-col flex-1">
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
        }}
        className="flex-1 items-stretch"
      >
        <MailLayoutPanel
          defaultSize={defaultLayout[0]}
          collapsedSize={4}
          collapsible={true}
          minSize={15}
          maxSize={30}
          onCollapse={toggleCollapsed}
          classNames={{
            root: cn(isCollapsed && 'min-w-[50px] transition-all duration-300 ease-in-out'),
            top: 'items-center justify-between',
          }}
          withHandle
          top={
            <>
              <Lockup variant={isCollapsed ? 'compact' : 'full'} />
            </>
          }
        >
          <div className="h-full flex flex-col space-between">
            <div className="flex-1 p-4">folder tree view here</div>
            <div className="border-t grow-0 shrink-0 basis-[120px] flex justify-between p-2">
              <AccountPreview variant={isCollapsed ? 'compact' : 'full'} />
            </div>
          </div>
        </MailLayoutPanel>
        <MailLayoutPanel
          defaultSize={defaultLayout[1]}
          minSize={30}
          top={<>stuff here</>}
          withHandle
        >
          <div>file list for current folder here</div>
        </MailLayoutPanel>

        <MailLayoutPanel defaultSize={defaultLayout[1]} minSize={30}>
          <div>detail view here</div>
        </MailLayoutPanel>
      </ResizablePanelGroup>
    </div>
  );
};
