import { useEffect, useState } from 'react';

export default function useImagePreloader(srcs) {
  const [loadedMap, setLoadedMap] = useState(null);

  useEffect(() => {
    const unique = [...new Set(srcs)];
    if (unique.length === 0) {
      setLoadedMap({});
      return;
    }

    let cancelled = false;
    const promises = unique.map(
      src =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve({ src, img });
          img.onerror = reject;
          img.src = src;
        })
    );

    Promise.all(promises)
      .then(entries => {
        if (!cancelled) {
          const map = {};
          entries.forEach(({ src, img }) => (map[src] = img));
          setLoadedMap(map);
        }
      })
      .catch(err => console.warn('[ImagePreloader]', err));

    return () => { cancelled = true; };
  }, [srcs]);

  return loadedMap;
}