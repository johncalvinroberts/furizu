import { FileState } from '@shared/types';
import { LockIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

type Props = {
  state: FileState;
  className?: string;
};

const FileStatus = ({ state, className }: Props) => {
  switch (state) {
    case 'created':
    case 'encrypting':
    case 'propagating':
      return <span className={cn(className, 'px-2 capitalize')}>{state}...</span>;
    case 'done':
      return (
        <span className={cn(className, 'px-2 bg-accent flex items-center justify-between')}>
          <LockIcon size={10} className="mr-2" />
          Ready
        </span>
      );
    default:
      break;
  }
};

export default FileStatus;
