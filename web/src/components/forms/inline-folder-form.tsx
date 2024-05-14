import { zodResolver } from '@hookform/resolvers/zod';
import { KeyboardEvent, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'sonner';
import { z } from 'zod';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Folders } from '@/generated/client';
import { useFolders } from '@/hooks/useFolders';
import { getErrorMessageString } from '@/lib/utils';

import { Button } from '../ui/button';
import { Input } from '../ui/input';

type InlineFolderFormProps = {
  folder: Folders;
  onSuccess?: () => void;
};

const formSchema = z.object({
  name: z.string().min(1).regex(/\S/),
});

export const InlineFolderForm = ({ folder, onSuccess }: InlineFolderFormProps) => {
  const { updateFolder } = useFolders();

  useHotkeys('esc', () => {
    console.log('derdepr');
    onSuccess?.();
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: folder.name,
    },
  });

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      try {
        await updateFolder(folder.id, values);
        onSuccess?.();
      } catch (error) {
        toast.error(`Failed to update: ${getErrorMessageString(error)}`);
      }
    },
    [updateFolder, folder, onSuccess],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSuccess?.();
      }
    },
    [onSuccess],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex justify-center">
                  <Input
                    placeholder="folder..."
                    type="text"
                    autoFocus
                    className="mr-2"
                    onKeyDown={handleKeyDown}
                    {...field}
                  />
                  <Button type="submit" className="">
                    Ok
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
