// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// Statically rendered + uploaded to Cloudflare Pages; no SSR adapter needed.
// CSS is inlined into every page (`inlineStylesheets: 'always'`) so first
// paint doesn't wait on a separate stylesheet request — important on slow
// or high-latency connections.
export default defineConfig({
  site: 'https://pngu.info',
  output: 'static',
  integrations: [mdx()],
  compressHTML: true,
  build: { inlineStylesheets: 'always' },
});
