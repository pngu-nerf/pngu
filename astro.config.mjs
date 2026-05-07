import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import markdoc from "@astrojs/markdoc";
import keystatic from "@keystatic/astro";

export default defineConfig({
  site: "https://pngu.info",
  output: "hybrid", // Allows Keystatic to run as a Worker
  integrations: [
    react(),
    markdoc(),
    keystatic()
  ],
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
});
