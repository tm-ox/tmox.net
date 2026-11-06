// Opens and closes the page's <dialog class="modal"> elements. Triggers are plain links or buttons
// with data-modal-open="<dialog id>"; a URL hash equal to a dialog id opens it on page load (shared
// links, and the footer links on pages without the dialogs). Esc and focus return are native.
// Where the page has no such dialog, a trigger link just navigates (to its href, e.g. "/#contact").
const dialogFor = (id: string | undefined) => {
  const d = id ? document.getElementById(id) : null;
  return d instanceof HTMLDialogElement ? d : null;
};

const openModal = (d: HTMLDialogElement) => {
  if (!d.open) d.showModal();
};

document.addEventListener("click", (e) => {
  const from = e.target instanceof Element ? e.target : null;
  const trigger = from?.closest<HTMLElement>("[data-modal-open]");
  const target = dialogFor(trigger?.dataset.modalOpen);
  if (trigger && target) {
    // modified clicks on a link keep their normal meaning (open the PDF in a new tab, and so on)
    if (trigger instanceof HTMLAnchorElement && (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return;
    e.preventDefault();
    openModal(target);
    return;
  }
  from?.closest("[data-modal-close]")?.closest("dialog")?.close();
});

// A dialog opened from the hash leaves the hash behind; clear it on close so a reload does not reopen it.
document.addEventListener("close", (e) => {
  if (e.target instanceof HTMLDialogElement && location.hash === `#${e.target.id}`)
    history.replaceState(null, "", location.pathname + location.search);
}, true);

const openFromHash = () => {
  const d = dialogFor(location.hash.slice(1));
  if (d) openModal(d);
};
openFromHash();
addEventListener("hashchange", openFromHash);
