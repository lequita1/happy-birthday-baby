import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { musicData } from '../musicData';
import '../css/MusicPlayer.css';

const fmtTime = (s) => {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
};

function MusicNoteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M8 5v14l11-7z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
      <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
    </svg>
  );
}

function PrevIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M6 5v14M18 5v14L8 12z" fill="currentColor" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M18 5v14M6 5v14l10-7z" fill="currentColor" />
    </svg>
  );
}

export default function MusicPlayer({ scene }) {
  const audioRef = useRef(null);
  const indexRef = useRef(0);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);

  // The floating button stays hidden on the title/countdown page,
  // then fades in at its spot once the first scene opens.
  const hidden = scene === 'countdown';

  const track = musicData[index];

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const select = useCallback((i) => {
    const audio = audioRef.current;
    if (!audio || musicData.length === 0) return;
    const nextIndex = (i + musicData.length) % musicData.length;
    setIndex(nextIndex);
    setError(false);
    setCurrentTime(0);
    setDuration(0);
    audio.src = musicData[nextIndex].src;
    audio.load();
    audio.play().catch(() => setError(true));
  }, []);

  const next = useCallback(() => select(indexRef.current + 1), [select]);
  const prev = useCallback(() => select(indexRef.current - 1), [select]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => setError(true));
    else audio.pause();
  }, []);

  const seek = useCallback(
    (e) => {
      const audio = audioRef.current;
      if (!audio || !duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      audio.currentTime = ratio * duration;
      setCurrentTime(audio.currentTime);
    },
    [duration],
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || musicData.length === 0) return undefined;

    audio.volume = 0.1;
    audio.src = musicData[0].src;

    const onPlay = () => {
      setPlaying(true);
      setError(false);
    };
    const onPause = () => setPlaying(false);
    const onTime = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onEnded = () => next();
    const onError = () => setError(true);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('durationchange', onDuration);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('durationchange', onDuration);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [next]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  if (musicData.length === 0) return null;

  return (
    <>
      <AnimatePresence>
        {open && !hidden && (
          <motion.div
            key="music-backdrop"
            className="music-backdrop"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <audio ref={audioRef} preload="auto" />

      <AnimatePresence>
        {open && !hidden && (
          <motion.div
            key="music-panel"
            className="music-panel"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <button className="music-close" onClick={() => setOpen(false)} aria-label="Close music player">
              ×
            </button>

            <div className="music-cover-wrap">
              <div
                className="music-cover"
                style={
                  track.cover
                    ? undefined
                    : { background: `linear-gradient(135deg, ${track.gradient[0]}, ${track.gradient[1]})` }
                }
              >
                {track.cover ? (
                  <img src={track.cover} alt="" />
                ) : (
                  <span className="music-cover-fallback">
                    <MusicNoteIcon />
                  </span>
                )}
              </div>
              <div className="music-meta">
                <span className="music-title">{track.title}</span>
                <span className="music-artist">{track.artist}</span>
              </div>
            </div>

            <div
              className="music-progress"
              onClick={seek}
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.floor(duration)}
              aria-valuenow={Math.floor(currentTime)}
            >
              <div className="music-progress-track">
                <div className="music-progress-fill" style={{ width: `${pct}%` }} />
                <span className="music-progress-dot" style={{ left: `${pct}%` }} />
              </div>
            </div>

            <div className="music-times">
              <span>{fmtTime(currentTime)}</span>
              <span>{fmtTime(duration)}</span>
            </div>

            <div className="music-controls">
              <button className="music-btn" onClick={prev} aria-label="Previous track">
                <PrevIcon />
              </button>
              <button className="music-play-btn" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
                {playing ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button className="music-btn" onClick={next} aria-label="Next track">
                <NextIcon />
              </button>
            </div>

            {error && (
              <p className="music-error">
                this track isn't here yet — drop the file into public/audio and add it to
                src/musicData.js
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!hidden && (
          <motion.button
            type="button"
            className={`music-fab${playing ? ' is-playing' : ''}`}
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close music player' : 'Open music player'}
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            whileTap={{ scale: 0.94 }}
          >
            <span className="music-fab-icon" aria-hidden="true">
              {playing ? (
                <span className="eq eq--fab is-playing">
                  <span />
                  <span />
                  <span />
                </span>
              ) : (
                <MusicNoteIcon />
              )}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
