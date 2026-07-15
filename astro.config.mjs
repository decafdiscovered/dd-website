// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Fall back to the production domain if SITE_URL isn't set or is invalid.
// Override via the SITE_URL env var (see the GitHub Actions workflow).
const DEFAULT_SITE = 'https://decafdiscovered.co.uk';
const siteFromEnv = process.env.SITE_URL?.trim();

let SITE = DEFAULT_SITE;
if (siteFromEnv) {
  try {
    SITE = new URL(siteFromEnv).toString();
  } catch {
    console.warn(`[astro.config] Ignoring invalid SITE_URL: "${siteFromEnv}"`);
  }
}

export default defineConfig({
  site: SITE,
  trailingSlash: 'ignore',
  // Keep prefetch focused on likely next clicks instead of every link in view.
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
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
