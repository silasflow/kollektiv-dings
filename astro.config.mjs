import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

import netlify from '@astrojs/netlify';

export default defineConfig({
  site: 'https://stadt-kollektiv.de',
  integrations: [react(), mdx(), sitemap()],

  // This is the default, but explicit is better
  output: 'static',

  adapter: netlify()
});