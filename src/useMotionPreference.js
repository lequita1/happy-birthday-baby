// ─────────────────────────────────────────────────────────────
// Central motion-preference switch.
//
// By default, browsers/OSes can tell the site "this visitor
// prefers reduced motion," and every scene dims its animations
// in response. For a one-time personal gift to one specific
// person, that protection isn't needed — so it's forced off here.
//
// If you ever want the site to respect that setting again
// (e.g. reusing this codebase for something more public), just
// flip this one flag back to true. Nothing else needs to change.
// ─────────────────────────────────────────────────────────────
import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';

const RESPECT_OS_PREFERENCE = false;

export function useReducedMotion() {
  const osPreference = useFramerReducedMotion();
  return RESPECT_OS_PREFERENCE ? osPreference : false;
}