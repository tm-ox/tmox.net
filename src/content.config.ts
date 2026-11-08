import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const tool = z.object({ name: z.string(), url: z.url().optional(), icon: z.string().optional(), mark: z.string().optional(), large: z.boolean().optional() });

export const collections = {
  pages: defineCollection({
    loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/pages" }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      // Strings shared by several components.
      site: z.object({
        brand: z.string(),
        homeLabel: z.string(), // aria-label of the logo link
        skip: z.string(),
        close: z.string(), // label and tooltip of the site menu's Close box (shown over the portfolio)
      }),
      // Labels of the site menu (components/Header.astro, SiteNav.astro); `label` names the <nav>.
      nav: z.object({ label: z.string(), home: z.string(), about: z.string(), work: z.string(), contact: z.string() }),
      hero: z.object({
        kicker: z.string(), // " | " becomes a spaced pipe separator
        title: z.string(),
        // Words of `title` set in the accent colour; must appear in `title` verbatim.
        accent: z.string().optional(),
        lead: z.string(),
        availability: z.string().optional(),
        contactCta: z.string(),
      }),
      folio: z.object({
        title: z.string(), // names the portfolio dialog
        hint: z.string(), // phone portrait hint
        prev: z.string(),
        next: z.string(),
        // {n} is the page number, {total} the page count, {text} the page's extracted text.
        pageAlt: z.string(),
        live: z.string(), // screen reader announcement on page change
        openLabel: z.string(),
        openTip: z.string(),
        downloadLabel: z.string(),
        downloadTip: z.string(),
        keysLabel: z.string(),
        keys: z.array(z.object({ key: z.string(), label: z.string() })),
      }),
      about: z.object({
        title: z.string(),
        lead: z.string(),
        more: z.string(),
        tabsLabel: z.string(), // aria-label of the tab list
        services: z.object({
          tab: z.string(),
          items: z.array(z.object({ title: z.string(), intro: z.string(), deliverables: z.array(z.string()) })),
        }),
        tools: z.object({
          tab: z.string(),
          // A tool shows its `icon` (a file in src/icons, e.g. "figma"; add one with scripts/tool-icon.py), or a `mark` (text) when it has no
          // logo (neither: just the name, larger; `large` sets that name larger still, for the "…" tile), and links
          // to `url` when it has one.
          nowTitle: z.string(),
          newTab: z.string(), // read out after a tool name that links out, e.g. "opens in a new tab"
          items: z.array(tool),
          pastTitle: z.string(), // tools no longer in use
          past: z.array(tool),
        }),
      }),
      contact: z.object({
        title: z.string(),
        lead: z.string(),
        note: z.string().optional(),
        honeypot: z.string(),
        nameLabel: z.string(),
        emailLabel: z.string(),
        needsLegend: z.string(),
        needsHint: z.string(),
        needs: z.array(z.object({ value: z.string(), label: z.string() })),
        messageLabel: z.string(),
        send: z.string(),
        error: z.string(),
        requiredNote: z.string(), // "* required", beside the Send button
        // Shown in the modal after sending, and on /sent.
        success: z.object({ title: z.string(), body: z.string(), back: z.string() }),
      }),
      footer: z.object({
        line: z.string(),
        pagesTitle: z.string(),
        portfolio: z.string(),
        portfolioPdf: z.string(),
        contact: z.string(),
        colophonTitle: z.string(),
        colophon: z.string(),
      }),
    }),
  }),
};
