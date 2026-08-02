import { useRef } from 'react';
import { motion, useScroll, useTransform, useTime } from 'framer-motion';
import { useReducedMotion } from '../useMotionPreference';
import { timelineData } from '../timelineData';
import '../css/Page4.css';

const HEADING_TEXT = 'a reel of us';
const SUBHEADING_TEXT = 'scroll to develop';
const TILTS = [-1.2, 1.1, -1.6, 1.3, -0.9, 1.5, -1.4, 1.2];

function DustParticle({ index, lightY, reduceMotion }) {
  const time = useTime();
  const driftX = useTransform(
    time,
    (t) => Math.sin(t / 2000 + index) * 25 + (index % 3 - 1) * 15
  );
  const driftY = useTransform(
    time,
    (t) => Math.cos(t / 2500 + index * 2) * 15
  );
  const opacity = useTransform(
    time,
    (t) => 0.2 + 0.35 * Math.sin(t / 3000 + index * 1.7)
  );
  const top = useTransform([lightY, driftY], ([ly, dy]) => `calc(${ly} + ${dy}px)`);
  const left = useTransform(driftX, (x) => `calc(50% + ${x}px)`);

  if (reduceMotion) return null;
  return <motion.div className="dust-mote" style={{ left, top, opacity }} aria-hidden="true" />;
}

function FilmFrame({ entry, index, reduceMotion }) {
  const tilt = TILTS[index % TILTS.length];
  const fromSide = index % 2 === 0 ? -1 : 1;
  return (
    <motion.div
      className="film-frame"
      initial={reduceMotion ? false : { opacity: 0, y: 40, rotate: fromSide * 2, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt, scale: 1 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="sprockets sprockets--left" aria-hidden="true" />
      <span className="sprockets sprockets--right" aria-hidden="true" />
      <div className="film-photo-wrap">
        <img src={entry.image} alt={entry.age} className="film-photo" loading="lazy" />
        {/* subtle warmth still present, but no cropping */}
        <div className="photo-warmth" aria-hidden="true" />
      </div>
      <span className="film-date">developed · {entry.age}</span>
    </motion.div>
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
      next reel
    </motion.button>
  );
}

export default function Page4({ onNext }) {
  const reduceMotion = useReducedMotion();
  const trackRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start center', 'end center'],
  });
  const lightY = useTransform(scrollYProgress, [0, 1], ['5%', '95%']);
  const time = useTime();
  const flicker = useTransform(time, (t) => {
    if (reduceMotion) return 0.7;
    return 0.65 + 0.12 * Math.sin(t / 1200) + 0.05 * Math.sin(t / 370);
  });
  const lightOpacity = useTransform(
    [scrollYProgress, flicker],
    ([progress, flk]) => {
      const base = progress < 0.1 ? progress / 0.1 : progress > 0.9 ? (1 - progress) / 0.1 : 1;
      return base * flk;
    }
  );
  const dustIndices = Array.from({ length: 12 }, (_, i) => i);

  return (
    <motion.div
      className="timeline-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
    >
      <div className="film-grain" aria-hidden="true" />
      <div className="tl-heading-block">
        <h2 className="timeline-heading">{HEADING_TEXT}</h2>
        <p className="timeline-subheading">{SUBHEADING_TEXT}</p>
      </div>

      {!reduceMotion && (
        <>
          <motion.div
            className="projector-light"
            style={{ top: lightY, opacity: lightOpacity }}
            aria-hidden="true"
          />
          {dustIndices.map((i) => (
            <DustParticle key={i} index={i} lightY={lightY} reduceMotion={reduceMotion} />
          ))}
        </>
      )}

      <div className="film-track" ref={trackRef}>
        <motion.div
          className="film-strip film-strip--shadow"
          style={{
            y: useTransform(scrollYProgress, [0, 1], ['0%', '3%']),
            opacity: useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 0.25, 0.25, 0]),
          }}
          aria-hidden="true"
        />
        <div className="film-strip" aria-hidden="true" />
        {timelineData.map((entry, i) => (
          <FilmFrame key={i} entry={entry} index={i} reduceMotion={reduceMotion} />
        ))}
      </div>

      <div className="timeline-continue-wrap">
        <ContinueButton onNext={onNext} />
      </div>
    </motion.div>
  );
}