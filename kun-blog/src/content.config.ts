import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const postSchema = z.object({
	title: z.string(),
	description: z.string(),
	date: z.coerce.date(),
	tags: z.array(z.string()).default([]),
	draft: z.boolean().default(false),
});

const posts = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
	schema: postSchema,
});

const postsEn = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/posts-en' }),
	schema: postSchema,
});

export const collections = { posts, 'posts-en': postsEn };