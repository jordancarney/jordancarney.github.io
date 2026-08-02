# 👋 Jordan Carney — personal site

### ▶ [Visit it](https://jordancarney.github.io/)

A single-page personal site: animated hyperspace background, a terminal-typed intro,
a short bio, and two ways to reach me. Built with Vite, React, TypeScript, Tailwind CSS
and shadcn/ui.

## What's here

- **Landing page** — the whole thing is [src/App.tsx](src/App.tsx), and every word of
  copy lives in [src/content/site.ts](src/content/site.ts), so edits don't mean touching
  components.
- **Privacy policies** for [Liberate](https://jordancarney.github.io/liberate-privacy-policy/)
  and [The Orb](https://jordancarney.github.io/the-orb-privacy-policy/) — self-contained
  static pages in `public/`, no JS and no build output, so those URLs stand on their own.
- **404 page** that redirects back to the root.

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

## Project layout

```
index.html            Vite entry
src/main.tsx          React root + a small pathname router
src/App.tsx           The landing page
src/content/site.ts   All the copy — name, bio, email, links
src/components/       Avatar, Container, HyperspaceBackground, TerminalIntro + shadcn/ui
src/index.css         Tailwind layers + the hyperspace and CTA animations
public/               Copied to the site root as-is — avatar, favicon, 404, privacy policies
```
