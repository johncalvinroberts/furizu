import { useEffect } from 'react';
import { toast } from 'sonner';

import { useLocation } from '@/hooks/useLocation';
import { useUser } from '@/hooks/useUser';

import { SignupForm } from '../../forms/signup-form';

export const Signup = () => {
  const { isUnprovisional } = useUser();
  const { setAbsoluteLocation } = useLocation();

  useEffect(() => {
    if (isUnprovisional) {
      setAbsoluteLocation('/');
      toast.success('Successfully signed up');
    }
  }, [isUnprovisional, setAbsoluteLocation]);

  return (
    <>
      <SignupForm />
    </>
  );
};
