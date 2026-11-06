// Contact form: send in place (Netlify Forms accepts a urlencoded POST to "/"), then swap the form
// for a thank-you block inside the modal. Without JS the form posts to /sent as a normal page.
document.addEventListener("submit", async (e) => {
  const form = e.target instanceof HTMLFormElement && e.target.matches("[data-contact]") ? e.target : null;
  if (!form) return;
  e.preventDefault();
  const error = form.querySelector<HTMLElement>("[data-error]");
  const done = form.parentElement?.querySelector<HTMLElement>("[data-done]");
  const button = form.querySelector<HTMLButtonElement>("button[type=submit]");
  if (error) error.hidden = true;
  if (button) button.disabled = true;
  try {
    const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString();
    const res = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) throw new Error(String(res.status));
    form.hidden = true;
    form.parentElement?.querySelector<HTMLElement>(".contact-intro")?.setAttribute("hidden", "");
    if (done) {
      done.hidden = false;
      done.focus();
    }
  } catch {
    if (error) error.hidden = false;
    if (button) button.disabled = false;
  }
});
