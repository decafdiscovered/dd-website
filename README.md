# Decaf Discovered

Honest reviews of decaf coffee from a normal coffee drinker. Built as a static Astro site, deployable to Azure Static Web Apps for free.

## Quick start

```bash
npm install
npm run dev
```

Then open http://localhost:4321.

### Previewing the production build

`npm run preview` serves the contents of `dist/`, so you must build first. Use `--host` inside a dev container / VM so the port is reachable from your browser:

```bash
npm run build
npm run preview -- --host
```

## Scripts

| Command                     | What it does                                                    |
| --------------------------- | --------------------------------------------------------------- |
| `npm run dev`               | Local dev server with hot reload.                               |
| `npm run build`             | Build the site **and** the Pagefind search index into `dist/`.  |
| `npm run indexnow`          | Submit built review/guide URLs in `dist/` to the IndexNow API.  |
| `npm run publish:content`   | Build then submit review/guide URLs to IndexNow in one command. |
| `npm run preview -- --host` | Preview the built site locally (run `npm run build` first).     |
| `npm run check`             | TypeScript + Astro content collection validation.               |
| `npm run format`            | Prettier across the codebase.                                   |

## Content

Everything lives in `src/content/`:

- `reviews/*.md` — one file per coffee, using the schema in `src/content/config.ts`.
- `roasters/*.md` — small roaster directory.
- `guides/*.md` — beginner-friendly explainers.

Prefer editing in a browser? Set the repo details in `public/admin/config.yml` and visit `/admin/` — Decap CMS is wired up and ready to go, no backend required.

## Environment variables

All optional. Set them as **GitHub Actions repository variables** (not secrets — they're public at runtime):

| Variable                      | Purpose                                                                                |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| `SITE_URL`                    | Canonical URL used for OG tags, sitemap, RSS.                                          |
| `PUBLIC_AHREFS_ANALYTICS_KEY` | Ahrefs analytics site key. If unset, Ahrefs analytics is not loaded.                   |
| `PUBLIC_BEEHIIV_FORM_ACTION`  | Beehiiv embed URL for the newsletter form. If unset, the form runs in "demo mode".     |
| `PUBLIC_TURNSTILE_SITE_KEY`   | Cloudflare Turnstile site key used by the contact form widget.                         |
| `INDEXNOW_KEY`                | Optional override for IndexNow key; otherwise read from `public/<key>.txt`.            |
| `INDEXNOW_ENDPOINT`           | Optional IndexNow endpoint override (defaults to `https://api.indexnow.org/indexnow`). |

The Azure deploy token belongs in **GitHub Secrets** as `AZURE_STATIC_WEB_APPS_API_TOKEN`.

### Contact form + Turnstile

- The contact page posts to Formspree at `https://formspree.io/f/mjgngydn`.
- Set `PUBLIC_TURNSTILE_SITE_KEY` in your GitHub Actions repository variables so Astro can render the widget.
- Do **not** put your Turnstile secret in this repo. Store it in Formspree's Turnstile/CAPTCHA settings (or in a server-side secret store if you later verify tokens yourself).

## Deployment

Push to `main` and the GitHub Actions workflow (`.github/workflows/azure-static-web-apps.yml`) builds and deploys to Azure Static Web Apps. Every PR gets its own preview environment automatically.

To provision the target SWA resource:

```bash
az staticwebapp create \
  --name decaf-discovered \
  --resource-group rg-decaf-discovered \
  --location westeurope \
  --source https://github.com/<you>/decaf-discovered \
  --branch main \
  --app-location "/" \
  --output-location "dist" \
  --login-with-github
```

## Content model at a glance

See `src/content/config.ts`. The reviews schema mirrors the product brief:

- `coffeeName`, `roaster`, `country`, `origin`, `decaffeinationMethod`, `roastLevel`, `price`, `weight`, `purchaseUrl`, `image`, `publishedDate`, `tags`, `bestFor`
- `ratings.{overallScore, espressoScore, milkDrinksScore, valueScore, wouldBuyAgain}`
- `taste.{sweetness, bitterness, acidity, body}` — descriptors are free-text but must stay approachable.
- `summary`, `myExperience`, `bestBrewingMethod`, `whoWouldLikeThis`, `whoMightNotLikeThis`, `pros`, `cons`.

Sample content is flagged with `isSampleContent: true` — swap it out for the real thing whenever you're ready.
