// Native <dialog> lightbox. Thumbnails are plain links to the large image
// (work without JS); with JS they open the single dialog on the page.
const dialog = document.querySelector<HTMLDialogElement>("#lightbox");
const links = Array.from(
  document.querySelectorAll<HTMLAnchorElement>("[data-lightbox]")
);

if (dialog && links.length && typeof dialog.showModal === "function") {
  const img = dialog.querySelector<HTMLImageElement>("[data-lb-img]")!;
  const caption = dialog.querySelector<HTMLElement>("[data-lb-caption]")!;
  let index = 0;
  let opener: HTMLElement | null = null;

  const show = (i: number) => {
    index = (i + links.length) % links.length;
    const a = links[index];
    const alt = a.querySelector("img")?.alt ?? "";
    img.src = a.href;
    img.alt = alt;
    caption.textContent = alt;
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

  // Backdrop: the dialog fills the viewport, so a click on itself is outside the content.
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) close();
  });
  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(index - 1);
    else if (e.key === "ArrowRight") show(index + 1);
  });
  dialog.addEventListener("close", () => {
    img.removeAttribute("src");
    opener?.focus();
    opener = null;
  });
}
