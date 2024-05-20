import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useParams } from 'wouter';

import { Panel } from '@/components/panel-layout';
import { DEFAULT_LAYOUT } from '@/config';
import { useActiveFolder } from '@/hooks/useActiveFolder';
import { useFiles, useFilesByFolderId } from '@/hooks/useFiles';
import { useLocation } from '@/hooks/useLocation';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';

import { Dropzone } from '../dropzone';
import { FolderBreadCrumbs } from '../folder-bread-crumbs';
import { Link } from '../link';
import TimeDisplay from '../TimeDisplay';
import { Button } from '../ui/button';

type Props = {
  root: boolean;
};

type InnerProps = {
  id: string;
};

const UploadButton = ({ onDrop }: { onDrop: (files: File[]) => void }) => {
  const { open, getInputProps } = useDropzone({ onDrop });
  return (
    <Button
      tooltip="Upload a file"
      size="tiny"
      variant="ghost"
      className="w-full text-accent-foreground/50 rounded-none"
      onClick={open}
    >
      <Plus size={20} /> <input {...getInputProps()} accept="audio/*" />
    </Button>
  );
};

export const FolderDetailPageInner = ({ id }: InnerProps) => {
  const { location } = useLocation();
  const isFileDetailPage = location !== '/';
  const files = useFilesByFolderId(id);
  const { createFile } = useFiles();

  const handleDrop = async (files: File[]) => {
    for (const file of files) {
      await createFile(file, id);
    }
  };

  const isEmpty = files.results && files.results.length < 1;

  return (
    <Panel
      defaultSize={DEFAULT_LAYOUT[1]}
      minSize={30}
      top={<FolderBreadCrumbs id={id} />}
      withHandle={isFileDetailPage}
    >
      <div className="h-full">
        <Dropzone isEmpty={isEmpty} onDrop={handleDrop}>
          <div className="px-2 py-1 flex w-full bg-accent border-b border-border sticky text-sm">
            <div className="flex-none w-[200px] font-bold">Name</div>
            <div className="flex-none w-[130px] font-bold">Created At</div>
            <div className="flex-none w-[130px] font-bold">Updated At</div>
          </div>
          <ul>
            {files?.results?.map((item, index) => (
              <li
                key={item.id}
                className={cn('group px-2 py-1 text-sm', {
                  'hover:bg-accent/30': index % 2 == 0,
                  'bg-accent hover:bg-accent/80': index % 2 != 0,
                })}
              >
                <Link href={`/folder/${id}/file/${item.id}`} className="flex w-full">
                  <span className="flex-none w-[200px]">
                    <span
                      className="block text-ellipsis overflow-hidden text-nowrap w-full"
                      title={item.name}
                    >
                      {item.name}
                    </span>
                  </span>
                  <span className="flex-none w-[130px]">
                    <TimeDisplay date={item.created_at} />
                  </span>
                  <span className="flex-none w-[130px]">
                    <TimeDisplay date={item.updated_at} />
                  </span>
                </Link>
              </li>
            ))}
            {!isEmpty && (
              <li>
                <UploadButton onDrop={handleDrop} />
              </li>
            )}
          </ul>
        </Dropzone>
      </div>
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
