import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { SmartVehicleInput } from '../components/SmartVehicleInput';

export default function Requirements() {
  const location = useLocation();
  const initialQuery = (location.state as { initialQuery?: string })?.initialQuery || '';

  // Lock body & html to prevent any scroll/bounce behind the chat screen on iOS Safari
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    html.style.overflow = 'hidden';
    html.style.height = '100%';
    html.style.overscrollBehavior = 'none';
    body.style.overflow = 'hidden';
    body.style.height = '100%';
    body.style.overscrollBehavior = 'none';
    body.style.touchAction = 'manipulation';

    // Prevent overscroll bounce on iOS
    const preventBounce = (e: TouchEvent) => {
      // Allow scrolling inside the chat scroll area
      const target = e.target as HTMLElement;
      if (target.closest('[data-scroll-area]')) return;
      e.preventDefault();
    };
    document.addEventListener('touchmove', preventBounce, { passive: false });

    return () => {
      html.style.overflow = '';
      html.style.height = '';
      html.style.overscrollBehavior = '';
      body.style.overflow = '';
      body.style.height = '';
      body.style.overscrollBehavior = '';
      body.style.touchAction = '';
      document.removeEventListener('touchmove', preventBounce);
    };
  }, []);

  return (
    <SmartVehicleInput mode="page" initialQuery={initialQuery} />
  );
}
