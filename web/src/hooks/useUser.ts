import { genUUID } from 'electric-sql/util';

import { USER_ID_LOCALSTORAGE_KEY } from '@/config';

export let userId = localStorage.getItem(USER_ID_LOCALSTORAGE_KEY);
export let isProvisionalUser = false;
if (!userId) {
  userId = genUUID();
  isProvisionalUser = true;
}

export const useUser = () => {};
