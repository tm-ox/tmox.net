// Reveal once: add `.in` when a [data-reveal] element first enters the viewport.
// Content stays visible without JS or with reduced motion (CSS gates the hidden state).
// Runs on every page load of the client router (astro:page-load fires on the first load too).
let io: IntersectionObserver | undefined;

const reveal = () => {
  io?.disconnect();
  io = undefined;
  const els = [...document.querySelectorAll<HTMLElement>("[data-reveal]:not(.in)")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("IntersectionObserver" in window) || reduce) {
    els.forEach((el) => el.classList.add("in"));
    return;
  }
  io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add("in");
      io?.unobserve(e.target);
    }
  });
  els.forEach((el) => io!.observe(el));
};

const w = window as unknown as Record<string, boolean>;
if (!w.__tmoxReveal) {
  w.__tmoxReveal = true;
  // Straight after the swap, before the new page is shown: whatever sits in the first screen is
  // already revealed, so a navigation does not paint it hidden and pop it in a moment later.
  // The router has already scrolled (top, back/forward position or hash target) by this point, so the
  // check is against the viewport as it will be shown.
  document.addEventListener("astro:after-swap", () => {
    document.querySelectorAll<HTMLElement>("[data-reveal]:not(.in)").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) el.classList.add("in");
    });
  });
  // astro:page-load only fires on the window `load` event for a first visit, and `js` hides the
  // content from the head, so start as soon as the document is parsed; reveal() is safe to repeat.
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", reveal, { once: true });
  else reveal();
  document.addEventListener("astro:page-load", reveal);
}

export {}; // a module, so top-level names stay local to this file
