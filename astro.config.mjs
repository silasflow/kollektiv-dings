import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://stadt-kollektiv.de',
  integrations: [react(), mdx(), sitemap()],
});