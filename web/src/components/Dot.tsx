import { cn } from '@/lib/utils';

export const Dot = ({ className }: { className?: string }) => (
  <span
    className={cn(
      'bg-accent-foreground/50 w-[7px] h-[7px] ml-1 rounded-circle inline-flex mt-[1px]',
      className,
    )}
  />
);
