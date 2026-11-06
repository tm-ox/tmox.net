// Portfolio viewer: shows one [data-slide] at a time inside [data-viewer]. Controls: prev and next
// buttons, a click on the left or right half of the page, a click on a rail segment, ArrowLeft,
// ArrowRight, Home and End (plus h, l, g, G) while the dialog is open, and a horizontal swipe (touch and pen).
// Pages do not wrap: prev is disabled on the first page, next on the last.
const bind = (root: HTMLElement) => {
  const slides = [...root.querySelectorAll<HTMLElement>("[data-slide]")];
  const ticks = [...root.querySelectorAll<HTMLElement>("[data-go]")];
  const prev = root.querySelector<HTMLButtonElement>("[data-prev]")!;
  const next = root.querySelector<HTMLButtonElement>("[data-next]")!;
  const halves = [...root.querySelectorAll<HTMLElement>("[data-half]")];
  const live = root.querySelector<HTMLElement>("[data-live]");
  const liveFormat = root.dataset.liveFormat ?? "";
  const dialog = root.closest("dialog");
  const pages = root.querySelector<HTMLElement>(".viewer-pages");
  const last = slides.length - 1;
  let at = 0;
  let ready = false;
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  let timer = 0;
  const cancel = () => (clearInterval(timer), (timer = 0));
  // Images are lazy and the dialog is closed (display: none), so nothing downloads until the portfolio
  // is first opened; then the current page and its neighbours are fetched, and again on every step.
  const promote = () => {
    for (const n of [at - 1, at, at + 1]) slides[n]?.querySelector("img")?.setAttribute("loading", "eager");
  };
  if (dialog)
    new MutationObserver(() => dialog.open && promote()).observe(dialog, { attributes: true, attributeFilter: ["open"] });
  // ms: a faster, linear slide used while travelling over several pages (g, G, Home, End, rail)
  const step = (i: number, ms?: number) => {
    const from = at;
    at = Math.max(0, Math.min(last, i));
    for (const s of slides) {
      s.removeAttribute("data-dir");
      s.hidden = true;
    }
    const cur = slides[at];
    cur.hidden = false;
    if (ready && from !== at && !still.matches) {
      const d = at > from ? 1 : -1;
      const old = slides[from];
      for (const [s, dir] of [[cur, "in"], [old, "out"]] as const) {
        s.style.setProperty("--d", String(d));
        if (ms) (s.style.setProperty("--t", `${ms}ms`), s.style.setProperty("--e", "linear"));
        else (s.style.removeProperty("--t"), s.style.removeProperty("--e"));
        s.dataset.dir = dir;
      }
      old.hidden = false;
    }
    ticks.forEach((t, n) => t.toggleAttribute("data-on", n === at));
    prev.disabled = at === 0;
    next.disabled = at === last;
    for (const h of halves) h.toggleAttribute("data-off", h.dataset.half === "prev" ? at === 0 : at === last);
    if (live) live.textContent = liveFormat.replace("{n}", String(at + 1)).replace("{total}", String(slides.length));
    if (ready) promote();
    if (document.activeElement instanceof HTMLButtonElement && document.activeElement.disabled)
      (document.activeElement === prev ? next : prev).focus();
  };
  const show = (i: number) => (cancel(), step(i));
  // Jumps of more than one page run through every page in between, fast, so the whole portfolio
  // scrolls past. Any other navigation stops the run where it is.
  const travel = (to: number) => {
    cancel();
    to = Math.max(0, Math.min(last, to));
    const n = Math.abs(to - at);
    if (n <= 1 || still.matches) return step(to);
    const ms = Math.max(35, Math.min(90, Math.round(1200 / n)));
    const dir = to > at ? 1 : -1;
    step(at + dir, ms);
    timer = window.setInterval(() => {
      step(at + dir, ms);
      if (at === to) cancel();
    }, ms);
  };
  // The outgoing page is hidden once its slide-out animation ends.
  pages?.addEventListener("animationend", (e) => {
    const s = e.target as HTMLElement;
    if (s.dataset.dir === "out") (s.hidden = true, s.removeAttribute("data-dir"));
  });
  dialog?.addEventListener("close", cancel);
  prev.addEventListener("click", () => show(at - 1));
  next.addEventListener("click", () => show(at + 1));
  for (const h of halves) h.addEventListener("click", () => show(at + (h.dataset.half === "prev" ? -1 : 1)));
  ticks.forEach((t, n) => t.addEventListener("click", () => travel(n)));
  dialog?.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target instanceof Element && e.target.closest("input,textarea,select")) return;
    // Vim keys alongside the arrows: h back, l forward, g first, G (shift) last.
    if (e.shiftKey && e.key !== "G") return;
    if (e.key === "ArrowLeft" || e.key === "h") show(at - 1);
    else if (e.key === "ArrowRight" || e.key === "l") show(at + 1);
    else if (e.key === "Home" || e.key === "g") (e.preventDefault(), travel(0));
    else if (e.key === "End" || e.key === "G") (e.preventDefault(), travel(last));
  });
  let start: { x: number; y: number } | null = null;
  root.addEventListener("pointerdown", (e) => {
    start = e.pointerType !== "mouse" ? { x: e.clientX, y: e.clientY } : null;
  });
  root.addEventListener("pointerup", (e) => {
    if (start) {
      const dx = e.clientX - start.x;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - start.y)) show(at + (dx < 0 ? 1 : -1));
    }
    start = null;
  });
  step(0);
  ready = true;
};
document.querySelectorAll<HTMLElement>("[data-viewer]").forEach(bind);
