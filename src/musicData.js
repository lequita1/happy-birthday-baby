// ─────────────────────────────────────────────────────────────
// Music player playlist
//
// HOW TO USE:
// 1. Drop your mp3 files into /public/audio/ (e.g. track-1.mp3).
// 2. Add one entry per song below. `cover` is optional — without
//    it the player shows a gradient tile from `gradient` instead.
// 3. That's it. The player floats at the bottom-left of every
//    scene and keeps playing as she moves through the pages.
// ─────────────────────────────────────────────────────────────

export const musicData = [
  {
    id: '1',
    title: 'Your song',
    artist: 'Replace me',
    src: '/audio/track-1.mp3',
    cover: null,
    gradient: ['#4D6FFF', '#8B1A1A'],
  },
];
