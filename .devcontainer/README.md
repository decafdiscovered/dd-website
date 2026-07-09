# Development container

Opens the project in a reproducible Node 20 environment with the Astro, Tailwind, MDX, GitHub Actions and Azure Static Web Apps extensions pre-installed.

## Open it

- **VS Code**: `Ctrl+Shift+P` → **Dev Containers: Reopen in Container**.
- **GitHub Codespaces**: click **Code → Create codespace on main**.

First launch takes a few minutes while the image pulls and `npm install` runs. After that:

```bash
npm run dev
```

Astro will start on port `4321` and VS Code will forward and open it automatically.

## What's inside

| Piece | Why |
|---|---|
| `mcr.microsoft.com/devcontainers/typescript-node:1-20-bookworm` | Matches the Node 20 used in CI. |
| GitHub CLI feature | `gh pr create` etc. from inside the container. |
| Azure CLI feature | `az staticwebapp ...` for provisioning without leaving the container. |
| Named `node_modules` volume | Keeps installs fast and off the host filesystem on Windows/macOS. |
| Extensions | Astro, Tailwind IntelliSense, Prettier, ESLint, MDX, GitHub Actions, Azure SWA, GitLens. |

## Environment variables

Optional. Add a local `.env` in the workspace root (it's already gitignored) if you want to test with real values:

```
SITE_URL=http://localhost:4321
PUBLIC_GA_MEASUREMENT_ID=
PUBLIC_BEEHIIV_FORM_ACTION=
```

## Rebuilding

If you change `devcontainer.json`: `Ctrl+Shift+P` → **Dev Containers: Rebuild Container**.
