// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://kun.moe', // ← 改成你的实际域名
  integrations: [sitemap()],
});
