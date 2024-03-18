import { Panel } from '@/components/panel-layout';
import { DEFAULT_LAYOUT } from '@/config';

export const FolderDetailPage = () => {
  return (
    <Panel defaultSize={DEFAULT_LAYOUT[1]} minSize={30} top={<>stuff here</>} withHandle>
      <div>file list for current folder here</div>
    </Panel>
  );
};
