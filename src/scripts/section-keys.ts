// Vim-style keys on the home page: j / k move to the next / previous section, gg jumps to the
// first, G to the bottom of the page. Ignored while typing, with a modifier held, or with a
// dialog open. Sections are the nav's targets, in page order.
const ids = ["top", "work", "services", "about", "contact"];
const sectionsNow = () =>
  ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);

const w = window as unknown as Record<string, boolean>;
if (!w.__tmoxKeys) {
  w.__tmoxKeys = true;
  const calm = matchMedia("(prefers-reduced-motion: reduce)");
  const behavior = (): ScrollBehavior => (calm.matches ? "auto" : "smooth");

  // Distance from the viewport top where a section counts as "current" (the sticky logo row).
  // = where scrollIntoView lands a section (html scroll-padding-top + the section's scroll-margin-top) + slack.
  const probe = (sections: HTMLElement[]) =>
    (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) +
    (parseFloat(getComputedStyle(sections[0]).scrollMarginTop) || 0) +
    24;
  const current = (sections: HTMLElement[]) => {
    const y = probe(sections);
    let idx = 0;
    sections.forEach((s, i) => {
      if (s.getBoundingClientRect().top <= y) idx = i;
    });
    return idx;
  };
  const go = (sections: HTMLElement[], i: number) =>
    sections[Math.max(0, Math.min(sections.length - 1, i))].scrollIntoView({
      behavior: behavior(),
      block: "start",
    });

  let pendingG = 0;
  addEventListener("keydown", (e) => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    const sections = sectionsNow(); // re-read per key: the page may have changed under the router
    if (!sections.length) return;
    const t = e.target as HTMLElement | null;
    if (t?.closest("input, textarea, select, [contenteditable]")) return;
    if (document.querySelector("dialog[open]")) return;

    if (e.key === "j") {
      e.preventDefault();
      go(sections, current(sections) + 1);
    } else if (e.key === "k") {
      e.preventDefault();
      // If the current section's top is above the line, k first returns to that top.
      const i = current(sections);
      const top = sections[i].getBoundingClientRect().top;
      go(sections, top < probe(sections) - 24 - 4 ? i : i - 1); // probe() - 24 is where a section lands
    } else if (e.key === "G") {
      e.preventDefault();
      scrollTo({ top: document.documentElement.scrollHeight, behavior: behavior() });
    } else if (e.key === "g") {
      const now = Date.now();
      if (now - pendingG < 600) {
        pendingG = 0;
        e.preventDefault();
        go(sections, 0);
      } else pendingG = now;
    }
  });
}

export {}; // a module, so top-level names stay local to this file
