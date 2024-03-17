import { useState } from 'react';

import { cn } from '@/lib/utils';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable';
import { Separator } from './ui/separator';

const defaultLayout = [265, 440, 655];

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
          maxSize={20}
          onCollapse={() => {
            setIsCollapsed(!isCollapsed);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(!isCollapsed)}`;
          }}
          classNames={{
            root: cn(isCollapsed && 'min-w-[50px] transition-all duration-300 ease-in-out'),
            top: 'items-center justify-center',
          }}
          withHandle
          top={<>Logo here </>}
        >
          <div>nav links here.</div>
        </MailLayoutPanel>
        <MailLayoutPanel
          defaultSize={defaultLayout[1]}
          minSize={30}
          top={<>stuff here</>}
          withHandle
        >
          <div>file list here</div>
        </MailLayoutPanel>

        <MailLayoutPanel defaultSize={defaultLayout[1]} minSize={30}>
          <div>detail view here</div>
        </MailLayoutPanel>
      </ResizablePanelGroup>
    </div>
  );
};
