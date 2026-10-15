/**
 * Agent harness template: each instrument is told once, and nothing on the page is a fact no
 * brief gave.
 *
 * Before this pass every harness page had nine sections. The helm fold printed the lead
 * description under the headline. The index printed bare names (three or four, whatever the brief
 * gave) under "permits a local session actually keeps" and "each turn is a session beat — not a
 * workflow approve stamp dressed as trust", beside a "how it is put together" list that named them
 * again. A figure band drew a "cost · cumulative" chart with made-up values under "how X permits a
 * local tool", a specimen band printed every name again under "X permit field", and the turn-notes
 * essay printed every description a second time as "T01 Turn tape" under "how a local session
 * actually finishes" and "turn tape, tool permits, and the finish checks that keep a session
 * honest". The answers promised cancelling anytime, a comparison table, "one session" on the
 * reader's data, a person for procurement, "no hidden tier", and that every capability ships "from
 * day one". The close asked every product, a pottery studio's included, to "start the next session"
 * with "turn marks, tool permits, and the finish checks a harness engineer actually runs".
 */
import { describe, expect, it } from "vitest";
import { designFromFeatures, designFromFeaturesAuthored } from "../orchestrate";
import { SHOWCASE_BRIEFS } from "../templates";
import { DesignBrief } from "../types";
import { assertBasics } from "../basics-checklist";

const sample = SHOWCASE_BRIEFS.harness!;

const fresh = (productName: string, tagline: string, audience: string, f: [string, string][]) =>
  DesignBrief.parse({
    productName,
    tagline,
    audience,
    businessGoal: sample.businessGoal,
    siteKind: "agent-harness",
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

/** Phrases no brief here declares, and lines written for the one sample harness. */
const INVENTED = [
  "cost · cumulative",
  "step through the mechanism",
  "permits a local session actually keeps",
  "workflow approve stamp dressed as trust",
  "put together",
  "permits a local tool",
  "drawn rather than claimed",
  "permit field",
  "how a local session actually finishes",
  "turn tape, tool permits, and the finish checks that keep a session honest",
  "note 01",
  "beats · editorial order",
  "start the next",
  "turn marks, tool permits, and the finish checks a harness engineer",
  "cancel anytime",
  "comparison table",
  "one session:",
  "from day one",
  "procurement",
  "hidden tier",
  "agent-harness surface",
  "runs on your machine — no invented host",
];

const plateOf = (html: string) => html.match(/<svg[^>]*data-figure="permit-plate"[\s\S]*?<\/svg>/)?.[0] ?? "";
const railOf = (html: string) => html.match(/<nav class="ds-turn-rail"[\s\S]*?<\/nav>/)?.[0] ?? "";
const sectionOf = (html: string, id: string) =>
  html.split(/(?=<section[^>]*data-section=")/).find((p) => new RegExp(`^<section[^>]*data-section="${id}"`).test(p)) ?? "";
const nn = (i: number) => String(i + 1).padStart(2, "0");

describe("agent harness template says each thing once", () => {
  it("draws the helm fold, one index, the priorities, questions, and the close", () => {
    const { spec } = designFromFeatures(sample);
    expect(spec.sections.map((s) => s.id)).toEqual(["nav", "hero", "features", "story", "faq", "cta", "footer"]);
    expect(spec.sections.some((s) => ["specimen", "compare", "figure", "proof", "metrics"].includes(s.kind))).toBe(false);
  });

  it("prints each instrument description once on every brief, both paths", async () => {
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

  it("names each instrument once in the index, and the lead once more in the close (priorities cite numbers)", async () => {
    for (const brief of briefs.slice(1)) {
      for (const html of [designFromFeatures(brief).previewHtml, (await designFromFeaturesAuthored(brief, {})).previewHtml]) {
        const text = visible(html);
        for (const [i, f] of brief.features.entries()) {
          // Index in the page text, plus the close for the lead. Priorities cite index numbers.
          // The fold's permit plate may borrow the lead's first word as a TOOL label — that is craft,
          // not a second catalogue reprint of the instrument name as a row.
          expect(text.split(f.name.toLowerCase()).length - 1, `${brief.productName}: ${f.name}`).toBeGreaterThanOrEqual(i === 0 ? 2 : 1);
          expect(text.split(f.name.toLowerCase()).length - 1, `${brief.productName}: ${f.name} cap`).toBeLessThanOrEqual(i === 0 ? 4 : 2);
        }
      }
    }
  });

  it("puts every instrument in the one index, numbered, with its description and no list beside it", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const index = spec.sections.filter((s) => s.kind === "features");
      expect(index).toHaveLength(1);
      expect(index[0]!.blocks.map((b) => b.title)).toEqual(brief.features.map((f) => f.name));
      expect(index[0]!.blocks.map((b) => b.meta)).toEqual(brief.features.map((_, i) => nn(i)));
      expect(index[0]!.blocks.every((b) => b.body.length > 0 && b.kicker === undefined)).toBe(true);
      expect(index[0]!.body).toBe("");
      expect(index[0]!.eyebrow).toBe("The instruments");
      expect(index[0]!.title).toBe(`${brief.productName}, instrument by instrument.`);
      const html = sectionOf(previewHtml, "features");
      expect(html, brief.productName).not.toMatch(/<figure class="ds-plate/);
      for (const [i, f] of brief.features.entries()) {
        expect(html).toContain(`id="instrument-${nn(i)}" data-feature="${f.name}"`);
        const body = f.description.replace(/'/g, "&#39;");
        expect(html).toContain(`<p>${body.endsWith(".") ? body : `${body}.`}</p>`);
      }
    }
  });

  it("keeps the helm fold with turn tape, permit plate, and steer pin, with no lede on the fold", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const fold = sectionOf(previewHtml, "hero");
      expect(spec.sections.find((s) => s.kind === "hero")?.body).toBe("");
      expect(fold).not.toContain('class="ds-lede"');
      for (const f of brief.features) expect(fold.toLowerCase()).not.toContain(f.description.toLowerCase().slice(0, 16));
      expect(railOf(previewHtml), brief.productName).not.toBe("");
      expect(plateOf(previewHtml), brief.productName).not.toBe("");
      expect(previewHtml).toContain("data-steer-pin");
      expect(previewHtml).toContain("FINISH WHEN");
      expect(previewHtml).toContain(">LOCAL<");
      expect(previewHtml).toContain("ALLOW ONCE");
      expect(previewHtml).toContain("DENY");
    }
  });

  it("groups the instruments by the priority the brief gives", () => {
    const { spec } = designFromFeatures(briefs[3]!);
    const story = spec.sections.find((s) => s.kind === "story");
    expect(story?.eyebrow).toBe("Priorities");
    expect(story?.title).toBe("Which Kilnroom instruments to open first.");
    expect(story?.blocks.map((b) => [b.title, b.body])).toEqual([
      ["Core", "Instruments 01 and 02."],
      ["Supporting", "Instruments 03 and 04."],
      ["Additional", "Instrument 05."],
    ]);
  });

  it("applies the #98 design review: wrapped tape, pin beside the headline, plate fit to content, no filler", () => {
    for (const brief of briefs) {
      const { previewHtml } = designFromFeatures(brief);
      const fold = sectionOf(previewHtml, "hero");
      // FINISH WHEN pin sits in the claim row, before the tape and the plate, not over them.
      const body = fold.indexOf('class="ds-helm-body"');
      const pin = fold.indexOf("data-steer-pin");
      expect(body, brief.productName).toBeGreaterThan(-1);
      expect(pin).toBeGreaterThan(fold.indexOf('class="ds-helm-claim"'));
      expect(pin).toBeLessThan(fold.indexOf('class="ds-helm-fold"'));
      expect(previewHtml).toMatch(/\.ds-steer-pin\{\s*position:sticky/);
      // Turn labels wrap: no clamp, and the tape has no fixed height that would cut them.
      expect(previewHtml).not.toMatch(/\.ds-turn-label\{[^}]*line-clamp/);
      expect(previewHtml).not.toMatch(/\.ds-turn-rail\{[^}]*max-height:88px/);
      // Permit plate: no full-bleed wrapper, no bleed inset, drawn to its content height.
      expect(fold).not.toMatch(/class="[^"]*ds-bleed ds-helm-field/);
      const vb = plateOf(previewHtml).match(/viewBox="([-\d.]+) 0 ([\d.]+) ([\d.]+)"/);
      expect(vb, brief.productName).toBeTruthy();
      expect(Number(vb![1])).toBe(0);
      expect(Number(vb![3])).toBeLessThan(520);
      expect(previewHtml).not.toMatch(/\.ds-permit-plate \.ds-fig\{[^}]*min-height/);
      // Token chips, priorities drawings, and the grey thumbnail strip are gone.
      expect(previewHtml).not.toContain('class="ds-token-rail"');
      const story = sectionOf(previewHtml, "story");
      expect(story).not.toContain("ds-chapter-mark");
      expect(previewHtml).not.toContain('class="ds-story-fill"');
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
      "Who is the Kilnroom session for?",
      "What is not in the Kilnroom session?",
    ]);
    const cta = spec.sections.find((s) => s.kind === "cta");
    expect(cta?.title).toBe("Start the Kilnroom session with kiln calendar.");
    expect(cta?.body).toBe("Four more instruments sit in the index above.");
    expect([cta?.ctaLabel, cta?.secondaryLabel]).toEqual(["Start a local session", "Read all five instruments"]);
    const nav = spec.sections.find((s) => s.kind === "nav");
    expect(nav?.navItems.map((n) => n.label)).toEqual(["Session", "Permit", "Finish"]);
  });

  it("carries no fold note on the authored path", async () => {
    for (const brief of briefs) {
      const html = (await designFromFeaturesAuthored(brief, {})).previewHtml;
      expect(visible(html), brief.productName).not.toContain("runs on your machine — no invented host");
      expect(visible(html), brief.productName).not.toContain("harness engineer actually runs");
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
    expect(html).not.toMatch(/<meta name="description" content="[^"]*(agent-harness|sections built from)/);
  });
});
