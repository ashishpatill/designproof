/**
 * Lantern path template: each chapter is told once, and nothing on the page is a fact no
 * brief gave.
 *
 * Before this pass every lantern-path page had nine sections. The path fold hid the lead
 * description (CSS-hidden lede). The index printed bare names (three or four, whatever the brief
 * gave) under "chapters a night walk actually keeps" and "each chapter is a lantern waypoint —
 * not a dark glow page dressed as cinema", beside a "how it is put together" list that named them
 * again. A figure band drew a "cost · cumulative" chart with made-up values under "how X charts a
 * night walk", a specimen band printed every name again under "X path field", and the ember-notes
 * essay printed every description a second time as "Ch I Threshold" under "how a night walk is
 * actually read" and "lantern beads, chapter index, and the embers that keep a walk honest". The
 * answers promised cancelling anytime, a comparison table, "one session" on the reader's data, a
 * person for procurement, "no hidden tier", and that every capability ships "from day one". The
 * close asked every product, a pottery studio's included, to "walk the next chapter" with
 * "waypoint marks, path plates, and the chapters editors and founders actually walk".
 */
import { describe, expect, it } from "vitest";
import { designFromFeatures, designFromFeaturesAuthored } from "../orchestrate";
import { SHOWCASE_BRIEFS } from "../templates";
import { DesignBrief } from "../types";
import { assertBasics } from "../basics-checklist";

const sample = SHOWCASE_BRIEFS.lantern!;

const fresh = (productName: string, tagline: string, audience: string, f: [string, string][]) =>
  DesignBrief.parse({
    productName,
    tagline,
    audience,
    businessGoal: sample.businessGoal,
    siteKind: "lantern-path",
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

/** Phrases no brief here declares, and lines written for the one sample lantern. */
const INVENTED = [
  "cost · cumulative",
  "put together",
  "chapters a night walk actually keeps",
  "dark glow page dressed as cinema",
  "charts a night walk",
  "drawn rather than claimed",
  "path field",
  "how a night walk is actually read",
  "lantern beads, chapter index, and the embers that keep a walk honest",
  "note 01",
  "ember notes",
  "walk the next",
  "waypoint marks, path plates, and the chapters",
  "cancel anytime",
  "comparison table",
  "from day one",
  "procurement",
  "hidden tier",
  "lantern-path surface",
  "see the approach",
  "read the detail",
  "verifiable before you commit",
  "step through the mechanism",
];

const plateOf = (html: string) => html.match(/<svg[^>]*data-figure="path-plate"[\s\S]*?<\/svg>/)?.[0] ?? "";
const railOf = (html: string) => html.match(/<nav class="ds-way-rail"[\s\S]*?<\/nav>/)?.[0] ?? "";
const sectionOf = (html: string, id: string) =>
  html.split(/(?=<section[^>]*data-section=")/).find((p) => new RegExp(`^<section[^>]*data-section="${id}"`).test(p)) ?? "";
const nn = (i: number) => String(i + 1).padStart(2, "0");

describe("lantern path template says each thing once", () => {
  it("draws the path fold, one index, the priorities trail, questions, and the close", () => {
    const { spec } = designFromFeatures(sample);
    expect(spec.sections.map((s) => s.id)).toEqual(["nav", "hero", "features", "story", "faq", "cta", "footer"]);
    expect(spec.sections.some((s) => ["specimen", "compare", "figure", "proof", "metrics"].includes(s.kind))).toBe(false);
  });

  it("prints each chapter description once on every brief, both paths", async () => {
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

  it("names each chapter once in the index, the lead once more in the close, and never in the priorities", async () => {
    for (const brief of briefs.slice(1)) {
      for (const html of [designFromFeatures(brief).previewHtml, (await designFromFeaturesAuthored(brief, {})).previewHtml]) {
        const text = visible(html);
        for (const [i, f] of brief.features.entries()) {
          expect(text.split(f.name.toLowerCase()).length - 1, `${brief.productName}: ${f.name}`).toBeGreaterThanOrEqual(i === 0 ? 2 : 1);
          expect(text.split(f.name.toLowerCase()).length - 1, `${brief.productName}: ${f.name} cap`).toBeLessThanOrEqual(i === 0 ? 4 : 2);
        }
      }
    }
  });

  it("puts every chapter in the one index, numbered, with its description and no list beside it", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const index = spec.sections.filter((s) => s.kind === "features");
      expect(index).toHaveLength(1);
      expect(index[0]!.blocks.map((b) => b.title)).toEqual(brief.features.map((f) => f.name));
      expect(index[0]!.blocks.map((b) => b.meta)).toEqual(brief.features.map((_, i) => nn(i)));
      expect(index[0]!.blocks.every((b) => b.body.length > 0 && b.kicker === undefined)).toBe(true);
      expect(index[0]!.body).toBe("");
      expect(index[0]!.eyebrow).toBe("The chapters");
      expect(index[0]!.title).toBe(`${brief.productName}, chapter by chapter.`);
      const html = sectionOf(previewHtml, "features");
      expect(html, brief.productName).not.toMatch(/<figure class="ds-plate/);
      for (const [i, f] of brief.features.entries()) {
        expect(html).toContain(`id="chapter-${nn(i)}" data-feature="${f.name}"`);
        const body = f.description.replace(/'/g, "&#39;");
        expect(html).toContain(`<p>${body.endsWith(".") ? body : `${body}.`}</p>`);
      }
    }
  });

  it("keeps the path fold with way rail and path-plate, with no lede on the fold", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const fold = sectionOf(previewHtml, "hero");
      expect(spec.sections.find((s) => s.kind === "hero")?.body).toBe("");
      expect(fold).not.toContain('class="ds-lede"');
      for (const f of brief.features) expect(fold.toLowerCase()).not.toContain(f.description.toLowerCase().slice(0, 16));
      expect(railOf(previewHtml), brief.productName).not.toBe("");
      expect(plateOf(previewHtml), brief.productName).not.toBe("");
      expect(previewHtml).toContain("PATH ATLAS");
      expect(previewHtml).toContain("CH I");
      expect(previewHtml).toContain("Ember");
    }
  });

  it("groups the chapters by the priority the brief gives on the night trail", () => {
    const { spec, previewHtml } = designFromFeatures(briefs[3]!);
    const story = spec.sections.find((s) => s.kind === "story");
    expect(story?.eyebrow).toBe("Priorities");
    expect(story?.title).toBe("Which Kilnroom chapters to open first.");
    expect(story?.blocks.map((b) => [b.title, b.body, b.meta, b.points])).toEqual([
      ["Core", "Chapters 01 and 02.", undefined, []],
      ["Supporting", "Chapters 03 and 04.", undefined, []],
      ["Additional", "Chapter 05.", undefined, []],
    ]);
    const html = sectionOf(previewHtml, "story");
    expect(html).toContain('aria-label="Night trail"');
    expect(html).not.toContain('class="ds-ember-mark"');
    expect(html).not.toContain("Note 01");
    // Three tier cards and nothing else: no grey rest card opposite, no chapter line over the tier.
    expect(html.match(/class="ds-ember-panel"/g)).toHaveLength(3);
    expect(html).not.toContain("ds-ember-rest");
    expect(html).not.toContain('class="ds-ember-ch"');
    for (const f of briefs[3]!.features) expect(html).not.toContain(f.name);
  });

  it("labels the five night-path boxes Ch I to Ch V with no Ember Gate chapter names on any brand", () => {
    for (const brief of briefs) {
      const { previewHtml } = designFromFeatures(brief);
      for (const r of ["I", "II", "III", "IV", "V"]) expect(previewHtml).toContain(`CH ${r}<`);
      for (const word of ["Threshold", "Gardens", "Craft", "Rituals", "Afterlight"]) {
        expect(previewHtml, `${brief.productName}: ${word}`).not.toMatch(new RegExp(`>\\s*${word}\\s*<|Chapter [IV]+: ${word}`));
      }
    }
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
      "Who is the Kilnroom path for?",
      "What is not on the Kilnroom path?",
    ]);
    const cta = spec.sections.find((s) => s.kind === "cta");
    expect(cta?.title).toBe("Walk the Kilnroom path with kiln calendar.");
    expect(cta?.body).toBe("Four more chapters sit in the index above.");
    expect([cta?.ctaLabel, cta?.secondaryLabel]).toEqual(["Walk the path", "Read all five chapters"]);
    const nav = spec.sections.find((s) => s.kind === "nav");
    expect(nav?.navItems.map((n) => n.label)).toEqual(["Path", "Chapters", "Ember"]);
  });

  it("carries no fold note on the authored path", async () => {
    for (const brief of briefs) {
      const html = (await designFromFeaturesAuthored(brief, {})).previewHtml;
      expect(visible(html), brief.productName).not.toContain("verifiable before you commit");
      expect(visible(html), brief.productName).not.toContain("waypoint marks, path plates, and the chapters");
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
    expect(html).not.toMatch(/<meta name="description" content="[^"]*(lantern-path|sections built from)/);
  });
});
