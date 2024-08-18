import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { File_locations } from '@/generated/client';
import { useFileById, useFileFetchDecryptDownload } from '@/hooks/useFiles';
import { cn } from '@/lib/utils';

import { Button } from './ui/button';

type Props = {
  fileId: string;
  className?: string;
};

export const DownloadComboButton = ({ fileId, className }: Props) => {
  const [location, setLocation] = useState<File_locations>();
  const { file } = useFileById(fileId);
  const { startDownloadAndDecrypt } = useFileFetchDecryptDownload(fileId, location);

  const handleDownload = async () => {
    if (!location) {
      throw new Error('no location selected; select a file location');
    }
    if (location.provider_type === 'opfs') {
      console.error('not implemented yet: add opfs file provider type');
    }
    if (location.provider_type == 's3like_object_storage') {
      startDownloadAndDecrypt();
    }
  };

  useEffect(() => {
    if (file?.file_locations?.[0]) {
      setLocation(file?.file_locations?.[0]);
    }
  }, [file?.file_locations]);

  return (
    <div className={cn('w-full flex', className)}>
      <Button
        className="rounded-none rounded-l-md border border-primary"
        onClick={handleDownload}
        disabled={!location}
      >
        {location ? `Download from ${location?.provider_display_name}` : 'Download'}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="rounded-none rounded-r-md border border-l-input border-t-0 border-r-0 border-b-0"
            disabled={!location}
          >
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {file?.file_locations?.map((item) => (
            <DropdownMenuCheckboxItem
              key={item.id}
              checked={item.id === location?.id}
              onClick={() => setLocation(item)}
            >
              {item.provider_name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
