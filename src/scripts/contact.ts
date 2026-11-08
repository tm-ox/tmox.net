// Contact form: send in place (Netlify Forms accepts a urlencoded POST to "/"), then swap the form
// for a thank-you block inside the modal. Without JS the form posts to /sent as a normal page.
document.addEventListener("submit", async (e) => {
  const form = e.target instanceof HTMLFormElement && e.target.matches("[data-contact]") ? e.target : null;
  if (!form) return;
  e.preventDefault();
  const error = form.querySelector<HTMLElement>("[data-error]");
  const done = form.parentElement?.querySelector<HTMLElement>("[data-done]");
  const button = form.querySelector<HTMLButtonElement>("button[type=submit]");
  if (error) error.textContent = "";
  if (button) button.disabled = true;
  try {
    const body = new URLSearchParams([...new FormData(form)].map(([k, v]) => [k, String(v)])).toString();
    const res = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(15000), // a hung request must not leave the button disabled for good
    });
    if (!res.ok) throw new Error(String(res.status));
    form.hidden = true;
    form.parentElement?.querySelector<HTMLElement>(".split-intro")?.setAttribute("hidden", "");
    if (done) {
      done.hidden = false;
      done.focus();
    }
  } catch {
    if (error) error.textContent = error.dataset.message ?? "";
    if (button) button.disabled = false;
  }
});

// A phone's on-screen keyboard covers the lower fields: bring the focused one into view once the layout has resized.
document.addEventListener("focusin", (e) => {
  const el = e.target;
  if (el instanceof HTMLElement && el.closest("[data-contact]") && el.matches("input,textarea")) {
    setTimeout(() => el.scrollIntoView({ block: "center", behavior: "smooth" }), 300);
  }
});
