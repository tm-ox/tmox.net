// Reveal once: add `.in` when a [data-reveal] element first enters the viewport.
// Content stays visible without JS or with reduced motion (CSS gates the hidden state).
const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!("IntersectionObserver" in window) || reduce) {
  els.forEach((el) => el.classList.add("in"));
} else {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add("in");
      io.unobserve(e.target);
    }
  });
  els.forEach((el) => io.observe(el));
}
