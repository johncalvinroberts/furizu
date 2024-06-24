import { useEffect } from 'react';
import { toast } from 'sonner';

import { LoginForm } from '@/components/forms/login-form';
import { useLocation } from '@/hooks/useLocation';
import { useUser } from '@/hooks/useUser';

export const Login = () => {
  const { isUnprovisional } = useUser();
  const { setAbsoluteLocation } = useLocation();

  useEffect(() => {
    if (isUnprovisional) {
      setAbsoluteLocation('/');
      toast.success('Welcome Back');
    }
  }, [isUnprovisional, setAbsoluteLocation]);
  return (
    <>
      <LoginForm />
    </>
  );
};
