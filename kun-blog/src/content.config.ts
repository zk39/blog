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

const embaSchema = z.object({
	course_code: z.string(),
	course_name: z.string(),
	title: z.string(),
	description: z.string(),
	date: z.coerce.date(),
	learning_outcome: z.string(),
	status: z.enum(['draft', 'complete']).default('draft'),
	category: z.enum(['core', 'it']),
});

const emba = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/emba' }),
	schema: embaSchema,
});

export const collections = { posts, 'posts-en': postsEn, emba };