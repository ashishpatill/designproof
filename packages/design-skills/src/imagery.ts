/**
 * S5 imagery stage — deterministic, zero-LLM.
 *
 * Roadmap step 2 of the concept-first plan (Book III §3, §5): `SectionSpec` gains a media slot
 * (source · licence · alt · focalPoint · artDirectionNote), and a dedicated stage places the
 * brief's real assets before the key screen is composed.
 *
 * Rules this module enforces, each learned from a shipped failure:
 *   - Only brief-supplied assets are placed. Nothing is invented and no stock is pulled in
 *     silently (the loom template cycled three stock photos through six cells, so two tiles
 *     showed the same shirt).
 *   - One asset, one slot. Never cycled.
 *   - An empty slot is reported as a gap. It is not back-filled with an SVG schematic.
 *   - Raster imagery and SVG drawings are measured separately; SVG credit is capped
 *     (the old blind evaluation counted `svg` the same as `img`).
 */
import {
  ImageryPlanSpec,
  MediaAsset,
  MediaSlot,
  type DesignBrief,
  type DesignSpec,
  type MediaRole,
  type SectionSpec,
} from "./types";

/* ------------------------------------------------------------------ */
/* Placement                                                           */
/* ------------------------------------------------------------------ */

/** Section kinds that can carry a photograph or capture without fighting their own content. */
const MEDIA_ELIGIBLE: ReadonlySet<SectionSpec["kind"]> = new Set([
  "story",
  "figure",
  "specimen",
  "features",
  "proof",
]);

/** Corpus medians from the 82-site evidence set (Book III §4). */
export const IMAGERY_CORRIDOR = {
  medianImages: 42,
  medianImageAreaRatio: 0.242,
  /** Minimum raster slots before the imagery stage stops warning. */
  minRasterSlots: 3,
  /** At most this many inline SVG figures earn figure credit; the rest are decoration. */
  svgFigureCreditCap: 2,
} as const;

function words(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 3),
  );
}

function overlap(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const w of a) if (b.has(w)) n += 1;
  return n;
}

function sectionWords(s: SectionSpec): Set<string> {
  return words([s.title, s.body, s.eyebrow ?? "", ...s.blocks.map((b) => `${b.title} ${b.body}`)].join(" "));
}

function landscapeScore(a: MediaAsset): number {
  if (!a.width || !a.height) return 1;
  const r = a.width / a.height;
  // Folds are wide: prefer 1.3–2.4 aspect, then size.
  const shape = r >= 1.3 && r <= 2.4 ? 2 : r >= 1 ? 1.5 : 1;
  return shape + Math.min(1, (a.width * a.height) / (2400 * 1400));
}

export interface ImageryStageResult {
  sections: SectionSpec[];
  plan: ImageryPlanSpec;
}

/**
 * Place the brief's assets onto sections. Pure: same brief + sections → same placement.
 */
export function planImagery(sections: SectionSpec[], brief: DesignBrief): ImageryStageResult {
  const assets = (brief.assets ?? []).map((a) => MediaAsset.parse(a));
  const remaining = assets.filter((a) => !a.decorative || a.preferredRole === "band");
  const placed: ImageryPlanSpec["placed"] = [];
  const bySection = new Map<string, MediaSlot[]>();

  const take = (asset: MediaAsset): void => {
    const i = remaining.indexOf(asset);
    if (i >= 0) remaining.splice(i, 1);
  };
  const put = (section: SectionSpec, role: MediaRole, asset: MediaAsset, reason: string): void => {
    const slot = MediaSlot.parse({ role, asset, reason });
    bySection.set(section.id, [...(bySection.get(section.id) ?? []), slot]);
    placed.push({ sectionId: section.id, role, assetId: asset.id, reason });
    take(asset);
  };

  const hero = sections.find((s) => s.kind === "hero");
  if (hero) {
    const explicit = remaining.find((a) => a.preferredRole === "hero");
    const candidates = remaining.filter((a) => !a.decorative && a.preferredRole !== "band" && a.preferredRole !== "section");
    const best =
      explicit ??
      [...candidates].sort((a, b) => landscapeScore(b) - landscapeScore(a) || a.id.localeCompare(b.id))[0];
    if (best) {
      put(hero, "hero", best, explicit ? "brief asked for this asset on the fold" : "widest real asset owns the fold");
    }
  }

  const eligible = sections.filter((s) => MEDIA_ELIGIBLE.has(s.kind));
  const used = new Set<string>();
  // Subject matches first: an asset that depicts a named capability goes to that capability.
  for (const asset of [...remaining]) {
    const subject = words(`${asset.subject} ${asset.alt}`);
    if (!subject.size) continue;
    let bestSection: SectionSpec | undefined;
    let bestScore = 0;
    for (const s of eligible) {
      if (used.has(s.id)) continue;
      const score = overlap(subject, sectionWords(s));
      if (score > bestScore) {
        bestScore = score;
        bestSection = s;
      }
    }
    if (bestSection) {
      const role: MediaRole =
        asset.preferredRole === "band" || bestSection.kind === "specimen" || bestSection.kind === "figure"
          ? "band"
          : "section";
      put(bestSection, role, asset, `subject matches “${bestSection.title}”`);
      used.add(bestSection.id);
    }
  }
  // Then page order for whatever is left — still one asset per section.
  for (const s of eligible) {
    if (used.has(s.id)) continue;
    const asset = remaining[0];
    if (!asset) break;
    const role: MediaRole =
      asset.preferredRole === "band" || s.kind === "specimen" || s.kind === "figure" ? "band" : "section";
    put(s, role, asset, "next real asset in page order");
    used.add(s.id);
  }

  const gaps: string[] = [];
  const heroHasMedia = placed.some((p) => p.role === "hero");
  if (hero && !heroHasMedia) {
    gaps.push(
      "Fold has no real media — supply a product photograph, screenshot, or capture in brief.assets (preferredRole: \"hero\").",
    );
  }
  if (placed.length < IMAGERY_CORRIDOR.minRasterSlots) {
    gaps.push(
      `${placed.length} raster slot${placed.length === 1 ? "" : "s"} placed; the imagery stage wants ≥ ${IMAGERY_CORRIDOR.minRasterSlots} (reference corpus median ${IMAGERY_CORRIDOR.medianImages} images, ${Math.round(IMAGERY_CORRIDOR.medianImageAreaRatio * 100)}% of page area).`,
    );
  }
  const unfilled = eligible.filter((s) => !used.has(s.id)).map((s) => s.id);
  if (assets.length && unfilled.length && !remaining.length) {
    gaps.push(`Sections still drawn rather than photographed: ${unfilled.slice(0, 4).join(", ")}.`);
  }

  const out = sections.map((s) => {
    const media = bySection.get(s.id);
    return media ? { ...s, media } : s;
  });

  return {
    sections: out,
    plan: ImageryPlanSpec.parse({
      placed,
      unusedAssetIds: remaining.map((a) => a.id),
      heroHasMedia,
      rasterSlots: placed.length,
      gaps,
    }),
  };
}

/* ------------------------------------------------------------------ */
/* Markup                                                              */
/* ------------------------------------------------------------------ */

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function pct(n: number): string {
  return `${Math.round(n * 1000) / 10}%`;
}

/**
 * The bare media element. Explicit width/height (or an aspect-ratio fallback) so layout never
 * shifts; the fold asset is eager + high priority, everything else lazy.
 */
export function mediaElement(asset: MediaAsset, opts: { priority?: boolean } = {}): string {
  const a = MediaAsset.parse(asset);
  const dims = a.width && a.height ? ` width="${a.width}" height="${a.height}"` : "";
  const ratio = a.width && a.height ? "" : "aspect-ratio:16/10;";
  const style = ` style="${ratio}object-position:${pct(a.focalPoint.x)} ${pct(a.focalPoint.y)}"`;
  const alt = a.decorative ? "" : a.alt;
  const load = opts.priority ? ` loading="eager" fetchpriority="high"` : ` loading="lazy"`;
  const data = ` data-media-kind="${a.kind}" data-media-source="${a.source}"`;
  if (a.kind === "video" && a.posterSrc) {
    return `<video class="ds-fig ds-media-img" src="${esc(a.src)}" poster="${esc(a.posterSrc)}"${dims}${style}${data} muted playsinline controls preload="${opts.priority ? "metadata" : "none"}" aria-label="${esc(alt)}"></video>`;
  }
  // 3D renders ship poster-first; the runtime mounts only after immersive-tier approval.
  const src = a.kind === "render-3d" && a.posterSrc ? a.posterSrc : a.src;
  const runtime = a.kind === "render-3d" ? ` data-runtime="immersive-pending"` : "";
  return `<img class="ds-fig ds-media-img" src="${esc(src)}" alt="${esc(alt)}"${dims}${style}${data}${runtime}${load} decoding="async"/>`;
}

/** A placed slot as a standalone figure with an honest caption. */
export function mediaFigure(slot: MediaSlot): string {
  const a = slot.asset;
  const caption = a.caption ?? (a.decorative ? "" : a.alt);
  return `<figure class="ds-media ds-media-${slot.role}" data-media-slot="${esc(a.id)}">${mediaElement(a)}${
    caption ? `<figcaption>${esc(caption)}</figcaption>` : ""
  }</figure>`;
}

/** Hero caption: say what the picture is, instead of calling a photograph "illustrative". */
export function heroMediaCaption(section: SectionSpec | undefined): string | undefined {
  const slot = section?.media?.find((m) => m.role === "hero");
  if (!slot) return undefined;
  return slot.asset.caption ?? (slot.asset.decorative ? undefined : slot.asset.alt);
}

/** CSS for placed media. Empty when the page carries none, so existing output is unchanged. */
export function mediaCss(spec: DesignSpec): string {
  if (!spec.sections.some((s) => s.media?.length)) return "";
  return `
.ds-media-img{display:block;width:100%;height:100%;object-fit:cover;background:var(--surface-sunken,transparent)}
.ds-plate .ds-media-img{min-height:inherit}
.ds-media{margin:var(--s-l,2.5rem) auto 0;width:min(100% - 2*var(--s-m,1.5rem),1360px)}
.ds-media-band{width:100%;margin-inline:0}
.ds-media-band .ds-media-img{max-height:min(78vh,820px)}
.ds-media-section .ds-media-img{max-height:min(64vh,640px);border-radius:var(--r-md,8px)}
.ds-media figcaption{margin-top:var(--s-2xs,.5rem);font-size:.8125rem;line-height:1.4;color:var(--surface-muted,currentColor)}
.ds-media-band figcaption{padding-inline:var(--s-m,1.5rem)}
`;
}

/* ------------------------------------------------------------------ */
/* Evaluation bands (static, from preview HTML)                        */
/* ------------------------------------------------------------------ */

export interface ImageryBands {
  rasterCount: number;
  svgFigureCount: number;
  /** Raster figures plus at most `svgFigureCreditCap` SVG figures. */
  creditedFigures: number;
  heroHasMedia: boolean;
  duplicateSrcs: string[];
}

function heroHtml(html: string): string {
  const start = html.search(/<section[^>]*\bid="top"/);
  if (start < 0) return "";
  const end = html.indexOf("</section>", start);
  return end < 0 ? html.slice(start) : html.slice(start, end);
}

/**
 * Measure imagery in rendered preview HTML without a browser. SVG drawings and raster media are
 * counted on separate lines; only raster media (img/video with a non-SVG source) is imagery.
 */
export function measureImageryHtml(html: string): ImageryBands {
  const srcs: string[] = [];
  const rasterRe = /<(img|video)\b[^>]*?\bsrc="([^"]+)"/gi;
  let m: RegExpExecArray | null;
  while ((m = rasterRe.exec(html))) {
    const src = m[2] ?? "";
    if (/^data:image\/svg/i.test(src) || /\.svg(\?|#|$)/i.test(src)) continue;
    srcs.push(src);
  }
  const svgFigureCount = (html.match(/<svg\b[^>]*\bclass="ds-fig"/g) ?? []).length;
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const s of srcs) {
    if (seen.has(s)) dup.add(s.length > 64 ? `${s.slice(0, 61)}…` : s);
    seen.add(s);
  }
  const hero = heroHtml(html);
  const heroHasMedia = /<(img|video)\b[^>]*\bds-media-img/.test(hero);
  return {
    rasterCount: srcs.length,
    svgFigureCount,
    creditedFigures: srcs.length + Math.min(svgFigureCount, IMAGERY_CORRIDOR.svgFigureCreditCap),
    heroHasMedia,
    duplicateSrcs: [...dup],
  };
}

export interface ImageryGateFinding {
  id: string;
  severity: "ban" | "warn";
  ok: boolean;
  detail: string;
}

export interface ImageryGateReport {
  passed: boolean;
  bands: ImageryBands;
  findings: ImageryGateFinding[];
}

/**
 * Gate for approving the imagery stage. Bans block approval; warnings are shown at review.
 */
export function imageryGate(previewHtml: string): ImageryGateReport {
  const bands = measureImageryHtml(previewHtml);
  const findings: ImageryGateFinding[] = [
    {
      id: "hero-media",
      severity: "ban",
      ok: bands.heroHasMedia,
      detail: bands.heroHasMedia
        ? "Fold carries real media."
        : "Fold carries no raster media — a drawn schematic is not a hero image.",
    },
    {
      id: "no-cycled-assets",
      severity: "ban",
      ok: bands.duplicateSrcs.length === 0,
      detail: bands.duplicateSrcs.length
        ? `Same asset placed more than once: ${bands.duplicateSrcs.join(", ")}.`
        : "Every asset appears once.",
    },
    {
      id: "raster-slots",
      severity: "warn",
      ok: bands.rasterCount >= IMAGERY_CORRIDOR.minRasterSlots,
      detail: `${bands.rasterCount} raster media on the page (stage minimum ${IMAGERY_CORRIDOR.minRasterSlots}; corpus median ${IMAGERY_CORRIDOR.medianImages}).`,
    },
    {
      id: "svg-credit-capped",
      severity: "warn",
      ok: bands.svgFigureCount <= IMAGERY_CORRIDOR.svgFigureCreditCap || bands.rasterCount > 0,
      detail: `${bands.svgFigureCount} SVG figures; only ${Math.min(bands.svgFigureCount, IMAGERY_CORRIDOR.svgFigureCreditCap)} earn figure credit.`,
    },
  ];
  return {
    passed: findings.every((f) => f.ok || f.severity === "warn"),
    bands,
    findings,
  };
}
