import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Nebula, Aurora } from './Ambient';
import '../css/Page6.css';

// ─────────────────────────────────────────────────────────────
// Page6 — Video greeting
//
// HOW TO USE:
// 1. Drop your clip at /public/videos/message.mp4 and update
//    VIDEO_SRC below.
// 2. The scene shows a tap-to-play overlay first (mobile needs
//    the user gesture), then the player takes over. "continue"
//    appears once the clip finishes — or immediately if the
//    file can't be found, so the flow never dead-ends.
// ─────────────────────────────────────────────────────────────

const KICKER_TEXT = 'saved the best for last';
const HEADING_TEXT = 'one more thing';
const HINT_TEXT = 'tap to play · sound on';
const CONTINUE_LABEL = 'continue';
const VIDEO_SRC = '/videos/vid1.mp4';

function PlayOverlay({ onPlay }) {
  return (
    <button type="button" className="video-play-overlay" onClick={onPlay} aria-label="Play video">
      <span className="video-play-shimmer" aria-hidden="true" />
      <span className="video-play-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="30" height="30">
          <path d="M8 5v14l11-7z" fill="#ffffff" />
        </svg>
      </span>
      <span className="video-play-label">{HINT_TEXT}</span>
    </button>
  );
}

export default function VideoScene({ onNext }) {
  const videoRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [failed, setFailed] = useState(false);

  const handlePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video
      .play()
      .then(() => setStarted(true))
      .catch(() => setFailed(true));
  };

  const canContinue = finished || failed;

  return (
    <motion.div
      className="video-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
    >
      <Nebula />
      <Aurora />

      <div className="video-glow" aria-hidden="true" />
      <div className="video-flares" aria-hidden="true">
        <span className="vf vf-1" />
        <span className="vf vf-2" />
      </div>

      <div className="video-heading-block">
        <p className="video-kicker">{KICKER_TEXT}</p>
        <h2 className="video-heading">{HEADING_TEXT}</h2>
      </div>

      <div className="video-frame-wrap">
        <div className="film-strip" aria-hidden="true" />
        <div className={`video-frame${started ? ' is-playing' : ''}`}>
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            className="video-element"
            controls={started}
            playsInline
            preload="auto"
            onEnded={() => setFinished(true)}
            onError={() => setFailed(true)}
          />
          {started && <span className="video-sheen" aria-hidden="true" />}
          {!started && !failed && <PlayOverlay onPlay={handlePlay} />}
        </div>
        <div className="film-strip" aria-hidden="true" />
        <span className="video-corner video-corner--tl" aria-hidden="true" />
        <span className="video-corner video-corner--tr" aria-hidden="true" />
        <span className="video-corner video-corner--bl" aria-hidden="true" />
        <span className="video-corner video-corner--br" aria-hidden="true" />
      </div>

      {failed && <p className="video-failed-note">the clip is still loading — continue anyway</p>}

      <div className="video-continue-wrap">
        <AnimatePresence>
          {canContinue && (
            <motion.button
              key="video-continue-btn"
              className="video-continue-btn"
              onClick={onNext}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              whileTap={{ scale: 0.96 }}
            >
              {CONTINUE_LABEL}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
