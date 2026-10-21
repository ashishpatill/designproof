/**
 * Shared footer: no template names pages no brief gave, none claims every capability is live,
 * and every footer link lands on a real, visible, non-empty section of the same finished page,
 * for each template's own brief and for fresh sample brands.
 */
import { describe, expect, it } from "vitest";
import { designFromFeatures } from "../orchestrate";
import { DESIGN_TEMPLATES } from "../templates";
import { DesignBrief } from "../types";

const BANNED_LABELS = ["About", "Customers", "Careers", "Press", "Contact", "Security", "Availability", "Data handling", "Subprocessors", "Status", "Accessibility", "Privacy", "Terms", "Talk to us", "Security review"];
const CLAIM = "All capabilities listed on this page are available today";
/** Evaluate labels may only point at the section they name. */
const EVALUATE_TARGET: Record<string, string> = {
  "How it works": "figure",
  "What is included": "compare",
  Questions: "faq",
};

const SAMPLE_BRANDS: [string, string, string, string[]][] = [
  ["Harborbook", "Berth planning for small marinas", "marina harbour masters", ["Berth requests", "Fuel log", "Crew list", "Weather board", "Mooring map"]],
  ["Plotwise", "Planning software for community gardens", "garden coordinators", ["Plot plans", "Season stages", "Member roll", "Tool shed", "Water rota"]],
  ["Kilnroom", "Firing schedules for shared pottery studios", "studio managers at community pottery studios", ["Kiln calendar", "Glaze library", "Member shelves", "Clay orders", "Class roster"]],
];

function footerOf(html: string): string {
  const m = html.match(/<footer class="ds-footer" data-surface[\s\S]*?<\/footer>/);
  expect(m, "footer present").toBeTruthy();
  return m![0];
}

/** Opening tag carrying id, and the visible text that follows it up to the next section boundary. */
function target(body: string, id: string): { tag: string; text: string } | null {
  const i = body.search(new RegExp(`<[a-z][^>]*\\sid="${id}"[^>]*>`));
  if (i < 0) return null;
  const tag = body.slice(i, body.indexOf(">", i) + 1);
  const rest = body.slice(i + tag.length);
  const end = rest.search(/<section[\s>]|<footer[\s>]/);
  const text = (end < 0 ? rest : rest.slice(0, end))
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { tag, text };
}

function checkPage(html: string, siteKind: string) {
  expect(html).not.toContain(CLAIM);
  const footer = footerOf(html);
  const body = html.replace(footer, "");
  for (const label of BANNED_LABELS) expect(footer).not.toMatch(new RegExp(`>\\s*${label}\\s*<`));
  for (const [, label, id] of [...footer.matchAll(/<a [^>]*href="#([^"]+)"[^>]*>([^<]*)<\/a>/g)].map((m) => [m[0], m[2]!.trim(), m[1]!] as const)) {
    const t = target(body, id);
    expect(t, `${label} → #${id}: target id missing`).toBeTruthy();
    expect(t!.tag, `${label} → #${id}: target hidden`).not.toMatch(/\shidden[\s>=]|aria-hidden="true"|display:\s*none|visibility:\s*hidden/);
    expect(t!.text.length, `${label} → #${id}: target section empty`).toBeGreaterThan(20);
    // Lantern has no figure band; its path atlas on the fold is how it works.
    // Keel has no figure band; its session tape on the fold is how it works.
    const want =
      siteKind === "lantern-path" && label === "How it works"
        ? "path-atlas"
        : siteKind === "control-plane-oss" && label === "How it works"
          ? "session-tape"
          : EVALUATE_TARGET[label];
    if (want) expect(id, `${label} must link its own section`).toBe(want);
  }
  if (siteKind !== "control-plane-oss") expect(footer).not.toContain("ds-footer-item");
}

describe("shared footer only links sections on this page", () => {
  for (const t of DESIGN_TEMPLATES) {
    it(`${t.key}: no invented pages, no availability claim, every link lands on a real section`, () => {
      checkPage(designFromFeatures(t.brief).previewHtml as string, t.siteKind);
    });
    for (const [productName, tagline, audience, names] of SAMPLE_BRANDS) {
      it(`${t.key} × ${productName}: every footer link lands on a real section`, () => {
        const brief = DesignBrief.parse({
          productName, tagline, audience,
          businessGoal: t.brief.businessGoal, siteKind: t.siteKind, lockSiteKind: true, taste: t.brief.taste,
          features: names.map((name, j) => ({ id: `c${j}`, name, description: `${name} for ${audience}`, priority: j < 2 ? "p0" : j < 4 ? "p1" : "p2" })),
        });
        checkPage(designFromFeatures(brief).previewHtml as string, t.siteKind);
      });
    }
  }
});
