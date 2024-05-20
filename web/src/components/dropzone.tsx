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
    <div className={cn('relative h-full w-full', className)}>
      <div className="absolute w-full h-full inset-0" {...getRootProps()}>
        <div
          className={cn(
            'flex items-center justify-center opacity-0 transition-opacity w-full h-full relative',
            {
              'opacity-[0.8] cursor-pointer z-10': isDragActive,
              'opacity-[0.5] cursor-pointer hover:opacity-[0.6]': isEmpty,
            },
          )}
        >
          <div className="absolute bg-accent inset-0 w-full h-full" />
          <div className="z-10 flex items-center justify-center flex-col">
            <Plus size={40} />
            <span>Drop files here to upload</span>
          </div>
        </div>
        <input {...getInputProps()} />
      </div>
      <div
        className={cn('relative', {
          'z-10': !isDragActive,
        })}
      >
        {children}
      </div>
    </div>
  );
};
