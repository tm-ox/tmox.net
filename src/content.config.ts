import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const mat = z.enum(["none", "dark", "light", "black", "white"]);
const kind = z.enum(["screen", "mobile", "art", "mark", "photo"]);

export const collections = {
  pages: defineCollection({
    loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/pages" }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      email: z.email(),
      hero: z.object({
        kicker: z.string(),
        title: z.string(),
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
    loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
    schema: ({ image }) =>
      z.object({
        order: z.number().int(),
        draft: z.boolean().default(false),
        // Home grid: `featured: true` shows the project there (max 6, drawn in pairs).
        // `featuredOrder` sets its position (1 = first tile). Layout widths come from the position.
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
