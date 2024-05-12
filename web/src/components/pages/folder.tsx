import { useParams } from 'wouter';

import { Panel } from '@/components/panel-layout';
import { DEFAULT_LAYOUT } from '@/config';
import { useFilesByFolderId } from '@/hooks/useFiles';
import { useLocation } from '@/hooks/useLocation';
import { useUser } from '@/hooks/useUser';

type Props = {
  root: boolean;
};

type InnerProps = {
  id: string;
};

export const FolderDetailPageInner = ({ id }: InnerProps) => {
  const { location } = useLocation();
  const isNested = location !== '/';
  const files = useFilesByFolderId(id);

  return (
    <Panel defaultSize={DEFAULT_LAYOUT[1]} minSize={30} top={<>stuff here</>} withHandle={isNested}>
      <div>{files?.results?.map((item) => <div key={item.id}>{item.name}</div>)}</div>
    </Panel>
  );
};

export const FolderDetailPage = ({ root = false }: Props) => {
  const { user } = useUser();
  const params = useParams<{ id: string | undefined }>();
  const id = root ? user?.default_folder_id : params.id;
  return <FolderDetailPageInner id={id as string} />;
};
