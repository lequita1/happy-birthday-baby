import { useEffect, useRef } from 'react';

export default function CanvasBurst({ petals, reduceMotion, loadedImages, onComplete }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const completedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImages) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    if (reduceMotion) {
      drawStatic();
    } else {
      startAnimation();
    }

    function drawStatic() {
      const originX = canvas.width * 0.5;
      const originY = canvas.height * 0.45;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      petals.forEach(p => {
        const img = loadedImages[p.image];
        if (!img) return;
        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.translate(originX + p.x, originY + p.y);
        ctx.rotate((p.rotate * Math.PI) / 180);
        ctx.drawImage(img, -p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
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
      const originX = canvas.width * 0.5;
      const originY = canvas.height * 0.45;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let allDone = true;

      petals.forEach(p => {
        const img = loadedImages[p.image];
        if (!img) return;

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
        const currentRotation = p.rotate * eased;

        ctx.save();
        ctx.globalAlpha = currentOpacity;
        ctx.translate(currentX, currentY);
        ctx.rotate((currentRotation * Math.PI) / 180);
        ctx.scale(currentScale, currentScale);
        ctx.drawImage(img, -p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (!allDone && !completedRef.current) {
        rafRef.current = requestAnimationFrame(animate);
      } else if (!completedRef.current) {
        completedRef.current = true;
        // Final clean frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        petals.forEach(p => {
          const img = loadedImages[p.image];
          if (!img) return;
          ctx.save();
          ctx.globalAlpha = 1;
          ctx.translate(originX + p.x, originY + p.y);
          ctx.rotate((p.rotate * Math.PI) / 180);
          ctx.drawImage(img, -p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        });
        onComplete?.();
      }
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [petals, reduceMotion, loadedImages, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
      }}
    />
  );
}