import { FileState } from '@shared/types';
import { Plus } from 'lucide-react';
import { ChangeEvent, useRef } from 'react';

import { Panel } from '@/components/panel-layout';
import { DEFAULT_LAYOUT } from '@/config';
import { FileWithLocations, useFiles, useFilesByFolderId } from '@/hooks/useFiles';
import { useLocation } from '@/hooks/useLocation';
import { cn, formatFileSize } from '@/lib/utils';

import { Dot } from './Dot';
import { Dropzone } from './dropzone';
import FileStatus from './file-status';
import { FolderBreadCrumbs } from './folder-bread-crumbs';
import { Link } from './link';
import TimeDisplay from './time-display';
import { Button } from './ui/button';

type Props = {
  folder_id: string;
};

const UploadButton = ({ onChange }: { onChange: (files: File[]) => void }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onChange(Array.from(event.target.files));
    }
  };

  return (
    <Button
      tooltip="Upload a file"
      size="tiny"
      variant="ghost"
      className="w-full text-accent-foreground/50 rounded-none"
      onClick={handleClick}
    >
      <Plus size={20} />
      <input
        ref={fileInputRef}
        type="file"
        accept="*"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </Button>
  );
};

const FileListItem = ({
  file,
  index,
  isActive,
}: {
  file: FileWithLocations;
  index: number;
  isActive: boolean;
}) => {
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
            {isActive && <Dot />} {file.name}
          </span>
        </span>
        <span className="flex-none w-[100px] text-xs text-nowrap flex items-center">
          {formatFileSize(file.size, 'short')}
        </span>
        <span className="flex-none w-[100px] text-xs text-nowrap flex items-center">
          <FileStatus state={file.state as FileState} locations={file.file_locations} />
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
  const fileDetailPageId = location.split('/').pop();

  const { createFile } = useFiles();
  const { files } = useFilesByFolderId(folder_id);

  const handleDrop = (files: File[]) => {
    files.forEach((file) => createFile(file, folder_id));
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
                <FileListItem
                  key={item.id}
                  file={item}
                  index={index}
                  isActive={isFileDetailPage && fileDetailPageId === item.id}
                />
              ))}
              {!isEmpty && (
                <li>
                  <UploadButton onChange={handleDrop} />
                </li>
              )}
            </ul>
          </div>
        </Dropzone>
      </div>
    </Panel>
  );
};
