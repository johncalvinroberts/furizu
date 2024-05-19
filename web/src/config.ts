export const DEFAULT_LAYOUT = [25, 65, 655];
export const API_URL = import.meta.env.VITE_API_URL;
export const TOKEN_LOCALSTORAGE_KEY = 'furizu_token';
export const USER_ID_LOCALSTORAGE_KEY = 'furizu_user_id';

export const DEV_MODE = import.meta.env.DEV;
export const ELECTRIC_URL = import.meta.env.VITE_ELECTRIC_URL || 'ws://localhost:5133';

// We can override the debug mode with a query param: ?debug=true or ?debug=false
const searchParams = new URLSearchParams(window.location.search);
const debugParam = searchParams.get('debug');

// DEBUG defaults to true in dev mode, false in prod mode
export const DEBUG = debugParam === 'true';

export const WELCOME_FOLDER = 'welcome';

// Create a File from the Blob
export const WELCOME_FILE = new File(
  [new Blob(['hello world'], { type: 'text/plain' })],
  'hello-world.txt',
  {
    type: 'text/plain',
    lastModified: new Date().getTime(),
  },
);
