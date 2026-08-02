import { useEffect, useMemo, useRef } from 'react';
import { motion} from 'framer-motion';
import { useReducedMotion } from '../useMotionPreference';
import { flowerImages } from '../flowerImages';
import '../css/Page2.css';


function createRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const PETAL_COUNT = 60; // test on a real phone; drop to ~36–44 if it chugs

function usePetals(count) {
  return useMemo(() => {
    const rng = createRandom(count * 7 + 13);

    const diagonal = Math.hypot(window.innerWidth, window.innerHeight);
    const maxDist = diagonal * 0.58;
    const minDist = 90;

    return Array.from({ length: count }, (_, i) => {
      const goldenAngle = 137.508;
      const baseAngle = (i * goldenAngle) % 360;
      const angleDeg = baseAngle + (rng() * 20 - 10);
      const angleRad = (angleDeg * Math.PI) / 180;

      const dist = minDist + (i / count) * (maxDist - minDist) + (rng() * 60 - 30);

      return {
        id: i,
        x: Math.cos(angleRad) * dist,
        y: Math.sin(angleRad) * dist - 40,
        rotate: angleDeg + rng() * 180,
        image: flowerImages[Math.floor(rng() * flowerImages.length)],
        size: 30 + rng() * 26,
        delay: (i / count) * 0.55,
        duration: 1.1 + rng() * 0.55,
      };
    });
  }, [count]);
}

function Petal({ data }) {
  return (
    <motion.img
      src={data.image}
      alt=""
      className="petal-img"
      style={{ width: data.size, height: data.size }}
      initial={{ x: 0, y: 0, opacity: 0, scale: 0.1, rotate: 0 }}
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
        opacity: { times: [0, 0.12, 0.62, 1], ease: 'linear' },
        scale: { times: [0, 0.5, 1] },
      }}
    />
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
  const petals = usePetals(PETAL_COUNT);
  const calledRef = useRef(false);

  useEffect(() => {
    let timeoutMs;
    if (reduceMotion) {
      timeoutMs = 1300;
    } else {
      const longestDelay = Math.max(...petals.map((p) => p.delay + p.duration));
      timeoutMs = (longestDelay + 0.2) * 1000;
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
      transition={{ duration: 0.4 }}
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
              style={{
                width: p.size,
                height: p.size,
                transform: `translate(${p.x * 0.7}px, ${p.y * 0.7}px) rotate(${p.rotate}deg)`,
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