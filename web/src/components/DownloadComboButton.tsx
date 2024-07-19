import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { File_locations } from '@/generated/client';
import { useFileById, useFiles } from '@/hooks/useFiles';
import { cn } from '@/lib/utils';

import { Button } from './ui/button';

type Props = {
  fileId: string;
  className?: string;
};

export const DownloadComboButton = ({ fileId, className }: Props) => {
  const { fetchDecryptDownloadFile } = useFiles();
  const [location, setLocation] = useState<File_locations>();
  const { file } = useFileById(fileId);

  const handleDownload = () => {
    fetchDecryptDownloadFile(fileId);
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
        Download from {location?.provider_name}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="rounded-none rounded-r-md border border-l-input border-t-0 border-r-0 border-b-0">
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {file?.file_locations?.map((item) => (
            <DropdownMenuCheckboxItem key={item.id} checked={item.id === location?.id}>
              {item.provider_name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
