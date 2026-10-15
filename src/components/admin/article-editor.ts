import { isEditorHtmlEmpty, sanitizeArticleHtml } from "../../lib/news/html";

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function currentBlock(): string {
  const value = document.queryCommandValue("formatBlock").toLowerCase();
  if (value.includes("h2")) return "h2";
  if (value.includes("h3")) return "h3";
  if (value.includes("blockquote")) return "blockquote";
  return "p";
}

function formatBlock(tag: string) {
  document.execCommand("formatBlock", false, tag);
  if (currentBlock() !== tag) {
    document.execCommand("formatBlock", false, `<${tag}>`);
  }
}

function blockFromNode(canvas: HTMLElement, node: Node | null): HTMLElement | null {
  if (!node || !canvas.contains(node)) return null;
  const el = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
  const block = el?.closest("p, h2, h3, blockquote, li") as HTMLElement | null;
  if (!block || !canvas.contains(block) || block === canvas) return null;
  return block;
}

function isBlockEmpty(el: HTMLElement) {
  if (el.querySelector("img")) return false;
  return (el.textContent ?? "").replace(/\u00a0/g, " ").trim().length === 0;
}

export function bindArticleEditor(
  root: HTMLElement,
  options: {
    textarea: HTMLTextAreaElement;
    onBusy?: (busy: boolean) => void;
  },
) {
  const canvas = root.querySelector("[data-editor-canvas]") as HTMLElement | null;
  const toolbar = root.querySelector("[data-format-toolbar]") as HTMLElement | null;
  const tipMain = root.querySelector("[data-tip-main]") as HTMLElement | null;
  const plus = root.querySelector("[data-plus]") as HTMLButtonElement | null;
  const insertMenu = root.querySelector("[data-insert-menu]") as HTMLElement | null;
  const imageInput = root.querySelector("[data-editor-image]") as HTMLInputElement | null;
  const status = root.querySelector("[data-editor-status]") as HTMLElement | null;
  const linkPopover = root.querySelector("[data-link-popover]") as HTMLElement | null;
  const linkUrl = root.querySelector("[data-link-url]") as HTMLInputElement | null;
  const savedRange = { current: null as Range | null };
  let busy = false;
  let plusOpen = false;
  let linkMode = false;

  if (!canvas || !toolbar) {
    return {
      sync: () => undefined,
      isBusy: () => false,
    };
  }

  const setBusy = (next: boolean) => {
    busy = next;
    options.onBusy?.(next);
  };

  const syncEmpty = () => {
    canvas.classList.toggle("is-empty", isEditorHtmlEmpty(canvas.innerHTML));
  };

  const sync = () => {
    const html = sanitizeArticleHtml(canvas.innerHTML);
    options.textarea.value = isEditorHtmlEmpty(html) ? "" : html;
    syncEmpty();
  };

  const restoreSelection = () => {
    const range = savedRange.current;
    if (!range) return;
    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const rememberSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    if (!canvas.contains(selection.anchorNode)) return;
    savedRange.current = selection.getRangeAt(0).cloneRange();
  };

  const hideTip = () => {
    toolbar.hidden = true;
    linkMode = false;
    if (linkPopover) linkPopover.hidden = true;
    if (tipMain) tipMain.hidden = false;
  };

  const hidePlus = () => {
    plusOpen = false;
    if (plus) {
      plus.hidden = true;
      plus.classList.remove("is-open");
    }
    if (insertMenu) insertMenu.hidden = true;
  };

  const placeOver = (el: HTMLElement, x: number, y: number) => {
    const maxX = Math.max(8, root.clientWidth - el.offsetWidth - 8);
    el.style.left = `${Math.min(Math.max(8, x), maxX)}px`;
    el.style.top = `${Math.max(8, y)}px`;
  };

  const updateTip = () => {
    const selection = window.getSelection();
    if (linkMode) return;
    if (
      !selection ||
      selection.rangeCount === 0 ||
      selection.isCollapsed ||
      !canvas.contains(selection.anchorNode)
    ) {
      hideTip();
      return;
    }

    hidePlus();
    rememberSelection();
    toolbar.hidden = false;
    if (tipMain) tipMain.hidden = false;
    if (linkPopover) linkPopover.hidden = true;

    toolbar.querySelectorAll("[data-command]").forEach((button) => {
      const command = button.getAttribute("data-command");
      if (!command || command === "createLink" || command === "blockquote") return;
      button.classList.toggle("is-active", document.queryCommandState(command));
    });
    const tag = currentBlock();
    toolbar.querySelectorAll("[data-block]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-block") === tag);
    });
    toolbar.querySelector("[data-command='blockquote']")?.classList.toggle("is-active", tag === "blockquote");

    const rect = selection.getRangeAt(0).getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    const tipW = toolbar.offsetWidth || 220;
    const tipH = toolbar.offsetHeight || 42;
    const x = rect.left + rect.width / 2 - rootRect.left - tipW / 2;
    const above = rect.top - rootRect.top - tipH - 10;
    const y = above < 8 ? rect.bottom - rootRect.top + 10 : above;
    placeOver(toolbar, x, y);
  };

  const updatePlus = () => {
    if (!plus) return;
    const selection = window.getSelection();
    if (!selection || !selection.isCollapsed || !canvas.contains(selection.anchorNode)) {
      if (!plusOpen) hidePlus();
      return;
    }
    if (!toolbar.hidden) return;

    const block = blockFromNode(canvas, selection.anchorNode);
    const emptyEditor = isEditorHtmlEmpty(canvas.innerHTML);
    if (!emptyEditor && (!block || !isBlockEmpty(block))) {
      hidePlus();
      return;
    }

    plus.hidden = false;
    plus.style.left = "8px";
    const rootRect = root.getBoundingClientRect();
    if (block) {
      const blockRect = block.getBoundingClientRect();
      plus.style.top = `${blockRect.top - rootRect.top + Math.max(0, (blockRect.height - 32) / 2)}px`;
    } else {
      plus.style.top = "8px";
    }
    if (plusOpen && insertMenu) {
      insertMenu.hidden = false;
      insertMenu.style.left = "56px";
      insertMenu.style.top = plus.style.top;
    }
  };

  const closeInsert = () => {
    plusOpen = false;
    plus?.classList.remove("is-open");
    if (insertMenu) insertMenu.hidden = true;
  };

  const insertHtml = (html: string) => {
    canvas.focus();
    restoreSelection();
    document.execCommand("insertHTML", false, html);
    sync();
    updateTip();
    updatePlus();
  };

  const runCommand = (command: string) => {
    canvas.focus();
    restoreSelection();
    if (command === "createLink") {
      linkMode = true;
      if (tipMain) tipMain.hidden = true;
      if (linkPopover) linkPopover.hidden = false;
      toolbar.hidden = false;
      linkUrl?.focus();
      return;
    }
    if (command === "insertImage") {
      imageInput?.click();
      closeInsert();
      return;
    }
    if (command === "blockquote") {
      formatBlock(currentBlock() === "blockquote" ? "p" : "blockquote");
    } else {
      document.execCommand(command, false);
    }
    sync();
    updateTip();
    updatePlus();
  };

  const uploadImage = async (file: File) => {
    setBusy(true);
    if (status) {
      status.hidden = false;
      status.textContent = "Uploading image…";
    }

    const body = new FormData();
    body.set("kind", "body");
    body.set("file", file);

    try {
      const res = await fetch("/api/admin/media", { method: "POST", body });
      const json = (await res.json()) as { error?: string; url?: string };
      if (!res.ok || !json.url) {
        if (status) status.textContent = json.error ?? "Upload failed.";
        return;
      }
      const alt =
        window.prompt("Describe this image for accessibility (alt text)", file.name.replace(/\.[^.]+$/, "")) ??
        "";
      insertHtml(
        `<img src="${escapeAttr(json.url)}" alt="${escapeAttr(alt.trim().slice(0, 160))}">`,
      );
      if (status) status.textContent = "Image added.";
    } catch {
      if (status) status.textContent = "Upload failed. Try again.";
    } finally {
      setBusy(false);
    }
  };

  document.execCommand("defaultParagraphSeparator", false, "p");
  syncEmpty();

  canvas.addEventListener("input", () => {
    if (canvas.firstChild?.nodeType === Node.TEXT_NODE) {
      document.execCommand("formatBlock", false, "p");
    }
    sync();
    updatePlus();
  });
  canvas.addEventListener("keyup", () => {
    rememberSelection();
    updateTip();
    updatePlus();
  });
  canvas.addEventListener("mouseup", () => {
    rememberSelection();
    updateTip();
    updatePlus();
  });
  canvas.addEventListener("mousedown", () => {
    if (plusOpen) closeInsert();
  });
  canvas.addEventListener("focus", () => {
    if (isEditorHtmlEmpty(canvas.innerHTML) && !canvas.querySelector("p, h2, h3")) {
      canvas.innerHTML = "<p><br></p>";
    }
    rememberSelection();
    syncEmpty();
    updatePlus();
  });
  canvas.addEventListener("scroll", () => {
    updateTip();
    updatePlus();
  });

  canvas.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      rememberSelection();
      runCommand("createLink");
    }
  });

  canvas.addEventListener("paste", (event) => {
    const clipboard = event.clipboardData;
    if (!clipboard) return;
    const file = [...clipboard.files].find((item) => item.type.startsWith("image/"));
    if (file) {
      event.preventDefault();
      void uploadImage(file);
      return;
    }
    const html = clipboard.getData("text/html");
    const text = clipboard.getData("text/plain");
    event.preventDefault();
    if (html) insertHtml(sanitizeArticleHtml(html));
    else document.execCommand("insertText", false, text);
    sync();
  });

  canvas.addEventListener("drop", (event) => {
    const file = [...(event.dataTransfer?.files ?? [])].find((item) => item.type.startsWith("image/"));
    if (!file) return;
    event.preventDefault();
    void uploadImage(file);
  });

  toolbar.addEventListener("mousedown", (event) => {
    if ((event.target as HTMLElement | null)?.closest("button")) event.preventDefault();
  });

  toolbar.querySelectorAll("[data-command]").forEach((button) => {
    button.addEventListener("click", () => {
      const command = button.getAttribute("data-command");
      if (command) runCommand(command);
    });
  });

  toolbar.querySelectorAll("[data-block]").forEach((button) => {
    button.addEventListener("click", () => {
      const tag = button.getAttribute("data-block") || "p";
      canvas.focus();
      restoreSelection();
      formatBlock(currentBlock() === tag ? "p" : tag);
      sync();
      updateTip();
    });
  });

  plus?.addEventListener("mousedown", (event) => event.preventDefault());
  plus?.addEventListener("click", () => {
    plusOpen = !plusOpen;
    plus.classList.toggle("is-open", plusOpen);
    if (!insertMenu) return;
    insertMenu.hidden = !plusOpen;
    if (plusOpen) {
      insertMenu.style.left = "56px";
      insertMenu.style.top = plus.style.top;
    }
  });

  insertMenu?.addEventListener("mousedown", (event) => event.preventDefault());
  insertMenu?.querySelectorAll("[data-command]").forEach((button) => {
    button.addEventListener("click", () => {
      const command = button.getAttribute("data-command");
      if (command) runCommand(command);
      closeInsert();
    });
  });
  insertMenu?.querySelectorAll("[data-block]").forEach((button) => {
    button.addEventListener("click", () => {
      const tag = button.getAttribute("data-block") || "h2";
      canvas.focus();
      restoreSelection();
      formatBlock(tag);
      closeInsert();
      sync();
      updatePlus();
    });
  });

  document.addEventListener("mousedown", (event) => {
    const target = event.target as Node | null;
    if (!root.contains(target)) {
      hideTip();
      hidePlus();
    }
  });

  document.addEventListener("selectionchange", () => {
    if (!canvas.contains(window.getSelection()?.anchorNode ?? null) && !root.contains(document.activeElement)) {
      hideTip();
      return;
    }
    updateTip();
    updatePlus();
  });

  imageInput?.addEventListener("change", () => {
    const file = imageInput.files?.[0];
    imageInput.value = "";
    if (file) void uploadImage(file);
  });

  linkPopover?.querySelector("[data-link-apply]")?.addEventListener("click", () => {
    const url = linkUrl?.value.trim() ?? "";
    linkMode = false;
    if (linkPopover) linkPopover.hidden = true;
    if (tipMain) tipMain.hidden = false;
    if (!url) {
      updateTip();
      return;
    }
    canvas.focus();
    restoreSelection();
    const selection = window.getSelection();
    if (selection && selection.isCollapsed) {
      insertHtml(
        `<a href="${escapeAttr(url)}" rel="noopener noreferrer" target="_blank">${escapeText(url)}</a>`,
      );
    } else {
      document.execCommand("createLink", false, url);
      sync();
    }
    hideTip();
  });

  linkPopover?.querySelector("[data-link-remove]")?.addEventListener("click", () => {
    linkMode = false;
    canvas.focus();
    restoreSelection();
    document.execCommand("unlink", false);
    sync();
    hideTip();
  });

  linkUrl?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      (linkPopover?.querySelector("[data-link-apply]") as HTMLButtonElement | null)?.click();
    }
    if (event.key === "Escape") {
      linkMode = false;
      if (linkPopover) linkPopover.hidden = true;
      if (tipMain) tipMain.hidden = false;
      canvas.focus();
      updateTip();
    }
  });

  return { sync, isBusy: () => busy };
}
