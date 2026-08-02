import { motion } from 'framer-motion';
import { useReducedMotion } from '../useMotionPreference';
import '../css/Page8.css';

// ─────────────────────────────────────────────────────────────
// Page8 — Final + replay
//
// Closing line, then a replay button that restarts the
// experience from the gift box (scene 2), skipping the
// countdown. Replace the copy below whenever you like.
// ─────────────────────────────────────────────────────────────

const CLOSING_LINE = 'happy birthday, my love';
const THANK_YOU_LINE = 'thank you for letting me love you';
const REPLAY_LABEL = 'replay';

export default function FinalScene({ onReplay }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="final-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
    >
      <div className="final-glow" aria-hidden="true" />
      <div className="final-flares" aria-hidden="true">
        <span className="fnal fnal-1" />
        <span className="fnal fnal-2" />
      </div>

      <h2 className="final-heading">{CLOSING_LINE}</h2>
      <p className="final-sub">{THANK_YOU_LINE}</p>

      <motion.button
        className="final-replay-btn"
        onClick={onReplay}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0.2 }
            : { duration: 0.9, ease: 'easeOut', delay: 0.6 }
        }
        whileTap={{ scale: 0.96 }}
      >
        {REPLAY_LABEL}
      </motion.button>
    </motion.div>
  );
}
