/**
 * Corporate template: each capability is told once, and nothing on the page is a fact no brief gave.
 *
 * Before this pass the sample corporate page had ten sections, and a five-capability brief got
 * eleven. The fold's spine listed the first four capability names, the posture grid beside it named
 * them again with their descriptions cut into short lines, and the catalogue drew them a third time
 * in a picture beside its first row. A specimen strip listed them as bare values, the shared proof
 * board printed every description again, the chapters named every capability once more under
 * "language, principles, outcomes, posture — the diligence path in order", and a "what is included"
 * table said in its own lede that it was "the same list as above". A five-capability brief left one
 * capability with no catalogue row at all. Every corporate page, a pottery studio's or a marina's
 * included, also answered questions about cancelling anytime, a comparison table, "one session" on
 * your data, procurement and security, a named human approval gate, and a rollback path, and closed
 * on "see it against your own material" and "one conversation".
 */
import { describe, expect, it } from "vitest";
import { designFromFeatures, designFromFeaturesAuthored } from "../orchestrate";
import { SHOWCASE_BRIEFS } from "../templates";
import { DesignBrief } from "../types";

const sample = SHOWCASE_BRIEFS.corporate!;

const fresh = (productName: string, tagline: string, audience: string, f: [string, string][]) =>
  DesignBrief.parse({
    productName,
    tagline,
    audience,
    businessGoal: sample.businessGoal,
    siteKind: "corporate-story",
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

/** Phrases no brief here declares, and lines written for one sample corporate product. */
const INVENTED = [
  "diligence posture",
  "diligence path",
  "earns the room",
  "board pack",
  "pillars",
  "verifiable",
  "the same list as above",
  "procurement",
  "security, and sequencing",
  "cancel anytime",
  "annual lock",
  "comparison table",
  "one session",
  "prepared sandbox",
  "human gate",
  "rollback path",
  "mid-flight",
  "your own material",
  "one conversation",
  "carry the argument",
  "reasons to say no",
  "editorial order",
  "secret tier",
];

describe("corporate template says each thing once", () => {
  it("draws the fold, one catalogue, the priorities, questions, and the close", () => {
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

  it("puts every capability in the one catalogue, with no second band, proof board, or table", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const catalogues = spec.sections.filter((s) => s.kind === "features");
      expect(catalogues).toHaveLength(1);
      expect(catalogues[0]!.blocks.map((b) => b.title)).toEqual(brief.features.map((f) => f.name));
      expect(spec.sections.some((s) => s.kind === "proof" || s.kind === "compare" || s.kind === "specimen")).toBe(false);
      expect(previewHtml).not.toMatch(/<ul[^>]*\bdata-proof-board\b/);
    }
  });

  it("names each capability once in the posture grid, with no descriptions in it", () => {
    for (const brief of briefs) {
      const html = designFromFeatures(brief).previewHtml;
      const grid = html.match(/<svg[^>]*data-figure="posture-grid"[\s\S]*?<\/svg>/)?.[0] ?? "";
      expect(grid, brief.productName).not.toBe("");
      for (const f of brief.features) {
        expect(grid.split(`>${f.name}<`).length - 1, `${brief.productName}: ${f.name}`).toBe(1);
        expect(grid.toLowerCase(), `${brief.productName}: ${f.name}`).not.toContain(f.description.toLowerCase().slice(0, 16));
      }
    }
  });

  it("indexes the page's own sections on the fold spine instead of the capability names", () => {
    for (const brief of briefs) {
      const html = designFromFeatures(brief).previewHtml;
      const spine = html.match(/<aside class="ds-principle-spine"[\s\S]*?<\/aside>/)?.[0] ?? "";
      expect([...spine.matchAll(/<b>([^<]+)<\/b>/g)].map((m) => m[1])).toEqual(["Capabilities", "Priorities", "Questions"]);
    }
  });

  it("does not draw a second picture beside the first catalogue row", () => {
    for (const brief of briefs) {
      const html = designFromFeatures(brief).previewHtml;
      const catalogue = html.split(/(?=<section[^>]*data-section=")/).find((p) => /^<section[^>]*data-section="features"/.test(p)) ?? "";
      expect(catalogue, brief.productName).toMatch(/^<section/);
      expect(catalogue).not.toMatch(/<svg[^>]*data-figure="stack"/);
    }
  });

  it("groups the work by the priority the brief gives", () => {
    const { spec, previewHtml } = designFromFeatures(briefs[3]!);
    const story = spec.sections.find((s) => s.kind === "story");
    expect(story?.title).toBe("Where Kilnroom puts its weight.");
    expect(story?.blocks.map((b) => [b.title, b.body])).toEqual([
      ["Core", "Two capabilities: kiln calendar and glaze library."],
      ["Supporting", "Two capabilities: member shelves and clay orders."],
      ["Additional", "One capability: class roster."],
    ]);
    // The groups are printed, not hidden behind quiet chapter titles.
    expect(visible(previewHtml)).toContain("two capabilities: member shelves and clay orders.");
  });

  it("leaves the priorities out when the brief gives a single priority", () => {
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
      "What does Kilnroom leave out?",
      "Where do we go from here with Kilnroom?",
    ]);
    const cta = spec.sections.find((s) => s.kind === "cta");
    expect(cta?.title).toBe("Kilnroom starts with kiln calendar.");
    expect(cta?.body).toBe("Four more capabilities are described above.");
    expect(cta?.secondaryLabel).toBe("Read all five capabilities");
  });

  it("asks who approves only when the brief declares an approval step, and answers with its own capability", () => {
    const boardpack = DesignBrief.parse({
      productName: "Boardpack",
      tagline: "Diligence packs for mid-market boards",
      audience: "corporate secretaries",
      businessGoal: "trust",
      siteKind: "corporate-story",
      lockSiteKind: true,
      features: [
        { id: "c1", name: "Board pack", description: "Assemble the packet the board actually opens", priority: "p0" },
        { id: "c2", name: "Sign-off log", description: "Named approvals before irreversible sends", priority: "p0" },
        { id: "c3", name: "Exception path", description: "Surface failures with a rollback note", priority: "p1" },
      ],
      taste: sample.taste,
    });
    const faq = designFromFeatures(boardpack).spec.sections.find((s) => s.kind === "faq");
    const approve = faq?.blocks.find((b) => b.title === "Who approves irreversible actions?");
    expect(approve?.body).toBe("Sign-off log is where that happens. Its description is in the list above.");
    for (const brief of briefs) {
      expect(designFromFeatures(brief).previewHtml, brief.productName).not.toMatch(/Who approves irreversible actions/i);
    }
  });

  it("describes the product, not the engine, in the page header", () => {
    const html = designFromFeatures(briefs[3]!).previewHtml;
    expect(html).toContain(
      '<meta name="description" content="Kilnroom: Firing schedules for shared pottery studios, for studio managers at community pottery studios"/>',
    );
  });
});
