import { InteractiveLogo } from '@/components/interactive-logo';
import { Panel } from '@/components/panel-layout';
import { DEFAULT_LAYOUT } from '@/config';

export const PlaceholderPanel = () => {
  return (
    <Panel defaultSize={DEFAULT_LAYOUT[1]} minSize={30}>
      <div className="p-4">
        <div className="mb-4">
          <div className="w-full h-full">
            <InteractiveLogo size="400px" className="" />
          </div>
        </div>
      </div>
    </Panel>
  );
};
