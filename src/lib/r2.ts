import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

/**
 * R2 (S3-compatible) listing helper. Server-side only.
 *
 * Credentials are read from `process.env` exclusively — we deliberately do
 * NOT fall back to `import.meta.env`, because Vite would inline that into the
 * client bundle if anyone ever imports this module from a client island.
 *
 * To populate listings during `astro build`, set `R2_ACCESS_KEY_ID` and
 * `R2_SECRET_ACCESS_KEY` in the build environment. When unset, getR2Data()
 * resolves to `[]` so static builds still succeed (with empty content).
 */

const ACCOUNT_ENDPOINT =
  'https://3f9488bac1783599afb7ea3af1654150.r2.cloudflarestorage.com';
const BUCKET_NAME = 'pngu-assets';

const accessKeyId = process.env.R2_ACCESS_KEY_ID ?? '';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY ?? '';

const s3 = new S3Client({
  region: 'auto',
  endpoint: ACCOUNT_ENDPOINT,
  credentials: { accessKeyId, secretAccessKey },
});

export interface R2Folder {
  /** Human-readable name (URI-decoded, "/" stripped). */
  displayName: string;
  /** Raw folder name as it appears in R2 (still URI-encoded if applicable). */
  folderName: string;
  /** File names inside this folder (relative, not URI-decoded). */
  files: string[];
}

/**
 * List objects under `folderPrefix` and group them by their immediate
 * parent folder. Loose files at the prefix root land under a synthetic
 * "." group (`displayName: "General Assets"`).
 *
 * Returns `[]` on error or when credentials are missing — callers can
 * render empty states without try/catch boilerplate.
 */
export async function getR2Data(folderPrefix: string): Promise<R2Folder[]> {
  if (!accessKeyId || !secretAccessKey) return [];

  try {
    const response = await s3.send(
      new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: folderPrefix })
    );
    const files = response.Contents ?? [];

    const projectMap: Record<string, R2Folder> = {};
    for (const file of files) {
      const relativeKey = file.Key?.replace(folderPrefix, '') ?? '';
      if (!relativeKey || relativeKey === '/') continue;

      const parts = relativeKey.split('/');
      const isLoose = parts.length === 1;
      const folderName = isLoose ? '.' : parts[0];
      const fileName = isLoose ? parts[0] : parts[1];

      if (!projectMap[folderName]) {
        projectMap[folderName] = {
          displayName:
            folderName === '.'
              ? 'General Assets'
              : decodeURIComponent(folderName).replace(/%20/g, ' '),
          folderName,
          files: [],
        };
      }
      projectMap[folderName].files.push(fileName);
    }

    return Object.values(projectMap);
  } catch (error) {
    console.error(`[R2] Failed to list "${folderPrefix}":`, error);
    return [];
  }
}

/**
 * Flat list of file names directly under `prefix`. Used at build time to
 * auto-discover hero + gallery images per blaster (see /data/[slug]).
 * Returns alphabetically-sorted filenames (no nesting, no folders). Empty
 * array if credentials are missing or the prefix has no objects.
 */
export async function listR2Files(prefix: string): Promise<string[]> {
  if (!accessKeyId || !secretAccessKey) return [];

  try {
    const response = await s3.send(
      new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: prefix })
    );
    return (response.Contents ?? [])
      .map((o) => o.Key?.slice(prefix.length) ?? '')
      .filter((name) => name.length > 0 && !name.includes('/'))
      .sort();
  } catch (error) {
    console.error(`[R2] listR2Files failed for "${prefix}":`, error);
    return [];
  }
}

/**
 * Fetch the text contents of `<baseUrl>/<folder>/<key>`, or `''` if it
 * doesn't exist / errors. Used for the optional per-project `description`
 * and `link` files under the public R2 mirror.
 *
 * Defined here (not in a page's frontmatter) because Astro's getStaticPaths
 * is extracted into its own module scope at build time — only top-level
 * imports are visible inside getStaticPaths, not page-local function
 * declarations.
 */
export async function fetchR2Text(baseUrl: string, folder: string, key: string): Promise<string> {
  const url = `${baseUrl}/${encodeURIComponent(folder)}/${key}`;
  try {
    const res = await fetch(url);
    return res.ok ? (await res.text()).trim() : '';
  } catch {
    return '';
  }
}
