// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Update this to the final production URL before shipping.
const SITE = process.env.SITE_URL ?? 'https://decafdiscovered.example';

export default defineConfig({
  site: SITE,
  trailingSlash: 'ignore',
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    // Keep image processing on-build; no runtime image server needed.
    responsiveStyles: true,
  },
  build: {
    // Produce clean per-page HTML files so Pagefind can crawl the output.
    format: 'directory',
  },
});
