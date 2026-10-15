/**
 * Merchandising loom template: each line is told once, and nothing on the page is a fact no brief gave.
 *
 * Before this pass every loom page had nine sections. The drawloom fold put the audience over the
 * claim and the lead description under it, and its cloth cycled the line names through all six
 * cells, each with a made-up SKU number ("Sku 100"), under a "Loom · warp × weft" head with the
 * product name again in the middle and a foot that named the product a third time beside "6 cells ·
 * free textile stock", whatever the brief gave. The treadles ran XS to XXL and pointed at bands the
 * page did not always have. The index printed bare names (four on a six-line brief) under "lines a
 * merchandising loom actually cuts" and "each line is a woven SKU — not a product card dressed as
 * merchandising", beside a "how it is put together" list that named them again. A figure band set
 * the names twice more beside a "cost · cumulative" chart with made-up values under "how X weaves a
 * cut", a specimen band printed the names again as "X loom field", and the hangtag essay printed
 * every description again with the name over it, a size tape that named every line once more,
 * "Note 01" labels, and a drawing on every tag, under "how a hangtag is actually cut". The answers
 * promised cancelling anytime, a comparison table, "one session" on the reader's data, a person for
 * procurement, "no hidden tier", and that every capability ships "from day one". The close asked
 * every product, a pottery studio's included, to "cut a sample" with "size tapes, SKU cells, and
 * the lines ... actually cut".
 */
import { describe, expect, it } from "vitest";
import { designFromFeatures, designFromFeaturesAuthored } from "../orchestrate";
import { SHOWCASE_BRIEFS } from "../templates";
import { DesignBrief } from "../types";
import { assertBasics } from "../basics-checklist";

const sample = SHOWCASE_BRIEFS.loom!;

const fresh = (productName: string, tagline: string, audience: string, f: [string, string][]) =>
  DesignBrief.parse({
    productName,
    tagline,
    audience,
    businessGoal: sample.businessGoal,
    siteKind: "commerce-loom",
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

/** Phrases no brief here declares, and lines written for the one sample merchandising press. */
const INVENTED = [
  "cost · cumulative",
  "step through the mechanism",
  "drawn rather than claimed",
  "weaves a cut",
  "loom field",
  "how a hangtag",
  "actually cut",
  "keep a cut honest",
  "tags · size tape",
  "note 01",
  "put together",
  "dressed as merchandising",
  "woven sku",
  "starting with",
  "cut a sample",
  "size tapes, sku cells",
  "request a cut",
  "walk the loom",
  "not a demo theatre",
  "verifiable before you commit",
  "ships first",
  "cells · free textile",
  "sku 10",
  "cancel anytime",
  "comparison table",
  "one session",
  "from day one",
  "procurement",
  "hidden tier",
];

const clothOf = (html: string) => html.match(/<svg[^>]*data-figure="loom-weave"[\s\S]*?<\/svg>/)?.[0] ?? "";
const sectionOf = (html: string, id: string) =>
  html.split(/(?=<section[^>]*data-section=")/).find((p) => new RegExp(`^<section[^>]*data-section="${id}"`).test(p)) ?? "";
const num = (i: number) => String(i + 1).padStart(2, "0");

describe("merchandising loom template says each thing once", () => {
  it("draws the drawloom fold, one index, the hangtags, questions, and the close", () => {
    const { spec } = designFromFeatures(sample);
    expect(spec.sections.map((s) => s.id)).toEqual(["nav", "hero", "features", "story", "faq", "cta", "footer"]);
    expect(spec.sections.some((s) => ["specimen", "compare", "figure", "proof", "metrics"].includes(s.kind))).toBe(false);
  });

  it("prints each line description once on every brief, both paths", async () => {
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

  it("names each line once on the cloth, once in the index, and the lead once more in the close; hangtags give numbers", async () => {
    for (const brief of briefs) {
      for (const html of [designFromFeatures(brief).previewHtml, (await designFromFeaturesAuthored(brief, {})).previewHtml]) {
        // The sample's own sentences use its names ("Bottom size treadles that land you …"), so
        // the descriptions, printed once each, are set aside before counting names.
        let text = visible(html);
        for (const f of brief.features) text = text.split(f.description.toLowerCase()).join(" ");
        const cloth = clothOf(html);
        for (const [i, f] of brief.features.entries()) {
          // Cloth and index, plus the close for the lead; hangtags cite line numbers. It was up to eleven. "Care
          // label" is also the close's own label on every loom page.
          const label = f.name.toLowerCase() === "care label" ? 1 : 0;
          expect(text.split(f.name.toLowerCase()).length - 1, `${brief.productName}: ${f.name}`).toBe((i === 0 ? 3 : 2) + label);
          expect(cloth.split(`>${f.name}<`).length - 1, `${brief.productName} cloth: ${f.name}`).toBe(1);
        }
      }
    }
  });

  it("puts every line in the one index, numbered like the cloth, with its description and no list beside it", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const index = spec.sections.filter((s) => s.kind === "features");
      expect(index).toHaveLength(1);
      expect(index[0]!.blocks.map((b) => b.title)).toEqual(brief.features.map((f) => f.name));
      expect(index[0]!.blocks.map((b) => b.meta)).toEqual(brief.features.map((_, i) => num(i)));
      expect(index[0]!.blocks.every((b) => b.body.length > 0 && b.kicker === undefined)).toBe(true);
      expect(index[0]!.body).toBe("");
      expect(index[0]!.eyebrow).toBe("The lines");
      expect(index[0]!.title).toBe(`${brief.productName}, line by line.`);
      const html = sectionOf(previewHtml, "features");
      expect(html, brief.productName).not.toMatch(/<figure class="ds-plate/);
      for (const [i, f] of brief.features.entries()) {
        expect(html).toContain(`id="line-${num(i)}" data-feature="${f.name}"`);
        expect(html).toContain(`<p>${f.description.replace(/'/g, "&#39;")}.</p>`);
      }
    }
  });

  it("names each line in its own cell, with no eyebrow, lede, SKU numbers, or fixed loom head on the fold", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const fold = sectionOf(previewHtml, "hero");
      const hero = spec.sections.find((s) => s.kind === "hero");
      expect(hero?.body).toBe("");
      expect(hero?.eyebrow).toBe("");
      expect(hero?.secondaryLabel).toBeUndefined();
      expect(fold).not.toContain('class="ds-lede"');
      expect(fold).not.toContain('class="ds-cta-note"');
      expect(fold.toLowerCase()).not.toContain(brief.audience.toLowerCase());
      for (const f of brief.features) expect(fold.toLowerCase()).not.toContain(f.description.toLowerCase().slice(0, 16));
      const cloth = clothOf(previewHtml);
      expect(cloth, brief.productName).not.toBe("");
      const labels = [...cloth.matchAll(/<text[^>]*>([^<]+)<\/text>/g)].map((m) => m[1]!);
      const shown = brief.features.slice(0, 6);
      // Only the cells with a line carry a number and a name, in the brief's order.
      // Tiles carry their number ("01") and name; no "Line 01" tab text, no photos, no spare tiles.
      expect(labels.filter((l) => /^\d\d$/.test(l))).toEqual(shown.map((_, i) => num(i)));
      expect(cloth).not.toContain("<image");
      expect(labels).not.toContain("Shuttle");
      expect(labels.filter((l) => brief.features.some((f) => f.name === l))).toEqual(shown.map((f) => f.name));
      expect(labels).toContain(`Lines 01–${num(shown.length - 1)}`);
      expect(labels).not.toContain(brief.productName);
      expect(labels.some((l) => /^Sku /.test(l) || /free textile stock/.test(l) || /loom weave/.test(l))).toBe(false);
      // No treadle tab strip (a second "Line 01–05"), no "Fell" word, no threads through the headline.
      expect(fold).not.toMatch(/ds-treadles|ds-fell|ds-shuttle|ds-weft-thread|<svg class="ds-shed"/);
      expect(fold).not.toContain(">Fell<");
      const beam = previewHtml.match(/<header class="ds-loom-beam"[\s\S]*?<\/header>/)?.[0] ?? "";
      expect(beam).toContain(`Lines 01–${num(shown.length - 1)}`);
      expect(beam).not.toContain("Shed · warp × weft");
    }
  });

  it("groups the lines by the priority the brief gives on the hangtags, each note pointing at line numbers", () => {
    const { spec, previewHtml } = designFromFeatures(briefs[3]!);
    const story = spec.sections.find((s) => s.kind === "story");
    expect(story?.eyebrow).toBe("Priorities");
    expect(story?.title).toBe("Which Kilnroom lines come first.");
    expect(story?.blocks.map((b) => [b.title, b.body, b.meta, b.points])).toEqual([
      ["Core", "Kilnroom starts here.", "I", ["01", "02"]],
      ["Supporting", "Open these once the core lines are in use.", "II", ["03", "04"]],
      ["Additional", "Kept on hand alongside the rest.", "III", ["05"]],
    ]);
    const html = sectionOf(previewHtml, "story");
    expect(html).toContain("3 tiers");
    const notes = [...html.matchAll(/<p class="ds-hang-note">([\s\S]*?)<\/p>/g)].map((m) => m[1]!.replace(/<[^>]+>/g, ""));
    expect(notes).toEqual(["Lines 01, 02", "Lines 03, 04", "Line 05"]);
    // Hangtags only: no tier tape strip saying the tiers again.
    expect(html).not.toContain('class="ds-hang-tape"');
    for (const f of briefs[3]!.features) expect(html).not.toContain(`>${f.name}`);
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(["#line-01", "#line-02", "#line-03", "#line-04", "#line-05"]);
    expect(html).not.toContain('class="ds-hang-mark"');
    expect(html).not.toMatch(/Note 0\d/);
  });

  it("leaves the hangtags out when the brief gives a single priority, and still clears the basics", () => {
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
    expect(faq?.title).toBe("Questions about the Kilnroom loom.");
    expect(faq?.blocks.map((b) => [b.title, b.body])).toEqual([
      ["Who is the Kilnroom loom for?", "Studio managers at community pottery studios."],
      ["What is not on the Kilnroom loom?", "Anything that is not one of its five lines."],
    ]);
    const cta = spec.sections.find((s) => s.kind === "cta");
    expect(cta?.eyebrow).toBe("Care label");
    expect(cta?.title).toBe("Start the Kilnroom loom with kiln calendar.");
    expect(cta?.body).toBe("Four more lines are woven into the index above.");
    expect([cta?.ctaLabel, cta?.secondaryLabel]).toEqual(["Open the loom", "Read all five lines"]);
    const nav = spec.sections.find((s) => s.kind === "nav");
    expect(nav?.navItems.map((n) => n.label)).toEqual(["Lines", "Priorities", "Questions"]);
  });

  it("asks which line handles approvals only when the brief declares an approval step", () => {
    const sampleRoom = DesignBrief.parse({
      productName: "Sample Room",
      tagline: "How a season's line reaches the buyer",
      audience: "wholesale buyers",
      businessGoal: "trust",
      siteKind: "commerce-loom",
      lockSiteKind: true,
      features: [
        { id: "c1", name: "Line sheets", description: "Every style with its colours and sizes", priority: "p0" },
        { id: "c2", name: "Buyer sign-off", description: "Named approvals before a style goes to order", priority: "p0" },
        { id: "c3", name: "Reorder notes", description: "What sold through, and where", priority: "p1" },
      ],
      taste: sample.taste,
    });
    const faq = designFromFeatures(sampleRoom).spec.sections.find((s) => s.kind === "faq");
    const approve = faq?.blocks.find((b) => b.title === "Which line handles approvals?");
    expect(approve?.body).toBe("Buyer sign-off, line 02 in the index above.");
    for (const brief of briefs) {
      expect(designFromFeatures(brief).previewHtml, brief.productName).not.toMatch(/handles approvals/i);
    }
  });

  it("carries no fold note on the authored path", async () => {
    for (const brief of briefs) {
      const html = (await designFromFeaturesAuthored(brief, {})).previewHtml;
      expect(visible(html), brief.productName).not.toContain("ships first");
      expect(html).not.toContain('class="ds-cta-note"');
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
    expect(html).not.toMatch(/<meta name="description" content="[^"]*(commerce-loom|sections built from)/);
  });
});
