/**
 * Fintech template: each capability is told once, and nothing on the page is a fact no brief gave.
 *
 * Before this pass the sample fintech page had twelve sections. It printed some descriptions four
 * times (the fold ledger, the catalogue, a proof drawing, and the proof list under it) and never
 * printed others at all, because the catalogue's tail went to an "also included" band as bare
 * names. Every fintech page, a marina's or a pottery studio's included, also carried wire cut-off
 * times, made-up FX rates, a "±0.4% tolerance" line, a send-path chapter written for one treasury
 * product, billing terms, a table whose own lede said "the same list as above", and answers about
 * cancelling anytime, procurement, security, and a human approval gate with a rollback path.
 */
import { describe, expect, it } from "vitest";
import { designFromFeatures, designFromFeaturesAuthored } from "../orchestrate";
import { SHOWCASE_BRIEFS } from "../templates";
import { DesignBrief } from "../types";

const sample = SHOWCASE_BRIEFS.fintech!;

const fresh = (productName: string, tagline: string, audience: string, f: [string, string][]) =>
  DesignBrief.parse({
    productName,
    tagline,
    audience,
    businessGoal: sample.businessGoal,
    siteKind: "fintech-marketing",
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

/** Phrases no brief here declares: times, rates, terms, contacts, gates, and engine settings. */
const INVENTED = [
  "tolerance",
  "±",
  "minutes",
  "cancel",
  "annual",
  "billed monthly",
  "lock-in",
  "procurement",
  "security",
  "irreversible",
  "rollback",
  "operators approve",
  "the send path",
  "wire, wallet, approval, fx",
  "audit-ready",
  "mid-market cash",
  "editorial order",
  "the comparison table",
  "the same list as above",
  "one conversation",
  "in front of your",
  "carry the argument",
  "remove reasons to say no",
  "hidden tier",
  "sandbox",
];

describe("Fintech template says each thing once", () => {
  it("keeps one complete catalogue and drops the second band, the proof board, the chapters, and the table", () => {
    for (const brief of briefs) {
      const { spec } = designFromFeatures(brief);
      const ids = spec.sections.map((s) => s.id);
      expect(ids.filter((id) => id.startsWith("features")), brief.productName).toEqual(["features"]);
      expect(ids).toContain("pricing");
      expect(ids).not.toContain("proof");
      expect(ids).not.toContain("story");
      expect(ids).not.toContain("compare");
      const catalogue = spec.sections.find((s) => s.id === "features")!;
      expect(catalogue.blocks.map((b) => b.title), brief.productName).toEqual(brief.features.map((f) => f.name));
    }
  });

  it("tells every capability description exactly once", () => {
    for (const brief of briefs) {
      const text = visible(designFromFeatures(brief).previewHtml);
      for (const f of brief.features) {
        const told = text.split(f.description.toLowerCase().slice(0, 36)).length - 1;
        expect(told, `${brief.productName}: ${f.name}`).toBe(1);
      }
    }
  });

  it("names the lead capability at most eight times on the page", () => {
    for (const brief of briefs) {
      const text = visible(designFromFeatures(brief).previewHtml);
      const lead = brief.features[0]!.name.toLowerCase();
      expect(text.split(lead).length - 1, brief.productName).toBeLessThanOrEqual(8);
    }
  });

  it("states no time, rate, term, contact, approval gate, or stock line the brief never gave", () => {
    for (const brief of briefs) {
      const text = visible(designFromFeatures(brief).previewHtml);
      for (const phrase of INVENTED) {
        expect(text, `${brief.productName}: ${phrase}`).not.toContain(phrase);
      }
    }
  });

  it("carries no copy written for the sample treasury product onto other products", () => {
    for (const brief of briefs.slice(1)) {
      const text = visible(designFromFeatures(brief).previewHtml);
      for (const word of ["treasury", "wire", "wallet", "fx", "cash", "ledger"]) {
        expect(text, `${brief.productName}: ${word}`).not.toMatch(new RegExp(`\\b${word}\\b`));
      }
    }
  });

  it("draws the fold ledger with each name once and no clock times, rates, or states", () => {
    for (const brief of briefs) {
      const { previewHtml } = designFromFeatures(brief);
      const fold = previewHtml.match(/<svg[^>]*data-figure="wire-ledger"[\s\S]*?<\/svg>/)?.[0] ?? "";
      expect(fold, brief.productName).not.toBe("");
      expect(fold).toContain('class="ds-draw"');
      for (const f of brief.features.slice(0, 5)) {
        expect(fold.split(`>${f.name}<`).length - 1, `${brief.productName}: ${f.name}`).toBe(1);
      }
      expect(fold).not.toMatch(/\d\d:\d\d/);
      expect(fold).not.toMatch(/>\d+\.\d\d</);
      expect(fold).not.toMatch(/CLEARING|QUEUED|POSTED|Same-day path|Tolerance/);
      const hero = previewHtml.match(/<section[^>]*data-section="hero"[\s\S]*?<\/section>/)?.[0] ?? "";
      expect(hero).not.toContain("ds-tolerance-strip");
      expect(hero).not.toMatch(/\d\d:\d\d/);
    }
  });

  it("lists each capability in exactly one lane, with no billing cadence", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const lanes = spec.sections.find((s) => s.id === "pricing")!.blocks;
      expect(lanes.flatMap((l) => l.points), brief.productName).toEqual(brief.features.map((f) => f.name));
      expect(previewHtml).not.toMatch(/<div class="ds-cadence"/);
      expect(previewHtml).not.toContain("ds-pricing-risk\">");
    }
  });

  it("answers questions that each carry this brief's own words, and closes on the lead capability", () => {
    for (const brief of briefs) {
      const { spec } = designFromFeatures(brief);
      const faq = spec.sections.find((s) => s.id === "faq")!.blocks;
      expect(faq.length).toBeGreaterThanOrEqual(5);
      const own = [brief.productName, ...brief.features.map((f) => f.name)].map((w) => w.toLowerCase());
      const grounded = faq.filter((q) => own.some((w) => `${q.title} ${q.body}`.toLowerCase().includes(w)));
      expect(grounded.length / faq.length, brief.productName).toBeGreaterThanOrEqual(0.75);
      const close = spec.sections.find((s) => s.id === "cta")!;
      expect(close.title.toLowerCase()).toContain(brief.features[0]!.name.toLowerCase());
      expect(close.ctaNote ?? "").toBe("");
    }
  });

  it("names the lanes section Lanes everywhere and keeps the walkthrough as the only ask", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      expect(previewHtml, brief.productName).not.toContain("Read the mechanics");
      expect(previewHtml, brief.productName).not.toContain("Scope and plans");
      expect(previewHtml, brief.productName).not.toMatch(/>Plans</);
      const pricing = spec.sections.find((s) => s.kind === "pricing");
      expect(pricing?.eyebrow, brief.productName).toBe("Lanes");
      const nav = spec.sections.find((s) => s.kind === "nav");
      expect(nav?.navItems?.map((n) => n.label), brief.productName).toContain("Lanes");
      expect(nav?.navItems?.map((n) => n.label), brief.productName).not.toContain("Plans");
      const footer = spec.sections.find((s) => s.kind === "footer");
      expect(footer?.ctaLabel, brief.productName).toBe("Book a walkthrough");
    }
  });

  it("describes the product, not the engine, in the page description", () => {
    for (const brief of briefs) {
      const { previewHtml } = designFromFeatures(brief);
      const description = previewHtml.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
      expect(description).toContain(brief.productName);
      expect(description).not.toMatch(/fintech-marketing|lean|sections built from/);
    }
  });
});

describe("Fintech template on the Studio and plugin path", () => {
  it("uses the same brief-built answers and says nothing invented when authored without a key", async () => {
    for (const brief of briefs) {
      const { previewHtml } = await designFromFeaturesAuthored(brief, {});
      const text = visible(previewHtml);
      for (const phrase of INVENTED) {
        expect(text, `${brief.productName}: ${phrase}`).not.toContain(phrase);
      }
      expect(text).toContain(`who is ${brief.productName.toLowerCase()} for`);
      expect(text).toContain("which lane includes");
    }
  });
});
