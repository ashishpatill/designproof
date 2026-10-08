/**
 * Workspace template (operator console): each capability is told once, and nothing on the page is
 * a fact no brief gave.
 *
 * Before this pass the sample workspace page named its lead capability twenty-three times and
 * printed one description five times: three times cycled through the fold console, then cut short
 * in a proof drawing, then in full under it. It also carried a chart over a "cost · cumulative"
 * curve, a table whose own lede said "the same list as above", made-up ages and rank changes, and
 * answers promising "minutes", "cancel anytime", and a comparison table the page did not have.
 */
import { describe, expect, it } from "vitest";
import { designFromFeatures } from "../orchestrate";
import { SHOWCASE_BRIEFS } from "../templates";
import { DesignBrief } from "../types";

const sample = SHOWCASE_BRIEFS.dashboard!;

const fresh = (productName: string, tagline: string, audience: string, f: [string, string][]) =>
  DesignBrief.parse({
    productName,
    tagline,
    audience,
    businessGoal: "activation",
    siteKind: "dashboard-webapp",
    lockSiteKind: true,
    taste: sample.taste,
    features: f.map(([name, description], i) => ({
      id: `c${i}`,
      name,
      description,
      priority: i < 2 ? "p0" : i < 4 ? "p1" : "p2",
    })),
  });

const briefs = [
  sample,
  fresh("Harborbook", "Berth planning for small marinas", "marina harbour masters", [
    ["Berth requests", "Incoming boat requests sorted by urgency so the harbour master works the most urgent first"],
    ["Fuel log", "Every fuel sale posted against the berth account and reconciled each night"],
    ["Crew list", "Who is on shift at the dock"],
    ["Weather board", "Today's wind and tide"],
    ["Mooring map", "Where each boat is tied up"],
  ]),
  fresh("Kilnroom", "Firing schedules for shared pottery studios", "studio managers at community pottery studios", [
    ["Kiln calendar", "Book a firing slot and see which shelves are already full this week"],
    ["Glaze library", "Every glaze recipe with test tiles photographed after each firing"],
    ["Member shelves", "Which pieces belong to whom, from greenware to finished"],
    ["Clay orders", "Bulk clay ordered once a month for the whole studio"],
    ["Class roster", "Who is in which wheel class"],
  ]),
];

/** Visible page text, without chrome, hidden swap templates, styles, or scripts. */
function visible(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<template[\s\S]*?<\/template>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .toLowerCase();
}

describe("Workspace template says each thing once", () => {
  it("keeps one complete catalogue and drops the proof board, the step chart, and the repeat table", () => {
    for (const brief of briefs) {
      const { spec } = designFromFeatures(brief);
      const ids = spec.sections.map((s) => s.id);
      expect(ids.filter((id) => id.startsWith("features")), brief.productName).toEqual(["features"]);
      expect(ids).toContain("app");
      expect(ids).not.toContain("proof");
      expect(ids).not.toContain("figure");
      expect(ids).not.toContain("compare");
      const catalogue = spec.sections.find((s) => s.id === "features")!;
      expect(catalogue.blocks.map((b) => b.title), brief.productName).toEqual(brief.features.map((f) => f.name));
    }
  });

  it("tells every capability description exactly once", () => {
    for (const brief of briefs) {
      const text = visible(designFromFeatures(brief).previewHtml);
      for (const f of brief.features) {
        const told = text.split(f.description.toLowerCase().slice(0, 36)).length - 1;
        expect(told, `${brief.productName}: ${f.name}`).toBe(1);
      }
    }
  });

  it("names the lead capability at most ten times on the page", () => {
    for (const brief of briefs) {
      const text = visible(designFromFeatures(brief).previewHtml);
      const lead = brief.features[0]!.name.toLowerCase();
      expect(text.split(lead).length - 1, brief.productName).toBeLessThanOrEqual(10);
    }
  });

  it("states no timeline, contract term, automation, chart axis, or engine setting the brief never gave", () => {
    for (const brief of briefs) {
      const text = visible(designFromFeatures(brief).previewHtml);
      for (const phrase of [
        "minutes",
        "cancel anytime",
        "annual lock",
        "handled automatically",
        "cost · cumulative",
        "the comparison table",
        "the same list as above",
        "one conversation",
        "in front of your",
        "stays open",
        "information-rich",
        "subtle-micro",
        "two carry the argument",
      ]) {
        expect(text, `${brief.productName}: ${phrase}`).not.toContain(phrase);
      }
    }
  });

  it("draws the fold console without cycled names, made-up ages, or rank changes", () => {
    for (const brief of briefs) {
      const { previewHtml } = designFromFeatures(brief);
      const fold = previewHtml.match(/<svg[^>]*data-figure="queue-console"[\s\S]*?<\/svg>/)?.[0] ?? "";
      expect(fold, brief.productName).not.toBe("");
      // Once in the rail, once as the panel heading — never again as a cycled row.
      expect(fold.split(`>${brief.features[0]!.name}<`).length - 1).toBeLessThanOrEqual(2);
      expect(fold).toContain('class="ds-draw"');
      expect(fold).not.toMatch(/>\d+m</);
      expect(fold).not.toMatch(/>[+−]\d</);
    }
  });

  it("fills the working surface with counts of its own rows, not names, ages, or stock filters", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const app = spec.sections.find((s) => s.id === "app")!;
      const names = new Set(brief.features.map((f) => f.name));
      expect(app.metrics.some((m) => names.has(m.value)), brief.productName).toBe(false);
      const shown = app.metrics.reduce((n, m) => n + Number(m.value), 0);
      expect(shown).toBe(app.blocks.length);
      const shell = previewHtml.match(/<div class="ds-app" data-app-shell>[\s\S]*?<\/table>/)?.[0] ?? "";
      expect(shell).not.toBe("");
      expect(shell).not.toContain(">Age<");
      expect(shell).not.toMatch(/>\d+m</);
      expect(shell).not.toContain("· live");
      expect(shell).not.toContain("Needs a human");
    }
  });

  it("answers questions that each carry this brief's own words, and closes on the lead capability", () => {
    for (const brief of briefs) {
      const { spec } = designFromFeatures(brief);
      const faq = spec.sections.find((s) => s.id === "faq")!.blocks;
      expect(faq.length).toBeGreaterThanOrEqual(5);
      const own = [brief.productName, ...brief.features.map((f) => f.name)].map((w) => w.toLowerCase());
      const grounded = faq.filter((q) => own.some((w) => `${q.title} ${q.body}`.toLowerCase().includes(w)));
      expect(grounded.length / faq.length, brief.productName).toBeGreaterThanOrEqual(0.75);
      const close = spec.sections.find((s) => s.id === "cta")!;
      expect(close.title.toLowerCase()).toContain(brief.features[0]!.name.toLowerCase());
    }
  });
});
