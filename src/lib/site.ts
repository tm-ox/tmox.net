import { getEntry } from "astro:content";

// The page copy in src/content/pages/index.md. Components that need strings call this themselves.
export const getSite = async () => {
  const entry = await getEntry("pages", "index");
  if (!entry) throw new Error("Missing content entry: pages/index");
  return entry.data;
};
