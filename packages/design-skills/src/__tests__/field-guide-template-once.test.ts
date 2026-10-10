/**
 * Field guide (herbarium) template: each trait is told once, and nothing on the page is a fact no
 * brief gave.
 *
 * Before this pass every field-guide page had nine sections. The glassine fold printed the lead
 * description on the specimen tag, named the first three traits inside the specimen plate beside
 * "Voucher · herbarium", "Range · W → E", and "Blot", and ran a Kingdom → Species strip whose
 * first six ranks pointed at fixed sections whether or not the page had them. The index printed
 * bare names (four, whatever the brief gave) under "traits a field voucher actually keeps" and
 * "each trait is a pressed voucher — not a nature photo dressed as science", beside a "how it is
 * put together" list that named them again. A figure band drew a "cost · cumulative" chart with
 * made-up values under "how X presses a voucher", a specimen strip named the traits again, and the
 * dichotomous key printed every description a second time with leads no brief gave ("trait holds
 * → photo inset", "trait fails → re-key from kingdom"). The answers promised cancelling anytime, a
 * comparison table, "one session" on the reader's data, a person for procurement, and that every
 * capability ships "from day one". A five-trait brief named its lead trait thirteen times, and
 * every page, a pottery studio's included, closed on "request a voucher".
 */
import { describe, expect, it } from "vitest";
import { designFromFeatures, designFromFeaturesAuthored } from "../orchestrate";
import { SHOWCASE_BRIEFS } from "../templates";
import { DesignBrief } from "../types";
import { assertBasics } from "../basics-checklist";

const sample = SHOWCASE_BRIEFS.herbarium!;

const fresh = (productName: string, tagline: string, audience: string, f: [string, string][]) =>
  DesignBrief.parse({
    productName,
    tagline,
    audience,
    businessGoal: sample.businessGoal,
    siteKind: "field-guide",
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

/** Phrases no brief here declares, and lines written for the one sample herbarium. */
const INVENTED = [
  "cost · cumulative",
  "voucher · herbarium",
  "range · w → e",
  "pin 02",
  "blot",
  "traits a field voucher actually keeps",
  "dressed as science",
  "presses a voucher",
  "drawn rather than claimed",
  "step through the mechanism",
  "specimen field",
  "how a voucher is actually read",
  "keep a voucher honest",
  "trait holds",
  "trait fails",
  "re-key from kingdom",
  "couplets · voucher key",
  "note 01",
  "put together",
  "request a voucher",
  "open the plate",
  "pressed plates, range notes",
  "not a demo theatre",
  "cancel anytime",
  "comparison table",
  "one session",
  "from day one",
  "procurement",
  "hidden tier",
];

const plateOf = (html: string) => html.match(/<svg[^>]*data-figure="template-plate"[\s\S]*?<\/svg>/)?.[0] ?? "";
const railOf = (html: string) => html.match(/<nav class="ds-taxon-rail ds-binomial-strip"[\s\S]*?<\/nav>/)?.[0] ?? "";
const sectionOf = (html: string, id: string) =>
  html.split(/(?=<section[^>]*data-section=")/).find((p) => new RegExp(`^<section[^>]*data-section="${id}"`).test(p)) ?? "";

describe("field guide template says each thing once", () => {
  it("draws the glassine fold, one index, the key, questions, and the close", () => {
    const { spec } = designFromFeatures(sample);
    expect(spec.sections.map((s) => s.id)).toEqual(["nav", "hero", "features", "story", "faq", "cta", "footer"]);
    expect(spec.sections.some((s) => ["specimen", "compare", "figure", "proof", "metrics"].includes(s.kind))).toBe(false);
  });

  it("prints each trait description once on every brief, both paths", async () => {
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

  it("names each trait once on the fold, once in the index, once in the key, and the lead once more in the close", async () => {
    for (const brief of briefs) {
      for (const html of [designFromFeatures(brief).previewHtml, (await designFromFeaturesAuthored(brief, {})).previewHtml]) {
        const text = visible(html);
        const rail = railOf(html);
        for (const [i, f] of brief.features.entries()) {
          // Index and key in the page text, plus the close for the lead. It was up to thirteen.
          expect(text.split(f.name.toLowerCase()).length - 1, `${brief.productName}: ${f.name}`).toBe(i === 0 ? 3 : 2);
          expect(rail.split(`>${f.name}<`).length - 1, `${brief.productName} strip: ${f.name}`).toBe(1);
        }
      }
    }
  });

  it("puts every trait in the one index, numbered, with its description and no drawing beside it", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const index = spec.sections.filter((s) => s.kind === "features");
      expect(index).toHaveLength(1);
      expect(index[0]!.blocks.map((b) => b.title)).toEqual(brief.features.map((f) => f.name));
      expect(index[0]!.blocks.map((b) => b.meta)).toEqual(brief.features.map((_, i) => String(i + 1).padStart(2, "0")));
      expect(index[0]!.blocks.every((b) => b.body.length > 0 && b.kicker === undefined)).toBe(true);
      expect(index[0]!.body).toBe("");
      expect(index[0]!.title).toBe(`${brief.productName}, trait by trait.`);
      const html = sectionOf(previewHtml, "features");
      expect(html, brief.productName).not.toMatch(/<figure class="ds-plate/);
      for (const [i, f] of brief.features.entries()) {
        expect(html).toContain(`id="trait-${String(i + 1).padStart(2, "0")}" data-feature="${f.name}"`);
        expect(html).toContain(`<p>${f.description.replace(/'/g, "&#39;")}.</p>`);
      }
    }
  });

  it("lists every trait in the binomial strip, each jumping to its index row, with no lede or names in the plate", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const fold = sectionOf(previewHtml, "hero");
      expect(spec.sections.find((s) => s.kind === "hero")?.body).toBe("");
      expect(fold).not.toContain('class="ds-lede"');
      for (const f of brief.features) expect(fold.toLowerCase()).not.toContain(f.description.toLowerCase().slice(0, 16));
      const rail = railOf(previewHtml);
      const hrefs = [...rail.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
      expect(hrefs).toEqual(brief.features.map((_, i) => `#trait-${String(i + 1).padStart(2, "0")}`));
      expect(rail.match(/is-active/g)).toHaveLength(1);
      for (const rank of ["Kingdom", "Phylum", "Genus", "Species"]) expect(rail).not.toContain(rank);
      const plate = plateOf(previewHtml);
      expect(plate, brief.productName).not.toBe("");
      for (const f of brief.features) expect(plate).not.toContain(f.name);
      expect(plate).not.toMatch(/>(K|P|C|O|F|G|S)</);
      // The product is named once in the plate's head, not again at its foot.
      expect(plate).not.toContain("· template plate");
      expect(fold).toContain(`<span class="ds-voucher-issue">${brief.features.length === 6 ? "Six" : "Five"} traits</span>`);
      expect(fold).not.toContain("Dissecting plate");
    }
  });

  it("keys out the traits by the priority the brief gives", () => {
    const { spec, previewHtml } = designFromFeatures(briefs[3]!);
    const story = spec.sections.find((s) => s.kind === "story");
    expect(story?.eyebrow).toBe("Priorities");
    expect(story?.title).toBe("Which Kilnroom traits matter most.");
    expect(story?.blocks.map((b) => [b.title, b.body, b.meta])).toEqual([
      ["Core", "Kiln calendar and glaze library.", "1"],
      ["Supporting", "Member shelves and clay orders.", "2"],
      ["Additional", "Class roster.", "3"],
    ]);
    const html = sectionOf(previewHtml, "story");
    // Each couplet's second lead sends the reader on; the last couplet has none.
    expect(html).toContain("Otherwise, go to 2");
    expect(html).toContain("Otherwise, go to 3");
    expect(html).not.toContain("Otherwise, go to 4");
    expect(html).toContain("3 couplets");
    expect(html).not.toContain('class="ds-range-mark"');
    expect(html).not.toContain('class="ds-range-note"');
  });

  it("leaves the key out when the brief gives a single priority, and still clears the basics", () => {
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
    expect(faq?.title).toBe("What people ask about Kilnroom.");
    expect(faq?.blocks.map((b) => [b.title, b.body])).toEqual([
      ["Who uses Kilnroom?", "Studio managers at community pottery studios."],
      ["What is not in the Kilnroom guide?", "Anything that is not one of its five traits."],
    ]);
    const cta = spec.sections.find((s) => s.kind === "cta");
    expect(cta?.title).toBe("Start the Kilnroom guide at kiln calendar.");
    expect(cta?.body).toBe("Four more traits follow in the index above.");
    expect([cta?.ctaLabel, cta?.secondaryLabel]).toEqual(["Open the guide", "Read all five traits"]);
    const nav = spec.sections.find((s) => s.kind === "nav");
    expect(nav?.navItems.map((n) => n.label)).toEqual(["Traits", "Priorities", "Questions"]);
  });

  it("asks which trait handles approvals only when the brief declares an approval step", () => {
    const runbook = DesignBrief.parse({
      productName: "Runbook",
      tagline: "How a change reaches production",
      audience: "platform engineers",
      businessGoal: "trust",
      siteKind: "field-guide",
      lockSiteKind: true,
      features: [
        { id: "c1", name: "Change request", description: "Every change written down before it starts", priority: "p0" },
        { id: "c2", name: "Release sign-off", description: "Named approvals before a change goes live", priority: "p0" },
        { id: "c3", name: "Rollback notes", description: "What to undo, and in which order", priority: "p1" },
      ],
      taste: sample.taste,
    });
    const faq = designFromFeatures(runbook).spec.sections.find((s) => s.kind === "faq");
    const approve = faq?.blocks.find((b) => b.title === "Which trait handles approvals?");
    expect(approve?.body).toBe("Release sign-off. Its description is in the index above.");
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
  });
});
