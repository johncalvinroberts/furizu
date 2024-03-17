import { AccountMenu } from './account-menu';
import { ModeToggle } from './mode-toggle';
import { Progress } from './ui/progress';

type Props = {
  variant?: 'compact' | 'full';
};

export const AccountPreview = ({ variant = 'full' }: Props) => {
  if (variant === 'full') {
    return (
      <>
        <div>
          <div className="text-xs font-medium">Space remaining: 91gb</div>
          <div className="px-0 py-1">
            <Progress value={91} />
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
