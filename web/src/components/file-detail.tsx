import { Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';

import { useFileById, useFiles } from '@/hooks/useFiles';
import { useLocation } from '@/hooks/useLocation';
import { useToggle } from '@/hooks/useToggle';
import { formatFileSize, getErrorMessageString } from '@/lib/utils';

import { Empty } from './empty-tip';
import TimeDisplay from './time-display';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogFooter } from './ui/dialog';

type Props = {
  id: string;
};

const FileDetail = ({ id }: Props) => {
  const { isOpen: isDeleteOpen, toggle: toggleDelete } = useToggle(false);
  const { deleteFile } = useFiles();
  const { setAbsoluteLocation } = useLocation();

  const { file } = useFileById(id);

  const confirmDelete = async () => {
    try {
      await deleteFile(id);
      toggleDelete();
      setAbsoluteLocation(`/folder/${file?.folder_id}`);
      toast.success(`Deleted file "${file?.name}"`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to delete: ${getErrorMessageString(error)}`);
    }
  };

  if (!file) {
    return (
      <>
        <Empty />
      </>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <div className="flex w-full space-between gap-1">
          <div className="text-primary text-xs pt-1 w-[100px] border-border border-r">Size:</div>
          <div>{formatFileSize(file.size, 'long')}</div>
        </div>
        <div className="flex w-full space-between gap-1">
          <div className="text-primary text-xs pt-1 w-[100px] border-border border-r">Created:</div>
          <div>
            <TimeDisplay date={file.created_at} />
          </div>
        </div>
        <div className="flex w-full space-between gap-1">
          <div className="text-primary text-xs pt-1 w-[100px] border-border border-r">
            Last Modified:
          </div>
          <div>
            <TimeDisplay date={file.updated_at} />
          </div>
        </div>
      </div>
      <div className="flex w-full space-between gap-1">
        <div className="text-primary text-xs pt-1 w-[100px] border-border border-r">Name:</div>
        <h3 className="font-bold flex-1">{file?.name}</h3>
        <div>
          <Button size="icon" variant="ghost" tooltip="Edit this file">
            <Edit size={12} />
          </Button>
          <Button size="icon" variant="ghost" tooltip="Delete this file" onClick={toggleDelete}>
            <Trash size={12} />
          </Button>
        </div>
      </div>
      <div></div>
      <Dialog open={isDeleteOpen} onOpenChange={toggleDelete}>
        <DialogContent className="sm:max-w-[425px] pt-10">
          Are you sure you want to delete {file?.name}?
          <DialogFooter>
            <Button variant="ghost" onClick={toggleDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Yes Delete It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileDetail;
