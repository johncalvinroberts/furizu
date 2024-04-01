import { create } from 'zustand';

import { API_URL, TOKEN_LOCALSTORAGE_KEY } from '@/config';

import { HTTPClient } from '../lib/http';

type HttpClientState = {
  client: HTTPClient;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  removeToken: () => void;
};

const initialToken = localStorage.getItem(TOKEN_LOCALSTORAGE_KEY);

export const useHttpClient = create<HttpClientState>((set) => ({
  client: new HTTPClient(API_URL, initialToken),
  isAuthenticated: Boolean(initialToken),
  setToken: (token: string) => {
    localStorage.setItem(TOKEN_LOCALSTORAGE_KEY, token);
    set({ client: new HTTPClient(API_URL, token), isAuthenticated: true });
  },
  removeToken: () => {
    localStorage.removeItem(TOKEN_LOCALSTORAGE_KEY);
    return set({
      client: new HTTPClient(API_URL),
      isAuthenticated: false,
    });
  },
}));
