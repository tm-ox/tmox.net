// Fade/FadeOnce: toggle `.in` when [data-reveal] enters the viewport.
// data-reveal="once" stays revealed; any other value reverses on leave.
const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!("IntersectionObserver" in window) || reduce) {
  els.forEach((el) => el.classList.add("in"));
} else {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const el = e.target as HTMLElement;
      if (e.isIntersecting) {
        el.classList.add("in");
        if (el.dataset.reveal === "once") io.unobserve(el);
      } else if (el.dataset.reveal !== "once") {
        el.classList.remove("in");
      }
    }
  });
  els.forEach((el) => io.observe(el));
}
