/**
 * Educational (mechanism explainer) template: each part is told once, and nothing on the page is a
 * fact no brief gave.
 *
 * Before this pass every explainer page had eight sections. The scrub fold printed the lead
 * description under the headline, listed the first four parts, then drew them again above a
 * "cost · cumulative" chart with values of 100, 70, 40 and 10 that no brief gave, cut the second
 * part's description mid-word inside it, and printed the active part's name a third time under the
 * range. A specimen strip named the parts again, the index printed bare names beside a drawn
 * interface and a "how it is put together" list that named them twice more, the chapters printed
 * every description a second time under "placement, preemption, backpressure, failure — the cost
 * function in order", and a "what is included" table set made-up Core / Standard / Full columns
 * under a lede calling it "the same list as above, arranged the way a procurement review asks for
 * it". A four-part brief named each part nine times; a five-part brief left two parts out of the
 * index and off the fold. Every explainer page, a marina's or a pottery studio's included, closed on
 * "see it against your own material" and "four capabilities, one conversation".
 */
import { describe, expect, it } from "vitest";
import { designFromFeatures, designFromFeaturesAuthored } from "../orchestrate";
import { SHOWCASE_BRIEFS } from "../templates";
import { DesignBrief } from "../types";
import { assertBasics } from "../basics-checklist";

const sample = SHOWCASE_BRIEFS.educational!;

const fresh = (productName: string, tagline: string, audience: string, f: [string, string][]) =>
  DesignBrief.parse({
    productName,
    tagline,
    audience,
    businessGoal: sample.businessGoal,
    siteKind: "docs-educational",
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

/** Phrases no brief here declares, and lines written for the one sample routing runtime. */
const INVENTED = [
  "cost · cumulative",
  "the cost path",
  "decides under constraint",
  "the cost function in order",
  "placement, preemption",
  "two carry the argument",
  "remove reasons to say no",
  "the same list as above",
  "procurement",
  "what is included",
  "standard",
  "see it against your own material",
  "one conversation",
  "verifiable before you commit",
  "step through the mechanism",
  "the scrub",
  "editorial order",
  "the mechanism",
  "put together",
  "cancel anytime",
  "comparison table",
  "one session",
  "from day one",
  "does with",
];

const plateOf = (html: string) => html.match(/<svg[^>]*data-figure="mechanism-plate"[\s\S]*?<\/svg>/)?.[0] ?? "";
const sectionOf = (html: string, id: string) =>
  html.split(/(?=<section[^>]*data-section=")/).find((p) => new RegExp(`^<section[^>]*data-section="${id}"`).test(p)) ?? "";

describe("educational template says each thing once", () => {
  it("draws the scrub fold, one index, the priorities, questions, and the close", () => {
    const { spec } = designFromFeatures(sample);
    expect(spec.sections.map((s) => s.id)).toEqual(["nav", "hero", "features", "story", "faq", "cta", "footer"]);
    expect(spec.sections.some((s) => ["specimen", "compare", "figure", "proof", "metrics"].includes(s.kind))).toBe(false);
  });

  it("prints each part description once on every brief, both paths", async () => {
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

  it("names each part at most four times on the page, both paths", async () => {
    // Fold list, index, priorities, and the close's first part. It was nine on every brief.
    for (const brief of briefs) {
      for (const html of [designFromFeatures(brief).previewHtml, (await designFromFeaturesAuthored(brief, {})).previewHtml]) {
        const text = visible(html);
        for (const [i, f] of brief.features.entries()) {
          expect(text.split(f.name.toLowerCase()).length - 1, `${brief.productName}: ${f.name}`).toBe(i === 0 ? 4 : 3);
        }
      }
    }
  });

  it("puts every part in the one index, numbered, with its description and no drawing beside it", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const index = spec.sections.filter((s) => s.kind === "features");
      expect(index).toHaveLength(1);
      expect(index[0]!.blocks.map((b) => b.title)).toEqual(brief.features.map((f) => f.name));
      expect(index[0]!.blocks.map((b) => b.meta)).toEqual(brief.features.map((_, i) => String(i + 1).padStart(2, "0")));
      expect(index[0]!.blocks.every((b) => b.body.length > 0 && b.kicker === undefined)).toBe(true);
      expect(index[0]!.body).toBe("");
      const html = sectionOf(previewHtml, "features");
      expect(html, brief.productName).not.toMatch(/<figure class="ds-plate/);
      expect(html).not.toMatch(/data-figure="interface"/);
    }
  });

  it("names each part once on the fold, with no lede, chart values, or caption repeating it", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const fold = sectionOf(previewHtml, "hero");
      expect(spec.sections.find((s) => s.kind === "hero")?.body).toBe("");
      for (const f of brief.features) {
        expect(fold.split(`>${f.name}<`).length - 1, `${brief.productName}: ${f.name}`).toBe(1);
        expect(fold.toLowerCase()).not.toContain(f.description.toLowerCase().slice(0, 16));
      }
      const plate = plateOf(previewHtml);
      expect(plate, brief.productName).not.toBe("");
      for (const f of brief.features) expect(plate).not.toContain(f.name);
      expect(plate).not.toMatch(/>(100|70|40|10)</);
      expect(fold).not.toContain("data-scrub-caption");
      expect(fold).toContain(`<p class="ds-eyebrow">${brief.features.length === 4 ? "Four" : "Five"} parts</p>`);
    }
  });

  it("draws one numbered column per part, as tall as the priority the brief gives, and the range moves across them", () => {
    const plate = plateOf(designFromFeatures(briefs[3]!).previewHtml);
    expect(plate).toContain(">HEIGHT · PRIORITY<");
    expect(plate.match(/class="ds-scrub-node"/g)).toHaveLength(5);
    expect(plate.match(/class="ds-scrub-stem"/g)).toHaveLength(5);
    for (const n of ["01", "02", "03", "04", "05"]) expect(plate).toContain(`>${n}<`);
    const ys = [...plate.matchAll(/class="ds-scrub-node" data-step="\d" cx="[\d.]+" cy="([\d.]+)"/g)].map((m) => Number(m[1]));
    // Core parts stand tallest, supporting next, additional lowest (smaller y is taller).
    expect(ys[0]).toBe(ys[1]);
    expect(ys[2]).toBe(ys[3]);
    expect(ys[0]!).toBeLessThan(ys[2]!);
    expect(ys[2]!).toBeLessThan(ys[4]!);
    const html = designFromFeatures(briefs[3]!).previewHtml;
    expect(html).toContain('max="4" value="1" data-scrub aria-label="Step through the parts"');
    // With one priority the columns are level and the plate has nothing to explain.
    const flat = DesignBrief.parse({ ...sample, features: sample.features.map((f) => ({ ...f, priority: "p0" })) });
    expect(plateOf(designFromFeatures(flat).previewHtml)).not.toContain("HEIGHT · PRIORITY");
  });

  it("groups the parts by the priority the brief gives", () => {
    const { spec } = designFromFeatures(briefs[3]!);
    const story = spec.sections.find((s) => s.kind === "story");
    expect(story?.eyebrow).toBe("Priorities");
    expect(story?.title).toBe("Which Kilnroom parts to read first.");
    expect(story?.blocks.map((b) => [b.title, b.body])).toEqual([
      ["Core", "Two parts: kiln calendar and glaze library."],
      ["Supporting", "Two parts: member shelves and clay orders."],
      ["Additional", "One part: class roster."],
    ]);
    const html = sectionOf(designFromFeatures(briefs[3]!).previewHtml, "story");
    expect(html).not.toContain("beats · editorial order");
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

  it("builds the questions, the close, and the menu from the brief's own names", () => {
    const { spec } = designFromFeatures(briefs[3]!);
    const faq = spec.sections.find((s) => s.kind === "faq");
    expect(faq?.title).toBe("Questions about Kilnroom.");
    expect(faq?.blocks.map((b) => [b.title, b.body])).toEqual([
      ["Who is Kilnroom written for?", "Studio managers at community pottery studios."],
      ["What does Kilnroom not cover?", "Anything that is not one of its five parts."],
    ]);
    const cta = spec.sections.find((s) => s.kind === "cta");
    expect(cta?.title).toBe("Start with kiln calendar.");
    expect(cta?.body).toBe("Four more parts follow in the index above.");
    expect([cta?.ctaLabel, cta?.secondaryLabel]).toEqual(["See the approach", "Read all five parts"]);
    const nav = spec.sections.find((s) => s.kind === "nav");
    expect(nav?.navItems.map((n) => n.label)).toEqual(["Parts", "Priorities", "Questions"]);
  });

  it("asks which part handles approvals only when the brief declares an approval step", () => {
    const runbook = DesignBrief.parse({
      productName: "Runbook",
      tagline: "How a change reaches production",
      audience: "platform engineers",
      businessGoal: "trust",
      siteKind: "docs-educational",
      lockSiteKind: true,
      features: [
        { id: "c1", name: "Change request", description: "Every change written down before it starts", priority: "p0" },
        { id: "c2", name: "Release sign-off", description: "Named approvals before a change goes live", priority: "p0" },
        { id: "c3", name: "Rollback notes", description: "What to undo, and in which order", priority: "p1" },
      ],
      taste: sample.taste,
    });
    const faq = designFromFeatures(runbook).spec.sections.find((s) => s.kind === "faq");
    const approve = faq?.blocks.find((b) => b.title === "Which part handles approvals?");
    expect(approve?.body).toBe("Release sign-off. Its description is in the index above.");
    for (const brief of briefs) {
      expect(designFromFeatures(brief).previewHtml, brief.productName).not.toMatch(/handles approvals/i);
    }
  });

  it("carries no fold note on the authored path", async () => {
    for (const brief of briefs) {
      const html = (await designFromFeaturesAuthored(brief, {})).previewHtml;
      expect(visible(html), brief.productName).not.toContain("ships first");
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
  });
});
