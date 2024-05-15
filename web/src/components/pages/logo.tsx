import { DEFAULT_LAYOUT } from '@/config';

import { InteractiveLogo } from '../interactive-logo';
import { Panel } from '../panel-layout';

const logo = () => {
  return (
    <Panel defaultSize={DEFAULT_LAYOUT[1]} minSize={30}>
      <div className="flex items-center w-full h-full p-[20]">
        <InteractiveLogo size="400px" className="" />
      </div>
    </Panel>
  );
};

export default logo;
