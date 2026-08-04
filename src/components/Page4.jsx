import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../useMotionPreference';
import { timelineData } from '../timelineData';
import { Nebula, Aurora } from './Ambient';
import Sprig from './Sprig';
import '../css/Page4.css';

// ─────────────────────────────────────────────────────────────
// Page4 — Filmstrip Timeline
//
// Frames show photos only. When the active entry has a video,
// a separate hint fades in below the caption — tap that to play.
//   { image, age, caption, video: '/videos/xyz.mp4' }  // optional
//
// ── How the loop + centering works ──────────────────────────
// The strip renders the data set 3x back to back: [prev][home][next].
// We start scrolled into the middle ("home") copy, which means there's
// always a full copy's worth of frames to scroll into on either side.
//
// Which frame is "active" (centered) is measured live with an
// IntersectionObserver watching a thin strip in the dead center of the
// track — not cached math — so it can never drift out of sync with what
// the user actually sees, on any screen size, at any frame count.
//
// Once scrolling fully settles, if the active frame is in the prev/next
// copy, we silently (no animation) shift scrollLeft by exactly one copy's
// width so the same photo is now the "home copy" equivalent. Because
// every frame is a fixed aspect-ratio (identical width), that shift is
// invisible — the user just keeps scrolling and it feels endless.
// ─────────────────────────────────────────────────────────────

const HEADING_TEXT = 'every step got us here';
const SCRUB_HINT_TEXT = 'scrub through';
const VIDEO_HINT_LABEL = 'watch this moment';
const CONTINUE_LABEL = 'continue';

function useLoopedFilmstrip(trackRef, count, { reduceMotion }) {
  const total = count * 3;
  const [tripleActive, setTripleActive] = useState(count);
  const tripleActiveRef = useRef(count);
  const rafIdRef = useRef(null);
  const watchingRef = useRef(false);

  const centerOn = useCallback(
    (idx, behavior = 'auto') => {
      const el = trackRef.current;
      const child = el?.children[idx];
      if (!el || !child) return;
      const target = child.offsetLeft + child.offsetWidth / 2 - el.clientWidth / 2;
      if (behavior === 'auto') {
        el.scrollLeft = target;
      } else {
        el.scrollTo({ left: target, behavior });
      }
    },
    [trackRef]
  );

  // Land on the middle copy before first paint so there's a full loop's
  // worth of buffer available immediately in both directions.
  useLayoutEffect(() => {
    if (count <= 0) return;
    centerOn(count, 'auto');
    tripleActiveRef.current = count;
    setTripleActive(count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  // Single source of truth for "is this actively scrolling" + the
  // settle-triggered loop re-anchor.
  //
  // Rather than guessing a fixed "probably done scrolling" delay (which
  // can fire *before* a native snap/momentum animation has actually
  // finished on a slower device — visibly yanking the frame mid-motion),
  // this polls scrollLeft on every animation frame and only calls it
  // settled once the position hasn't moved for a few consecutive frames.
  // That adapts automatically to however long the browser's own
  // deceleration/snap takes, on any device. `scrollend` (where supported)
  // is used as an immediate, precise short-circuit on top of that.
  useEffect(() => {
    const el = trackRef.current;
    if (!el || count <= 0) return;

    const settle = () => {
      watchingRef.current = false;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      el.classList.remove('is-scrolling');

      const idx = tripleActiveRef.current;
      if (idx < count) {
        centerOn(idx + count, 'auto');
        tripleActiveRef.current = idx + count;
        setTripleActive(idx + count);
      } else if (idx >= count * 2) {
        centerOn(idx - count, 'auto');
        tripleActiveRef.current = idx - count;
        setTripleActive(idx - count);
      }
    };

    let lastLeft = null;
    let stableFrames = 0;

    const pollForRest = () => {
      const left = el.scrollLeft;
      if (lastLeft !== null && Math.abs(left - lastLeft) < 0.5) {
        stableFrames += 1;
      } else {
        stableFrames = 0;
      }
      lastLeft = left;

      if (stableFrames >= 3) {
        settle();
        return;
      }
      rafIdRef.current = requestAnimationFrame(pollForRest);
    };

    const onScroll = () => {
      el.classList.add('is-scrolling');
      if (watchingRef.current) return;
      watchingRef.current = true;
      lastLeft = null;
      stableFrames = 0;
      rafIdRef.current = requestAnimationFrame(pollForRest);
    };

    const onScrollEnd = () => {
      settle();
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('scrollend', onScrollEnd);
    return () => {
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('scrollend', onScrollEnd);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [trackRef, count, centerOn]);

  // Re-center the current frame whenever the track's own box changes size
  // — orientation change, window resize, and (crucially, on mobile) the
  // browser chrome show/hide that changes available height without
  // firing a window `resize` event. This is what keeps frame geometry
  // from ever going stale.
  useEffect(() => {
    const el = trackRef.current;
    if (!el || count <= 0) return;
    const ro = new ResizeObserver(() => centerOn(tripleActiveRef.current, 'auto'));
    ro.observe(el);
    return () => ro.disconnect();
  }, [trackRef, count, centerOn]);

  // Live "what's actually centered" detection. A thin (~2%) strip in the
  // middle of the track is the observation root-margin; whichever frame
  // overlaps it most is the active one. This reflects real rendered
  // geometry, so it can't drift out of sync the way a cached measurement
  // can, and it needs no changes if more photos are added later.
  useEffect(() => {
    const el = trackRef.current;
    if (!el || count <= 0) return;

    const frames = Array.from(el.children);
    const indexOf = new WeakMap();
    frames.forEach((f, i) => indexOf.set(f, i));

    const thresholds = Array.from({ length: 21 }, (_, i) => i / 20);
    const observer = new IntersectionObserver(
      (entries) => {
        let best = null;
        for (const en of entries) {
          if (en.isIntersecting && (!best || en.intersectionRatio > best.intersectionRatio)) {
            best = en;
          }
        }
        if (!best) return;
        const idx = indexOf.get(best.target);
        if (idx === undefined) return;
        tripleActiveRef.current = idx;
        setTripleActive(idx);
      },
      { root: el, threshold: thresholds, rootMargin: '0px -49% 0px -49%' }
    );

    frames.forEach((f) => observer.observe(f));
    return () => observer.disconnect();
  }, [trackRef, count]);

  const goTo = useCallback(
    (delta) => {
      const el = trackRef.current;
      if (!el) return;
      const target = Math.min(Math.max(tripleActiveRef.current + delta, 0), total - 1);
      const child = el.children[target];
      if (child) {
        child.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    },
    [trackRef, total, reduceMotion]
  );

  const realIndex = count > 0 ? ((tripleActive % count) + count) % count : 0;
  return { realIndex, tripleActive, goTo };
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

const Frame = memo(function Frame({ entry, isActive, index, registerRef }) {
  return (
    <div className={`filmstrip-frame${isActive ? ' is-active' : ''}`}>
      <span className="washi-tape washi-tape--tl" aria-hidden="true" />
      <span className="corner-sprig corner-sprig--br" aria-hidden="true" />
      <div className="frame-image-wrap">
        {/* src is injected by the IntersectionObserver in Timeline so only
            the frames near the viewport decode the (large) photo at a
            time. width/height + aspect-ratio avoid layout shift on load. */}
        <img
          ref={(el) => registerRef(index, el)}
          data-src={entry.image}
          alt={entry.age}
          className="frame-image"
          loading="lazy"
          decoding="async"
          width="450"
          height="600"
        />
        <span className="frame-timestamp">{entry.age}</span>
      </div>
    </div>
  );
});

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
  const imgRefs = useRef([]);
  const registerRef = useCallback((i, el) => {
    imgRefs.current[i] = el;
  }, []);
  const [videoSrc, setVideoSrc] = useState(null);

  const count = timelineData.length;

  // Three back-to-back copies of the data: [prev][home][next]. This is
  // what gives the strip a full loop's worth of buffer to scroll into on
  // either side, so it can be re-anchored invisibly and feel endless.
  // Scales automatically — add more entries to timelineData and this
  // still just works, no other changes needed.
  const loopData = useMemo(() => {
    const out = [];
    for (let copy = 0; copy < 3; copy++) {
      timelineData.forEach((entry, i) => {
        out.push({ ...entry, __realIndex: i, __loopKey: `${copy}-${i}` });
      });
    }
    return out;
  }, []);

  const { realIndex, tripleActive, goTo } = useLoopedFilmstrip(trackRef, count, { reduceMotion });

  useDragScroll(trackRef);
  useWheelToHorizontal(trackRef);

  // Deferred image loading: swap data-src -> src only for frames that
  // approach the viewport, so only a handful of large photos decode at
  // once even though the strip now renders 3 copies of the data.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          const img = en.target;
          if (en.isIntersecting && !img.getAttribute('src')) {
            const src = img.getAttribute('data-src');
            if (src) img.src = src;
          }
        });
      },
      {
        root: track,
        rootMargin: '0px 150% 0px 150%',
      }
    );

    imgRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(1);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(-1);
      }
    };
    el.addEventListener('keydown', onKeyDown);
    return () => el.removeEventListener('keydown', onKeyDown);
  }, [goTo]);

  const activeEntry = timelineData[realIndex];
  const progress = count > 1 ? realIndex / (count - 1) : 0;

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
          onClick={() => goTo(-1)}
          aria-label="Previous memory"
        >
          ‹
        </button>

        <div className="filmstrip-track" ref={trackRef} tabIndex={0}>
          {loopData.map((entry, i) => (
            <Frame
              key={entry.__loopKey}
              entry={entry}
              index={i}
              isActive={i === tripleActive}
              registerRef={registerRef}
            />
          ))}
        </div>

        <button
          className="filmstrip-nav filmstrip-nav--right"
          onClick={() => goTo(1)}
          aria-label="Next memory"
        >
          ›
        </button>
      </div>

      <div className="filmstrip-detail">
        <AnimatePresence mode="popLayout">
          <motion.p
            key={`caption-${realIndex}`}
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
              key={`video-hint-${realIndex}`}
              onPlay={() => setVideoSrc(activeEntry.video)}
              reduceMotion={reduceMotion}
            />
          )}
        </AnimatePresence>
      </div>

      <Sprig className="filmstrip-sprig" />

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