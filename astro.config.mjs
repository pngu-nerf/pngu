// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import markdoc from "@astrojs/markdoc";

export default defineConfig({
  site: "https://pngu.info",
  output: "static", // Maximum reliability
  integrations: [
    mdx(),
    markdoc()
  ],
  compressHTML: true,
  build: {
    inlineStylesheets: 'always',
  }
});
