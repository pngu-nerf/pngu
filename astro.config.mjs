// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://pngu.info",
  output: "static", // Back to static! No more worker crashes.
  adapter: cloudflare(),
  integrations: [sitemap()]
});
