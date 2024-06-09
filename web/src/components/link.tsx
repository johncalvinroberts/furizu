// handles absolute location
import { forwardRef } from 'react';
import { MouseEvent } from 'react';
import { PropsWithChildren } from 'react';

import { useLocation } from '@/hooks/useLocation';
import { cn } from '@/lib/utils';

export const Link = forwardRef<
  HTMLAnchorElement,
  PropsWithChildren<{ href: string; className?: string }>
>(({ href, children, className }, ref) => {
  const { setAbsoluteLocation } = useLocation();
  const handleNavigate = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setAbsoluteLocation(e.currentTarget.href);
  };
  return (
    <a ref={ref} href={href} onClick={handleNavigate} className={cn(className)}>
      {children}
    </a>
  );
});

Link.displayName = 'Link';
