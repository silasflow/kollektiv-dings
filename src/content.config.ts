import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			// Optional language identifier for the post
			lang: z.enum(['en', 'de']).optional(),
		}),
});

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

export const collections = { blog, pages };
