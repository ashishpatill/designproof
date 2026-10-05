"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TemplatePreview } from "./TemplatePreview";

export type GalleryItem = {
  key: string;
  label: string;
  marketJob: string;
  siteKind: string;
  index: string;
  href: string;
  src: string;
  pinned?: "crease" | "baseline";
};

/**
 * Gallery families. Every template has its own site kind, so filtering by the raw
 * kind would return one card per chip — these roll the kinds into the handful of
 * jobs a buyer actually shops by.
 */
const FAMILIES: { id: string; label: string; kinds: string[] }[] = [
  {
    id: "marketing",
    label: "Marketing & trust",
    kinds: ["saas-marketing", "fintech-marketing", "corporate-story", "consumer-craft"],
  },
  {
    id: "product",
    label: "Product & docs",
    kinds: ["docs-educational", "dashboard-webapp", "agent-harness"],
  },
  {
    id: "editorial",
    label: "Editorial & studio",
    kinds: ["editorial-foundry", "art-directed-studio", "press-atelier"],
  },
  {
    id: "research",
    label: "Research & index",
    kinds: ["research-dossier", "archive-index", "signal-observatory"],
  },
  {
    id: "commerce",
    label: "Commerce & care",
    kinds: ["commerce-loom", "field-guide", "care-pathway", "lantern-path"],
  },
  {
    id: "sport",
    label: "Sport matchday",
    kinds: ["sport-matchday"],
  },
];

function familyFor(siteKind: string): string {
  return FAMILIES.find((family) => family.kinds.includes(siteKind))?.id ?? "other";
}

/**
 * Design template gallery — filterable filmstrip.
 * Cells stay still and only play their craft reel on hover, so a wall of
 * nineteen iframes never animates at once.
 */
export function TemplateGallery({ items }: { items: GalleryItem[] }) {
  const [family, setFamily] = useState<string>("all");

  const families = useMemo(
    () =>
      FAMILIES.map((family) => ({
        ...family,
        count: items.filter((item) => familyFor(item.siteKind) === family.id).length,
      })).filter((family) => family.count > 0),
    [items],
  );

  const visible = family === "all" ? items : items.filter((item) => familyFor(item.siteKind) === family);

  return (
    <>
      <div className="dp-gallery-bar">
        <div className="dp-gallery-bar__filters" role="group" aria-label="Filter templates by job">
          <button
            type="button"
            className="dp-filter"
            data-active={family === "all" ? "true" : "false"}
            aria-pressed={family === "all"}
            onClick={() => setFamily("all")}
          >
            All {items.length}
          </button>
          {families.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className="dp-filter"
              data-active={family === entry.id ? "true" : "false"}
              aria-pressed={family === entry.id}
              onClick={() => setFamily(entry.id)}
            >
              {entry.label} {entry.count}
            </button>
          ))}
        </div>
        <p className="dp-gallery-bar__hint">
          {family === "all"
            ? "Hover a cell to play its craft reel."
            : `${visible.length} of ${items.length} templates.`}
        </p>
      </div>

      <ol className="sx-cells" data-filtered={family !== "all" ? "true" : "false"}>
        {visible.map((o) => (
          <li key={o.key} className="sx-cell" data-family={familyFor(o.siteKind)}>
            <Link
              className="sx-cell-link"
              href={o.href}
              prefetch={false}
              data-testid={`showcase-link-${o.key}`}
              data-pinned={o.pinned}
            >
              <div className="sx-cell-frame">
                <div className="sx-cell-sprockets" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <TemplatePreview
                  className="sx-thumb sx-thumb-reel"
                  title={`${o.label} craft reel`}
                  src={o.src}
                  designWidth={1440}
                  designHeight={900}
                  mode="cinema"
                  prefer="figure"
                  decorative
                  lazy
                  autoplayInView={false}
                  testId={`showcase-thumb-${o.key}`}
                />
                <div className="sx-cell-sprockets sx-cell-sprockets-end" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className="sx-cell-meta">
                <span className="sx-num" aria-hidden="true">
                  {o.index}
                </span>
                <div className="sx-row-copy">
                  <h3>{o.label}</h3>
                  <p className="sx-kind">{o.siteKind}</p>
                </div>
                <p className="sx-row-job">{o.marketJob}</p>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      {!visible.length ? (
        <div className="dp-empty mt-6">
          <p>No templates in this kind yet.</p>
        </div>
      ) : null}
    </>
  );
}
