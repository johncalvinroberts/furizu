import { useElectric } from '@/lib/electric';

export const useFiles = () => {
  const { db } = useElectric()!;
  const createFile = (file: File, folderId: string) => {
    console.log({ folderId, file });
  };

  return { createFile };
};
