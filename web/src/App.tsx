import { MailEsqueLayout } from '@/components/mail-esque-layout';
import { ThemeProvider } from '@/components/theme-provider';

function App() {
  return (
    <ThemeProvider>
      <div className="w-full flex min-h-screen flex-col bg-background">
        <main className="flex-1 flex flex-col">
          <MailEsqueLayout />
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
