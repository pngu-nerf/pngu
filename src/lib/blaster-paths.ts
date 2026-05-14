/**
 * Single source of truth for everything blaster-related that crosses the
 * Astro / Pages-Functions boundary: the R2 prefix, the section enum, key
 * builders, request validators, and the upload limits.
 *
 * Renaming the R2 prefix is a one-line change in src/constants.ts.
 * Adding a new review section requires editing SECTION_KEYS here AND the
 * schema in src/content.config.ts (Zod field names must be literal so
 * the schema can't import this).
 */
import { BLASTER_PREFIX } from '../constants';

export { BLASTER_PREFIX };

// MUST stay in sync with the section fields on the `blasters` Zod schema
// in src/content.config.ts. Adding a new section requires touching both.
export const SECTION_KEYS = [
  'firstImpressions',
  'price',
  'buildQuality',
  'ergonomics',
  'magSystem',
  'performance',
  'maintenance',
  'failurePoints',
  'printingAssembly',
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

// Human-readable headings for each section. Keep in render order.
export const SECTION_HEADINGS: Record<SectionKey, string> = {
  firstImpressions: 'First Impressions',
  price: 'Price & Value',
  buildQuality: 'Build Quality',
  ergonomics: 'Ergonomics',
  magSystem: 'Mag System',
  performance: 'Performance',
  maintenance: 'Maintenance & Modularity',
  failurePoints: 'Failure Points & Support',
  printingAssembly: 'Printing & Assembly',
};

// Upload limits / cache policy — module constants, not parameters.
// Endpoints import these by name; there is no code path that omits the
// cache header or accepts an unlisted MIME type.
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_MIME_TYPES: ReadonlySet<string> = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);
export const IMMUTABLE_CACHE_CONTROL = 'public, max-age=31536000, immutable';

// ── Path composition ───────────────────────────────────────────────────
// Every R2 key for a blaster image goes through these. Endpoints accept
// (slug, target, filename) from the client and compose the key here —
// never trust a client-supplied R2 key.
export function blasterRoot(slug: string): string {
  return `${BLASTER_PREFIX}/${slug}`;
}
export function heroPrefix(slug: string): string {
  return `${blasterRoot(slug)}/hero/`;
}
export function galleryPrefix(slug: string, section: SectionKey): string {
  return `${blasterRoot(slug)}/galleries/${section}/`;
}
export function heroKey(slug: string, filename: string): string {
  return `${heroPrefix(slug)}${filename}`;
}
export function galleryKey(slug: string, section: SectionKey, filename: string): string {
  return `${galleryPrefix(slug, section)}${filename}`;
}

// ── Validation ─────────────────────────────────────────────────────────
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;
const FILENAME_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/;

export function isValidSlug(s: unknown): s is string {
  return typeof s === 'string' && SLUG_RE.test(s);
}
export function isValidFilename(s: unknown): s is string {
  if (typeof s !== 'string') return false;
  // Belt-and-braces — the regex below would already reject these, but
  // explicit rejection makes intent obvious in the error path.
  if (s.includes('/') || s.includes('\\') || s.includes('..')) return false;
  return FILENAME_RE.test(s);
}
export function isValidSection(s: unknown): s is SectionKey {
  return typeof s === 'string' && (SECTION_KEYS as readonly string[]).includes(s);
}
