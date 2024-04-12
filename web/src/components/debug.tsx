import React from 'react';

import { DEBUG } from '@/config';
import { useUser } from '@/hooks/useUser';
import { deleteDB } from '@/lib/utils';

import { Button } from './ui/button';

const DebugMode: React.FC = () => {
  const { logout, id } = useUser();
  const handleDeleteDatabase = () => {
    logout();
    deleteDB();
  };

  const handleResetUser = () => {
    logout();
  };

  if (!DEBUG) return null;

  return (
    <div className="fixed top-2 right-2 flex flex-col space-y-2 z-50 bg-[pink] p-4 shadow-lg">
      <div className="bg-background text-xs">id: {id}</div>
      <Button onClick={handleDeleteDatabase} size={'sm'}>
        Delete Database
      </Button>
      <Button onClick={handleResetUser} size={'sm'}>
        Reset User
      </Button>
    </div>
  );
};

export default DebugMode;
