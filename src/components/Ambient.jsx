const NEBULA_BLOBS = [
  { id: 1, top: -8,  left: -14, size: 52, color: '233, 198, 255', opacity: 0.72, duration: 34, dx: 14, dy: -7 },
  { id: 2, top: 52,  left: 52,  size: 58, color: '199, 249, 199', opacity: 0.6,  duration: 44, dx: -12, dy: 9 },
  { id: 3, top: 24,  left: 30,  size: 44, color: '234, 226, 249', opacity: 0.85, duration: 39, dx: 8,  dy: 12 },
];

export function Nebula() {
  return (
    <div className="ambient-nebula" aria-hidden="true">
      {NEBULA_BLOBS.map((b) => (
        <span
          key={b.id}
          className="ambient-blob"
          style={{
            top: `${b.top}%`,
            left: `${b.left}%`,
            width: `${b.size}vmax`,
            height: `${b.size}vmax`,
            background: `radial-gradient(circle, rgba(${b.color}, ${b.opacity}) 0%, rgba(${b.color}, 0) 70%)`,
            '--dur': `${b.duration}s`,
            '--dx': `${b.dx}vmax`,
            '--dy': `${b.dy}vh`,
            animationDelay: `-${b.id * 9}s`,
          }}
        />
      ))}
    </div>
  );
}

const AURORA_BANDS = [
  { id: 1, top: 12, width: 120, color: '233, 198, 255', opacity: 0.45, duration: 26, sway: 7,  rotate: -12, delay: -3 },
  { id: 2, top: 46, width: 100, color: '199, 249, 199', opacity: 0.5,  duration: 32, sway: -8, rotate: 9,  delay: -16 },
  { id: 3, top: 78, width: 130, color: '234, 226, 249', opacity: 0.6,  duration: 29, sway: 6,  rotate: -6,  delay: -24 },
];

export function Aurora() {
  return (
    <div className="ambient-aurora" aria-hidden="true">
      {AURORA_BANDS.map((b) => (
        <span
          key={b.id}
          className="aurora-band"
          style={{
            top: `${b.top}%`,
            width: `${b.width}vw`,
            '--band-color': b.color,
            '--band-opacity': b.opacity,
            '--band-sway': `${b.sway}vw`,
            '--band-rotate': `${b.rotate}deg`,
            '--band-dur': `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
