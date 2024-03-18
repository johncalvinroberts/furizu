import { Route, Switch } from 'wouter';

import { Auth } from '@/components/pages/auth';
import { FileDetailPage } from '@/components/pages/file';
import { FolderDetailPage } from '@/components/pages/folder';
import { PanelLayout } from '@/components/panel-layout';
import { ThemeProvider } from '@/components/theme-provider';

function App() {
  return (
    <ThemeProvider>
      <div className="w-full flex min-h-screen flex-col bg-background">
        <main className="flex-1 flex flex-col">
          {/* TODO: this should be /folder/:id */}
          <Switch>
            <PanelLayout>
              <Route path="/" nest>
                <FolderDetailPage />
                <Route path="/file/:id">
                  <FileDetailPage />
                </Route>
                <Route path="/auth" nest>
                  <Auth />
                </Route>
              </Route>
            </PanelLayout>
            <Route path="*">404</Route>
          </Switch>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
