const VIEW_KEY = "idnwired-news-view";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function syncUrl(category: string, query: string): void {
  const url = new URL(window.location.href);
  if (category && category !== "all") url.searchParams.set("category", category);
  else url.searchParams.delete("category");
  if (query) url.searchParams.set("q", query);
  else url.searchParams.delete("q");
  const next = `${url.pathname}${url.search}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next !== current) window.history.replaceState({}, "", next);
}

export function initNewsIndex(): void {
  const root = document.querySelector<HTMLElement>("[data-news-root]");
  if (!root || root.dataset.newsBound === "1") return;
  root.dataset.newsBound = "1";

  const search = root.querySelector<HTMLInputElement>("[data-news-search]");
  const dropdown = root.querySelector<HTMLElement>("[data-news-category]");
  const trigger = dropdown?.querySelector<HTMLButtonElement>("[data-news-category-trigger]");
  const menu = dropdown?.querySelector<HTMLElement>("[data-news-category-menu]");
  const label = dropdown?.querySelector<HTMLElement>("[data-news-category-label]");
  const options = [...(dropdown?.querySelectorAll<HTMLButtonElement>("[data-news-category-option]") ?? [])];
  const posts = [...root.querySelectorAll<HTMLElement>("[data-news-post]")];
  const empty = root.querySelector<HTMLElement>("[data-news-empty]");
  const viewButtons = [...root.querySelectorAll<HTMLButtonElement>("[data-news-view]")];

  let category = root.dataset.newsCategory || "all";
  let view = root.dataset.newsView === "grid" ? "grid" : "list";

  try {
    const stored = window.localStorage.getItem(VIEW_KEY);
    if (stored === "grid" || stored === "list") view = stored;
  } catch {
    /* ignore */
  }

  const page = root.closest(".news-index") ?? root;

  const applyView = (next: string): void => {
    view = next === "grid" ? "grid" : "list";
    page.classList.toggle("is-grid", view === "grid");
    root.classList.toggle("is-grid", view === "grid");
    viewButtons.forEach((btn) => {
      const active = btn.dataset.newsView === view;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
    try {
      window.localStorage.setItem(VIEW_KEY, view);
    } catch {
      /* ignore */
    }
  };

  const applyFilters = (): void => {
    const q = normalize(search?.value ?? "");
    let visible = 0;
    posts.forEach((post) => {
      const haystack = post.getAttribute("data-search") ?? "";
      const postCategory = post.getAttribute("data-category") ?? "";
      const matchesQuery = !q || haystack.includes(q);
      const matchesCategory = category === "all" || postCategory === category;
      const show = matchesQuery && matchesCategory;
      post.hidden = !show;
      if (show) visible += 1;
    });
    if (empty) empty.hidden = visible > 0 || posts.length === 0;
    syncUrl(category, q);
  };

  const closeMenu = (): void => {
    if (!dropdown || !trigger || !menu) return;
    dropdown.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  };

  const openMenu = (): void => {
    if (!dropdown || !trigger || !menu) return;
    dropdown.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    menu.hidden = false;
  };

  const selectCategory = (next: string): void => {
    const option = options.find((opt) => opt.dataset.newsCategoryOption === next) ?? options[0];
    if (!option) return;
    category = option.dataset.newsCategoryOption || "all";
    if (label) label.textContent = option.textContent?.trim() || "All categories";
    options.forEach((opt) => {
      const selected = opt === option;
      opt.classList.toggle("is-selected", selected);
      opt.setAttribute("aria-selected", selected ? "true" : "false");
    });
    closeMenu();
    applyFilters();
  };

  trigger?.addEventListener("click", (event) => {
    event.stopPropagation();
    if (dropdown?.classList.contains("is-open")) closeMenu();
    else openMenu();
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      selectCategory(option.dataset.newsCategoryOption || "all");
    });
  });

  document.addEventListener("click", (event) => {
    if (!dropdown?.contains(event.target as Node)) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  search?.addEventListener("input", applyFilters);
  search?.addEventListener("search", applyFilters);

  viewButtons.forEach((btn) => {
    btn.addEventListener("click", () => applyView(btn.dataset.newsView || "list"));
  });

  root.querySelectorAll<HTMLAnchorElement>("[data-news-category-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const next = link.dataset.newsCategoryLink;
      if (!next) return;
      event.preventDefault();
      selectCategory(next);
    });
  });

  root.querySelector("[data-news-reset]")?.addEventListener("click", (event) => {
    event.preventDefault();
    if (search) search.value = "";
    selectCategory("all");
  });

  applyView(view);
  selectCategory(category);
}
