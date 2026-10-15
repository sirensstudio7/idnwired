import { confirmAdminAction } from "./confirm-dialog";

export async function deleteArticle(id: string, title: string) {
  const label = title.trim() || "this article";
  const ok = await confirmAdminAction({
    title: "Delete article?",
    body: `“${label}” will be permanently removed. This cannot be undone.`,
    confirmLabel: "Delete article",
    danger: true,
  });
  if (!ok) return false;

  const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
  let json: { error?: string } = {};
  try {
    json = (await res.json()) as { error?: string };
  } catch {
    json = {};
  }

  if (!res.ok) {
    window.alert(json.error ?? "Could not delete the article.");
    return false;
  }

  return true;
}
