const openSelects = new Set<() => void>();

export function bindAdminCustomSelect(root: Element) {
  if (!(root instanceof HTMLElement) || root.dataset.selectBound === "1") return;
  root.dataset.selectBound = "1";

  const trigger = root.querySelector<HTMLButtonElement>(".admin-custom-select__trigger");
  const menu = root.querySelector<HTMLElement>(".admin-custom-select__menu");
  const hidden = root.querySelector<HTMLInputElement>("input[type='hidden']");
  const label = root.querySelector("[data-select-label]");
  const options = [...root.querySelectorAll<HTMLElement>(".admin-custom-select__option")];
  if (!trigger || !menu) return;

  const close = () => {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  };

  const open = () => {
    openSelects.forEach((fn) => {
      if (fn !== close) fn();
    });
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
  };

  openSelects.add(close);

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    if (menu.hidden) open();
    else close();
  });

  options.forEach((opt) => {
    opt.addEventListener("click", () => {
      const value = opt.getAttribute("data-value");
      if (value == null) return;
      if (hidden) hidden.value = value;
      if (label) label.textContent = opt.textContent?.trim() ?? value;
      options.forEach((item) => {
        item.setAttribute("aria-selected", item === opt ? "true" : "false");
      });
      close();
    });
  });

  document.addEventListener("click", (event) => {
    if (!root.contains(event.target as Node)) close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

export function bindAdminCustomSelects(scope: ParentNode = document) {
  scope.querySelectorAll("[data-admin-custom-select]").forEach(bindAdminCustomSelect);
}
