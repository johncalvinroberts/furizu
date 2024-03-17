import { PanelLayout } from '@/components/panel-layout';
import { ThemeProvider } from '@/components/theme-provider';

function App() {
  return (
    <ThemeProvider>
      <div className="w-full flex min-h-screen flex-col bg-background">
        <main className="flex-1 flex flex-col">
          <PanelLayout />
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
