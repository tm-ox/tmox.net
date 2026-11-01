# tmox.net

Design portfolio. Astro 7, Tailwind CSS 4, astro-icon (Ion set).

## Commands

| Command           | Action                                  |
| :---------------- | :-------------------------------------- |
| `npm install`     | Install dependencies (Node >= 22.12)    |
| `npm run dev`     | Dev server at `localhost:4321`          |
| `npm run build`   | Static build to `./dist/`               |
| `npm run preview` | Preview the build                       |
| `npm run check`   | Type-check Astro/TS (`astro check`)     |

## Structure

- `src/content.config.ts`: `pages` and `work` collections (Content Layer, glob loaders).
- `src/content/work/*.md`: one file per project (slug = file name), images in a folder beside it. Frontmatter: `order` (number, sorts the index and prev/next), `draft` (bool, default false), `title`, `client`, `type`, `tools`, `cover`, `images`; optional `year`, `role`, `summary`, `description`, `website`, `link`.
  - `images` render in array order. Each item: `src`, `alt` (also the visible caption), optional `size` (`sm | md | lg | xl | full`), `tall` (spans two rows on large screens), `align` (`start | end`). Without `size` it is derived from the image's pixel size and aspect ratio. The size-to-grid mapping lives in `src/components/Gallery.astro`.
  - Prev/next project links are computed from the sorted collection and wrap at the ends.
  - Draft: set `draft: true`. Drafts are excluded from the index, routes, sitemap and prev/next in production builds and shown in `npm run dev`.
- `src/components/Gallery.astro` + `src/scripts/lightbox.ts`: gallery grid and one native `<dialog>` lightbox per project page (Esc, backdrop, arrow keys; thumbnails are plain links to the large image without JS).
- `src/lib/work.ts`: `getWork()` (sorted, draft-filtered) and `neighbours()`.
- `src/styles/global.css`: Tailwind entry, `@theme` tokens (colours, font, animations).
- `src/scripts/reveal.ts`: IntersectionObserver for `Fade`/`FadeOnce` (CSS in `global.css`; content stays visible without JS).
- Fonts: Plus Jakarta Sans via Astro's fonts API (self-hosted at build).
- Analytics: gtag via Partytown (`BaseHead.astro`).
- Contact form uses Netlify Forms and redirects to `/sent`. `netlify.toml` holds build, cache and security headers.
