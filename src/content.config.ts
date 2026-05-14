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

    // Who designed the blaster (the human or studio behind the design,
    // not the seller). Optional — community blasters sometimes don't
    // have a single attributable designer.
    designer: z.string().optional(),

    // Hero is auto-discovered from R2 under <slug>/hero/. Frontmatter
    // only needs this when multiple files exist there — most entries
    // just drop a single hero.jpg and let the default win.
    heroFilename: z.string().optional().default('hero.jpg'),

    // Quick-stat infographic rendered as a grid of mini cards.
    stats: z
      .object({
        blasterType: z.string().optional(),       // e.g. "Springer", "Flywheel", "Rev-trigger"
        maxFps: z.number().optional(),
        // Numeric range so the page can draw a real bar graphic. Either
        // end can be left blank if only one bound is known.
        recommendedFpsMin: z.number().optional(),
        recommendedFpsMax: z.number().optional(),
        kitPriceUSD: z.number().optional(),
        totalPriceUSD: z.number().optional(),
        shippingUSD: z.number().optional(),
        battery: z.string().optional(),
        magSystem: z.string().optional(),
        braggingRights: z.string().optional(),

        // Feature toggles → only render when true (see [slug] filter).
        lipoSafe: z.boolean().optional(),
        brushlessFpsDial: z.boolean().optional(),
        // True when the user can adjust spring compression on the fly.
        springPrecompression: z.boolean().optional(),
        // Picatinny rail vs. M-LOK are distinct mounting standards;
        // some blasters have one, some both, some neither.
        picatinnyMount: z.boolean().optional(),
        mlocMount: z.boolean().optional(),
        slingPoints: z.boolean().optional(),
        gravityDropMags: z.boolean().optional(),
        catchIssues: z.boolean().optional(),
        a1Printable: z.boolean().optional(),
        beginnerFriendlyPrint: z.boolean().optional(),
        beginnerFriendlyAssembly: z.boolean().optional(),
      })
      .optional(),

    // Review sections — keys MUST match SECTION_KEYS in blaster-paths.ts.
    // Galleries are auto-discovered from R2 under
    // <BLASTER_PREFIX>/<slug>/galleries/<key>/ — no per-image entries in
    // frontmatter. Order images by prefixing filenames (01-, 02-, ...).
    price: section,
    buildQuality: section,
    ergonomics: section,
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
