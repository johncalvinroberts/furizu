// handles absolute location
import { MouseEvent } from 'react';
import { PropsWithChildren } from 'react';

import { useLocation } from '@/hooks/useLocation';
import { cn } from '@/lib/utils';

export const Link = ({
  href,
  children,
  className,
}: PropsWithChildren<{ href: string; className?: string }>) => {
  const { setAbsoluteLocation } = useLocation();
  const handleNavigate = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setAbsoluteLocation(e.currentTarget.href);
  };
  return (
    <a href={href} onClick={handleNavigate} className={cn(className)}>
      {children}
    </a>
  );
};
