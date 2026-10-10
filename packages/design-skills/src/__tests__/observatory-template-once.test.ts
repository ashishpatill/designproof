/**
 * Signal observatory template: each channel is told once, and nothing on the page is a fact no
 * brief gave.
 *
 * Before this pass every observatory page had nine sections. The chronometer fold printed the lead
 * description under the headline, ran hours 00 → 12 and "UTC" down its edge, and fixed a scrub rail
 * of "T−24h", "Live", "+6h", and "Calibrate" along its foot, with "Live" lit and pointing at a
 * figure band. Its signal lattice named the channels again (padding a short brief to four rows by
 * repeating the first) beside tolerances ("±0.5", "±1.0"), "LIVE", "WINDOW", and "00:10". The index
 * printed bare names (three or four, whatever the brief gave) under "channels an on-call desk
 * actually watches" and "each channel is a named signal — not a chart dressed as a product", beside
 * a "how it is put together" list that named them again. A figure band drew a "cost · cumulative"
 * chart with made-up values under "how X reads a window", a specimen band printed the first four
 * descriptions, and the event waterfall printed every description again against a T+00h → T+24h
 * ruler with "Note 01" labels, under "tick beads, channel notes, and the handoffs that keep calm
 * honest". The answers promised cancelling anytime, a comparison table, "one session" on the
 * reader's data, a person for procurement, and that every capability ships "from day one". The
 * close set made-up tolerances beside the first four names and asked every product, a pottery
 * studio's included, to "calibrate a window".
 */
import { describe, expect, it } from "vitest";
import { designFromFeatures, designFromFeaturesAuthored } from "../orchestrate";
import { SHOWCASE_BRIEFS } from "../templates";
import { DesignBrief } from "../types";
import { assertBasics } from "../basics-checklist";

const sample = SHOWCASE_BRIEFS.observatory!;

const fresh = (productName: string, tagline: string, audience: string, f: [string, string][]) =>
  DesignBrief.parse({
    productName,
    tagline,
    audience,
    businessGoal: sample.businessGoal,
    siteKind: "signal-observatory",
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

/** Phrases no brief here declares, and lines written for the one sample on-call desk. */
const INVENTED = [
  "cost · cumulative",
  "±0.5",
  "±1.0",
  "±1.5",
  "utc",
  "t+00h",
  "t+06h",
  "t−24h",
  "+6h",
  "00:10",
  "channels an on-call desk actually watches",
  "dressed as a product",
  "reads a window",
  "drawn rather than claimed",
  "step through the mechanism",
  "channel field",
  "what it covers",
  "how a window is actually walked",
  "keep calm honest",
  "instrument time",
  "note 01",
  "put together",
  "calibrate a",
  "desk window",
  "tolerance marks, channel maps",
  "not a demo theatre",
  "cancel anytime",
  "comparison table",
  "one session",
  "from day one",
  "procurement",
  "hidden tier",
];

const latticeOf = (html: string) => html.match(/<svg[^>]*data-figure="signal-lattice"[\s\S]*?<\/svg>/)?.[0] ?? "";
const railOf = (html: string) => html.match(/<nav class="ds-scrub-rail"[\s\S]*?<\/nav>/)?.[0] ?? "";
const sectionOf = (html: string, id: string) =>
  html.split(/(?=<section[^>]*data-section=")/).find((p) => new RegExp(`^<section[^>]*data-section="${id}"`).test(p)) ?? "";
const nn = (i: number) => String(i + 1).padStart(2, "0");

describe("observatory template says each thing once", () => {
  it("draws the chronometer fold, one index, the waterfall, questions, and the close", () => {
    const { spec } = designFromFeatures(sample);
    expect(spec.sections.map((s) => s.id)).toEqual(["nav", "hero", "features", "story", "faq", "cta", "footer"]);
    expect(spec.sections.some((s) => ["specimen", "compare", "figure", "proof", "metrics"].includes(s.kind))).toBe(false);
  });

  it("prints each channel description once on every brief, both paths", async () => {
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

  it("names each channel once on the fold, once in the index, once in the waterfall, and the lead once more in the close", async () => {
    // The sample's tagline carries its lead channel's name, so the marina, garden and pottery briefs prove the count.
    for (const brief of briefs.slice(1)) {
      for (const html of [designFromFeatures(brief).previewHtml, (await designFromFeaturesAuthored(brief, {})).previewHtml]) {
        const text = visible(html);
        const rail = railOf(html);
        for (const [i, f] of brief.features.entries()) {
          // Index and waterfall in the page text, plus the close for the lead. It was up to eleven.
          expect(text.split(f.name.toLowerCase()).length - 1, `${brief.productName}: ${f.name}`).toBe(i === 0 ? 3 : 2);
          expect(rail.split(`>${f.name}<`).length - 1, `${brief.productName} rail: ${f.name}`).toBe(1);
        }
      }
    }
  });

  it("puts every channel in the one index, numbered, with its description and no drawing beside it", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const index = spec.sections.filter((s) => s.kind === "features");
      expect(index).toHaveLength(1);
      expect(index[0]!.blocks.map((b) => b.title)).toEqual(brief.features.map((f) => f.name));
      expect(index[0]!.blocks.map((b) => b.meta)).toEqual(brief.features.map((_, i) => nn(i)));
      expect(index[0]!.blocks.every((b) => b.body.length > 0 && b.kicker === undefined)).toBe(true);
      expect(index[0]!.body).toBe("");
      expect(index[0]!.eyebrow).toBe("The channels");
      expect(index[0]!.title).toBe(`${brief.productName}, channel by channel.`);
      const html = sectionOf(previewHtml, "features");
      expect(html, brief.productName).not.toMatch(/<figure class="ds-plate/);
      for (const [i, f] of brief.features.entries()) {
        expect(html).toContain(`id="channel-${nn(i)}" data-feature="${f.name}"`);
        expect(html).toContain(`<p>${f.description.replace(/'/g, "&#39;")}.</p>`);
      }
    }
  });

  it("lists every channel in the scrub rail, each jumping to its index row, with no lede, clock, or names in the lattice", () => {
    for (const brief of briefs) {
      const { spec, previewHtml } = designFromFeatures(brief);
      const fold = sectionOf(previewHtml, "hero");
      expect(spec.sections.find((s) => s.kind === "hero")?.body).toBe("");
      expect(fold).not.toContain('class="ds-lede"');
      for (const f of brief.features) expect(fold.toLowerCase()).not.toContain(f.description.toLowerCase().slice(0, 16));
      const rail = railOf(previewHtml);
      const hrefs = [...rail.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
      expect(hrefs).toEqual(brief.features.map((_, i) => `#channel-${nn(i)}`));
      expect(rail.match(/is-live/g)).toHaveLength(1);
      for (const label of ["T−24h", ">Live<", "+6h", "Calibrate"]) expect(rail).not.toContain(label);
      // The chronometer keeps its ticks but prints no hours and no time zone.
      const chronometer = fold.match(/<aside class="ds-chronometer"[\s\S]*?<\/aside>/)?.[0] ?? "";
      expect(chronometer).toContain("ds-chrono-tick");
      expect(chronometer).not.toMatch(/<span>\d\d<\/span>|UTC/);
      const lattice = latticeOf(previewHtml);
      expect(lattice, brief.productName).not.toBe("");
      for (const f of brief.features) expect(lattice).not.toContain(f.name);
      for (const word of ["UTC", "LIVE", "WINDOW", "±", "00:", "· signal lattice"]) expect(lattice).not.toContain(word);
      // One row per channel, numbered like the index; a short brief is not padded with repeats.
      const rows = [...lattice.matchAll(/>(\d\d)<\/text>/g)].map((m) => m[1]);
      expect(rows).toEqual(brief.features.map((_, i) => nn(i)));
      expect(lattice).toContain(`>${brief.features.length} channels</text>`);
      expect(lattice).toContain("ds-lattice-bar");
    }
  });

  it("sorts the channels by the priority the brief gives in the event waterfall", () => {
    const { spec, previewHtml } = designFromFeatures(briefs[3]!);
    const story = spec.sections.find((s) => s.kind === "story");
    expect(story?.eyebrow).toBe("Priorities");
    expect(story?.title).toBe("Which Kilnroom channels to watch first.");
    expect(story?.blocks.map((b) => [b.title, b.body, b.meta])).toEqual([
      ["Core", "Kiln calendar and glaze library.", "01"],
      ["Supporting", "Member shelves and clay orders.", "02"],
      ["Additional", "Class roster.", "03"],
    ]);
    const html = sectionOf(previewHtml, "story");
    // The ruler is numbered like the index, one column per channel.
    const ruler = [...html.matchAll(/<span class="ds-chrono-ruler-tick">([^<]+)<\/span>/g)].map((m) => m[1]);
    expect(ruler).toEqual(["01", "02", "03", "04", "05"]);
    // Each span lights its own channels' columns: two, two, then one.
    const spans = html.split('<li class="ds-chrono-span"').slice(1);
    expect(spans.map((s) => (s.match(/class="ds-chrono-span-bar"/g) ?? []).length)).toEqual([2, 2, 1]);
    expect(spans[2]).toContain("--span-start:80%;--span-width:20%");
    expect(spans.map((s) => s.match(/<p class="ds-chrono-span-time">([^<]+)<\/p>/)?.[1])).toEqual([
      "2 channels",
      "2 channels",
      "1 channel",
    ]);
    expect(html).toContain("3 tiers");
    expect(html).toContain('aria-label="Event waterfall"');
    expect(html).not.toContain('class="ds-chrono-mark"');
    expect(html).not.toContain('class="ds-chrono-note"');
  });

  it("leaves the waterfall out when the brief gives a single priority, and still clears the basics", () => {
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

  it("closes without a tolerance strip, and builds the questions, the close, and the menu from the brief's own names", () => {
    const { spec, previewHtml } = designFromFeatures(briefs[3]!);
    expect(sectionOf(previewHtml, "cta")).not.toContain('class="ds-cal-strip"');
    const faq = spec.sections.find((s) => s.kind === "faq");
    expect(faq?.title).toBe("What to know before opening Kilnroom.");
    expect(faq?.blocks.map((b) => [b.title, b.body])).toEqual([
      ["Who is the Kilnroom desk for?", "Studio managers at community pottery studios."],
      ["What is not on the Kilnroom desk?", "Anything outside its five channels."],
    ]);
    const cta = spec.sections.find((s) => s.kind === "cta");
    expect(cta?.eyebrow).toBe("Calibration");
    expect(cta?.title).toBe("Start the Kilnroom desk on kiln calendar.");
    expect(cta?.body).toBe("Four more channels sit in the index above.");
    expect([cta?.ctaLabel, cta?.secondaryLabel]).toEqual(["Open the desk", "Read all five channels"]);
    const nav = spec.sections.find((s) => s.kind === "nav");
    expect(nav?.navItems.map((n) => n.label)).toEqual(["Channels", "Priorities", "Questions"]);
  });

  it("asks which channel handles approvals only when the brief declares an approval step", () => {
    const runbook = DesignBrief.parse({
      productName: "Runbook",
      tagline: "How a change reaches production",
      audience: "platform engineers",
      businessGoal: "trust",
      siteKind: "signal-observatory",
      lockSiteKind: true,
      features: [
        { id: "c1", name: "Change request", description: "Every change written down before it starts", priority: "p0" },
        { id: "c2", name: "Release sign-off", description: "Named approvals before a change goes live", priority: "p0" },
        { id: "c3", name: "Rollback notes", description: "What to undo, and in which order", priority: "p1" },
      ],
      taste: sample.taste,
    });
    const faq = designFromFeatures(runbook).spec.sections.find((s) => s.kind === "faq");
    const approve = faq?.blocks.find((b) => b.title === "Which channel handles approvals?");
    expect(approve?.body).toBe("Release sign-off, channel 02 in the index above.");
    for (const brief of briefs) {
      expect(designFromFeatures(brief).previewHtml, brief.productName).not.toMatch(/handles approvals/i);
    }
  });

  it("carries no fold note on the authored path", async () => {
    for (const brief of briefs) {
      const html = (await designFromFeaturesAuthored(brief, {})).previewHtml;
      expect(visible(html), brief.productName).not.toContain("windows ship with");
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
    expect(html).not.toMatch(/<meta name="description" content="[^"]*(signal-observatory|sections built from)/);
  });
});
