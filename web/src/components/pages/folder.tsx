import { useEffect } from 'react';
import { useParams } from 'wouter';

import { useActiveFolder } from '@/hooks/useActiveFolder';
import { useUser } from '@/hooks/useUser';

import { FolderFileList } from '../file-list';

type Props = {
  root: boolean;
};

export const FolderDetailPage = ({ root = false }: Props) => {
  const { user } = useUser();
  const params = useParams<{ id: string | undefined }>();
  const id = root ? user?.default_folder_id : params.id;

  useEffect(() => {
    useActiveFolder.setState({ id: id ?? null });
  }, [id]);

  return <FolderFileList folder_id={id as string} />;
};
