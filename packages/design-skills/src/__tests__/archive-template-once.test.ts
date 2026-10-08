/**
 * Archive index template: each entry is told once, and nothing on the page is a fact no brief gave.
 *
 * Before this pass every archive page had nine sections. The fold's index ledger filled a fixed
 * twelve cells by cycling the entries, so a five-entry brief named its lead entry three times on the
 * first screen, labelled each cell "Core" or "Included", and footed the plate "12 entries". The
 * catalogue below it printed only names, a drawing beside it named them again, a figure band named
 * the first four twice more beside a "cost · cumulative" chart with made-up values, a specimen strip
 * named them again, and the entry essay printed every description under the names of three other
 * entries and beside a shelf index of every name. A five-entry brief named its lead entry up to
 * seventeen times, and every brief left two entries with no catalogue row. Every archive page, a marina's or
 * a pottery studio's included, also said "each entry is a numbered stamp — not a search box dressed
 * as an archive", "hanging folio, ruled measure, and the cross-refs that keep the roll honest", and
 * "numbered stamps, cross-refs, and the entries … actually keep", and answered questions about
 * cancelling anytime, a comparison table, "one session" on your data, and procurement.
 */
import { describe, expect, it } from "vitest";
import { designFromFeatures, designFromFeaturesAuthored } from "../orchestrate";
import { SHOWCASE_BRIEFS } from "../templates";
import { DesignBrief } from "../types";
import { assertBasics } from "../basics-checklist";

const sample = SHOWCASE_BRIEFS.archive!;

const fresh = (productName: string, tagline: string, audience: string, f: [string, string][]) =>
  DesignBrief.parse({
    productName,
    tagline,
    audience,
    businessGoal: sample.businessGoal,
    siteKind: "archive-index",
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

/** Phrases no brief here declares, and lines written for the one sample award index. */
const INVENTED = [
  "numbered stamp",
  "search box dressed",
  "demo theatre",
  "keep the roll",
  "keeps the roll",
  "cross-refs",
  "actually keep",
  "shelf 0",
  "shelf index",
  "cost · cumulative",
  "rather than claimed",
  "request an entry",
  "browse the registry",
  "archive register",
  "stamps · ruled measure",
  "note 01",
  "cancel anytime",
  "comparison table",
  "one session",
  "prepared sandbox",
  "procurement",
  "from day one",
  "hidden tier",
  "secret tier",
];

const ledgerOf = (html: string) => html.match(/<svg[^>]*data-figure="index-ledger"[\s\S]*?<\/svg>/)?.[0] ?? "";

describe("archive index template says each thing once", () => {
  it("draws the fold, one index, the priorities, questions, and the close", () => {
    const { spec } = designFromFeatures(sample);
    expect(spec.sections.map((s) => s.id)).toEqual(["nav", "hero", "features", "story", "faq", "cta", "footer"]);
  });

  it("prints each entry description once on every brief, both paths", async () => {
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

  it("puts every entry in the one index, numbered, with no figure band, specimen strip, or proof board", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const catalogues = spec.sections.filter((s) => s.kind === "features");
      expect(catalogues).toHaveLength(1);
      expect(catalogues[0]!.blocks.map((b) => b.title)).toEqual(brief.features.map((f) => f.name));
      expect(catalogues[0]!.blocks.map((b) => b.meta)).toEqual(brief.features.map((_, i) => String(i + 1).padStart(3, "0")));
      expect(spec.sections.some((s) => ["figure", "specimen", "proof", "compare"].includes(s.kind))).toBe(false);
      expect(previewHtml).not.toMatch(/<ul[^>]*\bdata-proof-board\b/);
      const index = previewHtml.split(/(?=<section[^>]*data-section=")/).find((p) => /^<section[^>]*data-section="features"/.test(p)) ?? "";
      expect(index, brief.productName).not.toMatch(/<figure class="ds-plate/);
    }
  });

  it("names each entry once in the fold's ledger, with no descriptions, fake shelves, or fixed count", () => {
    for (const brief of briefs) {
      const ledger = ledgerOf(designFromFeatures(brief).previewHtml);
      expect(ledger, brief.productName).not.toBe("");
      for (const f of brief.features) {
        expect(ledger.split(`>${f.name}<`).length - 1, `${brief.productName}: ${f.name}`).toBe(1);
        expect(ledger.toLowerCase()).not.toContain(f.description.toLowerCase().slice(0, 16));
      }
      expect(ledger).not.toMatch(/shelf \d/);
      expect(ledger).toContain(`>${brief.features.length} entries<`);
    }
  });

  it("points each letter of the rail at the first entry that starts with it", () => {
    const html = designFromFeatures(briefs[3]!).previewHtml;
    const rail = html.match(/<nav class="ds-alpha-rail"[\s\S]*?<\/nav>/)?.[0] ?? "";
    // The first letter any entry starts with is lit; letters no entry starts with go to the index.
    expect(rail).toContain('href="#entry-004" class="ds-alpha-letter is-active" data-letter="C"');
    expect(rail).toContain('href="#entry-001" class="ds-alpha-letter" data-letter="K"');
    expect(rail).toContain('href="#features" class="ds-alpha-letter" data-letter="A"');
    expect(rail).not.toMatch(/#specimen|#figure|#proof/);
    expect(html).toContain('id="entry-004"');
    expect(html).toContain('<span class="ds-register-issue">C–M</span>');
  });

  it("groups the entries by the priority the brief gives, stamped with their index numbers", () => {
    const { spec, previewHtml } = designFromFeatures(briefs[3]!);
    const story = spec.sections.find((s) => s.kind === "story");
    expect(story?.title).toBe("Which Kilnroom entries come first.");
    expect(story?.blocks.map((b) => [b.title, b.body, b.points])).toEqual([
      ["Core", "Two core entries.", ["Kiln calendar", "Glaze library"]],
      ["Supporting", "Two supporting entries.", ["Member shelves", "Clay orders"]],
      ["Additional", "One additional entry.", ["Class roster"]],
    ]);
    expect(previewHtml).toMatch(/<span class="ds-stamp-folio">004<\/span>\s*<span class="ds-stamp-name">Clay orders<\/span>/);
    // No shelf index beside the essay listing every name again.
    expect(previewHtml).not.toContain('<aside class="ds-entry-aside"');
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
    const { spec } = designFromFeatures(briefs[3]!);
    const faq = spec.sections.find((s) => s.kind === "faq");
    expect(faq?.title).toBe("Kilnroom, asked and answered.");
    expect(faq?.blocks.map((b) => [b.title, b.body])).toEqual([
      ["Who keeps Kilnroom?", "Studio managers at community pottery studios."],
      ["What is outside Kilnroom?", "Anything that is not one of its five entries."],
    ]);
    const cta = spec.sections.find((s) => s.kind === "cta");
    expect(cta?.title).toBe("Kilnroom, from kiln calendar to class roster.");
    expect(cta?.body).toBe("");
    expect([cta?.ctaLabel, cta?.secondaryLabel]).toEqual(["Open the index", "See every entry"]);
  });

  it("asks which entry handles approvals only when the brief declares an approval step", () => {
    const ledgerbook = DesignBrief.parse({
      productName: "Ledgerbook",
      tagline: "Accession records for small museums",
      audience: "registrars at small museums",
      businessGoal: "trust",
      siteKind: "archive-index",
      lockSiteKind: true,
      features: [
        { id: "c1", name: "Accession log", description: "Every object numbered on arrival", priority: "p0" },
        { id: "c2", name: "Loan sign-off", description: "Named approvals before an object leaves the building", priority: "p0" },
        { id: "c3", name: "Condition notes", description: "Photographs and notes for each inspection", priority: "p1" },
      ],
      taste: sample.taste,
    });
    const faq = designFromFeatures(ledgerbook).spec.sections.find((s) => s.kind === "faq");
    const approve = faq?.blocks.find((b) => b.title === "Which entry handles approvals?");
    expect(approve?.body).toBe("Loan sign-off. Its description is in the index above.");
    for (const brief of briefs) {
      expect(designFromFeatures(brief).previewHtml, brief.productName).not.toMatch(/handles approvals/i);
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
