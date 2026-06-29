import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';



const pages = defineCollection({
	// Load Markdown and MDX files in the `src/content/pages/` directory.
	loader: glob({ base: './src/content/pages', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string().optional(),
			// Optional publication date for pages
			pubDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			// Required language identifier for the page
			lang: z.enum(['en', 'de']),
		}),
});

export const collections = { pages };
