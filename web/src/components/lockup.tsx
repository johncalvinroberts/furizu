import { Link } from 'wouter';

import Logo from '../../public/favicon.svg';
import { InteractiveLogo } from './interactive-logo';

type Props = {
  variant?: 'compact' | 'full';
  className?: string;
};
export const Lockup = ({ variant = 'full', className }: Props) => {
  return (
    <Link href="/" className={className}>
      {variant === 'full' && (
        <>
          <div className="font-semibold hover:font-bold w-full flex items-center">
            <span className="mr-2">
              {/* <img src={Logo} alt="" className="w-[20px] h-[20px]" /> */}
              <InteractiveLogo size="50px" />
            </span>
            furizu.
          </div>
        </>
      )}
      {variant === 'compact' && (
        <>
          <div>
            <img src={Logo} alt="" className="w-[10px] h-[10px]" />.
          </div>
        </>
      )}
    </Link>
  );
};
