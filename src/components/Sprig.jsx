// Botanical linework divider — thin stroke, no fill, drawn in
// currentColor so the palette violet tints it at low opacity.
// Shared by the scenes that need a pressed-flower flourish.

export default function Sprig({ className = '' }) {
  return (
    <svg
      viewBox="0 0 120 28"
      className={`sprig${className ? ` ${className}` : ''}`}
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 23 C 32 20, 66 12, 116 5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path d="M28 18 C 25 10, 32 6, 39 6 C 41 13, 35 19, 28 18 Z" stroke="currentColor" strokeWidth="1" />
      <path d="M48 13 C 51 6, 58 3, 64 4 C 64 11, 56 14, 48 13 Z" stroke="currentColor" strokeWidth="1" />
      <path d="M70 9 C 68 3, 75 0, 81 2 C 82 8, 75 12, 70 9 Z" stroke="currentColor" strokeWidth="1" />
      <path d="M92 6 C 96 2, 102 1, 106 4 C 103 9, 96 10, 92 6 Z" stroke="currentColor" strokeWidth="1" />
      <path d="M38 16 C 45 20, 47 25, 44 29 C 37 26, 35 20, 38 16 Z" stroke="currentColor" strokeWidth="1" />
      <path d="M56 11 C 62 14, 64 19, 60 22 C 55 19, 53 14, 56 11 Z" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
