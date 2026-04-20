// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://carmoneylab.com',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [svelte(), sitemap()]
});
