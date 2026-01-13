// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://pngu.info",
  integrations: [mdx(), sitemap()],
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    // This ensures your build environment supports Node.js features used by the S3 SDK
    runtime: { mode: 'complete' }
  }),
  output: "static",
  vite: {
    ssr: {
      // This specifically prevents the "DOMParser is not defined" error 
      // by keeping the AWS SDK on the server-side during the build.
      external: ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner']
    }
  }
});
