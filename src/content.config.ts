import { defineCollection, z } from 'astro:content';

const blasters = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    coverImage: z.string().optional(),
    attachedFiles: z.array(z.object({
      fileName: z.string(),
      fileUrl: z.string().url()
    })).optional().default([]),
  })
});

export const collections = { blasters };
