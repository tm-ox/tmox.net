# tmox.net

Design portfolio. Astro 7, Tailwind CSS 4, Alpine.js, astro-icon (Ion set).

## Commands

| Command           | Action                                  |
| :---------------- | :-------------------------------------- |
| `npm install`     | Install dependencies (Node >= 22.12)    |
| `npm run dev`     | Dev server at `localhost:4321`          |
| `npm run build`   | Static build to `./dist/`               |
| `npm run preview` | Preview the build                       |
| `npm run check`   | Type-check Astro/TS (`astro check`)     |

## Structure

- `src/content.config.ts`: `pages` and `work` collections (Content Layer, glob loaders). Files prefixed `_` are drafts and are skipped.
- `src/content/work/*.md`: one file per project, `order` frontmatter sorts the index. Images sit in a folder beside each file.
- `src/styles/global.css`: Tailwind entry, `@theme` tokens (colours, font, animations).
- `src/alpine.ts`: Alpine plugin registration (intersect).
- Fonts: Plus Jakarta Sans via Astro's fonts API (self-hosted at build).
- Analytics: gtag via Partytown (`BaseHead.astro`).
- Contact form posts to staticforms.xyz and redirects to `/sent`.
