/**
 * Resolves relative URLs in Markdown (links and images) against GitHub raw/blob paths.
 * Rejects unsafe URL schemes (javascript:, data:, vbscript:).
 */
export function resolveMarkdownUrl(
  url: string,
  owner: string,
  repoName: string,
  branch: string = "main",
  docPath: string = "README.md",
  isImage: boolean = false
): string {
  if (!url || typeof url !== "string") return "#";
  const trimmed = url.trim();

  // Anchors inside the page
  if (trimmed.startsWith("#")) return trimmed;

  const lower = trimmed.toLowerCase();
  // Reject unsafe schemes
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:")
  ) {
    return "#";
  }

  // Absolute HTTP / HTTPS / Mailto
  if (
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    lower.startsWith("mailto:")
  ) {
    return trimmed;
  }

  // Relative path resolution
  const docDir = docPath.includes("/") ? docPath.slice(0, docPath.lastIndexOf("/")) : "";
  const cleanPath = trimmed.startsWith("./")
    ? trimmed.slice(2)
    : trimmed.startsWith("/")
    ? trimmed.slice(1)
    : trimmed;

  const fullPath = docDir ? `${docDir}/${cleanPath}` : cleanPath;

  if (isImage) {
    return `https://raw.githubusercontent.com/${owner}/${repoName}/${branch}/${fullPath}`;
  }
  return `https://github.com/${owner}/${repoName}/blob/${branch}/${fullPath}`;
}
