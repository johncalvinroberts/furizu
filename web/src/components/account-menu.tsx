import { LogIn, LogOut, Settings, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'wouter';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBearer } from '@/hooks/useBearer';

import { Button } from './ui/button';

type Props = {
  size?: 'tiny' | 'icon';
  variant?: 'outline' | 'ghost';
  className?: string;
};

export const AccountMenu = ({ size = 'tiny', variant = 'outline', className }: Props) => {
  const http = useBearer();
  const handleLogOut = () => {
    http.removeToken();
    toast.success('Logged out');
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={size} variant={variant} className={className}>
          <Settings className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!http.isAuthenticated && (
          <DropdownMenuItem asChild>
            <Link href="/auth/signup">
              <LogIn className="mr-2 h-4 w-4" />
              Login/Signup
            </Link>
          </DropdownMenuItem>
        )}
        {http.isAuthenticated && (
          <DropdownMenuItem asChild>
            <button onClick={handleLogOut} className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </button>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/preferences">
            <Settings2 className="mr-2 h-4 w-4" />
            Preferences
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
