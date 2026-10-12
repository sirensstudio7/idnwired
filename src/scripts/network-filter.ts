function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function initCategoryDropdown(
  root: HTMLElement,
  onChange: (value: string) => void,
): string {
  const dropdown = root.querySelector<HTMLElement>(
    "[data-network-category-dropdown]",
  );
  if (!dropdown) return "all";

  const trigger = dropdown.querySelector<HTMLButtonElement>(
    "[data-network-category-trigger]",
  );
  const menu = dropdown.querySelector<HTMLElement>("[data-network-category-menu]");
  const label = dropdown.querySelector<HTMLElement>(
    "[data-network-category-label]",
  );
  const clearBtn = dropdown.querySelector<HTMLButtonElement>(
    "[data-network-category-clear]",
  );
  const options = dropdown.querySelectorAll<HTMLButtonElement>(
    "[data-network-category-option]",
  );
  const allOption = dropdown.querySelector<HTMLButtonElement>(
    '[data-network-category-option="all"]',
  );

  if (!trigger || !menu || !options.length || !allOption) return "all";

  let value =
    dropdown.querySelector<HTMLButtonElement>(
      ".network-filter-option.is-selected",
    )?.dataset.networkCategoryOption ?? "all";

  const close = (): void => {
    dropdown.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    menu.setAttribute("hidden", "");
  };

  const open = (): void => {
    dropdown.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    menu.removeAttribute("hidden");
  };

  const syncClear = (): void => {
    const filtered = value !== "all";
    trigger.classList.toggle("is-filtered", filtered);
    if (clearBtn) {
      clearBtn.hidden = !filtered;
    }
  };

  const select = (next: string, optionEl: HTMLButtonElement): void => {
    value = next;
    if (label) {
      label.textContent = optionEl.textContent?.trim() ?? label.textContent;
    }
    options.forEach((opt) => {
      const selected = opt === optionEl;
      opt.classList.toggle("is-selected", selected);
      opt.setAttribute("aria-selected", selected ? "true" : "false");
    });
    syncClear();
    close();
    onChange(value);
  };

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    if (dropdown.classList.contains("is-open")) close();
    else open();
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      select(option.dataset.networkCategoryOption ?? "all", option);
    });
  });

  clearBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    select("all", allOption);
  });

  syncClear();

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target as Node)) close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });

  return value;
}

export function initNetworkFilter(): void {
  const root = document.querySelector<HTMLElement>("[data-network-root]");
  if (!root || root.dataset.networkFilterReady === "true") return;
  root.dataset.networkFilterReady = "true";

  const searchInput = root.querySelector<HTMLInputElement>("[data-network-search]");
  const categories = root.querySelectorAll<HTMLElement>(
    "[data-network-category-section]",
  );
  const emptyEl = root.querySelector<HTMLElement>("[data-network-empty]");

  if (!searchInput || !categories.length) return;

  let activeCategory = "all";

  const apply = (): void => {
    const query = normalize(searchInput.value);
    let visibleOutlets = 0;

    categories.forEach((section) => {
      const sectionId = section.dataset.networkCategorySection ?? "";
      const categoryMatches =
        activeCategory === "all" || sectionId === activeCategory;

      if (!categoryMatches) {
        section.hidden = true;
        section.classList.add("is-filtered-out");
        return;
      }

      let sectionVisible = 0;
      const items = section.querySelectorAll<HTMLElement>("[data-outlet-name]");

      items.forEach((item) => {
        const name = normalize(item.dataset.outletName ?? "");
        const matches = !query || name.includes(query);
        item.hidden = !matches;
        item.classList.toggle("is-filtered-out", !matches);
        if (matches) sectionVisible += 1;
      });

      const showSection = sectionVisible > 0;
      section.hidden = !showSection;
      section.classList.toggle("is-filtered-out", !showSection);

      if (showSection) {
        visibleOutlets += sectionVisible;
      }
    });

    if (emptyEl) {
      emptyEl.hidden = visibleOutlets > 0;
    }
  };

  activeCategory = initCategoryDropdown(root, (next) => {
    activeCategory = next;
    apply();
  });

  searchInput.addEventListener("input", apply);

  apply();
}
