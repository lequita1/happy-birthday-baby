import { useEffect, useRef } from 'react';

// Cap canvas/sprite resolution so high-DPR phones don't over-fill the
// screen every frame. Visually fine on 2x–3x devices, much cheaper to
// repaint while the burst is animating.
const MAX_DPR = 1.5;

// Pre-render one petal (with its rotation baked in) into a small offscreen
// canvas of ~size×size. Drawing these cached sprites each frame is far
// cheaper than re-sampling the multi-MB PNG originals dozens of times,
// which is what made the burst chug on phones.
function makeSprite(image, size, rotateDeg, dpr) {
  const dim = Math.max(1, Math.ceil(size * dpr));
  const c = document.createElement('canvas');
  c.width = dim;
  c.height = dim;
  const ctx = c.getContext('2d');
  ctx.translate(dim / 2, dim / 2);
  ctx.rotate((rotateDeg * Math.PI) / 180);
  ctx.drawImage(image, -size / 2, -size / 2, size, size);
  return c;
}

export default function CanvasBurst({ petals, reduceMotion, loadedImages, width, height, onComplete }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const completedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImages) return;
    const ctx = canvas.getContext('2d');
    completedRef.current = false;

    const getDpr = () => Math.min(window.devicePixelRatio || 1, MAX_DPR);

    let holdTimer = null;
    const dpr = getDpr();
    const sprites = petals.map((p) => {
      const img = loadedImages[p.image];
      return img ? makeSprite(img, p.size, p.rotate, dpr) : null;
    });

    const resize = () => {
      const d = getDpr();
      const w = width || window.innerWidth;
      const h = height || window.innerHeight;
      canvas.width = Math.round(w * d);
      canvas.height = Math.round(h * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    if (reduceMotion) {
      drawStatic();
    } else {
      startAnimation();
    }

    function drawPetal(sprite, x, y, size, scale, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
      ctx.restore();
    }

    function drawStatic() {
      const w = width || window.innerWidth;
      const h = height || window.innerHeight;
      const originX = w * 0.5;
      const originY = h * 0.45;
      ctx.clearRect(0, 0, w, h);

      petals.forEach((p, i) => {
        const sprite = sprites[i];
        if (!sprite) return;
        drawPetal(sprite, originX + p.x, originY + p.y, p.size, 1, 0.95);
      });

      if (!completedRef.current) {
        completedRef.current = true;
        setTimeout(() => onComplete?.(), 300);
      }
    }

    function startAnimation() {
      startTimeRef.current = performance.now();
      animate();
    }

    function animate() {
      const now = performance.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      const w = width || window.innerWidth;
      const h = height || window.innerHeight;
      const originX = w * 0.5;
      const originY = h * 0.45;

      ctx.clearRect(0, 0, w, h);

      let allDone = true;

      petals.forEach((p, i) => {
        const sprite = sprites[i];
        if (!sprite) return;

        const localTime = elapsed - p.delay;
        if (localTime < 0) {
          allDone = false;
          return;
        }

        const progress = Math.min(localTime / p.duration, 1);
        if (progress < 1) allDone = false;

        const eased = 1 - Math.pow(1 - progress, 3);
        const currentX = originX + p.x * eased;
        const currentY = originY + p.y * eased;
        const currentScale = 0.1 + 0.9 * eased;
        const currentOpacity = Math.min(1, progress * 2.5);

        drawPetal(sprite, currentX, currentY, p.size, currentScale, currentOpacity);
      });

      if (!allDone && !completedRef.current) {
        rafRef.current = requestAnimationFrame(animate);
      } else if (!completedRef.current) {
        completedRef.current = true;
        // Final clean frame
        ctx.clearRect(0, 0, w, h);
        petals.forEach((p, i) => {
          const sprite = sprites[i];
          if (!sprite) return;
          drawPetal(sprite, originX + p.x, originY + p.y, p.size, 1, 1);
        });
        // Hold the fully-burst frame so it reads as "covered" before advancing.
        holdTimer = setTimeout(() => onComplete?.(), reduceMotion ? 400 : 900);
      }
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(holdTimer);
      window.removeEventListener('resize', resize);
    };
  }, [petals, reduceMotion, loadedImages, onComplete, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: width || window.innerWidth,
        height: height || window.innerHeight,
        zIndex: 2,
        pointerEvents: 'none',
      }}
    />
  );
}