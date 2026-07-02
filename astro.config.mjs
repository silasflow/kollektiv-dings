import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import node from '@astrojs/node';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://stadt-kollektiv.de',
  integrations: [react(), mdx(), sitemap()],

  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
});