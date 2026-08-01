import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import '../css/Page1.css';

const TAP_HINT_TEXT = 'tap to open';

// Deterministic RNG so the starfield is stable across re-renders
function createRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Starfield ──────────────────────────────────────────────────
// Three layers: tiny white pinpricks, electric-blue mid-size,
// and rare large crimson glints. Feels curated, not random.
function useStarField(count) {
  return useMemo(() => {
    const rng = createRandom(count + 42);
    return Array.from({ length: count }, (_, i) => {
      const roll = rng();
      const type =
        roll < 0.65 ? 'white' : roll < 0.88 ? 'blue' : 'crimson';
      return {
        id: i,
        type,
        top: rng() * 100,
        left: rng() * 100,
        size:
          type === 'white'
            ? rng() * 1.4 + 0.5
            : type === 'blue'
            ? rng() * 2.2 + 1.2
            : rng() * 3 + 2,
        delay: rng() * 6,
        duration: rng() * 3 + 2.5,
      };
    });
  }, [count]);
}

// ── Light-streak flares (the signature element) ────────────────
// Static diagonal lines in white + cobalt that echo the album
// cover's lens-flare slashes. Pure CSS, no animation — they're
// atmosphere, not distraction.
function Flares() {
  return (
    <div className="flare-field" aria-hidden="true">
      <span className="flare flare-1" />
      <span className="flare flare-2" />
      <span className="flare flare-3" />
      <span className="flare flare-4" />
    </div>
  );
}

// ── Gift Box ───────────────────────────────────────────────────
// Crimson body, cobalt ribbon, white bow — repainted to match theme.
function GiftBox({ onOpen, reduceMotion }) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      className="gift-box-button"
      aria-label="Open your gift"
      onClick={onOpen}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
    >
      {/* Glow: cobalt instead of gold */}
      <span className="gift-glow" aria-hidden="true" />

      {/* Orbiting sparks */}
      {!reduceMotion && (
        <span className="gift-orbit" aria-hidden="true">
          <span className="orbit-spark orbit-spark-1" />
          <span className="orbit-spark orbit-spark-2" />
          <span className="orbit-spark orbit-spark-3" />
        </span>
      )}

      <motion.svg
        viewBox="0 0 200 170"
        className="gift-box-svg"
        animate={
          reduceMotion
            ? undefined
            : { scale: pressed ? 0.95 : [1, 1.035, 1] }
        }
        transition={
          reduceMotion
            ? undefined
            : pressed
            ? { duration: 0.15 }
            : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        {/* Box body — deep crimson */}
        <rect x="32" y="76" width="136" height="82" rx="10" fill="#6B0F1A" />
        <rect
          x="32" y="76" width="136" height="82" rx="10"
          fill="url(#boxShade)"
        />

        {/* Lid — slightly lighter crimson */}
        <rect x="20" y="46" width="160" height="34" rx="9" fill="#8B1A1A" />

        {/* Ribbon — electric cobalt */}
        <rect x="90" y="46" width="20" height="112" fill="#1E3FD8" />
        <rect x="20" y="55" width="160" height="15" fill="#1E3FD8" />

        {/* Bow — white with slight blue tint */}
        <path
          d="M100 46 C 78 30, 55 34, 62 52 C 68 62, 90 54, 100 46 Z"
          fill="#E8EEFF"
        />
        <path
          d="M100 46 C 122 30, 145 34, 138 52 C 132 62, 110 54, 100 46 Z"
          fill="#E8EEFF"
        />
        {/* Bow centre knot */}
        <circle cx="100" cy="47" r="7" fill="#FFFFFF" />

        {/* Subtle highlight on lid */}
        <rect
          x="20" y="46" width="160" height="8" rx="9"
          fill="url(#lidHighlight)" opacity="0.3"
        />

        <defs>
          <linearGradient id="boxShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="1" stopColor="#000000" stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id="lidHighlight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </motion.svg>

      <motion.span
        className="tap-hint"
        animate={reduceMotion ? undefined : { opacity: [0.45, 1, 0.45] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        {TAP_HINT_TEXT}
      </motion.span>
    </button>
  );
}

// ── Scene root ─────────────────────────────────────────────────
export default function GalacticReveal({ onOpen }) {
  const reduceMotion = useReducedMotion();
  const stars = useStarField(80);

  return (
    <motion.div
      className="galactic-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      {/* White-to-scene fade veil (same mechanic as before) */}
      <motion.div
        className="fade-veil"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />

      {/* Starfield */}
      <div className="starfield" aria-hidden="true">
        {stars.map((s) => (
          <span
            key={s.id}
            className={`star star--${s.type}`}
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
        {!reduceMotion && <span className="shooting-star" aria-hidden="true" />}
      </div>

      {/* Static lens-flare slashes */}
      <Flares />

      {/* Gift box centre-stage */}
      <div className="gift-stage">
        <GiftBox onOpen={onOpen} reduceMotion={reduceMotion} />
      </div>
    </motion.div>
  );
}