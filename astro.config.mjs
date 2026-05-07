// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import markdoc from "@astrojs/markdoc";

export default defineConfig({
  site: "https://pngu.info",
  output: "static", // Pure static for maximum speed and reliability
  integrations: [
    sitemap(),
    mdx(),
    markdoc()
  ],
  compressHTML: true,
  build: {
    inlineStylesheets: 'always',
  }
});
