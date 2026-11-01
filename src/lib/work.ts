import { getCollection, type CollectionEntry } from "astro:content";

export type Work = CollectionEntry<"work">;

// Published projects sorted by `order`. Drafts are included only outside production builds.
export async function getWork() {
  const all = await getCollection("work", ({ data }) =>
    import.meta.env.PROD ? !data.draft : true
  );
  return all.sort(
    (a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id)
  );
}

// Previous/next project for each entry, wrapping at the ends.
export function neighbours<T extends { id: string }>(list: T[], id: string) {
  const i = list.findIndex((e) => e.id === id);
  return {
    prev: list[(i - 1 + list.length) % list.length],
    next: list[(i + 1) % list.length],
  };
}

// Home "Selected work" module: the featured rows share the stage's height, so keep the
// count small. 6 is the designed count; 4 to 8 fit.
export const MIN_FEATURED = 4;
export const MAX_FEATURED = 8;

// Featured projects in row order. Validates the owner-editable flags.
export function getFeatured(work: Work[]) {
  const feat = work
    .filter((w) => w.data.featured)
    .sort(
      (a, b) =>
        (a.data.featuredOrder ?? 99) - (b.data.featuredOrder ?? 99) ||
        a.data.order - b.data.order
    );
  if (feat.length < MIN_FEATURED || feat.length > MAX_FEATURED)
    throw new Error(
      `[home] ${feat.length} featured projects; feature ${MIN_FEATURED} to ${MAX_FEATURED} (6 is the designed count)`
    );
  const orders = feat.map((w) => w.data.featuredOrder).filter((n) => n !== undefined);
  if (new Set(orders).size !== orders.length)
    throw new Error("[home] duplicate featuredOrder values");
  return feat;
}
