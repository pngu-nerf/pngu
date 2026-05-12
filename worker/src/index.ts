/**
 * pngu-auth — Decap CMS GitHub OAuth backend.
 *
 * Decap CMS (https://decapcms.org/) is a static-site CMS. When it commits
 * changes via the GitHub backend, it needs a short-lived OAuth access token.
 * Browsers can't run the OAuth flow themselves (CORS + client_secret), so
 * we proxy it through this Worker.
 *
 * Routes:
 *   GET /auth      — start: redirect to GitHub's authorize endpoint
 *   GET /callback  — finish: exchange the code, postMessage the token back
 *   GET /          — health check / docs link
 *
 * CSRF: a random state value is set as a cookie on /auth and re-checked at
 * /callback. The token is never logged or stored — it's handed straight to
 * the admin popup via postMessage.
 *
 * Env vars (set with `wrangler secret put` for the secret one):
 *   GITHUB_CLIENT_ID      — public OAuth app client id
 *   GITHUB_CLIENT_SECRET  — secret (required, secret binding)
 *   ALLOWED_ORIGINS       — comma-separated list of origins permitted to
 *                           receive the token via postMessage
 *                           (e.g. "https://pngu.info,https://www.pngu.info")
 */

export interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  ALLOWED_ORIGINS: string;
}

const PROVIDER = 'github';
const STATE_COOKIE = 'pngu_oauth_state';
const STATE_TTL_SECONDS = 10 * 60; // 10 minutes is plenty for an OAuth round-trip

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/auth') return handleAuth(request, env, url);
    if (url.pathname === '/callback') return handleCallback(request, env, url);
    if (url.pathname === '/') return handleIndex();
    return new Response('Not found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;

/* -------------------------------------------------------------------------- */
/* /auth — kick off OAuth                                                     */
/* -------------------------------------------------------------------------- */

async function handleAuth(request: Request, env: Env, url: URL): Promise<Response> {
  if (!env.GITHUB_CLIENT_ID) {
    return errorResponse('GITHUB_CLIENT_ID is not configured', 500);
  }

  // Decap requests the GitHub scope it needs ("repo" for private repos,
  // "public_repo" for public-only). We honour what the admin asks for but
  // fall back to "repo" if unset.
  const requestedScope = url.searchParams.get('scope') || 'repo';
  const state = generateState();
  const redirectUri = `${url.origin}/callback`;

  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  authorize.searchParams.set('redirect_uri', redirectUri);
  authorize.searchParams.set('scope', requestedScope);
  authorize.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      // SameSite=Lax lets the cookie come back on GitHub's top-level redirect.
      'Set-Cookie': buildCookie(STATE_COOKIE, state, STATE_TTL_SECONDS),
    },
  });
}

/* -------------------------------------------------------------------------- */
/* /callback — exchange code, then postMessage the token to the opener       */
/* -------------------------------------------------------------------------- */

async function handleCallback(
  request: Request,
  env: Env,
  url: URL
): Promise<Response> {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieState = readCookie(request, STATE_COOKIE);

  if (!code || !state || !cookieState || !timingSafeEqual(state, cookieState)) {
    return adminPostMessageResponse(
      env,
      `authorization:${PROVIDER}:error:` +
        JSON.stringify({ error: 'invalid_state', provider: PROVIDER })
    );
  }

  if (!env.GITHUB_CLIENT_SECRET) {
    return errorResponse('GITHUB_CLIENT_SECRET is not configured', 500);
  }

  let token: string;
  try {
    token = await exchangeCodeForToken(code, env);
  } catch (err) {
    console.error('Token exchange failed:', err);
    return adminPostMessageResponse(
      env,
      `authorization:${PROVIDER}:error:` +
        JSON.stringify({
          error: 'token_exchange_failed',
          provider: PROVIDER,
        })
    );
  }

  // Hand the token to the opener via the Decap CMS postMessage protocol.
  const payload = JSON.stringify({ token, provider: PROVIDER });
  return adminPostMessageResponse(
    env,
    `authorization:${PROVIDER}:success:${payload}`,
    // Once the popup posts the token, the state cookie is no longer useful.
    { clearStateCookie: true }
  );
}

async function exchangeCodeForToken(code: string, env: Env): Promise<string> {
  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  if (!res.ok) {
    throw new Error(`GitHub returned ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token?: string; error?: string };
  if (!data.access_token) {
    throw new Error(`No access_token in response: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

/* -------------------------------------------------------------------------- */
/* HTML response that delivers the token to the admin popup                   */
/* -------------------------------------------------------------------------- */

/**
 * Renders the popup-side HTML for the Decap postMessage handshake.
 *
 * Decap protocol:
 *   1. Popup posts `authorizing:<provider>` to its opener (origin '*').
 *   2. Opener replies with `authorizing:<provider>` to confirm.
 *   3. Popup posts the result message back to the opener — but only to the
 *      origin we just received. We additionally filter against ALLOWED_ORIGINS
 *      so a malicious admin page can't steal the token.
 */
function adminPostMessageResponse(
  env: Env,
  message: string,
  options: { clearStateCookie?: boolean } = {}
): Response {
  const allowed = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // JSON-encode for safe injection into the inline script.
  const encodedMessage = JSON.stringify(message);
  const encodedAllowed = JSON.stringify(allowed);

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy"
          content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'" />
    <title>Signing you in…</title>
    <style>
      body{font-family:system-ui,sans-serif;background:#0a0a0a;color:#fff;
           display:flex;align-items:center;justify-content:center;
           min-height:100vh;margin:0;padding:1rem;text-align:center}
      .box{max-width:380px}
      h1{font-size:1rem;margin:0 0 .5rem;font-weight:600}
      p{color:#888;font-size:.85rem;margin:0}
    </style>
  </head>
  <body>
    <div class="box">
      <h1>Signing you in…</h1>
      <p id="status">Talking to the admin window.</p>
    </div>
    <script>
      (function () {
        var MESSAGE = ${encodedMessage};
        var ALLOWED = ${encodedAllowed};

        if (!window.opener) {
          document.getElementById('status').textContent =
            'No opener window — close this tab and try again from the admin page.';
          return;
        }

        // 2. Listen for the opener's handshake reply; respond with the token
        //    (or error) to that specific origin only.
        function onMessage(e) {
          var origin = e.origin;
          var data = typeof e.data === 'string' ? e.data : '';
          if (data !== 'authorizing:${PROVIDER}') return;
          if (ALLOWED.length && ALLOWED.indexOf(origin) === -1) {
            document.getElementById('status').textContent =
              'Refusing to send token: origin ' + origin + ' is not allow-listed.';
            return;
          }
          window.opener.postMessage(MESSAGE, origin);
          window.removeEventListener('message', onMessage, false);
          // Decap closes the popup itself on success. Close as a fallback.
          setTimeout(function () { try { window.close(); } catch (_) {} }, 1000);
        }
        window.addEventListener('message', onMessage, false);

        // 1. Tell the opener we're ready. Origin '*' is OK here because the
        //    payload is just the handshake token, not the access token.
        window.opener.postMessage('authorizing:${PROVIDER}', '*');
      })();
    </script>
  </body>
</html>`;

  const headers = new Headers({
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });
  if (options.clearStateCookie) {
    headers.append('Set-Cookie', buildCookie(STATE_COOKIE, '', 0));
  }
  return new Response(html, { headers });
}

/* -------------------------------------------------------------------------- */
/* /                                                                          */
/* -------------------------------------------------------------------------- */

function handleIndex(): Response {
  return new Response(
    [
      'pngu-auth: Decap CMS GitHub OAuth backend.',
      '',
      'Endpoints:',
      '  GET /auth     — redirect to GitHub authorize',
      '  GET /callback — exchange code, postMessage token to admin',
    ].join('\n'),
    {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    }
  );
}

/* -------------------------------------------------------------------------- */
/* helpers                                                                    */
/* -------------------------------------------------------------------------- */

function errorResponse(message: string, status: number): Response {
  return new Response(message, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

function buildCookie(name: string, value: string, maxAgeSeconds: number): string {
  const parts = [
    `${name}=${value}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];
  return parts.join('; ');
}

function readCookie(request: Request, name: string): string | null {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function generateState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// Constant-time compare so a timing attacker can't probe the state token.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
