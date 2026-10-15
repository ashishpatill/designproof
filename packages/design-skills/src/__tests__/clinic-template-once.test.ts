/**
 * Care pathway (clinic) template: each round is told once, and nothing on the page is a fact no
 * brief gave.
 *
 * Before this pass every care-pathway page had nine sections. The rounds fold hid the lead
 * description. The handoff strip printed bare names (three or four, whatever the brief gave) under
 * "stages a care pathway actually keeps" and "each stage is a chart waypoint — not a SaaS pipeline
 * dressed as care", beside a "how it is put together" list that named them again. A figure band drew
 * a "cost · cumulative" chart with made-up values under "how X maps a care pathway", a specimen band
 * printed every name again under "X chart field", and the round-notes essay printed every description
 * a second time as "Enc 01 Intake" under "how a care pathway is actually walked" and "handoff beads,
 * encounter index, and the rounds that keep a pathway honest". The answers promised cancelling
 * anytime, a comparison table, "one session" on the reader's data, a person for procurement, "no
 * hidden tier", and that every capability ships "from day one". The close asked every product, a
 * pottery studio's included, to "chart the next pathway" with "stage marks, care plates, and the
 * rounds a ward lead actually charts".
 */
import { describe, expect, it } from "vitest";
import { designFromFeatures, designFromFeaturesAuthored } from "../orchestrate";
import { SHOWCASE_BRIEFS } from "../templates";
import { DesignBrief } from "../types";
import { assertBasics } from "../basics-checklist";

const sample = SHOWCASE_BRIEFS.clinic!;

const fresh = (productName: string, tagline: string, audience: string, f: [string, string][]) =>
  DesignBrief.parse({
    productName,
    tagline,
    audience,
    businessGoal: sample.businessGoal,
    siteKind: "care-pathway",
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

/** Phrases no brief here declares, and lines written for the one sample clinic. */
const INVENTED = [
  "cost · cumulative",
  "put together",
  "stages a care pathway actually keeps",
  "saas pipeline dressed as care",
  "maps a care pathway",
  "drawn rather than claimed",
  "chart field",
  "how a care pathway is actually walked",
  "handoff beads, encounter index, and the rounds that keep a pathway honest",
  "note 01",
  "round notes",
  "chart the next",
  "ward lead actually charts",
  "cancel anytime",
  "comparison table",
  "from day one",
  "procurement",
  "hidden tier",
  "care-pathway surface",
  "walkthroughs ship with stage maps",
  "demo theatre",
  "step through the mechanism",
];

const plateOf = (html: string) => html.match(/<svg[^>]*data-figure="care-plate"[\s\S]*?<\/svg>/)?.[0] ?? "";
const railOf = (html: string) => html.match(/<nav class="ds-care-rail"[\s\S]*?<\/nav>/)?.[0] ?? "";
const sectionOf = (html: string, id: string) =>
  html.split(/(?=<section[^>]*data-section=")/).find((p) => new RegExp(`^<section[^>]*data-section="${id}"`).test(p)) ?? "";
const nn = (i: number) => String(i + 1).padStart(2, "0");

describe("care pathway template says each thing once", () => {
  it("draws the rounds fold, one index, the priorities ladder, questions, and the close", () => {
    const { spec } = designFromFeatures(sample);
    expect(spec.sections.map((s) => s.id)).toEqual(["nav", "hero", "features", "story", "faq", "cta", "footer"]);
    expect(spec.sections.some((s) => ["specimen", "compare", "figure", "proof", "metrics"].includes(s.kind))).toBe(false);
  });

  it("prints each round description once on every brief, both paths", async () => {
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

  it("names each round once in the index and once in the priorities, and the lead once more in the close", async () => {
    for (const brief of briefs.slice(1)) {
      for (const html of [designFromFeatures(brief).previewHtml, (await designFromFeaturesAuthored(brief, {})).previewHtml]) {
        const text = visible(html);
        for (const [i, f] of brief.features.entries()) {
          // Index and priorities in the page text, plus the close for the lead.
          expect(text.split(f.name.toLowerCase()).length - 1, `${brief.productName}: ${f.name}`).toBeGreaterThanOrEqual(i === 0 ? 3 : 2);
          expect(text.split(f.name.toLowerCase()).length - 1, `${brief.productName}: ${f.name} cap`).toBeLessThanOrEqual(i === 0 ? 5 : 3);
        }
      }
    }
  });

  it("puts every round in the one index, numbered, with its description and no list beside it", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const index = spec.sections.filter((s) => s.kind === "features");
      expect(index).toHaveLength(1);
      expect(index[0]!.blocks.map((b) => b.title)).toEqual(brief.features.map((f) => f.name));
      expect(index[0]!.blocks.map((b) => b.meta)).toEqual(brief.features.map((_, i) => nn(i)));
      expect(index[0]!.blocks.every((b) => b.body.length > 0 && b.kicker === undefined)).toBe(true);
      expect(index[0]!.body).toBe("");
      expect(index[0]!.eyebrow).toBe("The rounds");
      expect(index[0]!.title).toBe(`${brief.productName}, round by round.`);
      const html = sectionOf(previewHtml, "features");
      expect(html, brief.productName).not.toMatch(/<figure class="ds-plate/);
      expect(html, brief.productName).not.toMatch(/ds-handoff-strip/);
      for (const [i, f] of brief.features.entries()) {
        expect(html).toContain(`id="encounter-${nn(i)}" data-feature="${f.name}"`);
        const body = f.description.replace(/'/g, "&#39;");
        expect(html).toContain(`<p>${body.endsWith(".") ? body : `${body}.`}</p>`);
      }
    }
  });

  it("keeps the rounds fold with care rail and care-plate, with no lede on the fold", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const fold = sectionOf(previewHtml, "hero");
      expect(spec.sections.find((s) => s.kind === "hero")?.body).toBe("");
      expect(fold).not.toContain('class="ds-lede"');
      for (const f of brief.features) expect(fold.toLowerCase()).not.toContain(f.description.toLowerCase().slice(0, 16));
      expect(railOf(previewHtml), brief.productName).not.toBe("");
      expect(plateOf(previewHtml), brief.productName).not.toBe("");
      expect(previewHtml).toContain("PATHWAY");
      expect(previewHtml).toContain("Intake");
      expect(previewHtml).toContain("Discharge");
      expect(previewHtml).toContain("Chart");
    }
  });

  it("groups the rounds by the priority the brief gives on the rounds ladder", () => {
    const { spec, previewHtml } = designFromFeatures(briefs[3]!);
    const story = spec.sections.find((s) => s.kind === "story");
    expect(story?.eyebrow).toBe("Priorities");
    expect(story?.title).toBe("Which Kilnroom rounds to open first.");
    expect(story?.blocks.map((b) => [b.title, b.body, b.meta, b.points])).toEqual([
      ["Core", "Kiln calendar and glaze library.", "Enc 01", ["01", "02"]],
      ["Supporting", "Member shelves and clay orders.", "Enc 02", ["03", "04"]],
      ["Additional", "Class roster.", "Enc 03", ["05"]],
    ]);
    const html = sectionOf(previewHtml, "story");
    expect(html).toContain('aria-label="Rounds ladder"');
    expect(html).not.toContain('class="ds-rounds-mark"');
    expect(html).not.toContain("Note 01");
    expect(html).toContain("2 rounds · Enc 01, 02");
  });

  it("leaves the priorities out when the brief gives a single priority, and still clears the basics", () => {
    const flat = DesignBrief.parse({ ...sample, features: sample.features.map((f) => ({ ...f, priority: "p0" })) });
    const { spec, previewHtml } = designFromFeatures(flat);
    expect(spec.sections.some((s) => s.kind === "story")).toBe(false);
    const failed = assertBasics(spec, previewHtml).findings.filter((f) => !f.ok).map((f) => f.id);
    expect(failed).toEqual([]);
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
      "Who is the Kilnroom pathway for?",
      "What is not on the Kilnroom pathway?",
    ]);
    const cta = spec.sections.find((s) => s.kind === "cta");
    expect(cta?.title).toBe("Chart the Kilnroom pathway with kiln calendar.");
    expect(cta?.body).toBe("Four more rounds sit in the index above.");
    expect([cta?.ctaLabel, cta?.secondaryLabel]).toEqual(["Chart the pathway", "Read all five rounds"]);
    const nav = spec.sections.find((s) => s.kind === "nav");
    expect(nav?.navItems.map((n) => n.label)).toEqual(["Pathway", "Rounds", "Chart"]);
  });

  it("carries no fold note on the authored path", async () => {
    for (const brief of briefs) {
      const html = (await designFromFeaturesAuthored(brief, {})).previewHtml;
      expect(visible(html), brief.productName).not.toContain("walkthroughs ship with stage maps");
      expect(visible(html), brief.productName).not.toContain("ward lead actually charts");
    }
  });

  it("clears the basics on every brief", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const failed = assertBasics(spec, previewHtml).findings.filter((f) => !f.ok).map((f) => `${f.id} — ${f.detail}`);
      expect(failed, brief.productName).toEqual([]);
    }
  });

  it("describes the product, not the engine, in the page header", () => {
    const html = designFromFeatures(briefs[3]!).previewHtml;
    expect(html).toContain(
      '<meta name="description" content="Kilnroom: Firing schedules for shared pottery studios, for studio managers at community pottery studios"/>',
    );
    expect(html).not.toMatch(/<meta name="description" content="[^"]*(care-pathway|sections built from)/);
  });
});
