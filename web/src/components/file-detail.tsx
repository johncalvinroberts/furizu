import { FileState } from '@shared/types';
import { Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';

import { useFileById, useFiles } from '@/hooks/useFiles';
import { useLocation } from '@/hooks/useLocation';
import { useToggle } from '@/hooks/useToggle';
import { formatFileSize, getErrorMessageString } from '@/lib/utils';

import { DownloadComboButton } from './DownloadComboButton';
import { Empty } from './empty-tip';
import FileStatus from './file-status';
import { InlineFileForm } from './forms/inline-file-form';
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
  const { toggle: toggleInlineForm, isOpen: isInlineFormOpen } = useToggle();

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
        {!isInlineFormOpen && (
          <div className="flex w-full space-between gap-1">
            <h3 className="font-bold flex-1 mb-2">{file?.name}</h3>
            <div className="pt-[5px]">
              <FileStatus state={file.state as FileState} className="h-[20px]" />
            </div>
            <div className="">
              <Button
                size="icon"
                variant="ghost"
                tooltip="Edit name of this file"
                onClick={toggleInlineForm}
              >
                <Edit size={12} />
              </Button>
              <Button size="icon" variant="ghost" tooltip="Delete this file" onClick={toggleDelete}>
                <Trash size={12} />
              </Button>
            </div>
          </div>
        )}
        {isInlineFormOpen && (
          <div className="flex w-full space-between gap-1">
            <div className="text-primary text-xs pt-1 w-[100px] border-border border-r">Name:</div>
            <InlineFileForm onSuccess={toggleInlineForm} file={file} />
          </div>
        )}
        <div className="flex w-full space-between gap-1 text-xs mb-4">
          <div>{formatFileSize(file.size, 'long')}</div>
        </div>
        <div className="flex w-full space-between gap-1">
          <div className="text-primary text-xs pt-1 w-[100px] border-border border-r">Created:</div>
          <div className="flex items-center text-xs">
            <TimeDisplay date={file.created_at} />
          </div>
        </div>
        <div className="flex w-full space-between gap-1">
          <div className="text-primary text-xs pt-1 w-[100px] border-border border-r">
            Last Modified:
          </div>
          <div className="flex items-center text-xs">
            <TimeDisplay date={file.updated_at} />
          </div>
        </div>
      </div>
      <DownloadComboButton fileId={id} className="mb-2" />
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
