import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../useMotionPreference';
import { wishesData } from '../wishesData';
import '../css/Page7.css';

// ─────────────────────────────────────────────────────────────
// Page7 — Birthday wishes
//
// Wishes from wishesData.js fade in one by one, then a
// continue button appears. No audio wired in yet — drop an
// <audio> element here (like Page3) if you ever want it.
// ─────────────────────────────────────────────────────────────

const HEADING_TEXT = 'and some words from me';
const WISH_DELAY = 1600;
const CONTINUE_LABEL = 'continue';

const wishVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut', delay: i * 0.08 },
  }),
};

export default function WishesScene({ onNext }) {
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(reduceMotion ? wishesData.length : 1);

  useEffect(() => {
    if (reduceMotion || count >= wishesData.length) return;
    const t = setTimeout(() => setCount((c) => c + 1), WISH_DELAY);
    return () => clearTimeout(t);
  }, [count, reduceMotion]);

  const allShown = count >= wishesData.length;
  const visible = wishesData.slice(0, count);

  return (
    <motion.div
      className="wishes-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
    >
      <div className="wishes-glow" aria-hidden="true" />
      <div className="wishes-flares" aria-hidden="true">
        <span className="wf wf-1" />
        <span className="wf wf-2" />
      </div>

      <h2 className="wishes-heading">{HEADING_TEXT}</h2>

      <div className="wishes-list">
        {visible.map((wish, i) => (
          <motion.p
            key={i}
            custom={i}
            variants={wishVariants}
            initial="hidden"
            animate="visible"
            className="wish-line"
          >
            {wish}
          </motion.p>
        ))}
      </div>

      <div className="wishes-continue-wrap">
        <AnimatePresence>
          {allShown && (
            <motion.button
              key="wishes-continue-btn"
              className="wishes-continue-btn"
              onClick={onNext}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              whileTap={{ scale: 0.96 }}
            >
              {CONTINUE_LABEL}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
