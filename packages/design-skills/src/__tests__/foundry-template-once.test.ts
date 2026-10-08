/**
 * Editorial foundry template: each cut is told once, and nothing on the page is a fact no brief
 * gave.
 *
 * Before this pass every foundry page had nine sections. The hard-seam fold printed the lead
 * description under the headline, offered "Request a specimen" and "See the cuts" with a note that
 * "trial files ship with the optical sizes you will actually set", and set a type ladder whose rungs
 * were fixed "Display", "Title", "Deck", "Text", and "Caption" sizes with the first capability names
 * beside them and the product name again as "· optical sizes". The index printed bare names (three
 * or four, whatever the brief gave) under "cuts drawn for real reading sizes" and "each cut is a size
 * and a job — not a style picker dressed as a product", beside a "how it is put together" list that
 * named them again. A figure band drew the ladder a second time beside a "cost · cumulative" chart
 * with made-up values, a specimen band printed the names again, and the marginalia essay printed
 * every description again with the other names hung beside each one as "cut slips" and "Note 01"
 * labels, under "measure, hierarchy, and the notes that keep a layout from drifting". The answers
 * promised cancelling anytime, a comparison table, "one session" on the reader's data, a person for
 * procurement, and that every capability ships "from day one". The close asked every product, a
 * pottery studio's included, to "request a specimen" with "edition notes, trial files, and the cuts
 * ... actually set".
 */
import { describe, expect, it } from "vitest";
import { designFromFeatures, designFromFeaturesAuthored } from "../orchestrate";
import { SHOWCASE_BRIEFS } from "../templates";
import { DesignBrief } from "../types";
import { assertBasics } from "../basics-checklist";

const sample = SHOWCASE_BRIEFS.foundry!;

const fresh = (productName: string, tagline: string, audience: string, f: [string, string][]) =>
  DesignBrief.parse({
    productName,
    tagline,
    audience,
    businessGoal: sample.businessGoal,
    siteKind: "editorial-foundry",
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

/** Phrases no brief here declares, and lines written for the one sample type foundry. */
const INVENTED = [
  "cost · cumulative",
  "optical sizes",
  "step through the mechanism",
  "cuts drawn for real reading sizes",
  "dressed as a product",
  "changes with size",
  "drawn, not described",
  "at reading size",
  "how the face is set on a real page",
  "keep a layout from drifting",
  "cuts · annotated",
  "note 01",
  "put together",
  "request a specimen",
  "trial files",
  "edition notes",
  "cancel anytime",
  "comparison table",
  "one session",
  "from day one",
  "procurement",
  "hidden tier",
];

const ladderOf = (html: string) => html.match(/<svg[^>]*data-figure="type-ladder"[\s\S]*?<\/svg>/)?.[0] ?? "";
const sectionOf = (html: string, id: string) =>
  html.split(/(?=<section[^>]*data-section=")/).find((p) => new RegExp(`^<section[^>]*data-section="${id}"`).test(p)) ?? "";
const nn = (i: number) => String(i + 1).padStart(2, "0");

describe("foundry template says each thing once", () => {
  it("draws the seam fold, one index, the marginalia, questions, and the close", () => {
    const { spec } = designFromFeatures(sample);
    expect(spec.sections.map((s) => s.id)).toEqual(["nav", "hero", "features", "story", "faq", "cta", "footer"]);
    expect(spec.sections.some((s) => ["specimen", "compare", "figure", "proof", "metrics"].includes(s.kind))).toBe(false);
  });

  it("prints each cut description once on every brief, both paths", async () => {
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

  it("names each cut once on the ladder, once in the index, once in the marginalia, and the lead once more in the close", async () => {
    for (const brief of briefs) {
      for (const html of [designFromFeatures(brief).previewHtml, (await designFromFeaturesAuthored(brief, {})).previewHtml]) {
        const text = visible(html);
        const ladder = ladderOf(html);
        for (const [i, f] of brief.features.entries()) {
          // Ladder, index, and marginalia, plus the close for the lead. It was up to fourteen.
          expect(text.split(f.name.toLowerCase()).length - 1, `${brief.productName}: ${f.name}`).toBe(i === 0 ? 4 : 3);
          expect(ladder.split(`>${f.name}<`).length - 1, `${brief.productName} ladder: ${f.name}`).toBe(1);
        }
      }
    }
  });

  it("puts every cut in the one index, numbered, with its description and no drawing beside it", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const index = spec.sections.filter((s) => s.kind === "features");
      expect(index).toHaveLength(1);
      expect(index[0]!.blocks.map((b) => b.title)).toEqual(brief.features.map((f) => f.name));
      expect(index[0]!.blocks.map((b) => b.meta)).toEqual(brief.features.map((_, i) => nn(i)));
      expect(index[0]!.blocks.every((b) => b.body.length > 0 && b.kicker === undefined)).toBe(true);
      expect(index[0]!.body).toBe("");
      expect(index[0]!.eyebrow).toBe("The cuts");
      expect(index[0]!.title).toBe(`${brief.productName}, cut by cut.`);
      const html = sectionOf(previewHtml, "features");
      expect(html, brief.productName).not.toMatch(/<figure class="ds-plate/);
      for (const [i, f] of brief.features.entries()) {
        expect(html).toContain(`id="cut-${nn(i)}" data-feature="${f.name}"`);
        expect(html).toContain(`<p>${f.description.replace(/'/g, "&#39;")}.</p>`);
      }
    }
  });

  it("names each cut on its own numbered ladder rung, with no lede, fixed size words, or second product name on the fold", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const fold = sectionOf(previewHtml, "hero");
      const hero = spec.sections.find((s) => s.kind === "hero");
      expect(hero?.body).toBe("");
      expect(hero?.secondaryLabel).toBeUndefined();
      expect(fold).not.toContain('class="ds-lede"');
      expect(fold).not.toContain('class="ds-cta-note"');
      for (const f of brief.features) expect(fold.toLowerCase()).not.toContain(f.description.toLowerCase().slice(0, 16));
      const ladder = ladderOf(previewHtml);
      expect(ladder, brief.productName).not.toBe("");
      const labels = [...ladder.matchAll(/<text[^>]*>([^<]+)<\/text>/g)].map((m) => m[1]);
      expect(labels).toEqual(brief.features.flatMap((f, i) => [nn(i), f.name]));
      // The labels above are the ladder's only text: no size words and no second product name.
      for (const word of [">Display<", ">Title<", ">Deck<", ">Text<", ">Caption<", "optical sizes"]) {
        expect(ladder).not.toContain(word);
      }
      // A short brief still steps through five sizes; the spare rungs stay unnamed.
      const rules = (ladder.match(/<line [^>]*opacity="0.5"/g) ?? []).length;
      expect(rules, brief.productName).toBe(Math.max(5, brief.features.length) - 1);
    }
  });

  it("groups the cuts by the priority the brief gives in the marginalia, each note pointing at index numbers", () => {
    const { spec, previewHtml } = designFromFeatures(briefs[3]!);
    const story = spec.sections.find((s) => s.kind === "story");
    expect(story?.eyebrow).toBe("Priorities");
    expect(story?.title).toBe("Which Kilnroom cuts come first.");
    expect(story?.blocks.map((b) => [b.title, b.body, b.meta, b.points])).toEqual([
      ["Core", "Kiln calendar and glaze library.", "01", ["01", "02"]],
      ["Supporting", "Member shelves and clay orders.", "02", ["03", "04"]],
      ["Additional", "Class roster.", "03", ["05"]],
    ]);
    const html = sectionOf(previewHtml, "story");
    expect(html).toContain("3 tiers");
    const notes = [...html.matchAll(/<p class="ds-marginalia-meta">([^<]+)<\/p>/g)].map((m) => m[1]);
    expect(notes).toEqual(["2 cuts", "2 cuts", "1 cut"]);
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(["#cut-01", "#cut-02", "#cut-03", "#cut-04", "#cut-05"]);
    expect(html).not.toContain('class="ds-cut-slips"');
    expect(html).not.toContain('class="ds-marginalia-mark"');
    expect(html).not.toContain('class="ds-marginalia-rail"');
  });

  it("leaves the marginalia out when the brief gives a single priority, and still clears the basics", () => {
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
    expect(faq?.title).toBe("Questions about the Kilnroom specimen.");
    expect(faq?.blocks.map((b) => [b.title, b.body])).toEqual([
      ["Who is the Kilnroom specimen for?", "Studio managers at community pottery studios."],
      ["What is not in the Kilnroom specimen?", "Anything that is not one of its five cuts."],
    ]);
    const cta = spec.sections.find((s) => s.kind === "cta");
    expect(cta?.eyebrow).toBe("Colophon");
    expect(cta?.title).toBe("Start the Kilnroom specimen with kiln calendar.");
    expect(cta?.body).toBe("Four more cuts are set in the index above.");
    expect([cta?.ctaLabel, cta?.secondaryLabel]).toEqual(["Open the specimen", "Read all five cuts"]);
    const nav = spec.sections.find((s) => s.kind === "nav");
    expect(nav?.navItems.map((n) => n.label)).toEqual(["Cuts", "Priorities", "Questions"]);
  });

  it("asks which cut handles approvals only when the brief declares an approval step", () => {
    const proofroom = DesignBrief.parse({
      productName: "Proofroom",
      tagline: "How a page reaches the printer",
      audience: "production editors",
      businessGoal: "trust",
      siteKind: "editorial-foundry",
      lockSiteKind: true,
      features: [
        { id: "c1", name: "Galley proofs", description: "Every page set and proofed before press", priority: "p0" },
        { id: "c2", name: "Press sign-off", description: "Named approvals before a page goes to press", priority: "p0" },
        { id: "c3", name: "Errata notes", description: "What changed after printing, and where", priority: "p1" },
      ],
      taste: sample.taste,
    });
    const faq = designFromFeatures(proofroom).spec.sections.find((s) => s.kind === "faq");
    const approve = faq?.blocks.find((b) => b.title === "Which cut handles approvals?");
    expect(approve?.body).toBe("Press sign-off, cut 02 in the index above.");
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
    expect(html).not.toMatch(/<meta name="description" content="[^"]*(editorial-foundry|sections built from)/);
  });
});
