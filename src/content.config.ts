// Content collections — Astro 5 content-layer API.
// Each `blasters` entry lives at src/content/blasters/<slug>.md(x) and is
// rendered by src/pages/data/[slug].astro.

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blasters = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blasters' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    coverImage: z.string().optional(),
    attachedFiles: z
      .array(
        z.object({
          fileName: z.string(),
          fileUrl: z.string().url(),
        })
      )
      .optional()
      .default([]),
  }),
});

export const collections = { blasters };
