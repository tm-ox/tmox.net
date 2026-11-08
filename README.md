# tmox.net

Single-page portfolio for a freelance designer. One screen: a hero with two buttons that open modals, a contact form and a full-screen portfolio viewer. Plus a 404 page and a form-sent page. Astro 7, Tailwind CSS 4, astro-icon (Ion set). Static, dark only.

## Commands

| Command           | Action                                              |
| :---------------- | :-------------------------------------------------- |
| `npm install`     | Install dependencies (Node >= 22)                   |
| `npm run dev`     | Dev server at `localhost:4321`                      |
| `npm run build`   | Static build to `./dist/`                           |
| `npm run preview` | Preview the build                                   |
| `npm run check`   | Type-check Astro and TS (`astro check`)             |
| `npm run folio`   | Rebuild the portfolio viewer images from the PDF    |

## Where things live

- Copy (hero, portfolio title, contact, footer, page title and description): `src/content/pages/index.md`. The schema is `src/content.config.ts`.
- Portfolio pages: `npm run folio [new.pdf] [--single] [--skip=2,29]` renders `public/folio.pdf` (spreads are split into halves) to content-hashed `public/folio/NN-{800,1600}.<hash>.webp` and writes `src/data/folio.json` (names, ratio). Needs poppler on PATH. Run locally and commit the results (`git add -A public/folio`, which also records the removed old images). Then update the one-line-per-image alt text in `src/data/folio-captions.json`; the script warns if the count differs. Set the PDF's Title in the export dialog (it is shown in browser tabs).
- Tool logos: `scripts/tool-icon.py name...` crops a simple-icons logo into `src/icons` (needs Inkscape).
- Share image and icons: `public/og.png` (1200x630), `public/icon-*.png`, `favicon.ico`.
- Page markup: `src/pages/` (`index`, `404`, `sent`). Components in `src/components/`, client scripts in `src/scripts/` (modal, viewer, contact form).
- Styles: `src/styles/global.css` (Tailwind plus the tokens and component rules).

## Deploy

Netlify builds on push (`npm run build`, publish `dist`, Node 22; see `netlify.toml`). The contact form uses Netlify Forms (`data-netlify`, honeypot `bot-field`) and redirects to `/sent`.
