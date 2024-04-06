import { RegisterResponse } from '@furizu-types/users';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useBearer } from '@/hooks/useBearer';
import { useLocation } from '@/hooks/useLocation';
import { getErrorMessageString } from '@/lib/utils';

const PASSWORD_REGEX = new RegExp('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\\da-zA-Z]).{8,}$');

const formSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(64, {
      message: "That's way too long",
    })
    .regex(PASSWORD_REGEX, {
      message: 'one special character, one lower case letter, one uppercase letter',
    }),
});

export const Signup = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const { setAbsoluteLocation } = useLocation();
  const http = useBearer();
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await http.httpClient.post<RegisterResponse>('api/v1/users/register', {
        password: values.password,
        email: values.email,
      });
      http.setToken(res.token.token);
      setAbsoluteLocation('/');
      toast.success('Successfully signed up');
    } catch (error) {
      toast.error(`Sign up failed: ${getErrorMessageString(error)}`);
      console.error(error);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="person@website.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit">Sign up</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};
