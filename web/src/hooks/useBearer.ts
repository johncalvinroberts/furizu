import { genUUID } from 'electric-sql/util';
import { create } from 'zustand';

import { API_URL, TOKEN_LOCALSTORAGE_KEY, USER_ID_LOCALSTORAGE_KEY } from '@/config';

import { HTTPClient } from '../lib/http';

type HttpClientState = {
  httpClient: HTTPClient;
  isAuthenticated: boolean;
  setToken: (token: string, userId: string) => void;
  removeToken: () => void;
  userId: string;
  isProvisionalUser: boolean;
};

const initialToken = localStorage.getItem(TOKEN_LOCALSTORAGE_KEY);
let initialUserId = localStorage.getItem(USER_ID_LOCALSTORAGE_KEY);
let isProvisionalUser = false;
if (!initialUserId) {
  initialUserId = genUUID();
  isProvisionalUser = true;
}

export const useBearer = create<HttpClientState>((set) => ({
  userId: initialUserId,
  isProvisionalUser,
  httpClient: new HTTPClient(API_URL, initialToken),
  isAuthenticated: Boolean(initialToken),
  setToken: (token: string, userId: string) => {
    localStorage.setItem(TOKEN_LOCALSTORAGE_KEY, token);
    localStorage.setItem(USER_ID_LOCALSTORAGE_KEY, userId);
    set({ httpClient: new HTTPClient(API_URL, token), isAuthenticated: true });
  },
  removeToken: () => {
    localStorage.removeItem(TOKEN_LOCALSTORAGE_KEY);
    return set({
      httpClient: new HTTPClient(API_URL),
      isAuthenticated: false,
    });
  },
}));
