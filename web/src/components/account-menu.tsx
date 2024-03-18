import { LogIn, Settings, Settings2 } from 'lucide-react';
import { Link } from 'wouter';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from './ui/button';

type Props = {
  size?: 'tiny' | 'icon';
  variant?: 'outline' | 'ghost';
  className?: string;
};

export const AccountMenu = ({ size = 'tiny', variant = 'outline', className }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={size} variant={variant} className={className}>
          <Settings className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/auth/signup">
            <LogIn className="mr-2 h-4 w-4" />
            Login/Signup
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings2 className="mr-2 h-4 w-4" />
          Preferences
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
