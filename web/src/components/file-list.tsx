import { FileState } from '@shared/types';
import { Plus } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

import { Panel } from '@/components/panel-layout';
import { DEFAULT_LAYOUT } from '@/config';
import { Files } from '@/generated/client';
import { useFiles, useFilesByFolderId } from '@/hooks/useFiles';
import { useLocation } from '@/hooks/useLocation';
import { cn, formatFileSize } from '@/lib/utils';

import { Dropzone } from './dropzone';
import FileStatus from './file-status';
import { FolderBreadCrumbs } from './folder-bread-crumbs';
import { Link } from './link';
import TimeDisplay from './time-display';
import { Button } from './ui/button';

type Props = {
  folder_id: string;
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
      className={cn('group px-2 py-1 text-sm w-fit min-w-full block', {
        'hover:bg-accent/30': index % 2 == 0,
        'bg-accent hover:bg-accent/80': index % 2 != 0,
      })}
    >
      <Link href={`/folder/${file.folder_id}/file/${file.id}`} className="flex w-full">
        <span className="flex-none w-[220px] min-w-[180px] flex space-between gap-1 px-2">
          <span className="block text-ellipsis overflow-hidden text-nowrap w-full font-medium">
            {file.name}
          </span>
        </span>
        <span className="flex-none w-[100px] text-xs text-nowrap flex items-center">
          {formatFileSize(file.size, 'short')}
        </span>
        <span className="flex-none w-[100px] text-xs text-nowrap flex items-center">
          <FileStatus state={file.state as FileState} />
        </span>
        <span className="flex-none w-[180px] text-xs flex items-center">
          <TimeDisplay date={file.created_at} />
        </span>
        <span className="flex-none w-[180px] text-xs flex items-center">
          <TimeDisplay date={file.updated_at} />
        </span>
      </Link>
    </li>
  );
};

export const FolderFileList = ({ folder_id }: Props) => {
  const { location } = useLocation();
  const isFileDetailPage = location !== '/';
  const { createFile } = useFiles();
  const { files } = useFilesByFolderId(folder_id);

  const handleDrop = async (files: File[]) => {
    files.forEach((file) => {
      createFile(file, folder_id);
    });
  };

  const isEmpty = files.results && files.results.length < 1;

  return (
    <Panel
      defaultSize={DEFAULT_LAYOUT[1]}
      minSize={30}
      top={<FolderBreadCrumbs id={folder_id} />}
      withHandle={isFileDetailPage}
    >
      <div className="h-full">
        <Dropzone isEmpty={isEmpty} onDrop={handleDrop} className="h-full w-full max-w-full">
          <div className="w-fit max-w-full min-w-full overflow-scroll">
            <div className="px-2 py-1 flex bg-muted border-b border-border sticky text-xs min-w-full w-fit">
              <div className="flex-none w-[220px] min-w-[180px] font-normal">Name</div>
              <div className="flex-none w-[100px] font-normal">Size</div>
              <div className="flex-none w-[100px] font-normal">Status</div>
              <div className="flex-none w-[180px] font-normal">Created At</div>
              <div className="flex-none w-[180px] font-normal">Last Modified</div>
            </div>
            <ul className="max-w-full">
              {files?.results?.map((item, index) => (
                <FileListItem key={item.id} file={item} index={index} />
              ))}
              {!isEmpty && (
                <li>
                  <UploadButton onDrop={handleDrop} />
                </li>
              )}
            </ul>
          </div>
        </Dropzone>
      </div>
    </Panel>
  );
};
