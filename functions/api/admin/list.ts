/**
 * GET /api/admin/list?slug=&target=
 *
 * Returns an alphabetised list of files under a blaster's hero/ or
 * galleries/<section>/ prefix. Each entry includes the full public R2
 * URL so the uploader UI doesn't need to know the bucket layout.
 */
import { requireGitHubPush } from './_auth';
import {
  isValidSlug,
  isValidSection,
  heroPrefix,
  galleryPrefix,
  mainGalleryPrefix,
  type SectionKey,
} from '../../../src/lib/blaster-paths';
import { R2_BASE_URL } from '../../../src/constants';

interface Env {
  ASSETS_BUCKET: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await requireGitHubPush(request);
  if (!auth)
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  const target = url.searchParams.get('target'); // 'hero' | SectionKey

  if (!isValidSlug(slug)) {
    return Response.json({ ok: false, error: 'Invalid slug' }, { status: 400 });
  }

  const prefix =
    target === 'hero'
      ? heroPrefix(slug)
      : target === 'gallery'
        ? mainGalleryPrefix(slug)
        : isValidSection(target)
          ? galleryPrefix(slug, target as SectionKey)
          : null;
  if (prefix === null) {
    return Response.json({ ok: false, error: 'Invalid target' }, { status: 400 });
  }

  const listing = await env.ASSETS_BUCKET.list({ prefix });
  const files = listing.objects
    .map((o) => ({
      filename: o.key.slice(prefix.length),
      url: `${R2_BASE_URL}/${o.key}`,
      size: o.size,
      lastModified: o.uploaded.toISOString(),
    }))
    .filter((f) => f.filename.length > 0)
    .sort((a, b) => a.filename.localeCompare(b.filename));

  return Response.json({ ok: true, files });
};
