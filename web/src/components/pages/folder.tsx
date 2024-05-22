import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useParams } from 'wouter';

import { Panel } from '@/components/panel-layout';
import { DEFAULT_LAYOUT } from '@/config';
import { Files } from '@/generated/client';
import { useActiveFolder } from '@/hooks/useActiveFolder';
import { useFiles, useFilesByFolderId } from '@/hooks/useFiles';
import { useLocation } from '@/hooks/useLocation';
import { useUser } from '@/hooks/useUser';
import { cn, formatFileSize } from '@/lib/utils';

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

const FileListItem = ({ file, index }: { file: Files; index: number }) => {
  return (
    <li
      className={cn('group px-2 py-1 text-sm w-full block', {
        'hover:bg-accent/30': index % 2 == 0,
        'bg-accent hover:bg-accent/80': index % 2 != 0,
      })}
    >
      <Link href={`/folder/${file.folder_id}/file/${file.id}`} className="flex w-full">
        <span className="flex-none w-[35%] flex space-between gap-1 px-2">
          <span className="block text-ellipsis overflow-hidden text-nowrap w-full font-medium">
            {file.name}
          </span>
          <span className="text-xs text-nowrap flex items-center">
            {formatFileSize(file.size, 'short')}
          </span>
        </span>
        <span className="flex-none w-[200px]">
          <TimeDisplay date={file.created_at} />
        </span>
        <span className="flex-none w-[200px]">
          <TimeDisplay date={file.updated_at} />
        </span>
      </Link>
    </li>
  );
};

export const FolderDetailPageInner = ({ id }: InnerProps) => {
  const { location } = useLocation();
  const isFileDetailPage = location !== '/';
  const { createFile } = useFiles();
  const { files } = useFilesByFolderId(id);

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
      <div className="h-full min-w-[400px] overflow-scroll">
        <Dropzone isEmpty={isEmpty} onDrop={handleDrop} className="h-full min-w-full w-fit">
          <div className="px-2 py-1 flex w-full bg-muted border-b border-border sticky text-xs">
            <div className="flex-none w-[35%] min-w-[200px] font-normal">Name</div>
            <div className="flex-none w-[200px] font-normal">Created At</div>
            <div className="flex-none w-[200px] font-normal">Updated At</div>
          </div>
          <ul className="min-w-full">
            {files?.results?.map((item, index) => (
              <FileListItem key={item.id} file={item} index={index} />
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
