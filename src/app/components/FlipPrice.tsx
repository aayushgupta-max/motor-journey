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

  const isComma = digit === ',';

  return (
    <span
      className="relative inline-flex overflow-hidden"
      style={{
        width: isComma ? '0.2em' : '0.58em',
        height: '1.15em',
      }}
    >
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
          style={{ letterSpacing: '-0.02em' }}
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
    <span className={`inline-flex items-center ${className}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
      <span className="text-[0.55em] tracking-tight opacity-70 mr-[0.3em]">AED</span>
      <span className="inline-flex items-center" style={{ letterSpacing: '-0.03em' }}>
        {digits.map((d, i) => (
          <FlipDigit key={`pos-${i}`} digit={d} delay={i * 80} />
        ))}
      </span>
    </span>
  );
}
