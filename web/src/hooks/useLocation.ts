import { useLocation as useWouterLocation } from 'wouter';
import { useBrowserLocation } from 'wouter/use-browser-location';

export const useLocation = () => {
  const [location, setLocation] = useWouterLocation();

  // @ts-expect-error - dis "base" api not documented
  const [, setAbsoluteLocation] = useBrowserLocation({ base: '/' });
  return { location, setLocation, setAbsoluteLocation };
};
