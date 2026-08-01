import { motion, useReducedMotion } from 'framer-motion';
import { timelineData } from '../timelineData';
import '../css/Page4.css';

// ─────────────────────────────────────────────────────────────
// Page4 — Timeline (baby → present)
//
// Data-driven from timelineData.js — edit that file to add,
// remove, or reorder entries. Nothing here needs to change.
// ─────────────────────────────────────────────────────────────

const HEADING_TEXT = 'every step got us here';

function TimelineEntry({ entry, index, reduceMotion }) {
  const side = index % 2 === 0 ? 'left' : 'right';
  const offsetX = side === 'left' ? -30 : 30;

  return (
    <div className={`timeline-entry timeline-entry--${side}`}>
      <span className="timeline-node" aria-hidden="true" />
      <motion.div
        className="timeline-card"
        initial={reduceMotion ? false : { opacity: 0, x: offsetX, y: 16 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="timeline-image-wrap">
          <img src={entry.image} alt={entry.age} className="timeline-image" />
        </div>
        <span className="timeline-age">{entry.age}</span>
        <p className="timeline-caption">{entry.caption}</p>
      </motion.div>
    </div>
  );
}

function ContinueButton({ onNext }) {
  return (
    <motion.button
      className="timeline-continue-btn"
      onClick={onNext}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      whileTap={{ scale: 0.96 }}
    >
      continue
    </motion.button>
  );
}

export default function Page4({ onNext }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="timeline-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
    >
      <h2 className="timeline-heading">{HEADING_TEXT}</h2>

      <div className="timeline-track">
        <span className="timeline-line" aria-hidden="true" />
        {timelineData.map((entry, i) => (
          <TimelineEntry
            key={i}
            entry={entry}
            index={i}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>

      <div className="timeline-continue-wrap">
        <ContinueButton onNext={onNext} />
      </div>
    </motion.div>
  );
}