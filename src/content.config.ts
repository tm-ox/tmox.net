import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

export const collections = {

  pages: defineCollection({
    loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/pages" }),
    schema: ({ image }) =>
      z.object({
        title: z.string(),
        description: z.string(),
        website: z.string().optional(),
        sections: z.array(z.string()),
        subhead1: z.string(),
        sub1: z.string(),
        sub1skills: z.array(
          z.object({
            icon: image().optional(),
            name: z.string(),
            link: z.string().optional(),
          })
        ),
        subhead2: z.string(),
        sub2: z.string(),
        sub2skills: z.array(
          z.object({
            icon: image().optional(),
            name: z.string(),
            link: z.string().optional(),
          })
        ),
        tools: z.array(
          z.object({
            icon: image().optional(),
            name: z.string(),
            link: z.string().optional(),
          })
        ),
      }),
  }),

  work: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
    schema: ({ image }) =>
      z.object({
        order: z.number(),
        draft: z.boolean().default(false),
        title: z.string(),
        client: z.string(),
        website: z.string().optional(),
        link: z.string().optional(),
        type: z.string(),
        year: z.number().optional(),
        role: z.string().optional(),
        summary: z.string().optional(),
        tools: z.array(
          z.object({
            icon: image().optional(),
            name: z.string(),
            link: z.string().optional(),
          })
        ),
        description: z.string().optional(),
        cover: z.object({
          src: image(),
          alt: z.string(),
        }),
        images: z.array(
          z.object({
            src: image(),
            alt: z.string(),
            size: z.enum(["sm", "md", "lg", "xl", "full"]).optional(),
            tall: z.boolean().optional(),
            align: z.enum(["start", "end"]).optional(),
          })
        ),
      }),
  }),
};
