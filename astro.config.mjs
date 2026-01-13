// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://pngu.info",
  // output: "static" is perfect for speed; every page is a pre-baked HTML file.
  output: "static",
  integrations: [mdx(), sitemap()],
  adapter: cloudflare({
    platformProxy: { enabled: true },
    // Changed to 'directory' to simplify the internal routing tree
    runtime: { mode: 'complete' }
  }),
  // DIRECT SPEED GAINS:
  compressHTML: true, // Native Astro minifier. Squeezes every byte of whitespace.
  build: {
    inlineStylesheets: 'always', // Prevents an extra CSS network request for small styles.
  },
  vite: {
    ssr: {
      external: ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner']
    },
    build: {
      minify: 'esbuild', // Faster and more memory-efficient than Terser.
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: undefined, // Disables complex chunking logic for small sites.
        }
      }
    }
  }
});
