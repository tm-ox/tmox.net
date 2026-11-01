// Native <dialog> lightbox. Thumbnails are plain links to the large image
// (work without JS); with JS they open the single dialog on the page.
const dialog = document.querySelector<HTMLDialogElement>("#lightbox");
const links = Array.from(
  document.querySelectorAll<HTMLAnchorElement>("[data-lightbox]")
);

const MAT: Record<string, string> = {
  dark: "#141414",
  light: "#e8e8e8",
  black: "#000000",
  white: "#ffffff",
};

if (dialog && links.length && typeof dialog.showModal === "function") {
  const img = dialog.querySelector<HTMLImageElement>("[data-lb-img]")!;
  const caption = dialog.querySelector<HTMLElement>("[data-lb-caption]")!;
  const count = dialog.querySelector<HTMLElement>("[data-lb-count]")!;
  const stage = dialog.querySelector<HTMLElement>("[data-lb-stage]")!;
  const live = dialog.querySelector<HTMLElement>("[data-lb-live]");
  stage.style.touchAction = "pan-y"; // vertical scroll stays native; horizontal swipes are ours
  let index = 0;
  let opener: HTMLElement | null = null;

  const preload = (i: number) => {
    const a = links[(i + links.length) % links.length];
    new Image().src = a.href;
  };

  const show = (i: number) => {
    index = (i + links.length) % links.length;
    const a = links[index];
    img.src = a.href;
    img.alt = a.querySelector("img")?.alt ?? "";
    const mat = a.dataset.mat ?? "none";
    img.style.background = MAT[mat] ?? "";
    img.style.padding = MAT[mat] ? "6%" : "";
    caption.textContent = a.dataset.caption ?? img.alt;
    const num = a.dataset.num ?? String(index + 1).padStart(2, "0");
    count.textContent = `${num} / ${String(links.length).padStart(2, "0")}`;
    if (live) live.textContent = `${count.textContent}. ${caption.textContent}`;
    preload(index - 1);
    preload(index + 1);
  };

  links.forEach((a, i) =>
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      opener = a;
      show(i);
      dialog.showModal();
      dialog.querySelector<HTMLElement>("[data-lb-close]")?.focus();
    })
  );

  const close = () => dialog.close();
  dialog.querySelector("[data-lb-close]")!.addEventListener("click", close);
  dialog
    .querySelector("[data-lb-prev]")!
    .addEventListener("click", () => show(index - 1));
  dialog
    .querySelector("[data-lb-next]")!
    .addEventListener("click", () => show(index + 1));

  // Backdrop: the dialog fills the viewport, so a click on itself or the stage gap is outside the image.
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog || e.target === stage) close();
  });
  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(index - 1);
    else if (e.key === "ArrowRight") show(index + 1);
  });

  // Swipe on the stage.
  let sx = 0;
  let sy = 0;
  stage.addEventListener("pointerdown", (e) => {
    sx = e.clientX;
    sy = e.clientY;
  });
  stage.addEventListener("pointerup", (e) => {
    if (e.pointerType === "mouse") return; // swipe is for touch and pen; a mouse drag is not a gesture
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1));
  });

  dialog.addEventListener("close", () => {
    img.removeAttribute("src");
    opener?.focus();
    opener = null;
  });
}
