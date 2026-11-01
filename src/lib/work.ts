import { getCollection } from "astro:content";

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
