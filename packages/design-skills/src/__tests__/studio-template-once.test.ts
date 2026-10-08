/**
 * Studio template: each capability is told once, and nothing on the page is a fact no brief gave.
 *
 * Before this pass the sample studio page had eleven sections. It listed the capability names as
 * bare values in a raised band, again as numbered "stages" in a specimen strip, again as "steps"
 * in a method chapter list, twice more in a step chart with a "cost · cumulative" axis, and once
 * more beside the first catalogue row. The fold's work board repeated the first names when the
 * brief had fewer capabilities than plates. Every studio page, a pottery studio's or a marina's
 * included, also said "we take a few engagements at a time", "work that still holds after the
 * launch week", "identity, product, and motion under one grid", "without the pitch theatre",
 * "handoff-safe", and answered questions about cancelling anytime, a comparison table that was
 * never drawn, procurement, and security.
 */
import { describe, expect, it } from "vitest";
import { designFromFeatures, designFromFeaturesAuthored } from "../orchestrate";
import { SHOWCASE_BRIEFS } from "../templates";
import { DesignBrief } from "../types";

const sample = SHOWCASE_BRIEFS.studio!;

const fresh = (productName: string, tagline: string, audience: string, f: [string, string][]) =>
  DesignBrief.parse({
    productName,
    tagline,
    audience,
    businessGoal: sample.businessGoal,
    siteKind: "art-directed-studio",
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
  fresh("Plotwise", "Planning software for community gardens", "garden coordinators", [
    ["Plot plans", "Compare three plot layouts side by side before the season"],
    ["Season stages", "Each bed goes through stages: prepared, sown, growing, harvested"],
    ["Member roll", "Gardeners and their plots"],
    ["Tool shed", "Which tools are out"],
    ["Water rota", "Who waters on which day"],
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
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/** Phrases no brief here declares, and lines written for one sample studio. */
const INVENTED = [
  "few engagements",
  "launch week",
  "under one grid",
  "pitch theatre",
  "handoff-safe",
  "method board",
  "cost · cumulative",
  "cancel anytime",
  "comparison table",
  "procurement",
  "security",
  "your own material",
  "one conversation",
  "step through the mechanism",
];

describe("studio template says each thing once", () => {
  it("draws the fold, one register, the order of work, questions, and the close", () => {
    const { spec } = designFromFeatures(sample);
    expect(spec.sections.map((s) => s.id)).toEqual(["nav", "hero", "features", "story", "faq", "cta", "footer"]);
  });

  it("prints each capability description once on every brief, both paths", async () => {
    for (const brief of briefs) {
      for (const html of [designFromFeatures(brief).previewHtml, (await designFromFeaturesAuthored(brief, {})).previewHtml]) {
        const text = visible(html);
        for (const f of brief.features) {
          const needle = f.description.toLowerCase().slice(0, 36);
          expect(text.split(needle).length - 1, `${brief.productName}: ${f.name}`).toBe(1);
        }
      }
    }
  });

  it("puts every capability in the one register, with no second band", () => {
    for (const brief of briefs) {
      const { spec } = designFromFeatures(brief);
      const registers = spec.sections.filter((s) => s.kind === "features");
      expect(registers).toHaveLength(1);
      expect(registers[0]!.blocks.map((b) => b.title)).toEqual(brief.features.map((f) => f.name));
    }
  });

  it("names each capability once on the work board, leaving spare plates blank", () => {
    for (const brief of briefs) {
      const html = designFromFeatures(brief).previewHtml;
      const board = html.match(/<svg[^>]*data-figure="work-board"[\s\S]*?<\/svg>/)?.[0] ?? "";
      expect(board, brief.productName).not.toBe("");
      for (const f of brief.features) {
        const label = f.name.length > 22 ? f.name.slice(0, 21) : f.name;
        expect(board.split(`>${label}`).length - 1, `${brief.productName}: ${f.name}`).toBe(1);
      }
    }
  });

  it("does not draw a second picture beside the first register row", () => {
    for (const brief of briefs) {
      const html = designFromFeatures(brief).previewHtml;
      const register = html.split(/(?=<section[^>]*data-section=")/).find((p) => /^<section[^>]*data-section="features"/.test(p)) ?? "";
      expect(register, brief.productName).toMatch(/^<section/);
      expect(register).not.toMatch(/<svg[^>]*data-figure="stack"/);
    }
  });

  it("orders the work by the priority the brief gives", () => {
    const { spec } = designFromFeatures(briefs[3]!);
    const story = spec.sections.find((s) => s.kind === "story");
    expect(story?.blocks.map((b) => [b.title, b.body])).toEqual([
      ["First", "Kiln calendar and glaze library."],
      ["Next", "Member shelves and clay orders."],
      ["Alongside", "Class roster."],
    ]);
  });

  it("leaves the order of work out when the brief gives a single priority", () => {
    const flat = DesignBrief.parse({ ...sample, features: sample.features.map((f) => ({ ...f, priority: "p0" })) });
    expect(designFromFeatures(flat).spec.sections.some((s) => s.kind === "story")).toBe(false);
  });

  it("says nothing the brief did not give, on both paths", async () => {
    for (const brief of briefs) {
      for (const html of [designFromFeatures(brief).previewHtml, (await designFromFeaturesAuthored(brief, {})).previewHtml]) {
        const text = visible(html);
        for (const phrase of INVENTED) expect(text, `${brief.productName}: ${phrase}`).not.toContain(phrase);
      }
    }
  });

  it("builds the questions and the close from the brief's own names", () => {
    const brief = briefs[3]!;
    const { spec } = designFromFeatures(brief);
    const faq = spec.sections.find((s) => s.kind === "faq");
    expect(faq?.blocks.map((b) => b.title)).toEqual([
      "Who is Kilnroom for?",
      "Is class roster part of Kilnroom?",
      "What is not part of Kilnroom?",
      "How do we begin with Kilnroom?",
    ]);
    const cta = spec.sections.find((s) => s.kind === "cta");
    expect(cta?.title).toBe("Start with kiln calendar at Kilnroom.");
    expect(cta?.body).toBe("Four more parts sit in the list above.");
  });

  it("describes the product, not the engine, in the page header", () => {
    const html = designFromFeatures(briefs[3]!).previewHtml;
    expect(html).toContain(
      '<meta name="description" content="Kilnroom: Firing schedules for shared pottery studios, for studio managers at community pottery studios"/>',
    );
  });
});
