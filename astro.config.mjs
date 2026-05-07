// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import markdoc from "@astrojs/markdoc";
import keystatic from "@keystatic/astro";

export default defineConfig({
  site: "https://pngu.info",
  output: "hybrid",
  integrations: [
    react(),
    markdoc(),
    keystatic()
  ],
  adapter: cloudflare({
    // 'complete' mode polyfills Node.js APIs (like process) 
    // which Keystatic needs to read your secrets securely.
    runtime: { mode: 'complete' }
  }),
  vite: {
    ssr: {
      external: ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner']
    }
  }
});
