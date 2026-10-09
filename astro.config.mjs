// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import { withBlogLastmod } from './sitemap-lastmod.mjs';

export default defineConfig({
  site: 'https://carmoneylab.com',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [svelte(), sitemap({ serialize: withBlogLastmod })]
});
