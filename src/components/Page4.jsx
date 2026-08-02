import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../useMotionPreference';
import { timelineData } from '../timelineData';
import { Nebula, Aurora } from './Ambient';
import '../css/Page4.css';

// ─────────────────────────────────────────────────────────────
// Page4 — Filmstrip Timeline
//
// Frames show photos only. When the active entry has a video,
// a separate hint fades in below the caption — tap that to play.
//   { image, age, caption, video: '/videos/xyz.mp4' }  // optional
// ─────────────────────────────────────────────────────────────

const HEADING_TEXT = 'every step got us here';
const SCRUB_HINT_TEXT = 'scrub through';
const VIDEO_HINT_LABEL = 'watch this moment';
const CONTINUE_LABEL = 'continue';

function useScrollProgress(ref) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ticking = false;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [ref]);

  return progress;
}

function useActiveFrame(trackRef) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let ticking = false;
    const update = () => {
      const center = el.scrollLeft + el.clientWidth / 2;
      let closest = 0;
      let closestDist = Infinity;
      Array.from(el.children).forEach((child, i) => {
        const childCenter = child.offsetLeft + child.offsetWidth / 2;
        const dist = Math.abs(childCenter - center);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });
      setActive(closest);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [trackRef]);

  return active;
}

function useDragScroll(ref) {
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onPointerDown = (e) => {
      if (e.pointerType !== 'mouse') return;
      dragRef.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft };
      el.classList.add('is-dragging');
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.startX;
      el.scrollLeft = dragRef.current.startScroll - dx;
    };

    const endDrag = () => {
      dragRef.current.active = false;
      el.classList.remove('is-dragging');
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
    el.addEventListener('pointerleave', endDrag);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', endDrag);
      el.removeEventListener('pointercancel', endDrag);
      el.removeEventListener('pointerleave', endDrag);
    };
  }, [ref]);
}

function useWheelToHorizontal(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [ref]);
}

function Frame({ entry, isActive }) {
  return (
    <div className={`filmstrip-frame${isActive ? ' is-active' : ''}`}>
      <div className="frame-image-wrap">
        <img src={entry.image} alt={entry.age} className="frame-image" loading="lazy" />
        <span className="frame-timestamp">{entry.age}</span>
      </div>
    </div>
  );
}

function VideoHint({ onPlay, reduceMotion }) {
  return (
    <motion.button
      type="button"
      className="timeline-video-hint"
      onClick={onPlay}
      aria-label={VIDEO_HINT_LABEL}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{
        duration: reduceMotion ? 0.15 : 0.55,
        ease: 'easeOut',
        delay: reduceMotion ? 0 : 0.4,
      }}
      whileTap={{ scale: 0.97 }}
    >
      <span className="tvh-ring" aria-hidden="true" />
      <span className="tvh-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M8 5v14l11-7z" fill="#ffffff" />
        </svg>
      </span>
      <span className="tvh-label">{VIDEO_HINT_LABEL}</span>
    </motion.button>
  );
}

function VideoModal({ src, onClose }) {
  const videoRef = useRef(null);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useLayoutEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    setNeedsTap(false);

    const tryPlay = () => {
      video.play().catch(() => setNeedsTap(true));
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      tryPlay();
    } else {
      video.addEventListener('canplay', tryPlay, { once: true });
      video.load();
      return () => video.removeEventListener('canplay', tryPlay);
    }

    return undefined;
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    return () => {
      video?.pause();
    };
  }, []);

  const handlePlayTap = () => {
    const video = videoRef.current;
    if (!video) return;
    video
      .play()
      .then(() => setNeedsTap(false))
      .catch(() => setNeedsTap(true));
  };

  return (
    <motion.div
      className="video-modal-backdrop"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="video-modal-frame"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.25 }}
      >
        <div className="video-modal-player-wrap">
          <video
            ref={videoRef}
            src={src}
            controls
            playsInline
            preload="auto"
            className="video-modal-player"
          />
          {needsTap && (
            <button
              type="button"
              className="video-modal-play-overlay"
              onClick={handlePlayTap}
              aria-label="Play video"
            >
              <span className="video-modal-play-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="28" height="28">
                  <path d="M8 5v14l11-7z" fill="#ffffff" />
                </svg>
              </span>
            </button>
          )}
        </div>
        <button className="video-modal-close" onClick={onClose} aria-label="Close video">
          ×
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function Timeline({ onNext }) {
  const reduceMotion = useReducedMotion();
  const trackRef = useRef(null);
  const progress = useScrollProgress(trackRef);
  const activeIndex = useActiveFrame(trackRef);
  const [videoSrc, setVideoSrc] = useState(null);

  useDragScroll(trackRef);
  useWheelToHorizontal(trackRef);

  const goToIndex = (i) => {
    const el = trackRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(timelineData.length - 1, i));
    const child = el.children[clamped];
    if (child) child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onKeyDown = (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goToIndex(activeIndex + 1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goToIndex(activeIndex - 1); }
    };
    el.addEventListener('keydown', onKeyDown);
    return () => el.removeEventListener('keydown', onKeyDown);
  }, [activeIndex]);

  const activeEntry = timelineData[activeIndex];

  return (
    <motion.div
      className={`filmstrip-scene${reduceMotion ? ' reduce-motion' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
    >
      <Nebula />
      <Aurora />

      <div className="filmstrip-flares" aria-hidden="true">
        <span className="ff ff-1" />
        <span className="ff ff-2" />
      </div>

      <h2 className="filmstrip-heading">{HEADING_TEXT}</h2>
      <span className="filmstrip-hint">{SCRUB_HINT_TEXT}</span>

      <div className="filmstrip-track-wrap">
        <button
          className="filmstrip-nav filmstrip-nav--left"
          onClick={() => goToIndex(activeIndex - 1)}
          aria-label="Previous memory"
        >
          ‹
        </button>

        <div className="filmstrip-track" ref={trackRef} tabIndex={0}>
          {timelineData.map((entry, i) => (
            <Frame key={i} entry={entry} isActive={i === activeIndex} />
          ))}
        </div>

        <button
          className="filmstrip-nav filmstrip-nav--right"
          onClick={() => goToIndex(activeIndex + 1)}
          aria-label="Next memory"
        >
          ›
        </button>
      </div>

      <div className="filmstrip-detail">
        <AnimatePresence mode="wait">
          <motion.p
            key={`caption-${activeIndex}`}
            className="filmstrip-caption"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.35, ease: 'easeOut' }}
          >
            {activeEntry?.caption}
          </motion.p>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeEntry?.video && (
            <VideoHint
              key={`video-hint-${activeIndex}`}
              onPlay={() => setVideoSrc(activeEntry.video)}
              reduceMotion={reduceMotion}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="scrub-rail" aria-hidden="true">
        <div className="scrub-rail-track">
          <span className="scrub-dot" style={{ left: `${progress * 100}%` }} />
        </div>
      </div>

      <div className="filmstrip-continue-wrap">
        <motion.button
          className="filmstrip-continue-btn"
          onClick={onNext}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          whileTap={{ scale: 0.96 }}
        >
          {CONTINUE_LABEL}
        </motion.button>
      </div>

      <AnimatePresence>
        {videoSrc && (
          <VideoModal src={videoSrc} onClose={() => setVideoSrc(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
