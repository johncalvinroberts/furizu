import { Panel } from '@/components/panel-layout';
import { DEFAULT_LAYOUT } from '@/config';

export const FileDetailPage = () => {
  return (
    <Panel defaultSize={DEFAULT_LAYOUT[1]} minSize={30}>
      <div>detail view here</div>
    </Panel>
  );
};
