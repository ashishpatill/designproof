/**
 * Consumer craft template: each detail is told once, and nothing on the page is a fact no brief gave.
 *
 * Before this pass every consumer page had ten sections. It listed the capability names as bare
 * values in a raised metrics band beside truncated descriptions, again in a specimen strip, twice
 * more in a figure band with a "cost · cumulative" chart of made-up values under "how it works" /
 * "step through the mechanism" / "drag to step through how X moves work", and again as "Step 01"
 * chapters under "A day with X" and "From morning pack to evening empty" — a line written for one
 * sample bag. The fold printed the lead description, the register printed it again (and every other
 * description), and the chapters printed them a third time. Every consumer page, a pottery studio's
 * or a marina's included, also said "Ships when the batch is ready — no waitlist theatre", "Built
 * for the day you actually have", "not a lifestyle claim", and answered questions about cancelling
 * anytime, a comparison table that was never drawn, procurement, "from day one", and "no hidden
 * tier".
 */
import { describe, expect, it } from "vitest";
import { designFromFeatures, designFromFeaturesAuthored } from "../orchestrate";
import { SHOWCASE_BRIEFS } from "../templates";
import { DesignBrief } from "../types";
import { assertBasics } from "../basics-checklist";

const sample = SHOWCASE_BRIEFS.consumer!;

const fresh = (productName: string, tagline: string, audience: string, f: [string, string][]) =>
  DesignBrief.parse({
    productName,
    tagline,
    audience,
    businessGoal: sample.businessGoal,
    siteKind: "consumer-craft",
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

/** Phrases no brief here declares, and lines written for the one sample bag. */
const INVENTED = [
  "waitlist theatre",
  "built for the day you actually have",
  "lifestyle claim",
  "morning pack",
  "evening empty",
  "cost · cumulative",
  "step through the mechanism",
  "drawn rather than described",
  "cancel anytime",
  "comparison table",
  "one session",
  "from day one",
  "procurement",
  "hidden tier",
  "one conversation",
  "consumer-craft surface",
];

describe("consumer craft template says each thing once", () => {
  it("draws the fold, one register, the order of use, questions, and the close", () => {
    const { spec } = designFromFeatures(sample);
    expect(spec.sections.map((s) => s.id)).toEqual(["nav", "hero", "features", "story", "faq", "cta", "footer"]);
    expect(spec.sections.some((s) => ["specimen", "figure", "metrics", "proof"].includes(s.kind))).toBe(false);
  });

  it("prints each detail description once on every brief, both paths", async () => {
    for (const brief of briefs) {
      for (const html of [designFromFeatures(brief).previewHtml, (await designFromFeaturesAuthored(brief, {})).previewHtml]) {
        const text = visible(html);
        for (const f of brief.features) {
          // Editorial may keep only the claim ("…them.") and place the ", so …" payoff elsewhere.
          const needle = f.description.toLowerCase().replace(/,\s*so\b.*/, "").slice(0, 36);
          expect(text.split(needle).length - 1, `${brief.productName}: ${f.name}`).toBe(1);
        }
      }
    }
  });

  it("puts every detail in the one register, with no second band", () => {
    for (const brief of briefs) {
      const { spec } = designFromFeatures(brief);
      const registers = spec.sections.filter((s) => s.kind === "features");
      expect(registers).toHaveLength(1);
      expect(registers[0]!.blocks.map((b) => b.title)).toEqual(brief.features.map((f) => f.name));
      expect(registers[0]!.eyebrow).toBe("The details");
      expect(registers[0]!.title).toBe(`The ${brief.features.length === 6 ? "six" : brief.features.length === 5 ? "five" : String(brief.features.length)} details of ${brief.productName}.`);
      expect(registers[0]!.body).toBe("");
    }
  });

  it("orders use by the priority the brief gives", () => {
    const { spec } = designFromFeatures(briefs[3]!);
    const story = spec.sections.find((s) => s.kind === "story");
    expect(story?.eyebrow).toBe("Order of use");
    expect(story?.title).toBe("The order Kilnroom is used.");
    expect(story?.blocks.map((b) => [b.title, b.body])).toEqual([
      ["First", "Kiln calendar and glaze library."],
      ["Next", "Member shelves and clay orders."],
      ["Alongside", "Class roster."],
    ]);
  });

  it("leaves the order of use out when the brief gives a single priority, and still clears the basics", () => {
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
      "Who is Kilnroom for?",
      "Is class roster part of Kilnroom?",
      "What is not part of Kilnroom?",
      "How do we begin with Kilnroom?",
    ]);
    const cta = spec.sections.find((s) => s.kind === "cta");
    expect(cta?.title).toBe("Start with kiln calendar at Kilnroom.");
    expect(cta?.body).toBe("Four more details sit in the list above.");
    expect([cta?.ctaLabel, cta?.secondaryLabel]).toEqual(["Order yours", "Read all five details"]);
    const nav = spec.sections.find((s) => s.kind === "nav");
    expect(nav?.navItems.map((n) => n.label)).toEqual(["Details", "Priorities", "Questions"]);
  });

  it("carries no fold note on the authored path", async () => {
    for (const brief of briefs) {
      const html = (await designFromFeaturesAuthored(brief, {})).previewHtml;
      expect(visible(html), brief.productName).not.toContain("ships first");
      expect(visible(html), brief.productName).not.toContain("waitlist theatre");
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
    expect(html).not.toMatch(/<meta name="description" content="[^"]*(consumer-craft|sections built from)/);
  });
});
