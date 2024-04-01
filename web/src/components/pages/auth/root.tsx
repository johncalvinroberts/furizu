import { Route } from 'wouter';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from '@/hooks/useLocation';

import { Login } from './login';
import { Signup } from './signup';

export const Auth = () => {
  const { location, setLocation, setAbsoluteLocation } = useLocation();
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setAbsoluteLocation('/');
    }
  };

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] pt-10">
        <Tabs defaultValue={location} className="w-full" onValueChange={(val) => setLocation(val)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="/login">Login</TabsTrigger>
            <TabsTrigger value="/signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="/login">
            <Route path="/login">
              <Login />
            </Route>
          </TabsContent>
          <TabsContent value="/signup">
            <Route path="/signup">
              <Signup />
            </Route>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
