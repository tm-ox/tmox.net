// Opens and closes the page's <dialog class="modal"> elements.
//
// Triggers are plain links or buttons with data-modal-open="<dialog id>"; a URL hash equal to a dialog id opens
// it on page load (shared links, and the menu links on pages without the dialogs). Where the page has no such
// dialog, a trigger link just navigates (to its href, e.g. "/#contact").
//
// Dialogs are non-modal (show(), not showModal()) so the layout header (logo and site menu) stays above them and
// usable. This script supplies what showModal() would have: Esc, focus return and an inert page behind.
// syncState() is the one place that reflects which dialog is open: the inert page, html[data-portfolio] (the
// header folds into the portfolio, see "Site header" in global.css) and the site menu's aria-current.
const root = document.documentElement;
const menu = document.querySelector<HTMLElement>(".site-menu");
const home = menu?.querySelector<HTMLElement>('a[href="/"]');
const homeCurrent = home?.getAttribute("aria-current") ?? null; // "page" on the home page, set by SiteNav
let lastTrigger: HTMLElement | null = null;
let pushed = false; // this script added a history entry (#id) for the open dialog, so closing it goes back
let switching = false; // one dialog is being swapped for another: not a real close

const dialogFor = (id: string | undefined) => {
  const d = id ? document.getElementById(id) : null;
  return d instanceof HTMLDialogElement ? d : null;
};
const openDialogs = () => [...document.querySelectorAll<HTMLDialogElement>("dialog.modal[open]")];
const modified = (e: MouseEvent) => e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;

const syncState = () => {
  const open = openDialogs();
  // everything in <main> that is not a dialog is inert while one is open (the header is outside <main>)
  document.querySelectorAll<HTMLElement>("main > :not(dialog)").forEach((el) => (el.inert = open.length > 0));
  root.toggleAttribute("data-portfolio", open.some((d) => d.id === "portfolio"));
  menu?.querySelectorAll<HTMLElement>("[data-modal-open]").forEach((b) => {
    if (open.some((d) => d.id === b.dataset.modalOpen)) b.setAttribute("aria-current", "true");
    else b.removeAttribute("aria-current");
  });
  if (home && homeCurrent) {
    if (open.length) home.removeAttribute("aria-current");
    else home.setAttribute("aria-current", homeCurrent);
  }
};

const coarse = matchMedia("(pointer: coarse)");
const openModal = (d: HTMLDialogElement, from?: HTMLElement | null) => {
  // switching dialogs from the site menu: close the open one so they do not stack
  const wasOpen = openDialogs().length > 0;
  switching = true;
  openDialogs().forEach((o) => o !== d && o.close());
  switching = false;
  if (from) {
    lastTrigger = from;
    // Back (Android, iOS edge swipe) closes the dialog instead of leaving the site
    if (location.hash !== `#${d.id}`) {
      if (wasOpen || pushed) history.replaceState(null, "", `#${d.id}`);
      else (history.pushState(null, "", `#${d.id}`), (pushed = true));
    }
  }
  if (!d.open) d.show();
  syncState();
  // no auto-focused field on touch: it would raise the keyboard before anything has been read
  const first = coarse.matches
    ? null
    : (d.querySelector<HTMLElement>("[autofocus]") ??
      d.querySelector<HTMLElement>('input:not([type=hidden]):not([tabindex="-1"]),textarea,button,a[href]'));
  (first ?? d).focus({ preventScroll: true });
};

document.addEventListener("click", (e) => {
  const from = e.target instanceof Element ? e.target : null;
  const trigger = from?.closest<HTMLElement>("[data-modal-open]");
  const target = dialogFor(trigger?.dataset.modalOpen);
  if (trigger && target) {
    // modified clicks on a link keep their normal meaning (open the PDF in a new tab, and so on)
    if (trigger instanceof HTMLAnchorElement && modified(e)) return;
    e.preventDefault();
    openModal(target, trigger);
    return;
  }
  // The logo, Home and the Close box close the open dialog (the home page is what is underneath, so a reload
  // would be wasted). With none open (another page) they navigate as usual; modified clicks keep their meaning.
  const closer = from?.closest<HTMLElement>("[data-modal-close]");
  const open = openDialogs();
  if (!closer || !open.length) return;
  if (closer instanceof HTMLAnchorElement && modified(e)) return;
  e.preventDefault();
  open.forEach((d) => d.close());
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || e.defaultPrevented || e.isComposing) return;
  const open = openDialogs();
  if (!open.length) return;
  e.preventDefault();
  open.forEach((d) => d.close());
});

// Every close, whoever caused it (the close event does not bubble, hence the capture phase): reflect the new
// state, clear a hash a dialog was opened from (a reload must not reopen it), and give focus back.
document.addEventListener(
  "close",
  (e) => {
    if (!(e.target instanceof HTMLDialogElement)) return;
    if (!switching && location.hash === `#${e.target.id}`) {
      if (pushed) history.back();
      else history.replaceState(null, "", location.pathname + location.search);
      pushed = false;
    }
    syncState();
    if (!openDialogs().length) (lastTrigger?.isConnected ? lastTrigger : home)?.focus({ preventScroll: true });
  },
  true,
);

const openFromHash = () => {
  const d = dialogFor(location.hash.slice(1));
  if (d) openModal(d);
  else if (openDialogs().length) {
    pushed = false; // Back or Forward left the dialog's entry
    openDialogs().forEach((o) => o.close());
  }
};
openFromHash();
addEventListener("hashchange", openFromHash);
