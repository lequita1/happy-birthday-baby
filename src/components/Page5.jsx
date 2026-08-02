import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../useMotionPreference';
import { galleryData } from '../galleryData';
import '../css/Page5.css';

// ─────────────────────────────────────────────────────────────
// Page5 — Gallery
//
// Swipe the card to browse. Viewing / watching is a separate,
// explicit action so swipes never accidentally open the lightbox.
// Data-driven from galleryData.js — edit that file only.
// ─────────────────────────────────────────────────────────────

const HEADING_TEXT = 'a few of my favorites';
const SWIPE_HINT_TEXT = 'swipe to browse';
const LOADING_TEXT = 'gathering the photos...';
const VIEW_PHOTO_LABEL = 'view full size';
const WATCH_CLIP_LABEL = 'watch clip';
const CONTINUE_LABEL = 'continue';
const SWIPE_THRESHOLD = 90;
const DOTS_MAX = 8;

const cardVariants = {
  enter: { scale: 0.92, opacity: 0, y: 16, x: 0, rotate: 0 },
  center: { scale: 1, opacity: 1, y: 0, x: 0, rotate: 0 },
  exit: (dir) => ({
    x: dir > 0 ? 320 : -320,
    opacity: 0,
    rotate: dir > 0 ? 14 : -14,
  }),
};

function useGalleryReady(firstSrc) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!firstSrc) {
      setReady(true);
      return;
    }

    let cancelled = false;
    const img = new Image();
    const done = () => {
      if (!cancelled) setReady(true);
    };

    img.onload = done;
    img.onerror = done;
    img.src = firstSrc;

    return () => {
      cancelled = true;
    };
  }, [firstSrc]);

  return ready;
}

function useAdjacentPreload(sources, index) {
  useEffect(() => {
    const count = sources.length;
    if (count === 0) return;

    [0, 1, 2].forEach((offset) => {
      const src = sources[(index + offset) % count];
      if (!src) return;
      const img = new Image();
      img.src = src;
    });
  }, [sources, index]);
}

function Lightbox({ entry, onClose }) {
  const videoRef = useRef(null);
  const isVideo = Boolean(entry.video);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useLayoutEffect(() => {
    if (!isVideo) return undefined;

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
  }, [isVideo, entry.video]);

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
      className="lightbox-backdrop"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="lightbox-frame"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.25 }}
      >
        {isVideo ? (
          <div className="lightbox-video-wrap">
            <video
              ref={videoRef}
              src={entry.video}
              controls
              playsInline
              preload="auto"
              className="lightbox-video"
            />
            {needsTap && (
              <button
                type="button"
                className="lightbox-play-overlay"
                onClick={handlePlayTap}
                aria-label="Play video"
              >
                <span className="lightbox-play-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="28" height="28">
                    <path d="M8 5v14l11-7z" fill="#ffffff" />
                  </svg>
                </span>
              </button>
            )}
          </div>
        ) : (
          <img src={entry.image} alt={entry.caption} className="lightbox-image" />
        )}
        <p className="lightbox-caption">{entry.caption}</p>
        <button className="lightbox-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function Gallery({ onNext }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [exitDir, setExitDir] = useState(0);
  const [lightboxEntry, setLightboxEntry] = useState(null);

  const imageSources = galleryData.map((g) => g.image);
  const ready = useGalleryReady(imageSources[0]);
  useAdjacentPreload(imageSources, index);

  const count = galleryData.length;
  const current = galleryData[index];
  const peekIndices = [(index + 1) % count, (index + 2) % count];
  const viewLabel = current?.video ? WATCH_CLIP_LABEL : VIEW_PHOTO_LABEL;

  const advance = useCallback(
    (dir) => {
      setExitDir(dir);
      setIndex((i) => (i + dir + count) % count);
    },
    [count],
  );

  const openLightbox = useCallback((entry) => {
    setLightboxEntry(entry);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (lightboxEntry) return;
      if (e.key === 'ArrowRight') advance(1);
      if (e.key === 'ArrowLeft') advance(-1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [advance, lightboxEntry]);

  const handleDragEnd = (_e, info) => {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      advance(info.offset.x > 0 ? 1 : -1);
    }
  };

  return (
    <motion.div
      className="stack-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
    >
      <span className="stack-glow" aria-hidden="true" />
      <div className="stack-flares" aria-hidden="true">
        <span className="sf sf-1" />
        <span className="sf sf-2" />
      </div>

      <h2 className="stack-heading">{HEADING_TEXT}</h2>

      {!ready ? (
        <div className="stack-loading">
          <motion.span
            animate={reduceMotion ? undefined : { opacity: [0.4, 1, 0.4] }}
            transition={
              reduceMotion ? undefined : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            {LOADING_TEXT}
          </motion.span>
        </div>
      ) : (
        <>
          <span className="stack-hint">{SWIPE_HINT_TEXT}</span>

          <div className="stack-wrap">
            <button
              className="stack-nav stack-nav--left"
              onClick={() => advance(-1)}
              aria-label="Previous photo"
            >
              ‹
            </button>

            {[peekIndices[1], peekIndices[0]].map((dataIdx, pos) => (
              <div
                key={`peek-${dataIdx}-${pos}`}
                className="stack-card stack-card--peek"
                style={{
                  transform: `translateY(${10 - pos * 6}px) scale(${0.9 + pos * 0.05}) rotate(${
                    pos === 0 ? -3 : 2.5
                  }deg)`,
                  zIndex: pos,
                }}
              >
                <img
                  src={galleryData[dataIdx].image}
                  alt=""
                  className="stack-image"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}

            <AnimatePresence custom={exitDir} initial={false}>
              <motion.div
                key={index}
                custom={exitDir}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: reduceMotion ? 0.15 : 0.4, ease: 'easeOut' }}
                className="stack-card stack-card--top"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.85}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                whileTap={{ cursor: 'grabbing' }}
                style={{ zIndex: 3 }}
              >
                <img
                  src={current.image}
                  alt={current.caption}
                  className="stack-image"
                  decoding="async"
                  draggable={false}
                />
                <p className="stack-caption">{current.caption}</p>
              </motion.div>
            </AnimatePresence>

            <button
              className="stack-nav stack-nav--right"
              onClick={() => advance(1)}
              aria-label="Next photo"
            >
              ›
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.button
              key={`view-${index}`}
              type="button"
              className="stack-view-btn"
              onClick={() => openLightbox(current)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.35, ease: 'easeOut', delay: 0.12 }}
              whileTap={{ scale: 0.97 }}
            >
              {current.video && (
                <span className="stack-view-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path d="M8 5v14l11-7z" fill="currentColor" />
                  </svg>
                </span>
              )}
              {viewLabel}
            </motion.button>
          </AnimatePresence>

          {count > DOTS_MAX ? (
            <div className="stack-progress">
              <div className="stack-progress-track">
                <motion.div
                  className="stack-progress-fill"
                  animate={{ width: `${((index + 1) / count) * 100}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
              <span className="stack-progress-label">
                {index + 1} / {count}
              </span>
            </div>
          ) : (
            <div className="stack-dots">
              {galleryData.map((_, i) => (
                <span key={i} className={`stack-dot${i === index ? ' is-active' : ''}`} />
              ))}
            </div>
          )}
        </>
      )}

      <div className="stack-continue-wrap">
        <motion.button
          className="stack-continue-btn"
          onClick={onNext}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
          whileTap={{ scale: 0.96 }}
        >
          {CONTINUE_LABEL}
        </motion.button>
      </div>

      <AnimatePresence>
        {lightboxEntry && (
          <Lightbox entry={lightboxEntry} onClose={() => setLightboxEntry(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
