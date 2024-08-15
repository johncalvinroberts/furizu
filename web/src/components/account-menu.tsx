import { LogIn, LogOut, Settings, Settings2 } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePersistedCryptoKeys } from '@/hooks/useCryptoKeys';
import { useUser } from '@/hooks/useUser';

import { Link } from './link';
import { Button } from './ui/button';

type Props = {
  size?: 'tiny' | 'icon';
  variant?: 'outline' | 'ghost';
  className?: string;
};

export const AccountMenu = ({ size = 'tiny', variant = 'outline', className }: Props) => {
  const { id, user, updatedAt, isUnprovisional, createProvisionalUser, logout } = useUser();
  const { initializePersistedKeypair } = usePersistedCryptoKeys();
  const handleLogOut = () => {
    logout();
    toast.success('Logged out');
  };

  useEffect(() => {
    // this should ONLY happen if the user is visiting for the first time
    if (!user && updatedAt != null && id) {
      createProvisionalUser(id);
    }
    // this should happen when the user has been defined,
    // for both new users (AFTER createProvisionalUser)
    // and for returning users
    if (id && user) {
      initializePersistedKeypair(id);
    }

    // eslint-disable-next-line
  }, [user, updatedAt, id]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={size} variant={variant} className={className}>
          <Settings className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!isUnprovisional && (
          <DropdownMenuItem asChild>
            <Link href="/auth/signup">
              <LogIn className="mr-2 h-4 w-4" />
              Login/Signup
            </Link>
          </DropdownMenuItem>
        )}
        {isUnprovisional && (
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
