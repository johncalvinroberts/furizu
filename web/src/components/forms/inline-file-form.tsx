import { zodResolver } from '@hookform/resolvers/zod';
import { KeyboardEvent, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'sonner';
import { z } from 'zod';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Files } from '@/generated/client';
import { useFiles } from '@/hooks/useFiles';
import { getErrorMessageString } from '@/lib/utils';

import { Button } from '../ui/button';
import { Input } from '../ui/input';

type InlineFileFormProps = {
  file: Files;
  onSuccess?: () => void;
};

const formSchema = z.object({
  name: z.string().min(1).regex(/\S/),
});

export const InlineFileForm = ({ file, onSuccess }: InlineFileFormProps) => {
  const { updateFile } = useFiles();

  useHotkeys('esc', () => {
    onSuccess?.();
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: file.name,
    },
  });

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      try {
        await updateFile(file.id, values);
        onSuccess?.();
      } catch (error) {
        toast.error(`Failed to update: ${getErrorMessageString(error)}`);
      }
    },
    [updateFile, file, onSuccess],
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
                    placeholder="file..."
                    type="text"
                    autoFocus
                    className="mr-2"
                    onKeyDown={handleKeyDown}
                    {...field}
                  />
                  <Button type="submit">Ok</Button>
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
