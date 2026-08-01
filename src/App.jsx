import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import CountdownGate from './components/CountdownGate';
import GalacticReveal from './components/Page1';
import FlowerBurst from './components/Page2';
import MessageScene from './components/Page3';
// Page4, Page5, Page6, Page7, Page8 — uncomment as each is built:
// import Timeline      from './components/Page4';
// import Gallery       from './components/Page5';
// import VideoGreeting from './components/Page6';
// import BirthdayWish  from './components/Page7';
// import FinalScene    from './components/Page8';

// ─────────────────────────────────────────────────────────────
// Scene flow (linear, no routing):
//
//  countdown → gift → burst → message → timeline
//  → gallery → video → wishes → final
//
// To go back to dev-testing a specific scene, temporarily set
// the initial state here, e.g. useState('burst').
// ─────────────────────────────────────────────────────────────

export default function App() {
  const [scene, setScene] = useState('countdown');
  const go = (next) => setScene(next);

  return (
    // AnimatePresence mode="wait" means the exiting scene fully
    // finishes its exit animation before the next one mounts.
    <AnimatePresence mode="wait">

      {scene === 'countdown' && (
        <CountdownGate
          key="countdown"
          onUnlock={() => go('gift')}
        />
      )}

      {scene === 'gift' && (
        <GalacticReveal
          key="gift"
          onOpen={() => go('burst')}
        />
      )}

      {scene === 'burst' && (
        <FlowerBurst
          key="burst"
          onComplete={() => go('message')}
        />
      )}

      {scene === 'message' && (
        <MessageScene
          key="message"
          onNext={() => go('timeline')}
        />
      )}

      {/* Uncomment each block as the page is built: */}

      {/* {scene === 'timeline' && (
        <Timeline
          key="timeline"
          onNext={() => go('gallery')}
        />
      )} */}

      {/* {scene === 'gallery' && (
        <Gallery
          key="gallery"
          onNext={() => go('video')}
        />
      )} */}

      {/* {scene === 'video' && (
        <VideoGreeting
          key="video"
          onNext={() => go('wishes')}
        />
      )} */}

      {/* {scene === 'wishes' && (
        <BirthdayWish
          key="wishes"
          onNext={() => go('final')}
        />
      )} */}

      {/* {scene === 'final' && (
        <FinalScene
          key="final"
          onReplay={() => go('gift')}
        />
      )} */}

    </AnimatePresence>
  );
}