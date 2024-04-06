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
import { dbName, ElectricProvider, initElectric } from '@/lib/electric';

import { Electric } from './generated/client';
import { useBearer } from './hooks/useBearer';

function deleteDB() {
  console.log("Deleting DB as schema doesn't match server's");
  const DBDeleteRequest = window.indexedDB.deleteDatabase(dbName);
  DBDeleteRequest.onsuccess = function () {
    console.log('Database deleted successfully');
  };
  // the indexedDB cannot be deleted if the database connection is still open,
  // so we need to reload the page to close any open connections.
  // On reload, the database will be recreated.
  window.location.reload();
}

function App() {
  const [electric, setElectric] = useState<Electric>();
  const { userId } = useBearer();
  useEffect(() => {
    const init = async () => {
      try {
        const client = await initElectric(userId);
        setElectric(client);

        const { synced } = await client.db.folders.sync({
          include: {
            files: true,
          },
        });
        await synced;
        const timeToSync = performance.now();
        if (DEBUG) {
          console.log(`Synced in ${timeToSync}ms from page load`);
        }
      } catch (error) {
        if ((error as Error).message.startsWith("Local schema doesn't match server's")) {
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
                {/* TODO: this should be /folder/:id */}
                <Route path="/" nest>
                  <FolderDetailPage />
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
        <Toaster />
      </ElectricProvider>
    </ThemeProvider>
  );
}

export default App;
