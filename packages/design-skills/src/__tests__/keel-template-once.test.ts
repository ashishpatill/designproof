/**
 * Keel (control-plane-oss) template: each capability is told once, and nothing on the page is a
 * fact no brief gave.
 *
 * Before this pass every keel page had eight sections. The claim fold printed a stock Keel lede on
 * every product. A "what it is" figure restated the control-plane story and named capabilities again
 * under "a control plane for coding agents, not a chat wrapper". A how-loop reprinted Ask → Permit →
 * Check → Ship copy that restated permits and finish conditions. A second terminal demo under
 * "session tape" doubled the specimen. The principles index named every capability again under
 * "what holds when you run many agents" and "each line is a control-plane fact — not a chat wrapper
 * dressed as a product". The answers promised cancelling anytime, a comparison table, "one session"
 * on the reader's data, a person for procurement, "no hidden tier", and that every capability ships
 * "from day one". The close asked every product, a pottery studio's included, to "get started" with
 * "repository and install path coming" — an invented storefront no brief declares.
 */
import { describe, expect, it } from "vitest";
import { designFromFeatures, designFromFeaturesAuthored } from "../orchestrate";
import { SHOWCASE_BRIEFS } from "../templates";
import { DesignBrief } from "../types";
import { assertBasics } from "../basics-checklist";

const sample = SHOWCASE_BRIEFS.keel!;

const fresh = (productName: string, tagline: string, audience: string, f: [string, string][]) =>
  DesignBrief.parse({
    productName,
    tagline,
    audience,
    businessGoal: sample.businessGoal,
    siteKind: "control-plane-oss",
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

/** Phrases no brief here declares, and lines written for the one sample keel. */
const INVENTED = [
  "cost · cumulative",
  "what holds when you run many agents",
  "chat wrapper dressed as a product",
  "control plane for coding agents, not a chat wrapper",
  "four beats on one session",
  "ask, permit, check, ship",
  "repository and install path coming",
  "this page is the product story and ui specimen",
  "open harness that runs many coding agents without the ui collapsing",
  "cancel anytime",
  "comparison table",
  "from day one",
  "procurement",
  "hidden tier",
  "control-plane-oss surface",
  "get started with",
  "beats · editorial order",
];

const sectionOf = (html: string, id: string) =>
  html.split(/(?=<section[^>]*data-section=")/).find((p) => new RegExp(`^<section[^>]*data-section="${id}"`).test(p)) ?? "";
const nn = (i: number) => String(i + 1).padStart(2, "0");

describe("keel template says each thing once", () => {
  it("draws the claim+terminal fold, one index, the priorities, questions, and the close", () => {
    const { spec } = designFromFeatures(sample);
    expect(spec.sections.map((s) => s.id)).toEqual(["nav", "hero", "features", "story", "faq", "cta", "footer"]);
    expect(spec.sections.some((s) => ["specimen", "compare", "figure", "proof", "metrics"].includes(s.kind))).toBe(false);
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

  it("names each capability once in the index, and the lead once more in the close (priorities cite numbers)", async () => {
    for (const brief of briefs.slice(1)) {
      for (const html of [designFromFeatures(brief).previewHtml, (await designFromFeaturesAuthored(brief, {})).previewHtml]) {
        const text = visible(html);
        for (const [i, f] of brief.features.entries()) {
          // Index in the page text, plus the close for the lead. Priorities cite index numbers.
          expect(text.split(f.name.toLowerCase()).length - 1, `${brief.productName}: ${f.name}`).toBeGreaterThanOrEqual(i === 0 ? 2 : 1);
          expect(text.split(f.name.toLowerCase()).length - 1, `${brief.productName}: ${f.name} cap`).toBeLessThanOrEqual(i === 0 ? 4 : 2);
        }
      }
    }
  });

  it("puts every capability in the one index, numbered, with its description and no list beside it", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const index = spec.sections.filter((s) => s.kind === "features");
      expect(index).toHaveLength(1);
      expect(index[0]!.blocks.map((b) => b.title)).toEqual(brief.features.map((f) => f.name));
      expect(index[0]!.blocks.map((b) => b.meta)).toEqual(brief.features.map((_, i) => nn(i)));
      expect(index[0]!.blocks.every((b) => b.body.length > 0 && b.kicker === undefined)).toBe(true);
      expect(index[0]!.body).toBe("");
      expect(index[0]!.eyebrow).toBe("The capabilities");
      expect(index[0]!.title).toBe(`${brief.productName}, capability by capability.`);
      const html = sectionOf(previewHtml, "features");
      expect(html, brief.productName).not.toMatch(/<figure class="ds-plate/);
      for (const [i, f] of brief.features.entries()) {
        expect(html).toContain(`id="capability-${nn(i)}" data-feature="${f.name}"`);
        const body = f.description.replace(/'/g, "&#39;");
        expect(html).toContain(`<p>${body.endsWith(".") ? body : `${body}.`}</p>`);
      }
    }
  });

  it("keeps the claim fold with session tape, one Allow/Deny, and done-when, with no lede on the fold", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const fold = sectionOf(previewHtml, "hero");
      expect(spec.sections.find((s) => s.kind === "hero")?.body).toBe("");
      expect(fold).not.toContain('class="ds-lede"');
      // Specimen craft says "one pending tool" on the permit plate; skip needles that are that craft.
      for (const f of brief.features) {
        const needle = f.description.toLowerCase().slice(0, 28);
        if (needle.startsWith("one pending tool")) continue;
        expect(fold.toLowerCase()).not.toContain(needle);
      }
      expect(previewHtml).toContain("data-keel-terminal");
      expect(previewHtml).toContain('data-figure="keel-terminal"');
      expect(previewHtml).toContain("data-steer-pin");
      expect(previewHtml).toContain("DONE WHEN");
      expect(previewHtml).toContain("Allow");
      expect(previewHtml).toContain("Deny");
      expect(previewHtml).toContain("Specimen — not a live API");
      expect(previewHtml).toContain("T01");
      expect((previewHtml.match(/class="ds-keel-turn/g) ?? []).length).toBeGreaterThanOrEqual(5);
      expect((previewHtml.match(/data-keel-permit/g) ?? []).length).toBe(1);
    }
  });

  it("groups the capabilities by the priority the brief gives", () => {
    const { spec } = designFromFeatures(briefs[3]!);
    const story = spec.sections.find((s) => s.kind === "story");
    expect(story?.eyebrow).toBe("Priorities");
    expect(story?.title).toBe("Which Kilnroom capabilities to open first.");
    expect(story?.blocks.map((b) => [b.title, b.body])).toEqual([
      ["Core", "Capabilities 01 and 02."],
      ["Supporting", "Capabilities 03 and 04."],
      ["Additional", "Capability 05."],
    ]);
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
    const brief = briefs[3]!;
    const { spec } = designFromFeatures(brief);
    const faq = spec.sections.find((s) => s.kind === "faq");
    expect(faq?.blocks.map((b) => b.title)).toEqual([
      "Who is Kilnroom for?",
      "What is not in Kilnroom?",
    ]);
    const cta = spec.sections.find((s) => s.kind === "cta");
    expect(cta?.title).toBe("Start Kilnroom with kiln calendar.");
    expect(cta?.body).toBe("Four more capabilities sit in the index above.");
    expect([cta?.ctaLabel, cta?.secondaryLabel]).toEqual(["See the session", "Read all five capabilities"]);
    const nav = spec.sections.find((s) => s.kind === "nav");
    expect(nav?.navItems.map((n) => n.label)).toEqual(["Session", "Capabilities", "Start"]);
  });

  it("carries no fold note on the authored path", async () => {
    for (const brief of briefs) {
      const html = (await designFromFeaturesAuthored(brief, {})).previewHtml;
      expect(visible(html), brief.productName).not.toContain("repository and install path coming");
      expect(visible(html), brief.productName).not.toContain("open harness that runs many coding agents");
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
    expect(html).not.toMatch(/<meta name="description" content="[^"]*(control-plane-oss|sections built from)/);
  });

  it("keeps the Keel sample's coding words off other brands, and links How it works to the session tape", () => {
    for (const brief of briefs.slice(1)) {
      const { spec, previewHtml } = designFromFeatures(brief);
      for (const w of ["typecheck", "git status", "no public host", "twenty agents", "course"]) {
        expect(previewHtml.toLowerCase(), `${brief.productName}: ${w}`).not.toContain(w);
      }
      expect(previewHtml).toContain('id="session-tape"');
      expect(previewHtml).toMatch(/<a [^>]*href="#session-tape"[^>]*>How it works<\/a>/);
      expect(previewHtml).not.toMatch(/>\s*What is included\s*</);
      const story = spec.sections.find((s) => s.kind === "story");
      expect(story?.blocks.map((b) => b.meta)).toEqual([undefined, undefined, undefined]);
      for (const f of brief.features) expect(story?.blocks.some((b) => b.body.includes(f.name))).toBe(false);
    }
    expect(designFromFeatures(briefs[0]!).previewHtml).toContain("typecheck");
  });
});
