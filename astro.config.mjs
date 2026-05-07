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
    platformProxy: { enabled: true },
    runtime: { mode: 'complete' }
  }),
  compressHTML: true,
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    // This tells Vite to replace these strings with the actual values 
    // from your Cloudflare environment during the build process.
    define: {
      'process.env.KEYSTATIC_GITHUB_CLIENT_ID': JSON.stringify(process.env.KEYSTATIC_GITHUB_CLIENT_ID),
      'process.env.KEYSTATIC_GITHUB_CLIENT_SECRET': JSON.stringify(process.env.KEYSTATIC_GITHUB_CLIENT_SECRET),
    },
    ssr: {
      external: ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner']
    }
  }
});
