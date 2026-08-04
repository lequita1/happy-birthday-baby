import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../useMotionPreference';
import { flowerImages } from '../flowerImages';
import CanvasBurst from './FlowerBox';
import '../css/Page2.css';

function createRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const JITTER_FRACTION = 0.2;
const SIZE_JITTER = [0.8, 1.3];
const STAGGER_WINDOW = 0.6;
const FLIGHT_DURATION = 0.85;

function useFlowerField(w, h) {
  return useMemo(() => {
    const anchorX = w * 0.5;
    const anchorY = h * 0.45;

    const TARGET_CELLS = w < 600 ? 35 : 60;
    const OVERLAP = w < 600 ? 0.3 : 0.5;
    const cellSize = Math.sqrt((w * h) / TARGET_CELLS);
    const baseFlowerSize = cellSize / OVERLAP;

    const cols = Math.ceil(w / cellSize) + 2;
    const rows = Math.ceil(h / cellSize) + 2;
    const rng = createRandom(cols * 97 + rows * 31 + 11);

    const cells = [];
    let maxDist = 0;

    for (let r = -1; r < rows - 1; r++) {
      for (let c = -1; c < cols - 1; c++) {
        const jx = (rng() * 2 - 1) * cellSize * JITTER_FRACTION;
        const jy = (rng() * 2 - 1) * cellSize * JITTER_FRACTION;
        const tx = c * cellSize + cellSize / 2 + jx;
        const ty = r * cellSize + cellSize / 2 + jy;
        const dx = tx - anchorX;
        const dy = ty - anchorY;
        const dist = Math.hypot(dx, dy);
        if (dist > maxDist) maxDist = dist;
        cells.push({ dx, dy, dist });
      }
    }

    return cells.map((cell, i) => ({
      id: i,
      x: cell.dx,
      y: cell.dy,
      rotate: (rng() * 2 - 1) * 180,
      image: flowerImages[Math.floor(rng() * flowerImages.length)],
      size: baseFlowerSize * (SIZE_JITTER[0] + rng() * (SIZE_JITTER[1] - SIZE_JITTER[0])),
      delay: (cell.dist / maxDist) * STAGGER_WINDOW + rng() * 0.04,
      duration: FLIGHT_DURATION + rng() * 0.2,
    }));
  }, [w, h]);
}

function OpenBox() {
  return (
    <svg viewBox="0 0 200 170" className="open-box-svg">
      <rect x="32" y="76" width="136" height="82" rx="10" fill="var(--lav-ice)" />
      <rect x="32" y="76" width="136" height="82" rx="10" fill="url(#boxShade2)" />
      <rect x="90" y="76" width="20" height="82" fill="var(--pop)" />
      <ellipse cx="100" cy="80" rx="58" ry="16" fill="#FFFFFF" opacity="0.9" />
      <g transform="rotate(-28 100 80) translate(0 -6)">
        <rect x="20" y="46" width="160" height="34" rx="9" fill="var(--lav)" />
        <rect x="90" y="46" width="20" height="34" fill="var(--pop)" />
        <path d="M100 46 C 78 30, 55 34, 62 52 C 68 62, 90 54, 100 46 Z" fill="var(--pop)" />
        <path d="M100 46 C 122 30, 145 34, 138 52 C 132 62, 110 54, 100 46 Z" fill="var(--pop)" />
        <circle cx="100" cy="47" r="7" fill="#FFFFFF" />
      </g>
      <defs>
        <linearGradient id="boxShade2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="1" stopColor="#3B2A4D" stopOpacity="0.08" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function BurstLoading() {
  return (
    <motion.div
      className="burst-loader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <span className="burst-loader-dot" />
      <span className="burst-loader-dot" />
      <span className="burst-loader-dot" />
    </motion.div>
  );
}

export default function FlowerBurst({ onComplete, loadedImages }) {
  const reduceMotion = useReducedMotion();
  const [size, setSize] = useState(() => {
    const vv = window.visualViewport;
    return {
      w: vv ? vv.width : window.innerWidth,
      h: vv ? vv.height : window.innerHeight,
    };
  });

  useEffect(() => {
    const measure = () => {
      const vv = window.visualViewport;
      setSize({
        w: vv ? vv.width : window.innerWidth,
        h: vv ? vv.height : window.innerHeight,
      });
    };
    window.visualViewport?.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('scroll', measure);
    window.addEventListener('resize', measure);
    return () => {
      window.visualViewport?.removeEventListener('resize', measure);
      window.visualViewport?.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, []);

  const petals = useFlowerField(size.w, size.h);

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

      {loadedImages ? (
        <CanvasBurst
          petals={petals}
          width={size.w}
          height={size.h}
          reduceMotion={reduceMotion}
          loadedImages={loadedImages}
          onComplete={onComplete}
        />
      ) : (
        <BurstLoading />
      )}

      <motion.div
        className="burst-flash"
        initial={{ opacity: 0.8, scale: 0.2 }}
        animate={{ opacity: 0, scale: 2 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </motion.div>
  );
}
