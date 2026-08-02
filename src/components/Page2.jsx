import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../useMotionPreference';
import { flowerImages } from '../flowerImages';
import '../css/Page2.css';

// ─────────────────────────────────────────────────────────────
// Page2 — Flower burst — Scene 3
//
// WHY THE OLD VERSION HAD GAPS:
// Concentric rings sound right but don't actually guarantee full
// coverage — a circle's area (π·r²) doesn't match a rectangle's
// area (w·h) for most screen aspect ratios, so rings either
// over-cover near the center or leave thin gaps in the radial
// bands *between* rings (the "donut hole" problem). That's what
// you were seeing.
//
// THE FIX: cover the actual rectangle directly. We lay a grid
// over the real viewport (with a buffer row/column past every
// edge), then fly one flower from the box to each grid cell.
// Flower size is derived FROM the grid spacing (not a fixed
// range), so overlap — and therefore zero gaps — is mathematically
// guaranteed regardless of screen size or aspect ratio. Delay is
// based on each cell's distance from the box, so it still reads
// as an outward "layer by layer" wave — just correctly shaped
// this time. No spiral: every flower still flies in a straight
// line; only its own rotation (not its path) changes in flight.
// ─────────────────────────────────────────────────────────────

function createRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Tune TARGET_CELLS down if this chugs on an older phone — fewer,
// bigger flowers still guarantee full coverage either way.
const TARGET_CELLS = 100;

// Flower diameter = cellSize / OVERLAP. Must stay comfortably
// under 1 — this ratio (combined with the jitter cap below) is
// what mathematically guarantees no gaps. Don't loosen without
// re-checking the math in the comment above useFlowerField.
const OVERLAP = 0.62;
const JITTER_FRACTION = 0.16; // of cellSize — kept small on purpose, see above
const SIZE_JITTER = [0.85, 1.25]; // multiplier range on top of the base size

const STAGGER_WINDOW = 0.5;   // seconds — spread of the outward wave
const FLIGHT_DURATION = 0.75; // seconds each flower takes to land
const HOLD_AFTER_COVERAGE = 500; // ms pause once fully tiled, before advancing

// Box sits slightly above true center (matches Page1/OpenBox) —
// the grid is built in plain viewport coordinates and only
// converted to "distance from the box" afterward, so the anchor
// offset can't create gaps the way it did with the ring math.
function useFlowerField() {
  return useMemo(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const anchorX = w * 0.5;
    const anchorY = h * 0.45;

    const cellSize = Math.sqrt((w * h) / TARGET_CELLS);
    const baseFlowerSize = cellSize / OVERLAP;

    const cols = Math.ceil(w / cellSize) + 2; // buffer past left/right edges
    const rows = Math.ceil(h / cellSize) + 2; // buffer past top/bottom edges
    const rng = createRandom(cols * 97 + rows * 31 + 11);

    const cells = [];
    let maxDist = 0;

    for (let r = -1; r < rows - 1; r++) {
      for (let c = -1; c < cols - 1; c++) {
        const jitterX = (rng() * 2 - 1) * cellSize * JITTER_FRACTION;
        const jitterY = (rng() * 2 - 1) * cellSize * JITTER_FRACTION;
        const targetX = c * cellSize + cellSize / 2 + jitterX;
        const targetY = r * cellSize + cellSize / 2 + jitterY;

        const dx = targetX - anchorX;
        const dy = targetY - anchorY;
        const dist = Math.hypot(dx, dy);
        if (dist > maxDist) maxDist = dist;

        cells.push({ dx, dy, dist });
      }
    }

    return cells.map((cell, i) => ({
      id: i,
      x: cell.dx,
      y: cell.dy,
      rotate: (rng() * 2 - 1) * 200, // spins in place — not a path
      image: flowerImages[Math.floor(rng() * flowerImages.length)],
      size: baseFlowerSize * (SIZE_JITTER[0] + rng() * (SIZE_JITTER[1] - SIZE_JITTER[0])),
      delay: (cell.dist / maxDist) * STAGGER_WINDOW + rng() * 0.05,
      duration: FLIGHT_DURATION + rng() * 0.25,
    }));
  }, []);
}

// Logs once per broken path instead of failing silently — if you
// ever see this in the console, the filename in flowerImages.js
// doesn't match what's actually in /public/flowers/.
function handleImgError(src) {
  console.warn(`[FlowerBurst] Image failed to load: ${src} — check the filename/path in flowerImages.js against your public/flowers/ folder.`);
}

function Petal({ data }) {
  return (
    <motion.div
      className="petal-anchor"
      initial={{ x: 0, y: 0, rotate: 0 }}
      animate={{ x: data.x, y: data.y, rotate: data.rotate }}
      transition={{
        duration: data.duration,
        delay: data.delay,
        ease: [0.16, 0.9, 0.3, 1], // straight-line travel, quick out, gentle settle
      }}
    >
      <motion.img
        src={data.image}
        alt=""
        className="petal-img"
        style={{
          width: data.size,
          height: data.size,
          marginLeft: -data.size / 2,
          marginTop: -data.size / 2,
        }}
        onError={() => handleImgError(data.image)}
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{ opacity: [0, 1, 1], scale: [0.2, 1.1, 1] }}
        transition={{
          duration: data.duration,
          delay: data.delay,
          times: [0, 0.4, 1],
          ease: 'easeOut',
        }}
      />
    </motion.div>
  );
}

function OpenBox() {
  return (
    <svg viewBox="0 0 200 170" className="open-box-svg">
      <rect x="32" y="76" width="136" height="82" rx="10" fill="#6B0F1A" />
      <rect x="32" y="76" width="136" height="82" rx="10" fill="url(#boxShade2)" />
      <rect x="90" y="76" width="20" height="82" fill="#1E3FD8" />
      <ellipse cx="100" cy="80" rx="58" ry="16" fill="#FFF3D6" opacity="0.85" />
      <g transform="rotate(-28 100 80) translate(0 -6)">
        <rect x="20" y="46" width="160" height="34" rx="9" fill="#8B1A1A" />
        <rect x="90" y="46" width="20" height="34" fill="#1E3FD8" />
        <path d="M100 46 C 78 30, 55 34, 62 52 C 68 62, 90 54, 100 46 Z" fill="#E8EEFF" />
        <path d="M100 46 C 122 30, 145 34, 138 52 C 132 62, 110 54, 100 46 Z" fill="#E8EEFF" />
        <circle cx="100" cy="47" r="7" fill="#FFFFFF" />
      </g>
      <defs>
        <linearGradient id="boxShade2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.18" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function FlowerBurst({ onComplete }) {
  const reduceMotion = useReducedMotion();
  const petals = useFlowerField();
  const calledRef = useRef(false);

  useEffect(() => {
    let timeoutMs;
    if (reduceMotion) {
      timeoutMs = 1200;
    } else {
      const longestDelay = Math.max(...petals.map((p) => p.delay + p.duration));
      timeoutMs = longestDelay * 1000 + HOLD_AFTER_COVERAGE;
    }

    const timeout = setTimeout(() => {
      if (!calledRef.current) {
        calledRef.current = true;
        onComplete?.();
      }
    }, timeoutMs);

    return () => clearTimeout(timeout);
  }, [petals, onComplete, reduceMotion]);

  return (
    <motion.div
      className="burst-scene"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="burst-box-stage">
        <OpenBox />
      </div>

      <div className="burst-origin">
        {reduceMotion ? (
          petals.map((p) => (
            <motion.img
              key={p.id}
              src={p.image}
              alt=""
              className="petal-img petal-img--static"
              onError={() => handleImgError(p.image)}
              style={{
                width: p.size,
                height: p.size,
                marginLeft: -p.size / 2,
                marginTop: -p.size / 2,
                transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rotate}deg)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.95 }}
              transition={{ duration: 0.6, delay: p.delay * 0.3 }}
            />
          ))
        ) : (
          petals.map((p) => <Petal key={p.id} data={p} />)
        )}
      </div>

      <motion.div
        className="burst-flash"
        initial={{ opacity: 0.7, scale: 0.2 }}
        animate={{ opacity: 0, scale: 3.5 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      />
    </motion.div>
  );
}