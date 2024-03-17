import { NotepadText, Plus, Upload } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from './ui/button';

export const UploadButton = () => {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size={'icon'} variant={'outline'}>
            <Plus />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </DropdownMenuItem>
          <DropdownMenuItem>
            <NotepadText className="mr-2 h-4 w-4" />
            Manual Text Note
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
