import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '../useMotionPreference';
import { timelineData } from '../timelineData';
import '../css/Page4.css';

// ─────────────────────────────────────────────────────────────
// Page4 — Timeline (baby → present)
//
// CONCEPT: a scrapbook pinned to the Buzz world. Each memory is
// a polaroid — cream border, small tape strip, a crimson ink
// stamp for the age — tilted slightly like it was just dropped
// onto the page. That's where "nostalgic" comes from.
//
// The spine ties it back to the rest of the site: it's not a
// static line, it's a light trail that GROWS as you scroll, with
// a small glowing head — the same visual language as the shooting
// star from Page1's starfield. Built with useScroll/useTransform
// so it's driven by actual scroll position, not a timer.
//
// Data-driven from timelineData.js — same shape as before, only
// this file changed:
//   { image, age, caption }
// ─────────────────────────────────────────────────────────────

const HEADING_TEXT = 'every step got us here';
const SUBHEADING_TEXT = 'a little scrapbook, just for you';

// Small deterministic tilt per card so photos read as "dropped
// on the page" rather than a rigid grid. Alternating +/- keeps
// it from feeling like they're all leaning the same way.
const TILTS = [-4, 3, -3.5, 4.5, -2.5, 3.5, -4.5, 2.5];

function TimelineEntry({ entry, index, reduceMotion }) {
  const tilt = TILTS[index % TILTS.length];
  const fromSide = index % 2 === 0 ? -1 : 1;
  const zigzag = index % 2 === 1; // odd cards nudge slightly right

  return (
    <div className={`tl-entry${zigzag ? ' tl-entry--b' : ''}`}>
      <span className="tl-node" aria-hidden="true" />
      <motion.div
        className="tl-card"
        initial={
          reduceMotion
            ? false
            : { opacity: 0, y: 34, x: fromSide * 14, rotate: 0, scale: 0.88 }
        }
        whileInView={{ opacity: 1, y: 0, x: 0, rotate: tilt, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="tl-tape" aria-hidden="true" />
        <div className="tl-photo-wrap">
          <img
            src={entry.image}
            alt={entry.age}
            className="tl-photo"
            loading="lazy"
          />
        </div>
        <span className="tl-stamp">{entry.age}</span>
        <p className="tl-caption">{entry.caption}</p>
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
  const trackRef = useRef(null);

  // Progress 0→1 as the track scrolls from "just entering" to
  // "just finishing" in the viewport — drives the spine fill and
  // its glowing head below.
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start center', 'end center'],
  });
  const spineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const dotTop = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <motion.div
      className="timeline-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
    >
      <span className="tl-vignette" aria-hidden="true" />

      <div className="tl-heading-block">
        <h2 className="timeline-heading">{HEADING_TEXT}</h2>
        <p className="timeline-subheading">{SUBHEADING_TEXT}</p>
      </div>

      <div className="timeline-track" ref={trackRef}>
        <span className="tl-spine-base" aria-hidden="true" />

        {reduceMotion ? (
          <span className="tl-spine-fill tl-spine-fill--static" aria-hidden="true" />
        ) : (
          <>
            <motion.span
              className="tl-spine-fill"
              style={{ height: spineHeight }}
              aria-hidden="true"
            />
            <motion.span
              className="tl-spine-dot"
              style={{ top: dotTop }}
              aria-hidden="true"
            />
          </>
        )}

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