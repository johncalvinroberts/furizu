import { useParams } from 'wouter';

import { Panel } from '@/components/panel-layout';
import { DEFAULT_LAYOUT } from '@/config';

import FileDetail from '../file-detail';

export const FileDetailPage = () => {
  const params = useParams<{ id: string | undefined }>();
  console.log({ params });
  return (
    <Panel defaultSize={DEFAULT_LAYOUT[1]} minSize={30}>
      {params.id && <FileDetail id={params.id} />}
    </Panel>
  );
};
