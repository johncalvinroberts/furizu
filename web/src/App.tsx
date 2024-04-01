import { Route, Switch } from 'wouter';

import { Auth } from '@/components/pages/auth/root';
import { FileDetailPage } from '@/components/pages/file';
import { FolderDetailPage } from '@/components/pages/folder';
import { Preferences } from '@/components/pages/preferences';
import { PanelLayout } from '@/components/panel-layout';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

export default App;
