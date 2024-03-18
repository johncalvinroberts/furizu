import { useLocation } from 'wouter';
import { Route } from 'wouter';
import { useBrowserLocation } from 'wouter/use-browser-location';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Auth = () => {
  const [location, setLocation] = useLocation();
  // @ts-expect-error - dis "base" api not documented
  const [, setAbsoluteLocation] = useBrowserLocation({ base: '/' });
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setAbsoluteLocation('/');
    }
  };
  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Tabs defaultValue={location} className="w-full" onValueChange={(val) => setLocation(val)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="/login">Login</TabsTrigger>
            <TabsTrigger value="/signup">Signup</TabsTrigger>
          </TabsList>
          <TabsContent value="/login">
            <Route path="/login">
              <DialogHeader>
                <DialogTitle>login</DialogTitle>
                <DialogDescription>blep</DialogDescription>
              </DialogHeader>
              <DialogFooter>stuff</DialogFooter>
            </Route>
          </TabsContent>
          <TabsContent value="/signup">
            <Route path="/signup">
              <DialogHeader>
                <DialogTitle>signup</DialogTitle>
                <DialogDescription>blep</DialogDescription>
              </DialogHeader>
              <DialogFooter>stuff</DialogFooter>
            </Route>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
