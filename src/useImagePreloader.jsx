import { useEffect, useMemo, useState } from 'react';

export default function useImagePreloader(srcs) {
  const [loadedMap, setLoadedMap] = useState(null);

  // Stable string key instead of the array reference itself — if the
  // caller passes a freshly-built array every render (very easy to do
  // by accident, e.g. `.map()` inline in JSX), the effect below would
  // otherwise re-run every single render and loop forever.
  const key = [...new Set(srcs)].join('|');
  const unique = useMemo(() => (key === '' ? [] : key.split('|')), [key]);

  useEffect(() => {
    if (unique.length === 0) {
      // Nothing to load — handled directly in the return value below
      // instead of round-tripping through a synchronous setState here.
      return;
    }

    let cancelled = false;

    const promises = unique.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ src, img, ok: true });
          img.onerror = () => resolve({ src, img: null, ok: false });
          img.src = src;
        })
    );

    // Our own resolve-never-reject pattern above means one broken image
    // path no longer blocks every other image from showing up in the map.
    Promise.all(promises).then((entries) => {
      if (cancelled) return;

      const map = {};
      entries.forEach(({ src, img, ok }) => {
        if (ok) {
          map[src] = img;
        } else {
          console.warn(`[ImagePreloader] Failed to load: ${src}`);
        }
      });
      setLoadedMap(map); // async — happens inside a .then(), not synchronously
    });

    return () => {
      cancelled = true;
    };
  }, [unique]);

  if (unique.length === 0) return {};
  return loadedMap;
}