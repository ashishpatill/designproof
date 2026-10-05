/**
 * SaaS template: each capability is told once, and nothing on the page is copy written for some
 * other product.
 *
 * Before this pass the sample SaaS page named its lead capability seventeen times. It had two
 * catalogues, a chapter list in "editorial order", pricing lanes that each re-listed the lane
 * below, and a matrix whose own lede said "the same list as above". The fold console filled eight
 * rows by cycling five names, and the template printed every name three times.
 */
import { describe, expect, it } from "vitest";
import { designFromFeatures, designFromFeaturesAuthored } from "../orchestrate";
import { SHOWCASE_BRIEFS } from "../templates";
import { DesignBrief } from "../types";

const fresh = (productName: string, tagline: string, audience: string, f: [string, string][]) =>
  DesignBrief.parse({
    productName,
    tagline,
    audience,
    businessGoal: "demos",
    siteKind: "saas-marketing",
    lockSiteKind: true,
    taste: { aestheticLean: "conversion-sharp", motion: "light-scroll-reveals", colorMood: "neutral-professional" },
    features: f.map(([name, description], i) => ({
      id: `c${i}`,
      name,
      description,
      priority: i < 2 ? "p0" : i < 4 ? "p1" : "p2",
    })),
  });

const briefs = [
  SHOWCASE_BRIEFS.saas!,
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
    .replace(/\s+/g, " ")
    .toLowerCase();
}

describe("SaaS template says each thing once", () => {
  it("keeps one catalogue, no chapter list, and no matrix under the lanes", () => {
    for (const brief of briefs) {
      const { spec } = designFromFeatures(brief);
      const ids = spec.sections.map((s) => s.id);
      expect(ids.filter((id) => id.startsWith("features"))).toEqual(["features"]);
      expect(ids).not.toContain("story");
      expect(ids).toContain("pricing");
      expect(ids).not.toContain("compare");
      // The one catalogue still lists every capability.
      const catalogue = spec.sections.find((s) => s.id === "features")!;
      expect(catalogue.blocks.map((b) => b.title)).toEqual(brief.features.map((f) => f.name));
    }
  });

  it("tells no capability description more than twice, and the sample brief exactly once", () => {
    for (const brief of briefs) {
      const text = visible(designFromFeatures(brief).previewHtml);
      for (const f of brief.features) {
        const told = text.split(f.description.toLowerCase().slice(0, 36)).length - 1;
        expect(told, `${brief.productName}: ${f.name}`).toBeLessThanOrEqual(2);
        if (brief === SHOWCASE_BRIEFS.saas) expect(told, f.name).toBeLessThanOrEqual(1);
      }
    }
  });

  it("names the lead capability at most ten times on the page", () => {
    for (const brief of briefs) {
      const text = visible(designFromFeatures(brief).previewHtml);
      const lead = brief.features[0]!.name.toLowerCase();
      expect(text.split(lead).length - 1, brief.productName).toBeLessThanOrEqual(10);
    }
  });

  it("lists each capability in exactly one pricing lane, with no billing terms the brief never gave", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const lanes = spec.sections.find((s) => s.id === "pricing")!.blocks;
      const listed = lanes.flatMap((l) => l.points);
      expect(listed).toEqual(brief.features.map((f) => f.name));
      const text = visible(previewHtml);
      for (const phrase of ["billed monthly", "save on annual", "annual preferred", "monthly annual"]) {
        expect(text).not.toContain(phrase);
      }
    }
  });

  it("carries no copy written for the sample product or for any product", () => {
    for (const brief of briefs.slice(1)) {
      const text = visible(designFromFeatures(brief).previewHtml);
      expect(text).not.toContain("moves an account");
      expect(text).not.toContain("booked walkthrough");
      expect(text).not.toContain("revenue leaders");
      expect(text).not.toContain("operator console");
      expect(text).not.toContain("the same list as above");
      expect(text).not.toContain("the comparison table");
      expect(text).not.toContain("in front of your");
    }
  });

  it("asks FAQ questions that each carry this brief's own words", () => {
    for (const brief of briefs) {
      const { spec } = designFromFeatures(brief);
      const faq = spec.sections.find((s) => s.id === "faq")!.blocks;
      expect(faq.length).toBeGreaterThanOrEqual(6);
      const own = [brief.productName, ...brief.features.map((f) => f.name)].map((w) => w.toLowerCase());
      const grounded = faq.filter((q) => own.some((w) => `${q.title} ${q.body}`.toLowerCase().includes(w)));
      expect(grounded.length / faq.length, brief.productName).toBeGreaterThanOrEqual(0.75);
    }
  });

  it("draws the fold console once per row instead of cycling the names", () => {
    const { previewHtml } = designFromFeatures(SHOWCASE_BRIEFS.saas!);
    const fold = previewHtml.match(/<svg[^>]*data-figure="queue-console"[\s\S]*?<\/svg>/)?.[0] ?? "";
    expect(fold).not.toBe("");
    const lead = SHOWCASE_BRIEFS.saas!.features[0]!.name;
    // Once in the rail, once as the panel heading — never again as a cycled row.
    expect(fold.split(`>${lead}<`).length - 1).toBeLessThanOrEqual(2);
    expect(fold).toContain('class="ds-draw"');
  });
});

describe("SaaS template on the Studio and plugin path", () => {
  it("uses the same brief-built FAQ when the page is authored without a key", async () => {
    for (const brief of briefs) {
      const { previewHtml } = await designFromFeaturesAuthored(brief, {});
      const text = visible(previewHtml);
      expect(text).not.toContain("the comparison table");
      expect(text).toContain(`who is ${brief.productName.toLowerCase()} for`);
      expect(text).toContain("which lane includes");
    }
  });
});
