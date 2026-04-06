import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

function FlipDigit({ digit, delay = 0 }: { digit: string; delay?: number }) {
  const [current, setCurrent] = useState(digit);
  const [previous, setPrevious] = useState(digit);
  const [flipping, setFlipping] = useState(false);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    if (digit !== current) {
      setPrevious(current);
      setFlipping(true);
      const timer = setTimeout(() => {
        setCurrent(digit);
        setTimeout(() => setFlipping(false), 300);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [digit]);

  return (
    <span className="relative inline-flex overflow-hidden" style={{ width: digit === ',' ? '0.35em' : '0.65em', height: '1.2em' }}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={current}
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '-100%' }}
          transition={{
            duration: 0.4,
            delay: flipping ? delay / 1000 : 0,
            ease: [0.23, 1, 0.32, 1],
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function FlipPrice({
  value,
  className = '',
}: {
  value: number;
  className?: string;
}) {
  const formatted = value.toLocaleString();
  const digits = formatted.split('');

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span className="mr-1 text-[0.6em]">AED</span>
      {digits.map((d, i) => (
        <FlipDigit key={`pos-${i}`} digit={d} delay={i * 80} />
      ))}
    </span>
  );
}
