// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://pngu.info",  // ← Changed from example.com
  integrations: [mdx(), sitemap()],
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  output: "static",  // ← Add this if you're building a static site
});
