import { useUser } from '@/hooks/useUser';

import { formatFileSize } from '../lib/utils';
import { AccountMenu } from './account-menu';
import { ModeToggle } from './mode-toggle';
import { Progress } from './ui/progress';

type Props = {
  variant?: 'compact' | 'full';
};

export const AccountPreview = ({ variant = 'full' }: Props) => {
  const { quota } = useUser();
  const bytesTotal = Number(quota?.bytes_total) ?? 0;
  const bytesUsed = Number(quota?.bytes_used) ?? 0;

  const bytes_remaining = bytesTotal - bytesUsed;
  const percentageUsed = bytesTotal > 0 ? (bytesUsed / bytesTotal) * 100 : 0;
  const percentageRemaining = 100 - percentageUsed;

  if (variant === 'full') {
    return (
      <>
        <div className="w-full">
          <div className="text-xs font-medium w-full">
            {quota && (
              <>
                {formatFileSize(bytes_remaining, 'none')} /{' '}
                {formatFileSize(quota?.bytes_total || 0, 'short')}
              </>
            )}
          </div>
          <div className="px-0 py-1">
            <Progress value={percentageRemaining} />
          </div>
          <div className="line-clamp-2 text-xs text-muted-foreground italic">Learn more</div>
        </div>
        <div className="flex">
          <AccountMenu size="icon" variant="outline" className="mr-2" />
          <ModeToggle size="icon" variant="outline" />
        </div>
      </>
    );
  }
  if (variant === 'compact') {
    return (
      <div className="flex flex-col gap-2 w-full items-center">
        <AccountMenu size="tiny" variant="ghost" />
        <ModeToggle size="tiny" variant="ghost" />
      </div>
    );
  }
};
