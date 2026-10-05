import Link from "next/link";
import { listTemplates, type DesignTemplate } from "@designproof/design-skills";
import { ProductShell } from "@/components/shell";
import { ShowcaseAnthologyReel } from "@/components/showcase/ShowcaseAnthologyReel";
import { TemplateGallery, type GalleryItem } from "@/components/showcase/TemplateGallery";
import { templateHtmlSrc, templateOpenHref } from "@/components/showcase/templateSrc";
import "./showcase.css";

export const dynamic = "force-static";
export const metadata = {
  title: "Design Templates — Craft reels, not theme packs",
  description:
    "Crease cricket and Baseline tennis matchday plus research-backed site kinds — filmstrip reels play on hover; the hero slowly tours best beats across templates.",
};

type FilmstripCell = GalleryItem;

/** Hand-crafted sport templates — pinned near the top of the filmstrip (not engine templates). */
const CREASE_CELL: Omit<FilmstripCell, "index"> = {
  key: "crease",
  pinned: "crease",
  label: "Crease",
  marketJob:
    "Cricket matchday companion — Core six multipage IA, glance-live score spine, pavilion-evening taste.",
  siteKind: "sport-matchday",
  href: "/crease",
  src: "/crease",
};

const BASELINE_CELL: Omit<FilmstripCell, "index"> = {
  key: "baseline",
  pinned: "baseline",
  label: "Baseline",
  marketJob:
    "Tennis court board — nested sets|games|points, server + pressure flags, best-of-3/5 lens, light-airy taste.",
  siteKind: "sport-matchday",
  href: "/baseline",
  src: "/baseline",
};

function buildFilmstrip(): FilmstripCell[] {
  const templates = listTemplates().map((t: DesignTemplate, i) => ({
    key: t.key,
    label: t.label,
    marketJob: t.marketJob,
    siteKind: t.siteKind,
    index: String(i + 3).padStart(2, "0"),
    href: templateOpenHref(t.key),
    src: templateHtmlSrc(t.key),
  }));
  return [
    { ...CREASE_CELL, index: "01" },
    { ...BASELINE_CELL, index: "02" },
    ...templates,
  ];
}

/**
 * Template gallery — hero anthology (slow cross-template tour) + filmstrip (hover-only reels).
 * Metadata only in the page payload; template HTML loads lazily via /api/design/html.
 * Crease + Baseline pinned first — sport matchday proof outside the engine template catalog.
 */
export default function ShowcaseGalleryPage() {
  const offerings = buildFilmstrip();
  const filmstripItems: GalleryItem[] = offerings;
  const anthologySlides = offerings.map((o) => ({
    key: o.key,
    label: o.label,
    marketJob: o.marketJob,
    index: o.index,
    href: o.href,
  }));

  return (
    <ProductShell active="showcase">
    <div className="sx-root" data-testid="showcase-gallery">
      <div className="sx-grain" aria-hidden="true" />
      <div className="sx-shell">
        <section className="sx-stage" aria-labelledby="sx-hero-title">
          <div className="sx-stage-mast">
            <p className="sx-kicker">Craft reels · not theme packs</p>
            <h1 id="sx-hero-title" className="sx-display">
              Design Templates
            </h1>
            <p className="sx-lede">
              Crease and Baseline lead the strip — cricket and tennis matchday with live spines. The
              stage slowly tours the best craft beat from each offering; filmstrip cells stay still
              until you hover.
            </p>
            <div className="sx-hero-actions">
              <Link className="sx-nav-cta" href="/baseline" prefetch={false}>
                Open Baseline
              </Link>
              <a className="sx-btn-ghost" href="#reels">
                Browse the filmstrip
              </a>
            </div>
          </div>

          <article className="sx-stage-reel" aria-label="Featured craft tour across templates">
            <div className="sx-reel-chrome" aria-hidden="true">
              <span className="sx-sprocket" />
              <span className="sx-sprocket" />
              <span className="sx-sprocket" />
              <span className="sx-sprocket" />
              <span className="sx-sprocket" />
              <span className="sx-sprocket" />
            </div>
            <ShowcaseAnthologyReel slides={anthologySlides} totalCount={offerings.length} dwellMs={5200} />
            <div className="sx-reel-chrome sx-reel-chrome-end" aria-hidden="true">
              <span className="sx-sprocket" />
              <span className="sx-sprocket" />
              <span className="sx-sprocket" />
              <span className="sx-sprocket" />
              <span className="sx-sprocket" />
              <span className="sx-sprocket" />
            </div>
          </article>
        </section>

        <section className="sx-filmstrip" id="reels" aria-labelledby="sx-reels-title">
          <div className="sx-index-head">
            <h2 id="sx-reels-title">Design templates</h2>
            <p>
              {offerings.length} templates · Crease + Baseline first · filter by kind, then hover a cell to
              play its craft reel. No autoplay in the strip.
            </p>
          </div>

          <TemplateGallery items={filmstripItems} />
        </section>

        <footer className="sx-foot">
          <p>
            Deepened by the recursive improve loop · the hero tours many templates; strip reels wait for
            hover.
          </p>
        </footer>
      </div>
    </div>
    </ProductShell>
  );
}
