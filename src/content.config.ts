// Content collections — Astro 5 content-layer API.
// Each `blasters` entry lives at src/content/blasters/<slug>.md(x) and is
// rendered by src/pages/data/[slug].astro.
//
// Section field names below MUST stay in sync with SECTION_KEYS in
// src/lib/blaster-paths.ts — the Pages Functions, the build-time gallery
// discovery, and the Decap CMS form all reference those keys.

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const section = z
  .object({
    body: z.string().optional(),
  })
  .optional();

const blasters = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blasters' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string().optional(),

    // Hero is auto-discovered from R2 under <slug>/hero/. Frontmatter
    // only needs this when multiple files exist there — most entries
    // just drop a single hero.jpg and let the default win.
    heroFilename: z.string().optional().default('hero.jpg'),

    // Quick-stat infographic rendered as a grid of mini cards.
    stats: z
      .object({
        maxFps: z.number().optional(),
        kitPriceUSD: z.number().optional(),
        totalPriceUSD: z.number().optional(),
        shippingUSD: z.number().optional(),
        battery: z.string().optional(),
        magSystem: z.string().optional(),
        braggingRights: z.string().optional(),

        // Yes/no toggles → render as checked / crossed pills.
        lipoSafe: z.boolean().optional(),
        brushlessFpsDial: z.boolean().optional(),
        springPrecompression: z.boolean().optional(),
        picatinnyMount: z.boolean().optional(),
        gravityDropMags: z.boolean().optional(),
        catchIssues: z.boolean().optional(),
        a1Printable: z.boolean().optional(),
        beginnerFriendlyPrint: z.boolean().optional(),
        beginnerFriendlyAssembly: z.boolean().optional(),
      })
      .optional(),

    // FPS readings across the dart types people actually use. Rendered
    // as a small bar chart.
    fpsSpread: z
      .array(
        z.object({
          dartType: z.string(),
          fps: z.number(),
          note: z.string().optional(),
        })
      )
      .optional()
      .default([]),

    // Review sections — keys MUST match SECTION_KEYS in blaster-paths.ts.
    // Galleries are auto-discovered from R2 under
    // <BLASTER_PREFIX>/<slug>/galleries/<key>/ — no per-image entries in
    // frontmatter. Order images by prefixing filenames (01-, 02-, ...).
    firstImpressions: section,
    price: section,
    buildQuality: section,
    ergonomics: section,
    magSystem: section,
    performance: section,
    maintenance: section,
    failurePoints: section,
    printingAssembly: section,

    // Conclusion / verdict block.
    verdict: z.enum(['skip', 'niche', 'upgrade']).optional(),
    betterAlternative: z.string().optional(),
    finalHighlights: z.string().optional(),
    finalWarnings: z.string().optional(),
    closingNote: z.string().optional(),

    // External links — vendors, remixes, support pages, community
    // threads. Rendered grouped by category.
    links: z
      .array(
        z.object({
          category: z.enum([
            'vendor',
            'remix',
            'support',
            'community',
            'printables',
            'other',
          ]),
          label: z.string(),
          url: z.string().url(),
        })
      )
      .optional()
      .default([]),
  }),
});

export const collections = { blasters };
