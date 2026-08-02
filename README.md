# 👋 Jordan Carney — personal site

### ▶ [Visit it](https://jordancarney.github.io/)

My simple one-page personal site: a terminal-typed intro over an animated background, a
short bio, and a couple of ways to reach me. It also serves privacy policies for my apps as
standalone static pages under `public/`, which need no JS and no build output.

## Built with

Vite, React, TypeScript, Tailwind CSS and shadcn/ui. All the copy lives in
[src/content/site.ts](src/content/site.ts), so wording changes don't mean touching components.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

`npm run build` type-checks and writes `dist/`, `npm run preview` serves that build, and
`npm run lint` runs ESLint.

## Deploys

GitHub Actions builds and publishes on every push to `main` — see
[.github/workflows/deploy.yml](.github/workflows/deploy.yml). It runs `npm ci`, runs
`npm run build`, uploads `dist/` with `actions/upload-pages-artifact`, and deploys with
`actions/deploy-pages`.

This repo is the GitHub Pages **user site** (`jordancarney.github.io`), so Vite keeps the
default base path (`/`) and the site deploys from the domain root.

### Why the docs link to `github.io`

A custom domain is configured in **Settings → Pages**, and GitHub redirects the `github.io`
URLs to it — including the project sites at `/ship-dash/` and `/platypus-adventures/`. So
these READMEs link to `github.io` on purpose: it lands in the same place either way, and it
doesn't go stale if the custom domain ever changes.
