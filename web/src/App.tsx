import { ThemeProvider } from '@/components/theme-provider';

import { ModeToggle } from './components/mode-toggle';
import { API_URL } from './config';

function App() {
  return (
    <ThemeProvider>
      <div className="w-full min-h-[100vh] flex items-center justify-center">
        <div>
          <p>API_URL: {API_URL}</p>
          <ModeToggle />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
