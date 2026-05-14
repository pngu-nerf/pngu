export const R2_BASE_URL = 'https://assets.pngu.info';

// Bare R2 folder prefixes (used by Pages Functions when composing object
// keys; src/lib/blaster-paths.ts imports BLASTER_PREFIX from here so the
// string lives in exactly one place).
export const BLASTER_PREFIX = 'PNGU-Blaster-Data-main';
export const BRAND_PREFIX = 'PNGU-Brand-Assets-main';
export const FILES_PREFIX = 'PNGU-3D-Files-main';
export const HIGHLIGHT_PREFIX = 'highlight';

// Public URL bases — what the browser sees.
export const R2_BRAND_BASE = `${R2_BASE_URL}/${BRAND_PREFIX}`;
export const R2_DATA_BASE = `${R2_BASE_URL}/${BLASTER_PREFIX}`;
export const R2_FILES_BASE = `${R2_BASE_URL}/${FILES_PREFIX}`;
export const R2_HIGHLIGHT_BASE = `${R2_BASE_URL}/${HIGHLIGHT_PREFIX}`;
