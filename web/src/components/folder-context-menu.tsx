import { Edit, EllipsisVertical, Trash } from 'lucide-react';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Folders } from '@/generated/client';
import { useFolders } from '@/hooks/useFolders';
import { useLocation } from '@/hooks/useLocation';
import { useToggle } from '@/hooks/useToggle';
import { getErrorMessageString } from '@/lib/utils';

import { Button } from './ui/button';
import { Dialog, DialogContent, DialogFooter } from './ui/dialog';

export const FolderContextMenu = ({
  folder,
  className,
  onClickRename,
}: {
  folder: Folders;
  className?: string;
  onClickRename: () => void;
}) => {
  const { isOpen, toggle } = useToggle(false);
  const { deleteFolder } = useFolders();
  const { setAbsoluteLocation } = useLocation();
  const handleDelete = () => {
    toggle();
  };

  const confirmDelete = async () => {
    try {
      await deleteFolder(folder.id);
      toggle();
      setAbsoluteLocation(folder.parent_id ? `/folder/${folder.parent_id}` : '/');
    } catch (error) {
      console.error(error);
      toast.error(`Failed to delete: ${getErrorMessageString(error)}`);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" tooltip="Folder options" className={className}>
            <EllipsisVertical color="currentColor" size={12} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="flex w-full justify-between" onClick={onClickRename}>
            <span>Rename</span>
            <Edit size={12} />
          </DropdownMenuItem>
          <DropdownMenuItem className="flex w-full justify-between" onClick={handleDelete}>
            <span>Delete</span>
            <Trash size={12} />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={isOpen} onOpenChange={toggle}>
        <DialogContent className="sm:max-w-[425px] pt-10">
          Are you sure you want to delete {folder.name}?
          <DialogFooter>
            <Button variant="ghost" onClick={toggle}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Yes Delete It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
