import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

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
        close: z.string(), // label and tooltip of a modal's Close button
      }),
      hero: z.object({
        kicker: z.string(), // " | " becomes a spaced pipe separator
        title: z.string(),
        // Words of `title` set in the accent colour; must appear in `title` verbatim.
        accent: z.string().optional(),
        lead: z.string(),
        availability: z.string().optional(),
        contactCta: z.string(),
        portfolioCta: z.string(),
      }),
      folio: z.object({
        title: z.string(), // names the portfolio dialog
        hint: z.string(), // phone portrait hint
        prev: z.string(),
        next: z.string(),
        // {n} is the page number, {total} the page count, {text} the page's extracted text.
        pageAlt: z.string(),
        pageText: z.string(),
        live: z.string(), // screen reader announcement on page change
        closeLabel: z.string(),
        closeTip: z.string(),
        openLabel: z.string(),
        openTip: z.string(),
        downloadLabel: z.string(),
        downloadTip: z.string(),
        keysLabel: z.string(),
        keys: z.array(z.object({ key: z.string(), label: z.string() })),
      }),
      contact: z.object({
        title: z.string(),
        lead: z.string(),
        note: z.string().optional(),
        honeypot: z.string(),
        nameLabel: z.string(),
        emailLabel: z.string(),
        needsLegend: z.string(),
        needs: z.array(z.object({ value: z.string(), label: z.string() })),
        messageLabel: z.string(),
        send: z.string(),
        error: z.string(),
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
