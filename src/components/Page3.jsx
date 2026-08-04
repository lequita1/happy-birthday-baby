import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../useMotionPreference';
import { Nebula, Aurora } from './Ambient';
import '../css/Page3.css';

// ─────────────────────────────────────────────────────────────
// Page3 — Typewriter message + audio
//
// HOW TO USE:
// 1. Write your message in MESSAGE below.
// 2. Record yourself reading it out loud at a natural pace.
//    Drop the file at /public/audio/message.mp3
// 3. If the typewriter finishes noticeably before/after your
//    voice, nudge CHAR_SPEED up or down below.
// ─────────────────────────────────────────────────────────────

const MESSAGE =
  `Happy birthday, baby ko <33
  Bilis ng panahon no? habang nagkakalkal ako ng pictures mo super small mo lang mga ganto 🤌 hehe
  I hope you know how special ikaw syempre di lang sakin, pero sa lahat din ng swerteng tao na kasama mo sa life mo.
  Ngayon I see someone na sobrang matured, responsible, cute, maganda, kahit may problema nakakakita pa rin ng way malagpasan, laging stuffed bibig, maganda mag smile, caring, may dreams, thoughtful, and may heart na super pure kaya unique ikaw hehe.
  ANDDDDDDD I want you to know that I am so so proud of you.
  Not just because of the things na natapos mo, but because of the person na ikaw ngayon after ng lahat ng pinagdaanan mo. I am so proud of you kahit baby litol steps pa yan o kahit walang nakakapansin. I am so proud of you na you kept on going pa rin kahit pagod ka. I am so proud of you for trying, growing, and for becoming more of yourself pa every year.
  I hope na ngayong 21 ka na sana life mo mabigyan ka pa rin ng maraming reason para mag smile, tumawa at maging masaya. 
  I hope na you get to experience yung kind of happiness na hindi nifforcee. I hope na maachieve mo lahat ng mga gusto mo, pangarap mo at pinaghihirapan mo. I hope na patuloy mo pa rin habulin lahat ng mga gusto mo kahit na mukang mahirap. I hope na magkaroon ka pa ng maraming memorable moments na masaya ikaw and more days pa na pwede mo masabi sa sarili mo na, "I am proud of myself".
  And when life doesn't go sa way na gusto mo, sana maalala mo na pwedeng magkamali baby
  Sobrang grateful ako kasi sa lahat ng mamemeet ko sa sobrang daming possibilities eh ikaw ang nameet ko. Ikaw ang kasama ko sa pag build ng future, at di lang kita nakilala sa happy na ikaw, pagod, emotional, tahimik, lahat ng side mo na di nakikita ng iba.
  May misunderstandings, nagkakamali ako, moments na nadadala tayo ng emotion natin at di madali para satin. Pero kahit na ganon, mas grateful pa rin ako kasi mas nakilala kita.
  I am grateful na I get to witness you grow, maging part ng journey mo, na nanjan ako sa happy at sad moments mo, at I get to laugh with you kahit sa maliit na bagay at masabihan kang maganda palagi hehe.
  Andaming stress recently baby at alam kong pagod na pagod ka.. So please allow yourself na magcelebrate ngayon. Be proud na anlayo na ng narating mo. Tas don't be too hard on yourself din by, di naman lahat alam mo rin po agad. Marami pa ikaw pag dadaanan, memories na magagawa, lugar na makkita at mapupuntahan, dreams to chase pa, at ibang version mo pa na makkita. I hope na kahit papaano, you can feel na I am proud of you and I love you so much baby ko <33
  Thank you for letting me be part of your life baby. I hope you never forget na nandito ako lagi to cheer for you, believe in you and support you. Sana sa pag next next next mo here sa website matuwa ka at maisip mo lahat ng sinabi ko rito. HAAPPPYYY HAPPPPYYYYYYY BIRTHDAYYYYYYY BABYYYYYY. U DESSERVVEE TO BE CELEBRATED DI LANG TODAY PERO ARAW ARAWWWWW.
  MAHAAAAAAALLL NA MAHAAAALL NA MAHAAAL KITAAA ILOVEYOUU BYYY HAPPYYY 21ST MWAAAAHHHH 
  `;

const CHAR_SPEED     = 10;
const PAUSE_WORD     = 60;
const PAUSE_CLAUSE   = 260;
const PAUSE_SENTENCE = 620;

function buildCharTimeline(text) {
  const chars = [];
  let totalDelay = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    chars.push({ char: ch, delay: totalDelay });
    totalDelay += CHAR_SPEED;

    if ('.!?'.includes(ch))       totalDelay += PAUSE_SENTENCE;
    else if (',;:'.includes(ch))  totalDelay += PAUSE_CLAUSE;
    else if (ch === ' ')          totalDelay += PAUSE_WORD;
    else if (ch === '\n')         totalDelay += PAUSE_SENTENCE * 1.4;
  }

  return { chars, totalDuration: totalDelay };
}

const { chars: CHAR_TIMELINE } = buildCharTimeline(MESSAGE);
const CHAR_COUNT = CHAR_TIMELINE.length;

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

// ── Play prompt ─────────────────────────────────────────────
// Redesigned: icon, rotating gradient ring, and ambient halo are
// grouped in their own fixed-size stack (.play-icon-stack) so
// they stay perfectly co-centered regardless of the hint text
// below — that mismatch was the root of the old "ugly/off"
// look. Ring rotation is pure CSS now (cheaper + always on,
// matching the site's intentionally ungated motion).
function PlayPrompt({ onPlay }) {
  return (
    <motion.button
      className="play-prompt"
      onClick={onPlay}
      aria-label="Play the message"
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
      whileTap={{ scale: 0.94 }}
    >
      <span className="play-icon-stack" aria-hidden="true">
        <span className="play-halo" />
        <span className="play-ring" />
        <span className="play-icon">
          <svg viewBox="0 0 24 24" width="26" height="26">
            <path d="M8 5v14l11-7z" fill="#ffffff" />
          </svg>
        </span>
      </span>
      <span className="play-hint">tap to hear my voice</span>
    </motion.button>
  );
}

export default function MessageScene({ onNext }) {
  const reduceMotion = useReducedMotion();
  const audioRef = useRef(null);
  const timersRef = useRef([]);

  const [started, setStarted] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [done, setDone] = useState(false);

  const revealedText = CHAR_TIMELINE.slice(0, revealedCount)
    .map((c) => c.char)
    .join('');

  useEffect(() => {
    if (!started) return;

    if (reduceMotion) {
      const t = setTimeout(() => {
        setRevealedCount(CHAR_COUNT);
        setDone(true);
      }, 0);
      timersRef.current.push(t);
    } else {
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

    // Firing inside a click-handler-triggered effect keeps this a
    // direct result of a user gesture, which every mobile browser
    // (iOS Safari included) requires before it'll allow audio to play.
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [started, reduceMotion]);

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
      <audio
        ref={audioRef}
        src="/audio/message.mp3"
        preload="auto"
        style={{ display: 'none' }}
      />

      <Nebula />
      <Aurora />

      <div className="msg-glow" aria-hidden="true" />
      <div className="msg-flares" aria-hidden="true">
        <span className="mf mf-1" />
        <span className="mf mf-2" />
      </div>

      <AnimatePresence mode="wait">
        {!started ? (
          <PlayPrompt
            key="play-prompt"
            onPlay={() => setStarted(true)}
          />
        ) : (
          <motion.div
            key="message-scroll-area"
            className="message-scroll-area"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="message-body">
              <span className="corner-sprig corner-sprig--br" aria-hidden="true" />
              <p className="typewriter-text">
                {renderText()}
                <Cursor visible={!done} />
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="continue-wrap">
        <AnimatePresence>
          {done && <ContinueButton key="continue-btn" onNext={onNext} />}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}