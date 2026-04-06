import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function AiAssistantButton() {
  const [expanded, setExpanded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const startTimer = () => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setExpanded(true), 5000);
    };

    const onActivity = () => {
      if (expanded) setExpanded(false);
      startTimer();
    };

    const events = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    startTimer();

    return () => {
      clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, [expanded]);

  return (
    <motion.button
      layout
      onClick={() => setExpanded(!expanded)}
      className="fixed bottom-6 right-4 z-40 flex items-center rounded-full bg-[#2D2D2D] shadow-lg active:scale-[0.98] transition-colors"
      style={{ padding: expanded ? '6px 14px 6px 6px' : '0px' }}
      aria-label="AI Assistant"
    >
      <motion.div
        layout
        className="h-10 w-10 shrink-0 rounded-full overflow-hidden"
      >
        <img
          src="https://imgv3.fotor.com/images/homepage-feature-card/fotor-3d-avatar.jpg"
          alt="Assistant"
          className="h-10 w-10 rounded-full object-cover"
        />
      </motion.div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden whitespace-nowrap ml-2 text-left"
          >
            <p className="text-white font-semibold leading-tight" style={{ fontSize: '14px' }}>
              Need help?
            </p>
            <p className="text-white/70 leading-tight" style={{ fontSize: '11px' }}>
              Click here to chat!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
