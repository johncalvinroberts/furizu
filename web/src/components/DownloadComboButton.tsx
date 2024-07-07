import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { Files } from '@/generated/client';
import { useFiles } from '@/hooks/useFiles';
import { cn } from '@/lib/utils';

import { Button } from './ui/button';

type Props = {
  file: Files;
  className?: string;
};

export const DownloadComboButton = ({ file, className }: Props) => {
  const { fetchDecryptDownloadFile } = useFiles();
  const [location] = useState('default');
  const handleDownload = () => {
    fetchDecryptDownloadFile(file.id);
  };

  return (
    <div className={cn('w-full flex', className)}>
      <Button
        className="rounded-none rounded-l-md border border-primary"
        disabled={!location}
        onClick={handleDownload}
      >
        Download from {location} location
      </Button>
      <Button
        className="rounded-none rounded-r-md border border-l-input border-t-0 border-r-0 border-b-0"
        disabled
      >
        <ChevronDown />
      </Button>
    </div>
  );
};
