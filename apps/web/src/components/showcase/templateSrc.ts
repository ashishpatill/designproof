/** Iframe document URL for a showcase template (cached HTML API). */
export function templateHtmlSrc(key: string): string {
  if (key === "crease") return "/crease";
  if (key === "baseline") return "/baseline";
  return `/api/design/html?showcase=${encodeURIComponent(key)}`;
}

/** Template open URL — engine templates under /showcase/*, sport templates under live routes. */
export function templateOpenHref(key: string): string {
  if (key === "crease") return "/crease";
  if (key === "baseline") return "/baseline";
  return `/showcase/${key}`;
}
