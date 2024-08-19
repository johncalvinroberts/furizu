import { CheckCircle2Icon } from 'lucide-react';

import { File_locations } from '@/generated/client/';
import { cn } from '@/lib/utils';

type Props = {
  locations: File_locations[] | null | undefined;
};

export const FileLocationsList = ({ locations }: Props) => {
  return (
    <ul>
      {locations?.map((item, index) => (
        <li
          className={cn('group px-2 py-1 text-sm w-fit min-w-full inline-flex items-center', {
            'bg-accent': index % 2 != 0,
          })}
          key={item.id}
        >
          {item.provider_display_name}{' '}
          <CheckCircle2Icon className="text-[green] mx-2" size="14px" />
        </li>
      ))}
    </ul>
  );
};
