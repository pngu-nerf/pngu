/**
 * Convert a folder name or display name into a URL-safe slug.
 * Handles URI-encoded names (e.g. "Cynthia%20Bolt%20Remix").
 */
export function slugify(text: string): string {
  return decodeURIComponent(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
