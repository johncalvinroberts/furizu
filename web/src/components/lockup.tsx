import { Link } from 'wouter';
type Props = {
  variant?: 'compact' | 'full';
};
export const Lockup = ({ variant = 'full' }: Props) => {
  return (
    <Link href="/">
      {variant === 'full' && (
        <>
          <div className="font-semibold hover:font-bold">
            <span className="mr-2">❄️</span>
            furizu.
          </div>
        </>
      )}
      {variant === 'compact' && (
        <>
          <div>❄️.</div>
        </>
      )}
    </Link>
  );
};
