import { create } from 'zustand';

type ActiveFolderState = {
  id: string | null;
};

export const useActiveFolder = create<ActiveFolderState>(() => ({
  id: null,
}));
