/**
 * POST /api/admin/upload
 *
 * Multipart upload of one or more images for a blaster's hero or one of
 * the named review-section galleries. The R2 key is composed server-side
 * from (slug, target, filename); we never trust a client-supplied key.
 */
import { requireGitHubPush } from './_auth';
import {
  isValidSlug,
  isValidFilename,
  isValidSection,
  galleryKey,
  heroKey,
  mainGalleryKey,
  ALLOWED_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  IMMUTABLE_CACHE_CONTROL,
  type SectionKey,
} from '../../../src/lib/blaster-paths';

interface Env {
  ASSETS_BUCKET: R2Bucket;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await requireGitHubPush(request);
  if (!auth) return jsonError(401, 'Unauthorized');

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError(400, 'Expected multipart/form-data');
  }

  const slug = form.get('slug');
  const target = form.get('target'); // 'hero' | SectionKey
  const files = form.getAll('files');

  if (!isValidSlug(slug)) return jsonError(400, 'Invalid slug');
  const isHero = target === 'hero';
  const isMainGallery = target === 'gallery';
  if (!isHero && !isMainGallery && !isValidSection(target)) {
    return jsonError(400, 'Invalid target');
  }
  if (files.length === 0) return jsonError(400, 'No files supplied');

  const uploaded: Array<{ key: string; filename: string; size: number }> = [];
  for (const f of files) {
    if (!(f instanceof File)) return jsonError(400, 'files[] must be File objects');
    if (!ALLOWED_MIME_TYPES.has(f.type))
      return jsonError(415, `Unsupported type: ${f.type || '(unknown)'}`);
    if (f.size > MAX_UPLOAD_BYTES)
      return jsonError(413, `${f.name} exceeds 10 MB`);
    if (!isValidFilename(f.name))
      return jsonError(400, `Bad filename: ${f.name}`);

    const key = isHero
      ? heroKey(slug, f.name)
      : isMainGallery
        ? mainGalleryKey(slug, f.name)
        : galleryKey(slug, target as SectionKey, f.name);

    // Collision check — never silently overwrite. .head() is cheap.
    if (await env.ASSETS_BUCKET.head(key)) {
      return jsonError(409, `Already exists: ${f.name}. Rename and retry.`);
    }

    await env.ASSETS_BUCKET.put(key, f.stream(), {
      httpMetadata: {
        contentType: f.type,
        cacheControl: IMMUTABLE_CACHE_CONTROL,
      },
    });
    uploaded.push({ key, filename: f.name, size: f.size });
  }

  return Response.json({ ok: true, uploaded });
};

function jsonError(status: number, error: string): Response {
  return Response.json({ ok: false, error }, { status });
}
