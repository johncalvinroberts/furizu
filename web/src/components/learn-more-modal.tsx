import { NEW_USER_DEFAULT_QUOTA_BYTES } from '@shared/constants';
import { ConstructionIcon } from 'lucide-react';

import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { useToggle } from '@/hooks/useToggle';
import { cn, formatFileSize } from '@/lib/utils';

import { Lockup } from './lockup';
import { Button } from './ui/button';

type LearnMoreModalProps = {
  isOpen: boolean;
  handleOpenChange: () => void;
};

export const LearnMoreModal = ({ isOpen, handleOpenChange }: LearnMoreModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] pt-10">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Coming Soon
          <ConstructionIcon className="inline-flex ml-2" />
        </h1>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          <Lockup className="inline-flex" variant="text-only" /> currently offers{' '}
          {formatFileSize(NEW_USER_DEFAULT_QUOTA_BYTES, 'long')} in totally free end-to-end
          encrypted cloud storage to new users. Stay tuned — more capacity coming soon!
        </p>
        <DialogFooter>
          <Button onClick={handleOpenChange}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const LearnMoreButton = ({ className }: { className?: string }) => {
  const { isOpen, toggle } = useToggle();
  return (
    <>
      <Button
        className={cn('line-clamp-2 text-xs text-muted-foreground italic p-0 h-auto', className)}
        variant="ghost"
        onClick={toggle}
      >
        Learn more
      </Button>
      <LearnMoreModal isOpen={isOpen} handleOpenChange={toggle} />
    </>
  );
};
