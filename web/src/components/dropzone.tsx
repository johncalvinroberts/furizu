import { Plus } from 'lucide-react';
import { PropsWithChildren } from 'react';
import { useDropzone } from 'react-dropzone';

import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  isEmpty?: boolean;
  onDrop: (files: File[]) => void;
};

export const Dropzone = ({ className, isEmpty, onDrop, children }: PropsWithChildren<Props>) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: !isEmpty,
  });

  return (
    <div className={cn('relative', className)} {...getRootProps()}>
      <div className={cn('absolute w-full h-full inset-0')}>
        <div
          className={cn(
            'flex items-center justify-center opacity-0 transition-opacity w-full h-full relative pointer-events-none',
            {
              'opacity-[0.8] pointer-events-auto': isDragActive,
              'opacity-[0.5] hover:opacity-[0.6] cursor-pointer pointer-events-auto': isEmpty,
            },
          )}
        >
          <div className="absolute bg-accent inset-0 w-full h-full" />
          <div className="flex items-center justify-center flex-col">
            <Plus size={40} />
            <span>Drop files here to upload</span>
          </div>
        </div>
        <input {...getInputProps()} />
      </div>
      <div className={cn('relative')}>{children}</div>
    </div>
  );
};
