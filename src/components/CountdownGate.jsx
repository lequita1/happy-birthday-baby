import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence} from 'framer-motion';
import { TARGET_DATE } from '../config';
import { useReducedMotion } from '../useMotionPreferenceuse';
import '../css/CountDownGate.css';

const LABEL_TEXT = 'until then';

function getTimeParts(target) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    done: diff <= 0,
  };
}

function Digit({ value, reduceMotion }) {
  return (
    <span className="digit-window">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className="digit"
          initial={reduceMotion ? false : { y: '-100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={reduceMotion ? undefined : { y: '100%', opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Unit({ label, value, reduceMotion }) {
  const padded = String(value).padStart(2, '0');
  return (
    <div className="unit">
      <div className="digit-pair">
        {padded.split('').map((d, i) => (
          <Digit key={i} value={d} reduceMotion={reduceMotion} />
        ))}
      </div>
      <span className="unit-label">{label}</span>
    </div>
  );
}

export default function CountdownGate({ onUnlock }) {
  const [time, setTime] = useState(() => getTimeParts(TARGET_DATE));
  const [fading, setFading] = useState(false);
  const reduceMotion = useReducedMotion();
  const hasUnlocked = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const parts = getTimeParts(TARGET_DATE);
      setTime(parts);

      if (parts.done && !hasUnlocked.current) {
        hasUnlocked.current = true;
        setFading(true);
        setTimeout(() => onUnlock(), 700);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [onUnlock]);

  return (
    <AnimatePresence>
      {!fading && (
        <motion.div
          className="countdown-gate"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        >
          <div className="countdown-row">
            <Unit label="days" value={time.days} reduceMotion={reduceMotion} />
            <Unit label="hours" value={time.hours} reduceMotion={reduceMotion} />
            <Unit label="min" value={time.minutes} reduceMotion={reduceMotion} />
            <Unit label="sec" value={time.seconds} reduceMotion={reduceMotion} />
          </div>
          <span className="countdown-hint">{LABEL_TEXT}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}