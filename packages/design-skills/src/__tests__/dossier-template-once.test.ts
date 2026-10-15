/**
 * Research dossier template: each instrument is told once, and nothing on the page is a fact no
 * brief gave.
 *
 * Before this pass every dossier page had nine sections. The folio fold printed the lead
 * description under the headline, ran "Vol. XII" / "Issue 03" in the masthead, and pointed its
 * chapter rail at #figure / #story / #proof bands. Its dossier plate foot said "1 briefing unit"
 * and "· dossier plate" on every product. The index printed bare names (three or four, whatever
 * the brief gave) under "instruments a capital brief actually uses" and "each instrument is a named
 * reading — not a dashboard dressed as research", beside a "how it is put together" list that named
 * them again. A figure band drew a "cost · cumulative" chart with made-up values under "how X maps
 * a briefing", a specimen band printed every description again under "X field plate", and the
 * verso/recto spread printed every description a third time as "Step 01" under "how a brief is
 * actually read" and "verso claim, recto evidence, footnotes that keep conviction honest". The
 * answers promised cancelling anytime, a comparison table, "one session" on the reader's data, a
 * person for procurement, "no hidden tier", and that every capability ships "from day one". The
 * close asked every product, a pottery studio's included, to "request the next folio" with
 * "numbered folios, source notes, and the instruments ... actually open".
 */
import { describe, expect, it } from "vitest";
import { designFromFeatures, designFromFeaturesAuthored } from "../orchestrate";
import { SHOWCASE_BRIEFS } from "../templates";
import { DesignBrief } from "../types";
import { assertBasics } from "../basics-checklist";

const sample = SHOWCASE_BRIEFS.dossier!;

const fresh = (productName: string, tagline: string, audience: string, f: [string, string][]) =>
  DesignBrief.parse({
    productName,
    tagline,
    audience,
    businessGoal: sample.businessGoal,
    siteKind: "research-dossier",
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

/** Phrases no brief here declares, and lines written for the one sample capital brief. */
const INVENTED = [
  "cost · cumulative",
  "step through the mechanism",
  "vol. xii",
  "issue 03",
  "1 briefing unit",
  "dossier plate",
  "instruments a capital brief actually uses",
  "dashboard dressed as research",
  "maps a briefing",
  "drawn rather than claimed",
  "field plate",
  "how a brief is actually read",
  "verso claim",
  "recto evidence",
  "keep conviction honest",
  "note 01",
  "put together",
  "request the next",
  "numbered folios, source notes",
  "not a demo theatre",
  "cancel anytime",
  "comparison table",
  "one session",
  "from day one",
  "procurement",
  "hidden tier",
  "editorial order",
  "research-dossier surface",
];

const plateOf = (html: string) => html.match(/<svg[^>]*data-figure="dossier-plate"[\s\S]*?<\/svg>/)?.[0] ?? "";
const railOf = (html: string) => html.match(/<nav class="ds-chapter-rail"[\s\S]*?<\/nav>/)?.[0] ?? "";
const sectionOf = (html: string, id: string) =>
  html.split(/(?=<section[^>]*data-section=")/).find((p) => new RegExp(`^<section[^>]*data-section="${id}"`).test(p)) ?? "";
const nn = (i: number) => String(i + 1).padStart(2, "0");

describe("research dossier template says each thing once", () => {
  it("draws the folio fold, one index, the priorities, questions, and the close", () => {
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

  it("names each instrument once on the plate, once in the index, and the lead once more in the close; the priorities give index numbers", async () => {
    for (const brief of briefs.slice(1)) {
      for (const html of [designFromFeatures(brief).previewHtml, (await designFromFeaturesAuthored(brief, {})).previewHtml]) {
        const text = visible(html);
        const plate = plateOf(html);
        for (const [i, f] of brief.features.entries()) {
          // Plate (drawn text) and index in the page text, plus the close for the lead. Priorities cite numbers.
          // Plate names are inside the SVG so they count in visible() after tag strip.
          expect(text.split(f.name.toLowerCase()).length - 1, `${brief.productName}: ${f.name}`).toBe(i === 0 ? 3 : 2);
          expect(plate.split(`>${nn(i)} ${f.name.slice(0, 17)}`).length - 1, `${brief.productName} plate: ${f.name}`).toBe(1);
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
        expect(html).toContain(`<p>${f.description.replace(/'/g, "&#39;")}.</p>`);
      }
    }
  });

  it("lists every instrument in the chapter rail, each jumping to its index row, with no lede or fixed volume on the fold", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const fold = sectionOf(previewHtml, "hero");
      expect(spec.sections.find((s) => s.kind === "hero")?.body).toBe("");
      expect(fold).not.toContain('class="ds-lede"');
      expect(fold).not.toContain("Vol. XII");
      expect(fold).not.toContain("Issue 03");
      for (const f of brief.features) expect(fold.toLowerCase()).not.toContain(f.description.toLowerCase().slice(0, 16));
      const rail = railOf(previewHtml);
      const hrefs = [...rail.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
      expect(hrefs).toEqual(brief.features.map((_, i) => `#instrument-${nn(i)}`));
      const plate = plateOf(previewHtml);
      expect(plate, brief.productName).not.toBe("");
      expect(visible(plate), brief.productName).not.toContain("briefing unit");
      expect(visible(plate), brief.productName).not.toContain("dossier plate");
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
    // Tiers carry no instrument drawing: tier i is not instrument i.
    expect(sectionOf(designFromFeatures(briefs[3]!).previewHtml, "story")).not.toContain("ds-chapter-mark");
  });

  it("labels every plate pin beside its own dot, numbered like the index, one pin per cell", () => {
    for (const brief of briefs) {
      const plate = plateOf(designFromFeatures(brief).previewHtml);
      const n = Math.min(brief.features.length, 40);
      for (const [i, f] of brief.features.slice(0, n).entries()) expect(plate).toContain(`>${nn(i)} ${f.name.slice(0, 17)}`);
      const dots = [...plate.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="5"/g)].map((m) => `${m[1]},${m[2]}`);
      expect(new Set(dots).size).toBe(dots.length);
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
      "Who is the Kilnroom brief for?",
      "What is not in the Kilnroom brief?",
    ]);
    const cta = spec.sections.find((s) => s.kind === "cta");
    expect(cta?.title).toBe("Start the Kilnroom brief with kiln calendar.");
    expect(cta?.body).toBe("Four more instruments sit in the index above.");
    expect([cta?.ctaLabel, cta?.secondaryLabel]).toEqual(["Open the brief", "Read all five instruments"]);
    const nav = spec.sections.find((s) => s.kind === "nav");
    expect(nav?.navItems.map((n) => n.label)).toEqual(["Instruments", "Priorities", "Questions"]);
  });

  it("carries no fold note on the authored path", async () => {
    for (const brief of briefs) {
      const html = (await designFromFeaturesAuthored(brief, {})).previewHtml;
      expect(visible(html), brief.productName).not.toContain("demo theatre");
      expect(visible(html), brief.productName).not.toContain("numbered folios");
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
    expect(html).not.toMatch(/<meta name="description" content="[^"]*(research-dossier|sections built from)/);
  });
});
