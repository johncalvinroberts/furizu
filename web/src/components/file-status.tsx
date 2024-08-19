import { FileState } from '@shared/types';
import { LockIcon } from 'lucide-react';
import { PropsWithChildren } from 'react';

import { File_locations } from '@/generated/client';
import { cn } from '@/lib/utils';

import { FileLocationsList } from './file-locations-list';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

type Props = {
  state: FileState;
  className?: string;
  locations?: File_locations[] | null | undefined;
};

const ListTooltip = ({ locations, children }: PropsWithChildren<Pick<Props, 'locations'>>) => {
  if (!locations || locations.length < 1) return children;
  return (
    <Tooltip>
      <TooltipContent className="bg-background text-foreground text-xs">
        <FileLocationsList locations={locations} />
      </TooltipContent>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
    </Tooltip>
  );
};

const FileStatus = ({ state, className, locations }: Props) => {
  switch (state) {
    case 'created':
    case 'encrypting':
    case 'propagating':
      return (
        <ListTooltip locations={locations}>
          <span className={cn(className, 'px-2 capitalize')}>{state}...</span>
        </ListTooltip>
      );

    case 'done':
      return (
        <ListTooltip locations={locations}>
          <span className={cn(className, 'px-2 bg-accent flex items-center justify-between')}>
            <LockIcon size={10} className="mr-2" />
            Ready
          </span>
        </ListTooltip>
      );
    default:
      break;
  }
};

export default FileStatus;
