// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Fall back to the production domain if SITE_URL isn't set at build time.
// Override via the SITE_URL env var (see the GitHub Actions workflow).
const SITE = process.env.SITE_URL ?? 'https://decafdiscovered.co.uk';

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
