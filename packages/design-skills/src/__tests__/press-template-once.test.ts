/**
 * Press atelier template: each plate is told once, and nothing on the page is a fact no brief gave.
 *
 * Before this pass every press page had nine sections. The press fold hid the audience and the lead
 * description in the page unseen, and its press sheet cycled the plate names through all eight
 * signature cells, cut to fourteen characters, under a "SIG A–H · FORME 16" head with the product
 * name again in the middle, whatever the brief gave. The signature rail ran "Sig A" to "Sig H" and
 * pointed at bands the page did not always have. The index printed bare names (four on a six-plate
 * brief) under "everything X does, starting with Y" and "each plate is a numbered signature — not
 * a gallery dressed as a pressroom", beside a "how it is put together" list that named them again.
 * A figure band set the names twice more beside a "cost · cumulative" chart with made-up values
 * under "how X locks a forme", a specimen band printed the names again as "X forme field", and the
 * gather essay printed every description again with the name over it, "Note 01" labels, and a
 * drawing on every forme, under "how a signature is actually gathered". The answers promised
 * cancelling anytime, a comparison table, "one session" on the reader's data, a person for
 * procurement, "no hidden tier", and that every capability ships "from day one". The close asked
 * every product, a pottery studio's included, to "lock a forme" with "plate numbers, densitometer
 * marks, and the formes ... actually run".
 */
import { describe, expect, it } from "vitest";
import { designFromFeatures, designFromFeaturesAuthored } from "../orchestrate";
import { SHOWCASE_BRIEFS } from "../templates";
import { DesignBrief } from "../types";
import { assertBasics } from "../basics-checklist";

const sample = SHOWCASE_BRIEFS.press!;

const fresh = (productName: string, tagline: string, audience: string, f: [string, string][]) =>
  DesignBrief.parse({
    productName,
    tagline,
    audience,
    businessGoal: sample.businessGoal,
    siteKind: "press-atelier",
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

/** Phrases no brief here declares, and lines written for the one sample pressroom. */
const INVENTED = [
  "cost · cumulative",
  "step through the mechanism",
  "forme legend",
  "locks a forme",
  "drawn rather than claimed",
  "forme field",
  "gather notes",
  "actually gathered",
  "keep a forme honest",
  "gather check",
  "formes · densitometer",
  "note 01",
  "put together",
  "dressed as a pressroom",
  "starting with",
  "lock a forme",
  "densitometer marks, and the formes",
  "see the approach",
  "read the detail",
  "verifiable before you commit",
  "ships first",
  "forme 16",
  "cancel anytime",
  "comparison table",
  "one session",
  "from day one",
  "procurement",
  "hidden tier",
];

const sheetOf = (html: string) => html.match(/<svg[^>]*data-figure="press-sheet"[\s\S]*?<\/svg>/)?.[0] ?? "";
const sectionOf = (html: string, id: string) =>
  html.split(/(?=<section[^>]*data-section=")/).find((p) => new RegExp(`^<section[^>]*data-section="${id}"`).test(p)) ?? "";
const sig = (i: number) => "ABCDEFGH"[i]!;

describe("press atelier template says each thing once", () => {
  it("draws the press fold, one index, the gather, questions, and the close", () => {
    const { spec } = designFromFeatures(sample);
    expect(spec.sections.map((s) => s.id)).toEqual(["nav", "hero", "features", "story", "faq", "cta", "footer"]);
    expect(spec.sections.some((s) => ["specimen", "compare", "figure", "proof", "metrics"].includes(s.kind))).toBe(false);
  });

  it("prints each plate description once on every brief, both paths", async () => {
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

  it("names each plate once on the press sheet, once in the index, once in the gather, and the lead once more in the close", async () => {
    for (const brief of briefs) {
      for (const html of [designFromFeatures(brief).previewHtml, (await designFromFeaturesAuthored(brief, {})).previewHtml]) {
        const text = visible(html);
        const sheet = sheetOf(html);
        for (const [i, f] of brief.features.entries()) {
          // Sheet, index, and gather, plus the close for the lead. It was up to eleven.
          expect(text.split(f.name.toLowerCase()).length - 1, `${brief.productName}: ${f.name}`).toBe(i === 0 ? 4 : 3);
          expect(sheet.split(`>${f.name}<`).length - 1, `${brief.productName} sheet: ${f.name}`).toBe(1);
        }
      }
    }
  });

  it("puts every plate in the one index, lettered like the sheet, with its description and no list beside it", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const index = spec.sections.filter((s) => s.kind === "features");
      expect(index).toHaveLength(1);
      expect(index[0]!.blocks.map((b) => b.title)).toEqual(brief.features.map((f) => f.name));
      expect(index[0]!.blocks.map((b) => b.meta)).toEqual(brief.features.map((_, i) => `Sig ${sig(i)}`));
      expect(index[0]!.blocks.every((b) => b.body.length > 0 && b.kicker === undefined)).toBe(true);
      expect(index[0]!.body).toBe("");
      expect(index[0]!.eyebrow).toBe("The plates");
      expect(index[0]!.title).toBe(`${brief.productName}, plate by plate.`);
      const html = sectionOf(previewHtml, "features");
      expect(html, brief.productName).not.toMatch(/<figure class="ds-plate/);
      for (const [i, f] of brief.features.entries()) {
        expect(html).toContain(`id="plate-${sig(i).toLowerCase()}" data-feature="${f.name}"`);
        expect(html).toContain(`<p>${f.description.replace(/'/g, "&#39;")}.</p>`);
      }
    }
  });

  it("names each plate in its own signature cell, with no lede, hidden audience, or fixed sheet head on the fold", () => {
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
      const sheet = sheetOf(previewHtml);
      expect(sheet, brief.productName).not.toBe("");
      const labels = [...sheet.matchAll(/<text[^>]*>([^<]+)<\/text>/g)].map((m) => m[1]!);
      // Every cell keeps its signature letter; only the cells with a plate carry a name.
      expect(labels.filter((l) => /^SIG [A-H]$/.test(l))).toEqual("ABCDEFGH".split("").map((S) => `SIG ${S}`));
      const names = labels.filter((l) => brief.features.some((f) => f.name === l));
      expect(names).toEqual(brief.features.map((f) => f.name));
      const last = sig(brief.features.length - 1);
      expect(labels).toContain(`SIG A–${last}`);
      expect(sheet).not.toContain("FORME 16");
      expect(labels).not.toContain(brief.productName);
      // The rail and the masthead count the plates the brief gives.
      const rail = previewHtml.match(/<nav class="ds-sig-rail"[\s\S]*?<\/nav>/)?.[0] ?? "";
      const hrefs = [...rail.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
      expect(hrefs).toEqual(brief.features.map((_, i) => `#plate-${sig(i).toLowerCase()}`));
      const mast = previewHtml.match(/<header class="ds-press-masthead"[\s\S]*?<\/header>/)?.[0] ?? "";
      expect(mast).toContain(`Sig A–${last}`);
      expect(mast).toContain(`${brief.features.length} plates`);
      expect(mast).not.toContain("Sig A–H");
    }
  });

  it("groups the plates by the priority the brief gives in the gather, each note pointing at signature letters", () => {
    const { spec, previewHtml } = designFromFeatures(briefs[3]!);
    const story = spec.sections.find((s) => s.kind === "story");
    expect(story?.eyebrow).toBe("Priorities");
    expect(story?.title).toBe("Which Kilnroom plates come first.");
    expect(story?.blocks.map((b) => [b.title, b.body, b.meta, b.points])).toEqual([
      ["Core", "Kiln calendar and glaze library.", "01", ["A", "B"]],
      ["Supporting", "Member shelves and clay orders.", "02", ["C", "D"]],
      ["Additional", "Class roster.", "03", ["E"]],
    ]);
    const html = sectionOf(previewHtml, "story");
    expect(html).toContain("3 tiers");
    const notes = [...html.matchAll(/<p class="ds-gather-note">([\s\S]*?)<\/p>/g)].map((m) => m[1]!.replace(/<[^>]+>/g, ""));
    expect(notes).toEqual(["2 plates · Sig A, B", "2 plates · Sig C, D", "1 plate · Sig E"]);
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(["#plate-a", "#plate-b", "#plate-c", "#plate-d", "#plate-e"]);
    expect(html).not.toContain('class="ds-gather-mark"');
    expect(html).not.toContain("ds-densito-label");
    expect(html).not.toMatch(/Note 0\d/);
  });

  it("leaves the gather out when the brief gives a single priority, and still clears the basics", () => {
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
    expect(faq?.title).toBe("Questions about the Kilnroom press sheet.");
    expect(faq?.blocks.map((b) => [b.title, b.body])).toEqual([
      ["Who is the Kilnroom press sheet for?", "Studio managers at community pottery studios."],
      ["What is not on the Kilnroom press sheet?", "Anything that is not one of its five plates."],
    ]);
    const cta = spec.sections.find((s) => s.kind === "cta");
    expect(cta?.eyebrow).toBe("Pressroom");
    expect(cta?.title).toBe("Start the Kilnroom press sheet with kiln calendar.");
    expect(cta?.body).toBe("Four more plates are set in the index above.");
    expect([cta?.ctaLabel, cta?.secondaryLabel]).toEqual(["Open the press sheet", "Read all five plates"]);
    const nav = spec.sections.find((s) => s.kind === "nav");
    expect(nav?.navItems.map((n) => n.label)).toEqual(["Plates", "Priorities", "Questions"]);
  });

  it("asks which plate handles approvals only when the brief declares an approval step", () => {
    const proofroom = DesignBrief.parse({
      productName: "Proofroom",
      tagline: "How a page reaches the printer",
      audience: "production editors",
      businessGoal: "trust",
      siteKind: "press-atelier",
      lockSiteKind: true,
      features: [
        { id: "c1", name: "Galley proofs", description: "Every page set and proofed before press", priority: "p0" },
        { id: "c2", name: "Press sign-off", description: "Named approvals before a page goes to press", priority: "p0" },
        { id: "c3", name: "Errata notes", description: "What changed after printing, and where", priority: "p1" },
      ],
      taste: sample.taste,
    });
    const faq = designFromFeatures(proofroom).spec.sections.find((s) => s.kind === "faq");
    const approve = faq?.blocks.find((b) => b.title === "Which plate handles approvals?");
    expect(approve?.body).toBe("Press sign-off, Sig B in the index above.");
    // The sample's densitometer strip mentions "the approved forme"; that is not an approval step.
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
    expect(html).not.toMatch(/<meta name="description" content="[^"]*(press-atelier|sections built from)/);
  });
});
