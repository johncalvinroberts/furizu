import { useEffect, useState } from 'react';
import { Route, Switch } from 'wouter';

import { Auth } from '@/components/pages/auth/root';
import { FileDetailPage } from '@/components/pages/file';
import { FolderDetailPage } from '@/components/pages/folder';
import { Preferences } from '@/components/pages/preferences';
import { PanelLayout } from '@/components/panel-layout';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { DEBUG } from '@/config';
import { useUserId } from '@/hooks/useUser';
import { ElectricProvider, initElectric } from '@/lib/electric';

import DebugMode from './components/debug';
import { Electric } from './generated/client';
import { deleteDB } from './lib/utils';

function App() {
  const [electric, setElectric] = useState<Electric>();
  const { id: userId } = useUserId();
  useEffect(() => {
    const init = async () => {
      try {
        const client = await initElectric(userId as string);
        setElectric(client);
        const works = await Promise.all([
          client.db.folders.sync({
            include: {
              files: true,
            },
          }),
          client.db.users.sync(),
          client.db.quotas.sync(),
        ]);

        const synceds = works.map((item) => item.synced);
        await Promise.all(synceds);
        const timeToSync = performance.now();
        if (DEBUG) {
          console.log(`Synced in ${timeToSync}ms from page load`);
        }
      } catch (error) {
        console.error(error);
        if ((error as Error).message?.startsWith("Local schema doesn't match server's")) {
          deleteDB();
        }
        throw error;
      }
    };

    init();
  }, [userId]);

  if (electric === undefined) {
    return null;
  }

  return (
    <ThemeProvider>
      <ElectricProvider db={electric}>
        <div className="w-full flex min-h-screen flex-col bg-background">
          <main className="flex-1 flex flex-col">
            <Switch>
              <PanelLayout>
                <Route path="/" nest>
                  <Route path="/">
                    <FolderDetailPage root />
                  </Route>
                  <Route path="/folder/:id" nest>
                    <FolderDetailPage root={false} />
                    <Route path="/file/:id">
                      <FileDetailPage />
                    </Route>
                  </Route>
                  <Route path="/file/:id">
                    <FileDetailPage />
                  </Route>
                  <Route path="/auth" nest>
                    <Auth />
                  </Route>
                  <Route path="/preferences">
                    <Preferences />
                  </Route>
                </Route>
              </PanelLayout>
              <Route path="*">404</Route>
            </Switch>
          </main>
        </div>
        <DebugMode />
        <Toaster />
      </ElectricProvider>
    </ThemeProvider>
  );
}

export default App;
