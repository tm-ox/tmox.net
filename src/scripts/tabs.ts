// ARIA tabs (components/Tabs.astro): click, ← → (or h l), Home and End move between tabs; only the chosen
// panel is shown. The choice is kept while the page stays open.
for (const list of document.querySelectorAll<HTMLElement>('[role="tablist"]')) {
  const tabs = [...list.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const select = (tab: HTMLButtonElement, focus = false) => {
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls") ?? "");
      if (panel) panel.hidden = !on;
    }
    if (focus) tab.focus();
  };
  list.addEventListener("click", (e) => {
    const tab = e.target instanceof Element ? e.target.closest<HTMLButtonElement>('[role="tab"]') : null;
    if (tab) select(tab);
  });
  list.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const i = tabs.findIndex((t) => t === document.activeElement);
    if (i < 0) return;
    const go: Record<string, number> = {
      ArrowRight: i + 1,
      l: i + 1,
      ArrowLeft: i - 1,
      h: i - 1,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!(e.key in go)) return;
    e.preventDefault();
    select(tabs[(go[e.key] + tabs.length) % tabs.length], true);
  });
}
