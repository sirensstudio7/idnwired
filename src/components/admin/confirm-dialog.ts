export type ConfirmOptions = {
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

export function confirmAdminAction(options: ConfirmOptions): Promise<boolean> {
  const dialog = document.querySelector<HTMLDialogElement>("[data-admin-confirm]");
  if (!dialog || typeof dialog.showModal !== "function") {
    return Promise.resolve(window.confirm(`${options.title}\n\n${options.body}`));
  }

  const title = dialog.querySelector("[data-admin-confirm-title]");
  const body = dialog.querySelector("[data-admin-confirm-body]");
  const ok = dialog.querySelector<HTMLButtonElement>("[data-admin-confirm-ok]");
  const cancel = dialog.querySelector<HTMLButtonElement>("[data-admin-confirm-cancel]");

  dialog.dataset.variant = options.danger ? "danger" : "default";
  if (title) title.textContent = options.title;
  if (body) body.textContent = options.body;
  if (ok) {
    ok.textContent = options.confirmLabel ?? "Confirm";
    ok.value = "confirm";
    ok.className = options.danger ? "admin-btn admin-btn--danger-solid" : "admin-btn admin-btn--primary";
    ok.setAttribute("data-admin-confirm-ok", "");
  }
  if (cancel) cancel.textContent = options.cancelLabel ?? "Cancel";

  if (dialog.open) dialog.close("cancel");
  dialog.returnValue = "cancel";

  return new Promise((resolve) => {
    const onBackdrop = (event: MouseEvent) => {
      if (event.target === dialog) dialog.close("cancel");
    };

    const finish = () => {
      dialog.removeEventListener("close", finish);
      dialog.removeEventListener("click", onBackdrop);
      resolve(dialog.returnValue === "confirm");
    };

    dialog.addEventListener("close", finish);
    dialog.addEventListener("click", onBackdrop);
    dialog.showModal();
    ok?.focus();
  });
}
