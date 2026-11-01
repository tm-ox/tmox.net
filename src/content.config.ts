import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { readdirSync, readFileSync } from "node:fs";

// Drafts (`draft: true` in frontmatter) are excluded at the loader in production builds, so their
// images are never processed or published. In dev they load, so they can be previewed.
const WORK_DIR = "./src/content/work";
const draftFiles = import.meta.env.PROD
  ? readdirSync(WORK_DIR)
      .filter((f) => f.endsWith(".md"))
      .filter((f) => /^draft:\s*true\s*$/m.test(readFileSync(`${WORK_DIR}/${f}`, "utf8")))
  : [];

const mat = z.enum(["none", "dark", "light", "black", "white"]);
const kind = z.enum(["screen", "mobile", "art", "mark", "photo"]);

export const collections = {
  pages: defineCollection({
    loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/pages" }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      hero: z.object({
        kicker: z.string(),
        title: z.string(),
        // Words of `title` set in the accent colour; must appear in `title` verbatim.
        accent: z.string().optional(),
        lead: z.string(),
        availability: z.string().optional(),
      }),
      services: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          intro: z.string(),
          deliverables: z.array(z.string()),
          proof: z.array(z.string()),
        })
      ),
      about: z.object({
        title: z.string(),
        paragraphs: z.array(z.string()).min(1),
        clients: z.array(z.string()),
        tools: z.array(z.string()),
        // Client reviews shown under About. Quote verbatim (ellipsis for cuts); attribute by project type only.
        reviews: z.array(z.object({ quote: z.string(), source: z.string() })).optional(),
      }),
      contact: z.object({
        title: z.string(),
        lead: z.string(),
        note: z.string().optional(),
      }),
      footer: z.object({ line: z.string() }),
    }),
  }),

  work: defineCollection({
    loader: glob({
      pattern: ["**/*.md", ...draftFiles.map((f) => `!${f}`)],
      base: WORK_DIR,
    }),
    schema: ({ image }) =>
      z.object({
        order: z.number().int(),
        draft: z.boolean().default(false),
        // Home "Selected work": `featured: true` lists the project there (4 to 8; 6 designed).
        // `featuredOrder` sets its position (1 = first row, shown on the stage first).
        featured: z.boolean().default(false),
        featuredOrder: z.number().int().min(1).optional(),
        title: z.string(),
        client: z.string(),
        website: z.string().optional(),
        link: z.url().optional().or(z.literal("")),
        type: z.string(),
        discipline: z.array(z.enum(["brand", "print", "web", "ui"])).min(1),
        year: z.number().int().optional(),
        role: z.string().optional(),
        deliverables: z.array(z.string()).default([]),
        description: z.string().max(160),
        summary: z.string().optional(),
        tools: z
          .array(z.object({ name: z.string(), link: z.string().optional() }))
          .default([]),
        cover: z.object({
          src: image(),
          alt: z.string(),
          fit: z.enum(["cover", "contain"]).default("cover"),
          position: z.string().default("50% 50%"),
          mat: mat.default("none"),
          mobileAspect: z.enum(["4/3", "3/2", "4/5"]).default("4/3"),
          sheet: z.array(image()).length(6).optional(),
        }),
        // Optional: a different image for the home "Selected work" stage (duotoned there). When
        // absent the cover is used. `position` is the crop focus, e.g. "50% 30%".
        feature: z
          .object({ src: image(), position: z.string().default("50% 50%") })
          .optional(),
        rows: z.array(z.number().int().min(1)).optional(),
        images: z.array(
          z.object({
            src: image(),
            alt: z.string(),
            caption: z.string().optional(),
            kind,
            mat: mat.optional(),
          })
        ),
      }),
  }),
};
