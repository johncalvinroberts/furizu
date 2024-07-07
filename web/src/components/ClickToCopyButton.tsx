import { Check, Copy } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = {
  value: string;
};

export const ClickToCopyButton = ({ value }: Props) => {
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex w-full max-w-sm items-center">
      <Input
        type="text"
        value={value}
        readOnly
        className="flex-grow rounded-none rounded-l-md mr-0"
      />
      <Button
        onClick={onCopy}
        variant="outline"
        size="icon"
        className="ml-0 rounded-none rounded-r-md border-l-0"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default ClickToCopyButton;
