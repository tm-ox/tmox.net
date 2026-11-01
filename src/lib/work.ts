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

// Home grid layout by tile position (1-based): md column span and row height step.
// Positions are drawn in pairs; each pair's spans sum to 12.
export const GRID = [
  { span: 8, row: 1 },
  { span: 4, row: 1 },
  { span: 6, row: 2 },
  { span: 6, row: 2 },
  { span: 7, row: 3 },
  { span: 5, row: 3 },
] as const;
export const MAX_FEATURED = GRID.length;

// Featured projects in tile order. Validates the owner-editable flags.
export function getFeatured(work: Work[]) {
  const feat = work
    .filter((w) => w.data.featured)
    .sort(
      (a, b) =>
        (a.data.featuredOrder ?? 99) - (b.data.featuredOrder ?? 99) ||
        a.data.order - b.data.order
    );
  if (feat.length === 0) throw new Error("[home] no published project has `featured: true`");
  if (feat.length > MAX_FEATURED)
    throw new Error(
      `[home] ${feat.length} featured projects; the grid holds at most ${MAX_FEATURED}`
    );
  if (feat.length % 2 !== 0)
    throw new Error(
      `[home] ${feat.length} featured projects; feature an even number (2, 4 or 6) so rows fill`
    );
  const orders = feat.map((w) => w.data.featuredOrder).filter((n) => n !== undefined);
  if (new Set(orders).size !== orders.length)
    throw new Error("[home] duplicate featuredOrder values");
  return feat;
}
