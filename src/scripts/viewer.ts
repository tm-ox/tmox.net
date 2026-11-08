// Portfolio viewer: shows one [data-slide] at a time inside [data-viewer]. Controls: prev and next
// buttons, a click on the left or right half of the page, a click on a rail segment, ArrowLeft,
// ArrowRight, Home and End (plus h, l, g, G) while the dialog is open, and a horizontal swipe (touch and pen).
// Touch and pen can also pinch to zoom the page inside its frame (the controls stay put) and drag it while zoomed.
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
  let liveTimer = 0;
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
    if (from !== at) resetZoom();
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
    // announced once the page has settled, not on every page of a fast run (g, G, Home, End, the rail)
    if (live) {
      clearTimeout(liveTimer);
      liveTimer = window.setTimeout(
        () => (live.textContent = liveFormat.replace("{n}", String(at + 1)).replace("{total}", String(slides.length))),
        timer ? 400 : 120,
      );
    }
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
  // Pinch zoom: the pages are scaled inside the stage (which clips them) from the top left corner, so the
  // pan offset is simply a translation kept between (frame - scaled page) and 0. Mouse pointers do not take part.
  const stage = root.querySelector<HTMLElement>(".viewer-stage");
  const MAX_ZOOM = 4;
  let z = { s: 1, x: 0, y: 0 };
  const pts = new Map<number, { x: number; y: number }>();
  let pinch: { d: number; mx: number; my: number; s: number; x: number; y: number } | null = null;
  let swiped = false; // a swipe that began and ended on an arrow must not also count as a tap on it
  let gestured = false; // this touch was a pinch or a pan, so it is neither a swipe nor a tap
  const applyZoom = () => {
    if (pages) pages.style.transform = z.s > 1 ? `translate(${z.x}px, ${z.y}px) scale(${z.s})` : "";
    stage?.toggleAttribute("data-zoomed", z.s > 1);
  };
  const clampZoom = () => {
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    z.s = Math.min(MAX_ZOOM, Math.max(1, z.s));
    z.x = Math.min(0, Math.max(r.width * (1 - z.s), z.x));
    z.y = Math.min(0, Math.max(r.height * (1 - z.s), z.y));
  };
  const resetZoom = () => {
    z = { s: 1, x: 0, y: 0 };
    pinch = null;
    applyZoom();
  };
  const mid = () => {
    const [a, b] = [...pts.values()];
    const r = stage!.getBoundingClientRect();
    return { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2 - r.left, my: (a.y + b.y) / 2 - r.top };
  };
  stage?.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse") return;
    if (!pts.size) gestured = false;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) {
      gestured = true;
      pinch = { ...mid(), s: z.s, x: z.x, y: z.y };
    }
  });
  stage?.addEventListener("pointermove", (e) => {
    const prevPt = pts.get(e.pointerId);
    if (!prevPt) return;
    const now = { x: e.clientX, y: e.clientY };
    pts.set(e.pointerId, now);
    if (pts.size === 2 && pinch) {
      const m = mid();
      const s = Math.min(MAX_ZOOM, Math.max(1, (pinch.s * m.d) / pinch.d));
      // the point of the page that was under the fingers' midpoint stays under it
      z = { s, x: m.mx - ((pinch.mx - pinch.x) / pinch.s) * s, y: m.my - ((pinch.my - pinch.y) / pinch.s) * s };
      clampZoom();
      applyZoom();
    } else if (pts.size === 1 && z.s > 1) {
      z.x += now.x - prevPt.x;
      z.y += now.y - prevPt.y;
      if (Math.hypot(now.x - prevPt.x, now.y - prevPt.y) > 0) gestured = true;
      clampZoom();
      applyZoom();
    }
  });
  const lift = (e: PointerEvent) => {
    if (!pts.delete(e.pointerId)) return;
    if (pts.size < 2) pinch = null;
    if (z.s < 1.05) resetZoom(); // near enough to fit: snap back
    if (gestured) swiped = true; // the click that follows a pinch or a pan must not turn the page
  };
  stage?.addEventListener("pointerup", lift);
  stage?.addEventListener("pointercancel", lift);
  dialog?.addEventListener("close", resetZoom);
  let start: { x: number; y: number } | null = null;
  root.addEventListener("pointerdown", (e) => {
    swiped = false;
    start = e.pointerType !== "mouse" ? { x: e.clientX, y: e.clientY } : null;
  });
  root.addEventListener("pointerup", (e) => {
    if (start && !gestured && z.s === 1) {
      const dx = e.clientX - start.x;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - start.y)) {
        swiped = true;
        show(at + (dx < 0 ? 1 : -1));
      }
    }
    start = null;
  });
  root.addEventListener(
    "click",
    (e) => {
      if (swiped) (e.stopPropagation(), e.preventDefault());
      swiped = false;
    },
    true,
  );
  step(0);
  ready = true;
};
document.querySelectorAll<HTMLElement>("[data-viewer]").forEach(bind);
