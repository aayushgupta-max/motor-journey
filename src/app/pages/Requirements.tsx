import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { SmartVehicleInput } from '../components/SmartVehicleInput';

export default function Requirements() {
  const location = useLocation();
  const initialQuery = (location.state as { initialQuery?: string })?.initialQuery || '';

  // Lock body scroll so nothing moves behind on iOS Safari
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.inset = '0';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.inset = '';
    };
  }, []);

  return (
    <SmartVehicleInput mode="page" initialQuery={initialQuery} />
  );
}
