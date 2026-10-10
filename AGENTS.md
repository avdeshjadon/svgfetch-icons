# AI Agent Operating Guidelines: svgfetch-icons

> **CRITICAL INSTRUCTION**: This repository (`svgfetch-icons`) is the central asset registry and CDN source for:
> 1. `svg-fetch` (Rust CLI core at `/Users/avdeshjadon/svg-fetch`)
> 2. `svgfetch-frontend` (React + Vite web app at `/Users/avdeshjadon/svgfetch-frontend`)
>
> You MUST read [`ECOSYSTEM.md`](ECOSYSTEM.md) before making changes.

## Mandatory Agent Rules:

1. **Folder Organization**:
   - All SVGs MUST be placed inside categorized subdirectories under `logos/<category>/`.
   - Never add flat SVG files directly in `logos/`.

2. **File Naming Conventions**:
   - Full Wordmark / Logo: `<brand-slug>.svg` (e.g. `logos/e-commerce/myntra.svg`)
   - Standalone Icon Mark: `<brand-slug>-icon.svg` (e.g. `logos/microsoft/github-icon.svg`)

3. **Manifest Generation & Contribution Logging**:
   - Every time an SVG is added, deleted, or renamed:
     - Run `node scripts/generate-manifest.js` (or `npm run manifest`) to regenerate `manifest.json`.
     - Append the addition to [`CONTRIBUTIONS.md`](CONTRIBUTIONS.md) with exact UTC timestamp, category, and source.
     - Copy updated `manifest.json` to `/Users/avdeshjadon/svg-fetch/data/curated_manifest.json`.

4. **CDN Cache Purging**:
   - When pushing changes to `main`, ensure jsDelivr CDN is purged (`curl -X POST https://purge.jsdelivr.net/gh/avdeshjadon/svgfetch-icons@main/manifest.json`).
