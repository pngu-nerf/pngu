# pngu

[pngu.info](https://pngu.info) — Astro site hosted on Cloudflare Pages
publishing open-source Nerf-blaster files, data, and brand assets.

## Layout

```
src/
  layouts/MainLayout.astro    — site chrome + global design tokens
  components/                  — BackgroundEffects, Logo, ContactItem
  pages/                       — routes (.astro files)
  content/blasters/            — Markdown content collection for /data
  lib/                         — R2 listing helper, slugify
public/                        — static assets served as-is
  admin/                       — Decap CMS entry point (uses /worker for auth)
worker/                        — Cloudflare Worker: GitHub OAuth backend
```

The site uses `output: 'static'` and bulk static-renders R2 listings at build
time. R2 credentials are optional — when unset, R2-backed pages render an
empty list rather than failing the build.

## Develop

```sh
npm install
npm run dev
```

To populate the /files and /brand pages with real R2 content during dev,
set `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` in the shell or a `.env`
file (gitignored).

## Build

```sh
npm run build
```

Outputs to `dist/`, which Cloudflare Pages serves.

## Admin

`/admin` is a Decap CMS UI that commits via GitHub OAuth. The OAuth handshake
is proxied through the [`worker/`](./worker) Cloudflare Worker — see
[`worker/README.md`](./worker/README.md) for deploy and secret setup.
