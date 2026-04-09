import { useLocation } from 'react-router';
import { SmartVehicleInput } from '../components/SmartVehicleInput';

export default function Requirements() {
  const location = useLocation();
  const initialQuery = (location.state as { initialQuery?: string })?.initialQuery || '';

  return (
    <div className="h-[100svh] bg-white overflow-hidden">
      <SmartVehicleInput mode="page" initialQuery={initialQuery} />
    </div>
  );
}
