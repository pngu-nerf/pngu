/**
 * POST /api/admin/delete
 * Body: { slug, target, filename }
 *
 * Delete one image from R2. Key composed server-side; client never
 * supplies the raw key.
 */
import { requireGitHubPush } from './_auth';
import {
  isValidSlug,
  isValidFilename,
  isValidSection,
  galleryKey,
  heroKey,
  type SectionKey,
} from '../../../src/lib/blaster-paths';

interface Env {
  ASSETS_BUCKET: R2Bucket;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await requireGitHubPush(request);
  if (!auth)
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  let body: { slug?: unknown; target?: unknown; filename?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Expected JSON body' }, { status: 400 });
  }

  if (!isValidSlug(body.slug))
    return Response.json({ ok: false, error: 'Invalid slug' }, { status: 400 });
  if (!isValidFilename(body.filename))
    return Response.json({ ok: false, error: 'Invalid filename' }, { status: 400 });

  const isHero = body.target === 'hero';
  if (!isHero && !isValidSection(body.target)) {
    return Response.json({ ok: false, error: 'Invalid target' }, { status: 400 });
  }

  const key = isHero
    ? heroKey(body.slug, body.filename)
    : galleryKey(body.slug, body.target as SectionKey, body.filename);

  // R2 delete is idempotent — success for a missing key is fine.
  await env.ASSETS_BUCKET.delete(key);
  return Response.json({ ok: true });
};
