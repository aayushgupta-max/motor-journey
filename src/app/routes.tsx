import { createBrowserRouter } from 'react-router';
import Home from './pages/Home';
import Quotes from './pages/Quotes';
import VehicleDetails from './pages/VehicleDetails';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Home,
  },
  {
    path: '/vehicle-details',
    Component: VehicleDetails,
  },
  {
    path: '/quotes',
    Component: Quotes,
  },
]);
