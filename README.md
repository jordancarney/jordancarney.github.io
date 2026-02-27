# Jordan Carney Site

Single-page personal site built with Vite, React, TypeScript, Tailwind CSS, and shadcn/ui.

This repository is configured as a GitHub Pages user site (`jordancarney.github.io`), so Vite uses the default base path (`/`) and deploys from the domain root.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

GitHub Actions workflow file: `.github/workflows/deploy.yml`

It deploys to GitHub Pages on push to `main` by:

1. Running `npm ci`
2. Running `npm run build`
3. Uploading `dist/` with `actions/upload-pages-artifact`
4. Deploying with `actions/deploy-pages`
