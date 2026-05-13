# pngu-auth

Cloudflare Worker that proxies the GitHub OAuth flow for Decap CMS at `/admin`.

The static admin page (`public/admin/index.html`) opens this worker in a
popup; the worker exchanges the OAuth `code` for an access token and posts
it back to the opener via `window.postMessage`. The token never leaves the
browser session — we do not log it, store it, or forward it anywhere else.

## Two copies of the source

`src/index.ts` is the canonical source — what `wrangler dev`/`wrangler deploy`
uses, and what gets type-checked.

`src/index.js` is a plain-JS mirror with the same logic, for pasting into
the Cloudflare dashboard's quick-edit mode (which doesn't accept TypeScript).
Keep them in sync if you edit one.

## Routes

| Path        | What it does                                                  |
| ----------- | ------------------------------------------------------------- |
| `/auth`     | Redirects to `https://github.com/login/oauth/authorize`.      |
| `/callback` | Exchanges `code` for an access token, postMessages the popup. |
| `/`         | Plain-text health page.                                       |

A random `state` value is set as a `HttpOnly; Secure; SameSite=Lax` cookie
on `/auth` and re-checked on `/callback`, so CSRF can't smuggle a code in.
Compare is constant-time.

The popup will only postMessage the token to origins listed in
`ALLOWED_ORIGINS`, so a malicious admin page hosted elsewhere can't steal it.

## One-time setup

1. **Create a GitHub OAuth App**
   - GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
   - **Homepage URL**: `https://pngu.info`
   - **Authorization callback URL**: `https://pngu-auth.<your-subdomain>.workers.dev/callback`
   - Note the **Client ID** and **Client Secret**.

2. **Configure the worker**

   Edit `wrangler.toml` and set:

   ```toml
   [vars]
   GITHUB_CLIENT_ID = "<your client id>"
   ALLOWED_ORIGINS = "https://pngu.info,https://www.pngu.info"
   ```

3. **Set the client secret** (never put this in git):

   ```sh
   cd worker
   wrangler secret put GITHUB_CLIENT_SECRET
   # paste the secret when prompted
   ```

4. **Deploy**

   ```sh
   cd worker
   npm install
   wrangler deploy
   ```

5. **Point the admin page at the worker.** In
   `public/admin/index.html`, `backend.base_url` should be the worker's
   origin (no trailing slash, no `/auth`):

   ```js
   backend: {
     name: 'github',
     repo: 'pngu-nerf/pngu',
     branch: 'main',
     base_url: 'https://pngu-auth.<your-subdomain>.workers.dev',
     auth_endpoint: 'auth',
   }
   ```

## Local development

```sh
cd worker
npm install
echo 'GITHUB_CLIENT_SECRET = "..."' > .dev.vars   # gitignored
wrangler dev
```

Then open `http://localhost:8787/` — you should see the plain-text health page.

## Rotating the secret

```sh
wrangler secret put GITHUB_CLIENT_SECRET   # overwrites the existing value
```

You also need to regenerate the secret in the GitHub OAuth App settings if
the leak is confirmed; just changing the worker's copy won't invalidate the
previous secret on GitHub's side.
