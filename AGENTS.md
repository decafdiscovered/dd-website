# AGENTS.md — Decaf Discovered

This file exists to give AI coding assistants (GitHub Copilot, Claude,
ChatGPT, Gemini, Cursor, etc.) the project-specific context needed to make
correct recommendations. Read it before proposing changes.

Human contributors should also read this — it is the canonical statement of
"how this repo works and what you must not casually change."

---

## Business context

- **Product:** Decaf Discovered — a personal blog reviewing decaffeinated
  coffee beans, aimed at everyday drinkers rather than specialty-coffee
  enthusiasts.
- **Author/owner:** one person (Sarah Lean). This is a hobby site — favour
  simplicity, low ops cost, and zero-runtime.
- **Voice:** first-person, plain UK English, no cupping jargon. Do not
  introduce specialty-coffee terminology in copy.
- **Primary domain (canonical):** https://decafdiscovered.co.uk
- **Mirror domain (do not link users to it):** https://decafdiscovered.netlify.app
  — exists solely to host Netlify Identity + Git Gateway for the CMS.

## Architectural constraints (do not violate without review)

- **Static site only.** Astro with the default `output: 'static'`. No SSR,
  no API routes, no runtime Node. Do not introduce server-rendered pages,
  middleware, or edge functions.
- **Dual-host deployment.** The same `dist/` is published to Azure Static
  Web Apps (canonical) and to Netlify (mirror). Any change that assumes
  one host in isolation is wrong.
- **Admin CMS lives at `/admin/`** and is redirected from the Azure host
  to the Netlify host by `public/staticwebapp.config.json`. Netlify
  Identity and Git Gateway are only provisioned on the `.netlify.app`
  mirror. Do not remove the redirect, the `identity_url` / `gateway_url`
  in `public/admin/config.yml`, or the hash-token forwarder in
  `src/layouts/BaseLayout.astro`.
- **`staticwebapp.config.json` must live in `public/`** so Astro copies
  it into `dist/`. The Azure workflow deploys `dist/` with
  `skip_app_build: true` and will not see a copy at the repo root.
- **Content lives in `src/content/`** and is validated by the Zod schemas
  in `src/content/config.ts`. Extending a collection requires updating
  both the Zod schema **and** `public/admin/config.yml` (Decap CMS) in
  the same PR.
- **Publish gating** is enforced by three flags on every `getCollection`
  call: `draft === false`, `isSampleContent === false`, and
  `isPublished(publishedDate) === true`. Any new listing/route must use
  all three.
- **`isPublished()` requires a rebuild to release a future-dated post.**
  There is currently **no scheduled rebuild workflow**. Do not tell
  users that future-dated content "goes live automatically" — it does
  not.

## Technology stack (fixed choices)

- Astro 5 + TypeScript (`astro/tsconfigs/strict`).
- Tailwind CSS **v4** via `@tailwindcss/vite`. Design tokens are defined
  with `@theme { --color-* / --font-* / --radius-* / --shadow-* }` in
  `src/styles/global.css`. There is intentionally **no
  `tailwind.config.js`**. Use `bg-[color:var(--color-*)]` /
  `text-[color:var(--color-*)]` / `rounded-[var(--radius-card)]` etc.
  for tokenised styles.
- MDX enabled but rarely used.
- Search via **Pagefind** (`npm run build` also runs
  `pagefind --site dist`). Regions to index are marked with
  `data-pagefind-body`.
- No CSS-in-JS, no client-side framework. Interactivity is vanilla TS
  in `src/scripts/*.ts`, loaded per page as needed.

## Coding conventions

- **Path aliases** (see `tsconfig.json`): use `@components/*`,
  `@layouts/*`, `@utils/*`, `@styles/*`, `@scripts/*` instead of
  relative paths.
- **Prettier** with `printWidth: 100`, single quotes, plus
  `prettier-plugin-astro` and `prettier-plugin-tailwindcss`. Run
  `npm run format` before committing. There is no ESLint config.
- **Type-check** with `npm run check` (Astro + TypeScript). CI does
  **not** currently run this — treat it as a local pre-commit
  responsibility.
- **UK English** in all user-facing copy (`en-GB` locale, `en_GB` OG
  locale, `<html lang="en-GB">`).
- **Accessibility:** keep the skip link, `aria-current`, `aria-live`
  regions, visible focus rings, and `prefers-reduced-motion` respect.
  Do not remove these.
- **Do not hotlink** to a roaster's images. Download and check the
  licence, then commit the asset (see the comment in
  `src/content/config.ts`).
- **Roaster ↔ review link is a case-insensitive free-text match** on
  the review's `roaster` frontmatter and the roaster's `name`. Renaming
  a roaster requires updating every review that references it, or the
  review count on the roasters index will silently drop to 0.

## Security & privacy expectations

- **No secrets in the repo.** Formspree's Turnstile secret is stored in
  Formspree's dashboard. Do not add a serverless verifier without a
  plan for storing its secret outside the repo.
- **Global response headers** are set in
  `public/staticwebapp.config.json`: `Strict-Transport-Security`,
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, `Permissions-Policy`. Keep them. There is
  deliberately no CSP yet — do not add one without auditing Beehiiv,
  Turnstile, Ahrefs, Decap and identity.netlify.com script/frame
  sources.
- **Analytics choice:** Ahrefs Web Analytics (cookieless). Do not add
  Google Analytics, Meta Pixel, or any cookie-setting analytics without
  discussion.
- **Contact form** submits via `fetch` with `Accept: application/json`
  so users stay on the site. Do not revert to a native POST (users
  would be bounced to Formspree's hosted thank-you page).
- **Affiliate links** must use `rel="sponsored noopener nofollow"`. Do
  not strip `rel` attributes from external commercial links.

## Repository-specific rules

- **`isSampleContent: true`** is used for demo entries that must never
  appear on the public site. Do not add new sample content unless
  demoing.
- **`draft: true`** hides an entry from listings, RSS, JSON-LD and the
  generated slug route. New reviews should start `draft: true`.
- The current **IndexNow key file** is
  `public/k1nye9k5g7wgff89jswrf2uz877yhsff.txt`. Its filename stem and
  its contents must match — the script in `scripts/indexnow-submit.mjs`
  refuses to run if they differ. Do not rename or move it without also
  updating the file body.
- The active deploy workflow is
  `.github/workflows/azure-static-web-apps-lemon-sky-08b7b9103.yml`.

## Things an AI must not change without explicit review

- The Netlify Identity / Git Gateway configuration in
  `public/admin/config.yml`, the widget init in
  `public/admin/index.html`, or the hash-token forwarder script in
  `src/layouts/BaseLayout.astro`.
- Any of the three publish gates (`draft`, `isSampleContent`,
  `isPublished`).
- `staticwebapp.config.json` — its location (must be in `public/`),
  its `/admin/*` redirect, and its global security headers.
- The Zod schemas in `src/content/config.ts` — every field change is a
  breaking content-model change that also needs a matching Decap CMS
  update.
- Tailwind config — do not introduce a `tailwind.config.js`; the
  project is intentionally on Tailwind v4 with `@theme` tokens.
- The affiliate-link `rel` attributes.
