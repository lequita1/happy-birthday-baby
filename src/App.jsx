import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { flowerImages } from './flowerImages';          // ← new import
import useImagePreloader from './useImagePreloader';    // ← new import
import CountdownGate from './components/CountdownGate';
import BoxReveal from './components/Page1';
import FlowerBurst from './components/Page2';
import MessageScene from './components/Page3';
import Timeline from './components/Page4';
import Gallery from './components/Page5';
import VideoScene from './components/Page6';
import WishesScene from './components/Page7';
import FinalScene from './components/Page8';
import MusicPlayer from './components/MusicPlayer';

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

  // Preload ALL flower images once, at app startup.
  // loadedImages will be null until the images are ready,
  // then a map of { src: HTMLImageElement }.
  const loadedImages = useImagePreloader(flowerImages);

  return (
    <>
      <AnimatePresence mode="wait">

      {scene === 'countdown' && (
        <CountdownGate
          key="countdown"
          onUnlock={() => go('gift')}
        />
      )}

      {scene === 'gift' && (
        <BoxReveal
          key="gift"
          onOpen={() => go('burst')}
        />
      )}

      {scene === 'burst' && (
        <FlowerBurst
          key="burst"
          loadedImages={loadedImages}   // ← pass preloaded images
          onComplete={() => go('message')}
        />
      )}

      {scene === 'message' && (
        <MessageScene
          key="message"
          onNext={() => go('timeline')}
        />
      )}

      {scene === 'timeline' && (
        <Timeline
          key="timeline"
          onNext={() => go('gallery')}
        />
      )}

      {scene === 'gallery' && (
        <Gallery
          key="gallery"
          onNext={() => go('video')}
        />
      )}

      {scene === 'video' && (
        <VideoScene
          key="video"
          onNext={() => go('wishes')}
        />
      )}

      {scene === 'wishes' && (
        <WishesScene
          key="wishes"
          onNext={() => go('final')}
        />
      )}

      {scene === 'final' && (
        <FinalScene
          key="final"
          onReplay={() => go('gift')}
        />
      )}
      </AnimatePresence>

      {/* Persistent across every scene — lives outside AnimatePresence
          so the audio element and track position survive scene switches. */}
      <MusicPlayer />
    </>
  );
}