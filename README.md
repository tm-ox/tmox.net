# tmox.net

Design portfolio. Astro 7, Tailwind CSS 4, astro-icon (Ion set). Static, hosted on Netlify. Dark only ("Workbench" design, see the design spec in the tmox project docs).

## Commands

| Command           | Action                                  |
| :---------------- | :-------------------------------------- |
| `npm install`     | Install dependencies (Node >= 22.12)    |
| `npm run dev`     | Dev server at `localhost:4321`          |
| `npm run build`   | Static build to `./dist/`               |
| `npm run preview` | Preview the build                       |
| `npm run check`   | Type-check Astro/TS (`astro check`)     |

## Managing projects

Each project is one file, `src/content/work/<slug>.md` (the slug is the URL: `/work/<slug>`), with its images in a folder beside it.

### Publish and feature flags

- `draft: true` hides a project from production builds (no page, no `/work` row, no sitemap entry, no prev/next link). Drafts are still built and visible in `npm run dev`. Flip it to `false` (or delete the line) to publish.
- `featured: true` lists a project in the home "Selected work" module. Default is `false`. Every published project, featured or not, appears on `/work`.
- `featuredOrder: <number>` sets its row in that module (1 = first, and the project the stage shows first). With a mouse from 1024 px the rows form an index beside one large stage that shows the hovered or focused project; on touch and narrow screens they are plain rows with thumbnails.
  - Feature 4 to 8 projects (6 is the designed count). The build fails with a clear `[home]` message otherwise, or if two projects share a `featuredOrder`.
  - A featured project needs a good `cover` (see below).
  - Optional `feature: { src, position }` gives the home stage its own image (otherwise the cover is used). The stage applies a duotone and dot screen in CSS (`.feat .wimg` in `global.css`, filter `#duotone` in `index.astro`), so source files stay untouched.

### Other frontmatter

- Required: `order` (number; the "No." and the sort order), `title`, `client`, `type`, `discipline` (list of `brand | print | web | ui`), `description` (one sentence, max 160 characters; used under the home stage and as meta description), `cover`, `images`.
- Optional: `year`, `role`, `summary` (the project-page lead; falls back to `description`), `deliverables` (list), `tools` (`name`, optional `link`), `website`, `link`. A missing field is simply left off the page. Nothing renders as a placeholder.
- `cover`: `src`, `alt`, `fit` (`cover` | `contain`), `position` (CSS object-position, e.g. `"80% 60%"`), `mat` (background behind `contain` or `sheet` covers), `mobileAspect` (`4/3 | 3/2 | 4/5`), optional `sheet` (exactly six images drawn as a 3x2 sheet, used for logo collections).
- `images`: in display order. Each has `src`, `alt`, optional `caption` (shown as figure text; falls back to `alt`), `kind`, optional `mat`.
  - `kind`: `screen` (web/desktop screenshot), `mobile` (phone screenshot), `art` (opaque print or social artwork), `mark` (logo on transparent background, shown square on a dark mat), `photo`.
  - `mat`: `none | dark | light | black | white`. Neutral mounts behind artwork. Marks default to `dark`; use `light` for dark-ink logos, `black` or `white` for artwork on a pure black or white canvas.
- `rows`: how many images go in each row, in order, e.g. `rows: [1, 2, 2, 3]`. Must sum to the number of images, or the build fails with a `[gallery]` message. Rows of 5+ marks become a sheet, rows of 2+ phones become a phone strip, everything else is justified to one height. Without `rows`, a safe automatic grouping is used.

### Redirects

Old URLs are redirected in `astro.config.mjs` (`redirects`): `/work/01-logos` to `/work/logos`, `/work/02-tg` to `/work/triplegoal`. Add a line there when a slug changes.

## Structure

- `src/content.config.ts`: `pages` (home copy) and `work` collections (Content Layer, glob loaders).
- `src/content/pages/index.md`: all home, hero, services, about, contact and footer copy, plus the contact email.
- `src/lib/work.ts`: `getWork()` (sorted, draft-filtered), `getFeatured()` (home "Selected work" with validation), `neighbours()`.
- `src/components/`: `Header`, `Footer`, `Logo`, `WorkTile`, `Ticket`, `Gallery` (rows and lightbox markup), `Contact` (Netlify form), `CopyEmail`, `Reveal`.
- `src/scripts/`: `lightbox.ts` (native `<dialog>`, counter, swipe, keyboard), `reveal.ts` (reveal once).
- `src/styles/global.css`: Tailwind entry, `@theme` tokens (colour, type), component CSS, motion and reduced-motion rules.
- Fonts: Plus Jakarta Sans via Astro's fonts API (self-hosted at build).
- Analytics: gtag via Partytown (`BaseHead.astro`).
- Contact form uses Netlify Forms and redirects to `/sent`. `netlify.toml` holds build, cache and security headers.

## Where to edit (visual work)

| To change | Edit |
| :-- | :-- |
| Colours, fonts, type scale, spacing, hero/nav/reel sizes, work list tunables (`--row-thumb`, `--feat-*`) | `@theme` and `:root` blocks at the top of `src/styles/global.css` |
| Component styles (buttons, nav pill, work list and home stage, gallery, lightbox, form) | `@layer components` in `src/styles/global.css` |
| Home hero markup | `<section id="top">` in `src/pages/index.astro`; hero text in `src/content/pages/index.md` (`hero:`) |
| Nav pill | `src/components/Header.astro` (markup, icons, scroll-spy) |
| Which projects show on home, and in what order | `featured` / `featuredOrder` in each `src/content/work/*.md` |
| Work rows (home "Selected work", `/work` index, project prev/next) | `src/components/WorkRow.astro`; home module markup and its stage script in `src/pages/index.astro`; `/work` in `src/pages/work/index.astro` |
| Project page layout | `src/pages/work/[slug].astro`, `src/components/Gallery.astro` |
| `src/components/Reel.astro` | parked: the drifting project strip, not used by any page |
