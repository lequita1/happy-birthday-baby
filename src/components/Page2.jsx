import { useEffect, useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import '../css/Page2.css';

// ─────────────────────────────────────────────────────────────
// Flower burst — Scene 3
//
// On mount:  petals explode outward from center in spiral arcs.
// At ~1.4s:  petals begin fading.
// At ~2.2s:  onComplete fires → parent switches to message scene.
//
// Palette: white petals, cobalt petals, rare crimson petals —
// consistent with the Buzz theme.
// ─────────────────────────────────────────────────────────────

// ── SVG flower shapes ────────────────────────────────────────
// Three petal silhouettes: 4-petal, 5-petal, daisy-style.
// Kept simple so they're fast to animate even on low-end phones.

function FlowerSVG({ type, color, size }) {
  if (type === 'four') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <ellipse cx="20" cy="10" rx="5" ry="10" fill={color} opacity="0.9" />
        <ellipse cx="20" cy="30" rx="5" ry="10" fill={color} opacity="0.9" />
        <ellipse cx="10" cy="20" rx="10" ry="5" fill={color} opacity="0.9" />
        <ellipse cx="30" cy="20" rx="10" ry="5" fill={color} opacity="0.9" />
        <circle cx="20" cy="20" r="5" fill={color} />
      </svg>
    );
  }
  if (type === 'five') {
    const petals = Array.from({ length: 5 }, (_, i) => {
      const angle = (i * 72 * Math.PI) / 180;
      const cx = 20 + Math.cos(angle) * 10;
      const cy = 20 + Math.sin(angle) * 10;
      return <ellipse key={i} cx={cx} cy={cy} rx="4.5" ry="9"
        fill={color} opacity="0.88"
        transform={`rotate(${i * 72 + 90}, ${cx}, ${cy})`} />;
    });
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        {petals}
        <circle cx="20" cy="20" r="5" fill={color} />
      </svg>
    );
  }
  // daisy — many thin petals
  const petals = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45 * Math.PI) / 180;
    const cx = 20 + Math.cos(angle) * 11;
    const cy = 20 + Math.sin(angle) * 11;
    return <ellipse key={i} cx={cx} cy={cy} rx="3" ry="8"
      fill={color} opacity="0.85"
      transform={`rotate(${i * 45 + 90}, ${cx}, ${cy})`} />;
  });
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {petals}
      <circle cx="20" cy="20" r="4" fill="#fff" />
    </svg>
  );
}

// ── Particle data ────────────────────────────────────────────
const TYPES = ['four', 'five', 'daisy'];

// Colors: mostly white, some cobalt, rare crimson — Buzz palette
const COLORS = [
  '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF',
  '#4D6FFF', '#4D6FFF',
  '#FF3A3A',
  '#E8EEFF',
  '#7B9FFF',
];

// Seeded RNG — same approach as Page1's starfield so useMemo is
// fully deterministic. React strict mode double-invokes useMemo in
// dev; Math.random() inside it gives different results each time,
// causing layout thrash. Seeded RNG fixes that completely.
function createRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function usePetals(count) {
  return useMemo(() => {
    const rng = createRandom(count * 7 + 13); // fixed seed per count

    return Array.from({ length: count }, (_, i) => {
      // Spiral: golden angle spread so petals never clump
      const goldenAngle = 137.508;
      const baseAngle = (i * goldenAngle) % 360;
      const angleDeg = baseAngle + (rng() * 20 - 10); // ±10° jitter
      const angleRad = (angleDeg * Math.PI) / 180;

      // Distance: staggered inner → outer by index
      const minDist = 120;
      const maxDist = Math.min(window.innerWidth, window.innerHeight) * 0.52;
      const dist = minDist + (i / count) * (maxDist - minDist) + (rng() * 60 - 30);

      return {
        id: i,
        x: Math.cos(angleRad) * dist,
        y: Math.sin(angleRad) * dist,
        rotate: angleDeg + rng() * 180,
        type: TYPES[i % TYPES.length],
        color: COLORS[Math.floor(rng() * COLORS.length)],
        size: 24 + rng() * 22,
        delay: (i / count) * 0.5,
        duration: 1.0 + rng() * 0.5,
      };
    });
  }, [count]);
}

// ── Single petal ─────────────────────────────────────────────
function Petal({ data, reduceMotion }) {
  if (reduceMotion) return null; // skip entirely for reduced motion

  return (
    <motion.div
      className="petal-wrap"
      // Start invisible and tiny at the origin
      initial={{ x: 0, y: 0, opacity: 0, scale: 0.1, rotate: 0 }}
      // Explode outward, spin, then fade out
      animate={{
        x: data.x,
        y: data.y,
        scale: [0.1, 1.15, 1],
        rotate: data.rotate,
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: data.duration,
        delay: data.delay,
        ease: [0.15, 0.85, 0.35, 1],
        // opacity fades in fast, holds, then fades out at the end
        opacity: {
          times: [0, 0.12, 0.6, 1],
          ease: 'linear',
        },
        // scale overshoots slightly for a punch feel
        scale: {
          times: [0, 0.5, 1],
          ease: ['backOut', 'easeIn'],
        },
      }}
    >
      <FlowerSVG type={data.type} color={data.color} size={data.size} />
    </motion.div>
  );
}

// ── Scene root ────────────────────────────────────────────────
const PETAL_COUNT = 48; // safe for mobile; bump to 60 on desktop if desired

export default function FlowerBurst({ onComplete }) {
  const reduceMotion = useReducedMotion();
  const petals = usePetals(PETAL_COUNT);
  const calledRef = useRef(false);

  // The whole burst takes ~1.8s max. Fire onComplete just after.
  useEffect(() => {
    const longestDelay = Math.max(...petals.map((p) => p.delay + p.duration));
    const timeout = setTimeout(() => {
      if (!calledRef.current) {
        calledRef.current = true;
        onComplete?.();
      }
    }, (longestDelay + 0.15) * 1000);

    return () => clearTimeout(timeout);
  }, [petals, onComplete]);

  return (
    <motion.div
      className="burst-scene"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Same deep crimson background as Page1 — seamless cut */}
      <div className="burst-origin">
        {petals.map((p) => (
          <Petal key={p.id} data={p} reduceMotion={reduceMotion} />
        ))}
      </div>

      {/* Flash on tap — white radial that quickly fades */}
      <motion.div
        className="burst-flash"
        initial={{ opacity: 0.7, scale: 0.2 }}
        animate={{ opacity: 0, scale: 3.5 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      />
    </motion.div>
  );
}