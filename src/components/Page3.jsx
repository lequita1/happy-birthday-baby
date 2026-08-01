import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import '../css/Page3.css';

// ─────────────────────────────────────────────────────────────
// Page3 — Typewriter message + audio
//
// HOW TO USE:
// 1. Write your message in MESSAGE below. Use real punctuation —
//    the pauses are driven by it automatically.
// 2. Record yourself reading it out loud at a natural pace.
//    Drop the file at /public/audio/message.mp3
// 3. That's it. The typewriter sets the visual pace; your voice
//    is already synced because you read the same words.
//
// PAUSE DURATIONS (tweak these to match your reading speed):
//   Period / ! / ?  →  PAUSE_SENTENCE  (long breath)
//   Comma / ; / :   →  PAUSE_CLAUSE    (short breath)
//   Space           →  PAUSE_WORD      (between words)
//   Each character  →  CHAR_SPEED      (typing speed)
// ─────────────────────────────────────────────────────────────

const MESSAGE =
  `Hey, it's me.\n\nI know a text would have been easier. But you're not someone I want to take the easy way with.\n\nYou showed up in my life and just... stayed. In the best way. The kind of way I didn't know I needed until you were already there.\n\nI hope today feels as good as you make everything else feel.\n\nHappy birthday.`;

// Typing timing (milliseconds)
const CHAR_SPEED     = 38;  // base delay per character
const PAUSE_WORD     = 60;  // extra pause after a space
const PAUSE_CLAUSE   = 260; // extra pause after , ; :
const PAUSE_SENTENCE = 620; // extra pause after . ! ?

// ── Build a flat array of { char, delay } from the message ───
function buildCharTimeline(text) {
  const chars = [];
  let totalDelay = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    chars.push({ char: ch, delay: totalDelay });
    totalDelay += CHAR_SPEED;

    // Look-ahead: add extra pause AFTER punctuation
    if ('.!?'.includes(ch))       totalDelay += PAUSE_SENTENCE;
    else if (',;:'.includes(ch))  totalDelay += PAUSE_CLAUSE;
    else if (ch === ' ')          totalDelay += PAUSE_WORD;
    else if (ch === '\n')         totalDelay += PAUSE_SENTENCE * 1.4;
  }

  return { chars, totalDuration: totalDelay };
}

const { chars: CHAR_TIMELINE } = buildCharTimeline(MESSAGE);
const CHAR_COUNT = CHAR_TIMELINE.length; // stable number — safe to use in useEffect deps

// ── Cursor blink ──────────────────────────────────────────────
function Cursor({ visible }) {
  return (
    <motion.span
      className="typewriter-cursor"
      animate={{ opacity: visible ? [1, 0, 1] : 0 }}
      transition={
        visible
          ? { duration: 0.9, repeat: Infinity, ease: 'linear' }
          : { duration: 0 }
      }
    >
      |
    </motion.span>
  );
}

// ── Continue button ───────────────────────────────────────────
function ContinueButton({ onNext }) {
  return (
    <motion.button
      className="continue-btn"
      onClick={onNext}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      whileTap={{ scale: 0.96 }}
    >
      continue
    </motion.button>
  );
}

// ── Scene root ────────────────────────────────────────────────
export default function MessageScene({ onNext }) {
  const reduceMotion = useReducedMotion();
  const audioRef = useRef(null);
  const timersRef = useRef([]);

  // How many characters are currently revealed
  const [revealedCount, setRevealedCount] = useState(0);
  const [done, setDone] = useState(false);

  const revealedText = CHAR_TIMELINE.slice(0, revealedCount)
    .map((c) => c.char)
    .join('');

  // ── Start typing on mount ───────────────────────────────────
  useEffect(() => {
    // Reduced motion: show everything instantly, but defer state updates
    // so we don't call setState synchronously inside the effect body.
    if (reduceMotion) {
      const t = setTimeout(() => {
        setRevealedCount(CHAR_COUNT);
        setDone(true);
      }, 0);
      timersRef.current.push(t);
    } else {
      // Schedule each character reveal
      CHAR_TIMELINE.forEach((item, i) => {
        const t = setTimeout(() => {
          setRevealedCount(i + 1);
          if (i === CHAR_COUNT - 1) {
            setTimeout(() => setDone(true), 800);
          }
        }, item.delay);
        timersRef.current.push(t);
      });
    }

    // Start audio
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Autoplay blocked in an unexpected edge case — audio just
        // won't play, typewriter still runs fine.
      });
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [reduceMotion]);

  // ── Render newlines as <br> / paragraph breaks ──────────────
  // Split on \n and render each segment, with a blank line
  // for double-newlines, so the message has natural paragraphs.
  const renderText = () => {
    const segments = revealedText.split('\n');
    return segments.map((seg, i) => (
      <span key={i}>
        {seg}
        {i < segments.length - 1 && (
          seg === '' ? <br /> : <><br /><br /></>
        )}
      </span>
    ));
  };

  return (
    <motion.div
      className="message-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
    >
      {/* Audio — drop file at /public/audio/message.mp3 */}
      <audio
        ref={audioRef}
        src="/audio/message.mp3"
        preload="auto"
        style={{ display: 'none' }}
      />

      {/* Atmosphere */}
      <div className="msg-glow"    aria-hidden="true" />
      <div className="msg-flares"  aria-hidden="true">
        <span className="mf mf-1" />
        <span className="mf mf-2" />
      </div>

      {/* Message body */}
      <div className="message-body">
        <p className="typewriter-text">
          {renderText()}
          <Cursor visible={!done} />
        </p>
      </div>

      {/* Continue button — only after typing finishes */}
      <div className="continue-wrap">
        <AnimatePresence>
          {done && (
            <ContinueButton key="continue-btn" onNext={onNext} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}