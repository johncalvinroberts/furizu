import { cn } from '@/lib/utils';

export const Empty = ({ className }: { className?: string }) => {
  return (
    <div className={cn('text-sm text-center text-accent-foreground/50', className)}>(empty)</div>
  );
};
