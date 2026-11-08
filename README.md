# tmox.net

Single-page site for a freelance designer. One screen: a hero, a site menu, and three modals: About (Services and Tools tabs), Folio (full-screen PDF page viewer) and Contact (form). Plus a 404 page and a form-sent page. Astro 7, Tailwind CSS 4, astro-icon (Ion and Simple Icons sets). Static, dark only.

The folio PDF is the single source of work content: update the PDF, not the page. The earlier multi-page build (work, services routes) lives on the `redesign` branch.

## Commands

| Command           | Action                                              |
| :---------------- | :-------------------------------------------------- |
| `npm install`     | Install dependencies (Node >= 22)                   |
| `npm run dev`     | Dev server at `localhost:4321`                      |
| `npm run build`   | Static build to `./dist/`                           |
| `npm run preview` | Preview the build                                   |
| `npm run check`   | Type-check Astro and TS (`astro check`)             |
| `npm run folio`   | Rebuild the folio viewer images from the PDF        |

## Where things live

- Copy (site, nav, hero, folio, About with services and tools, contact, footer, page title and description): `src/content/pages/index.md`. The schema is `src/content.config.ts`.
- Folio pages: `npm run folio [new.pdf] [--single] [--skip=2,29]` renders `public/folio.pdf` (spreads are split into halves) to content-hashed `public/folio/NN-{800,1600}.<hash>.webp` and writes `src/data/folio.json` (names, ratio). Needs poppler on PATH. Run locally and commit the results (`git add -A public/folio`, which also records the removed old images). Then update the one-line-per-image alt text in `src/data/folio-captions.json`; the script warns if the count differs. Set the PDF's Title in the export dialog (it is shown in browser tabs).
- Viewer controls: arrow keys, `h` / `l` (previous / next), `g` / `G` (first / last). The key hints and their labels are the `folio.keys` list in `index.md`.
- Tool logos: `scripts/tool-icon.py name...` crops a simple-icons logo into `src/icons` (needs Inkscape).
- Share image and icons: `public/og.png` (1200x630), `public/icon-*.png`, `favicon.ico`.
- Page markup: `src/pages/` (`index`, `404`, `sent`). Components in `src/components/`, client scripts in `src/scripts/` (modal, tabs, viewer, contact form).
- Styles: `src/styles/global.css` (Tailwind plus the tokens and component rules). Controls (icon buttons, key hints, tabs, chips) share `--color-control` at rest and `--color-accent` on hover, focus or selection; keep new controls on those tokens. Tooltips are CSS-only (`data-tip`, `data-tip-side`) via `IconButton.astro`.

## Deploy

Netlify builds on push (`npm run build`, publish `dist`, Node 22; see `netlify.toml`). The contact form uses Netlify Forms (`data-netlify`, honeypot `bot-field`) and redirects to `/sent`.

Headers and caching are in `netlify.toml`: folio images are content-hashed and cached immutable, `/folio.pdf` always revalidates (old `/portfolio.pdf` redirects to it), and a Content-Security-Policy is sent in Report-Only mode (check the browser console on the live site, then rename it to enforce).

Analytics: GA4 loads in production builds only, through Partytown (`src/components/BaseHead.astro`). There is no cookie banner.
