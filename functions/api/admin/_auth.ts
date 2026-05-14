/**
 * Admin-request auth: GitHub-token verification, not shared-secret cookie.
 *
 * No new auth pattern is introduced. We reuse the GitHub OAuth token that
 * Decap CMS already obtains via the pngu-auth Worker. The token is read
 * client-side from Decap's localStorage and sent on every admin endpoint
 * request as:
 *
 *     Authorization: token <oauth-token>
 *
 * (We also accept `Bearer <token>` so the same code works if a future
 * caller switches conventions.)
 *
 * Algorithm:
 *   1. Parse the bearer/token from the Authorization header.
 *   2. Call GET https://api.github.com/repos/pngu-nerf/pngu with that
 *      token. GitHub returns the repo's metadata only if the token
 *      authorises the user to see it.
 *   3. Inspect `permissions.push`. GitHub sets this to `true` only when
 *      the authenticated user has write access to the repo. Read-only
 *      collaborators get `push: false`. Public-repo readers never get
 *      `permissions` at all.
 *   4. Optionally fetch /user to log the actor's login (best-effort).
 *
 * On success: returns { token, login }. On failure: returns null, and
 * callers reply with 401. No new secret, no signed cookie, no DB row.
 */
const REPO = 'pngu-nerf/pngu';

export interface AdminIdentity {
  token: string;
  login: string;
}

export async function requireGitHubPush(
  request: Request
): Promise<AdminIdentity | null> {
  // Accept both `Bearer <t>` (RFC 7235) and `token <t>` (GitHub's
  // long-standing classic prefix). Uploader sends the latter.
  const header = request.headers.get('Authorization') ?? '';
  const match = header.match(/^(?:Bearer|token)\s+(.+)$/i);
  if (!match) return null;
  const token = match[1].trim();
  if (!token) return null;

  // 1. Probe the repo. GitHub returns 200 + a JSON body only when the
  //    caller is authenticated AND has at least read access.
  const repoRes = await fetch(`https://api.github.com/repos/${REPO}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'pngu-admin',
      Accept: 'application/vnd.github+json',
    },
  });
  if (!repoRes.ok) return null;

  // 2. Verify the user actually has push (= write) access. `permissions`
  //    is only present on authenticated, non-public-anonymous responses,
  //    and `push: true` means the user can commit / open PRs etc.
  const repo = (await repoRes.json()) as {
    permissions?: { push?: boolean; admin?: boolean };
  };
  if (!repo.permissions?.push) return null;

  // 3. Best-effort login lookup for audit; missing login isn't fatal.
  let login = '';
  try {
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'pngu-admin',
      },
    });
    if (userRes.ok) {
      login = ((await userRes.json()) as { login?: string }).login ?? '';
    }
  } catch {
    /* ignore — login is informational only */
  }

  return { token, login };
}
