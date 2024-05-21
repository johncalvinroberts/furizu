import { Link } from 'wouter';

import { InteractiveLogo } from './interactive-logo';

type Props = {
  variant?: 'compact' | 'full';
  className?: string;
  staticLogo?: boolean;
};
export const Lockup = ({ variant = 'full', className, staticLogo = false }: Props) => {
  return (
    <div className={className}>
      {variant === 'full' && (
        <>
          <div className="font-semibold hover:font-bold w-full flex items-center">
            <span className="mr-2">
              {staticLogo && <img src="/favicon.svg" alt="" className="w-[50px] h-[50px]" />}
              {!staticLogo && <InteractiveLogo size="50px" />}
            </span>
            <Link href="/">furizu.</Link>
          </div>
        </>
      )}
      {variant === 'compact' && (
        <>
          <Link href="/">
            {staticLogo && <img src="/favicon.svg" alt="" className="w-[10px] h-[10px]" />}
            {!staticLogo && <InteractiveLogo size="40px" />}
          </Link>
        </>
      )}
    </div>
  );
};
