type Props = {
  variant?: 'compact' | 'full';
};
export const Lockup = ({ variant = 'full' }: Props) => {
  if (variant === 'full') {
    return (
      <div>
        <span className="mr-2">❄️</span>
        furizu.
      </div>
    );
  }
  if (variant === 'compact') {
    return <div>❄️.</div>;
  }
};
