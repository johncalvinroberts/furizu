import { useEffect } from 'react';
import { useParams } from 'wouter';

import { Panel } from '@/components/panel-layout';
import { DEFAULT_LAYOUT } from '@/config';
import { useActiveFolder } from '@/hooks/useActiveFolder';
import { useFilesByFolderId } from '@/hooks/useFiles';
import { useLocation } from '@/hooks/useLocation';
import { useUser } from '@/hooks/useUser';

import { Empty } from '../empty-tip';
import { FolderBreadCrumbs } from '../folder-bread-crumbs';
import { Link } from '../link';

type Props = {
  root: boolean;
};

type InnerProps = {
  id: string;
};

export const FolderDetailPageInner = ({ id }: InnerProps) => {
  const { location } = useLocation();
  const isFileDetailPage = location !== '/';
  const files = useFilesByFolderId(id);

  return (
    <Panel
      defaultSize={DEFAULT_LAYOUT[1]}
      minSize={30}
      top={<FolderBreadCrumbs id={id} />}
      withHandle={isFileDetailPage}
    >
      <ul>
        {files?.results?.map((item) => (
          <li key={item.id}>
            <Link href={`/folder/${id}/file/${item.id}`}>{item.name}</Link>
          </li>
        ))}
      </ul>
      {files.results && files.results.length < 1 && <Empty className="w-full p-10" />}
    </Panel>
  );
};

export const FolderDetailPage = ({ root = false }: Props) => {
  const { user } = useUser();
  const params = useParams<{ id: string | undefined }>();
  const id = root ? user?.default_folder_id : params.id;
  useEffect(() => {
    useActiveFolder.setState({ id: id ?? null });
  }, [id]);
  return <FolderDetailPageInner id={id as string} />;
};
