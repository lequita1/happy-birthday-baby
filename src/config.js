// config.js
// ────────────────────────────────────────────────────────────
// Set the real birthday moment here before deploying.
//
// Use an explicit timezone offset (not just a date string) so the
// countdown means the same thing no matter what timezone her phone
// is set to. Example — August 15, 2026, 7:00 PM in Manila (UTC+8):
//
export const TARGET_DATE = new Date('2026-08-06T00:00:00+08:00');
//
// ────────────────────────────────────────────────────────────

// DEV MODE: fires 10 seconds after the page loads, so you can test
// the unlock transition instantly instead of waiting for the real date.
// Comment this out and uncomment the real line above before deploying.
//export const TARGET_DATE = new Date(Date.now() + 10_000);