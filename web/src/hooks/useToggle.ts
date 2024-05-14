import { useCallback, useState } from 'react';

type UseToggle = (initialState?: boolean) => {
  isOpen: boolean;
  toggle: () => void;
};

export const useToggle: UseToggle = (initialState = false) => {
  const [isOpen, setIsOpen] = useState<boolean>(initialState);

  // Define a toggle function that will switch the state between true and false
  const toggle = useCallback(() => {
    setIsOpen((currentState) => !currentState);
  }, []);

  return { toggle, isOpen };
};
