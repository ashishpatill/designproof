/**
 * Phase 0 — instrument Studio honesty blind spot.
 *
 * The 98.9 critique score measures grammar on 17 showcase pages, not whether two
 * ordinary products that share siteKind + businessGoal look authored. This suite
 * runs real `designFromFeatures` HTML (not fixtures) on ordinary briefs and
 * reports phrase-overlap + brief-vocabulary specificity on Design Expert's
 * authored-node list only.
 *
 * Scored nodes (Design Expert lock) — ONLY these:
 * - CTA: ctaFor() primary + secondary + note, plus riskReversal() (CTA band)
 * - FAQ: every questions() title + body (incl. corporate/fintech approve pair)
 * - Proof: workflow stage labels + gate copy when hasApprovalWorkflowSignal;
 *   else marquee ds-proof-claim / data-proof-board items (from real HTML)
 *
 * Not scored: nav/footer chrome, Privacy/Terms/Careers, eyebrows(), headline/heroLede,
 * pullQuote (outside the proof claim), plan-lane titles (Core / Standard / Full).
 *
 * Same site type, same goal, same counts used to share one proof layout and treat
 * about 57% shared wording as acceptable. That is not a pass. These briefs differ
 * in the kind of work, and the page shape has to differ with them.
 *
 * Phase 1 (`author.ts`) can inject brief-grounded CTA/FAQ/proof when GEMINI_API_KEY
 * is set; this suite stays on the no-key / sync `designFromFeatures` path so CI
 * never requires a live model. See `author.test.ts` for stubbed injection proof.
 */
import { describe, expect, it } from "vitest";
import { analyzeFeatures } from "../analyze";
import { ctaFor, questions, riskReversal } from "../copy";
import { designFromFeatures } from "../orchestrate";
import { DesignBrief, type DesignBrief as DesignBriefT } from "../types";

/** Ordinary, non-showcase briefs — five capabilities, two top-priority, saas-marketing, demos. */
function ordinaryBriefs(): DesignBriefT[] {
  return [
    DesignBrief.parse({
      productName: "Freightlane",
      tagline: "Lane booking and dock windows for regional carriers",
      audience: "fleet managers at mid-size carriers",
      businessGoal: "demos",
      siteKind: "saas-marketing",
      lockSiteKind: true,
      features: [
        { id: "f1", name: "Tender steps", description: "A load moves in order: tender, then dock, then release", priority: "p0" },
        { id: "f2", name: "Exception queue", description: "Triage missed windows in one ranked queue before the next truck", priority: "p0" },
        { id: "f3", name: "Carrier roster", description: "Keep preferred carriers listed by region", priority: "p1" },
        { id: "f4", name: "Yard notes", description: "Attach notes that travel with the load", priority: "p1" },
        { id: "f5", name: "Rate sheet", description: "Store the agreed lane price", priority: "p2" },
      ],
      taste: {
        aestheticLean: "conversion-sharp",
        motion: "light-scroll-reveals",
        colorMood: "neutral-professional",
      },
    }),
    DesignBrief.parse({
      productName: "Willowvet",
      tagline: "Appointment and treatment notes for neighborhood clinics",
      audience: "veterinary practice managers",
      businessGoal: "demos",
      siteKind: "saas-marketing",
      lockSiteKind: true,
      features: [
        { id: "v1", name: "Treatment choice", description: "Choose between in-clinic care and a referral option for the same visit", priority: "p0" },
        { id: "v2", name: "How a visit works", description: "Explain the mechanism of a visit from intake to discharge", priority: "p0" },
        { id: "v3", name: "Reminder notes", description: "Send a note before the appointment", priority: "p1" },
        { id: "v4", name: "Stock list", description: "Track vaccines on hand", priority: "p1" },
        { id: "v5", name: "Chart packet", description: "Package history when sending to a specialist", priority: "p2" },
      ],
      taste: {
        aestheticLean: "conversion-sharp",
        motion: "light-scroll-reveals",
        colorMood: "neutral-professional",
      },
    }),
    DesignBrief.parse({
      productName: "Scalehouse",
      tagline: "Lesson plans and practice logs for private music teachers",
      audience: "independent music teachers",
      businessGoal: "demos",
      siteKind: "saas-marketing",
      lockSiteKind: true,
      features: [
        { id: "m1", name: "Lesson ledger", description: "A ledger of movements through the week: assigned, practiced, performed", priority: "p0" },
        { id: "m2", name: "Recital evidence", description: "Named pieces and attendance counts a parent can check", priority: "p0" },
        { id: "m3", name: "Parent note", description: "Share a short progress note after each lesson", priority: "p1" },
        { id: "m4", name: "Room hold", description: "Hold the teaching room for the hour", priority: "p1" },
        { id: "m5", name: "Repertoire list", description: "Keep the pieces currently in study", priority: "p2" },
      ],
      taste: {
        aestheticLean: "conversion-sharp",
        motion: "light-scroll-reveals",
        colorMood: "neutral-professional",
      },
    }),
  ];
}

/** Both top capabilities are the same kind of work. The proof still must not copy the fold. */
function sameKindBrief(): DesignBriefT {
  return DesignBrief.parse({
    productName: "Twinrail",
    tagline: "Two sequences of steps for the same desk",
    audience: "operators who run the desk",
    businessGoal: "demos",
    siteKind: "saas-marketing",
    lockSiteKind: true,
    features: [
      { id: "t1", name: "Open steps", description: "Walk intake as a sequence of steps from request to scheduled", priority: "p0" },
      { id: "t2", name: "Close steps", description: "A second sequence of steps from done to archived", priority: "p0" },
      { id: "t3", name: "Roster", description: "People assigned to the work", priority: "p1" },
      { id: "t4", name: "Notes", description: "Notes kept with the record", priority: "p1" },
      { id: "t5", name: "Archive tag", description: "A label for finished records", priority: "p2" },
    ],
    taste: {
      aestheticLean: "conversion-sharp",
      motion: "light-scroll-reveals",
      colorMood: "neutral-professional",
    },
  });
}

function normalizeNode(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

/** Strip script/style so `>text<` walks page copy only. */
function stripChrome(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
}

function textBetweenTags(chunk: string): string[] {
  const out: string[] = [];
  const re = />([^<]+)</g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(chunk))) {
    const t = m[1]!.replace(/\s+/g, " ").trim();
    if (t.length >= 3) out.push(t);
  }
  return out;
}

export type AuthoredBuckets = {
  cta: string[];
  faq: string[];
  proof: string[];
};

/**
 * Design Expert authored nodes.
 * CTA + FAQ from copy helpers (exact locked list). Proof from real designFromFeatures HTML.
 */
export function extractAuthoredNodes(
  brief: DesignBriefT,
  html: string,
  hasApprovalWorkflow: boolean,
): AuthoredBuckets {
  const ctaCfg = ctaFor(brief.businessGoal, brief.siteKind, brief.primaryCta);
  const cta = [ctaCfg.primary, ctaCfg.secondary, ctaCfg.note, riskReversal(brief)];
  const faq = questions(brief, brief.features).flatMap((q) => [q.title, q.body]);

  const page = stripChrome(html);
  const proof: string[] = [];
  const proofSection =
    page.match(/<section[^>]*\bds-proof\b[^>]*>[\s\S]*?<\/section>/)?.[0] ??
    page.match(/<section[^>]*\bdata-workflow-proof\b[^>]*>[\s\S]*?<\/section>/)?.[0] ??
    "";

  if (hasApprovalWorkflow && /data-workflow-proof/.test(proofSection)) {
    // Workflow stage labels + gate copy
    for (const m of proofSection.matchAll(/data-workflow-step="[^"]*"[^>]*>([^<]+)/g)) {
      proof.push(m[1]!.trim());
    }
    for (const m of proofSection.matchAll(/class="ds-proof-claim"[^>]*>([^<]+)/g)) {
      proof.push(m[1]!.trim());
    }
    for (const m of proofSection.matchAll(/class="ds-proof-foot"[^>]*>([^<]+)/g)) {
      proof.push(m[1]!.trim());
    }
    for (const m of proofSection.matchAll(/<li[^>]*data-workflow-step[\s\S]*?<\/li>/g)) {
      proof.push(...textBetweenTags(m[0]!));
    }
  } else {
    // Marquee: ds-proof-claim + data-proof-board items only (not pullQuote attribution foot)
    for (const m of proofSection.matchAll(/class="ds-proof-claim"[^>]*>([^<]+)/g)) {
      proof.push(m[1]!.trim());
    }
    for (const m of proofSection.matchAll(/<li class="ds-proof-cell[\s\S]*?<\/li>/g)) {
      proof.push(...textBetweenTags(m[0]!));
    }
  }

  const clean = (xs: string[]) => xs.map((t) => t.replace(/\s+/g, " ").trim()).filter((t) => t.length >= 3);
  return { cta: clean(cta), faq: clean(faq), proof: clean(proof) };
}

function authoredNodeSet(buckets: AuthoredBuckets): Set<string> {
  return new Set([...buckets.cta, ...buckets.faq, ...buckets.proof].map(normalizeNode));
}

/** Phrase-overlap = |A ∩ B| / min(|A|, |B|) on normalized authored nodes. */
export function phraseOverlapRatio(a: Set<string>, b: Set<string>): {
  ratio: number;
  shared: string[];
  sharedCount: number;
} {
  const shared = [...a].filter((x) => b.has(x)).sort();
  const denom = Math.min(a.size, b.size) || 1;
  return { ratio: shared.length / denom, shared, sharedCount: shared.length };
}

const STOP = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "for",
  "with",
  "your",
  "that",
  "this",
  "into",
  "from",
  "of",
  "to",
  "in",
  "on",
  "at",
  "by",
  "is",
  "are",
  "be",
  "it",
  "as",
  "so",
  "you",
  "we",
  "they",
  "their",
  "our",
  "who",
  "what",
  "how",
  "when",
  "does",
  "need",
  "before",
  "after",
  "than",
  "then",
  "also",
  "only",
  "not",
  "yes",
  "all",
]);

/** Tokens from brief productName / tagline / features[].name / description (≥4 chars, no stopwords). */
export function briefVocabulary(brief: DesignBriefT): Set<string> {
  const raw = [
    brief.productName,
    brief.tagline,
    ...brief.features.flatMap((f) => [f.name, f.description]),
  ].join(" ");
  return new Set(
    raw
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length >= 4 && !STOP.has(t)),
  );
}

function lineSharesBriefToken(line: string, vocab: Set<string>): boolean {
  return line
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .some((t) => t.length >= 4 && vocab.has(t));
}

/**
 * Content-specificity metric: share of authored lines that share ≥1 brief vocabulary token.
 * Goal-keyed CTA/FAQ scaffolding may score low — that is the next PR, not a Phase 0 fail.
 */
export function contentSpecificity(
  buckets: AuthoredBuckets,
  brief: DesignBriefT,
): {
  ratio: number;
  hits: number;
  total: number;
  featureProofHits: number;
  featureProofTotal: number;
  featureFaqHits: number;
  featureFaqTotal: number;
} {
  const vocab = briefVocabulary(brief);
  const all = [...buckets.cta, ...buckets.faq, ...buckets.proof];
  const hits = all.filter((l) => lineSharesBriefToken(l, vocab)).length;

  const featureNames = brief.features.map((f) => f.name.toLowerCase());
  const proofLines = buckets.proof;
  const featureProof = proofLines.filter((l) =>
    featureNames.some((n) => l.toLowerCase().includes(n)),
  );
  const featureFaq = buckets.faq.filter((l) =>
    featureNames.some((n) => l.toLowerCase().includes(n)),
  );

  return {
    ratio: all.length ? hits / all.length : 0,
    hits,
    total: all.length,
    featureProofHits: featureProof.filter((l) => lineSharesBriefToken(l, vocab)).length,
    featureProofTotal: featureProof.length,
    featureFaqHits: featureFaq.filter((l) => lineSharesBriefToken(l, vocab)).length,
    featureFaqTotal: featureFaq.length,
  };
}

/** Operator/approve workflow narrative that ordinary briefs must not share after PR 69. */
const APPROVAL_NARRATIVE = [
  "operators approve",
  "human approves before apply",
  "nothing auto-applies",
  "named approval",
  "draft until a named",
  "explicit gate — never auto-apply",
];

function sectionChunk(html: string, sectionId: string): string {
  const page = stripChrome(html);
  const re = new RegExp(
    `<section[^>]*(?:id="${sectionId}"|data-section="${sectionId}")[^>]*>[\\s\\S]*?<\\/section>`,
  );
  return page.match(re)?.[0] ?? "";
}

/** Item titles on a screen — not the page headline. */
function plainText(chunk: string): string {
  return chunk.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

/** Visible proof lines told more than once. A second card, nav slot, or table cell of the same line fails. */
function repeatedProofLines(proofChunk: string): string[] {
  const counts = new Map<string, number>();
  for (const match of proofChunk.matchAll(/>([^<]+)</g)) {
    const line = match[1]!.replace(/\s+/g, " ").trim().toLowerCase().replace(/[.!?]+$/g, "");
    if (line.length < 12) continue;
    counts.set(line, (counts.get(line) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, n]) => n > 1).map(([line]) => line);
}

/** First-screen titles (feature names the fold actually paints) that the proof still says. */
function repeatedFoldNames(brief: DesignBriefT, foldChunk: string, proofChunk: string): string[] {
  const fold = plainText(foldChunk);
  const proof = plainText(proofChunk);
  return brief.features
    .map((feature) => feature.name.replace(/\s+/g, " ").trim().toLowerCase())
    .filter((name) => name.length >= 3 && fold.includes(name) && proof.includes(name));
}

function itemTitles(chunk: string): Set<string> {
  const found = new Set<string>();
  const patterns = [
    /class="ds-stage-label"[^>]*>([^<]+)/g,
    /class="ds-priority-label"[^>]*>([^<]+)/g,
    /class="ds-cutoff-label"[^>]*>([^<]+)/g,
    /class="ds-workflow-label"[^>]*>([^<]+)/g,
    /class="ds-metric-value"[^>]*>([^<]+)/g,
    /<h3>([^<]+)<\/h3>/g,
    /<strong>([^<]+)<\/strong>/g,
    /<th scope="row">([^<]+)/g,
  ];
  for (const re of patterns) {
    for (const match of chunk.matchAll(re)) {
      const title = match[1]!.replace(/\s+/g, " ").trim().toLowerCase();
      if (title.length >= 2) found.add(title);
    }
  }
  return found;
}

describe("cross-brief distinctiveness (Phase 0 honesty)", () => {
  it("same type and same counts diverge when the capabilities are different kinds of work", () => {
    const briefs = ordinaryBriefs();
    const pages = briefs.map((brief) => {
      expect(brief.features).toHaveLength(5);
      expect(brief.features.filter((f) => f.priority === "p0")).toHaveLength(2);
      const analysis = analyzeFeatures(brief);
      expect(analysis.hasApprovalWorkflow, `${brief.productName} must not trigger approval workflow`).toBe(false);
      const { previewHtml, spec } = designFromFeatures(brief);
      expect(previewHtml.length, `${brief.productName} must emit real HTML`).toBeGreaterThan(500);
      expect(spec.brief.siteKind).toBe("saas-marketing");
      expect(spec.brief.businessGoal).toBe("demos");
      const fold = spec.sections.find((s) => s.kind === "hero");
      const proof = spec.sections.find((s) => s.id === "proof");
      expect(fold, `${brief.productName} fold`).toBeTruthy();
      expect(proof, `${brief.productName} proof`).toBeTruthy();
      expect(proof!.layout, `${brief.productName} proof copies the fold`).not.toBe(fold!.layout);
      const heroChunk = sectionChunk(previewHtml, "hero");
      const proofChunk = sectionChunk(previewHtml, "proof");
      const foldTitles = itemTitles(heroChunk);
      const proofTitles = itemTitles(proofChunk);
      // A plate that already lists the evidence has no card headings. Those lines are the titles.
      if (proof!.layout === "marquee-proof" && !/data-proof-board/.test(proofChunk)) {
        const stack = proofChunk.match(/<svg[^>]*data-figure="stack"[^>]*>[\s\S]*?<\/svg>/);
        if (stack) {
          for (const text of stack[0].matchAll(/<text[^>]*font-weight="600"[^>]*>([^<]+)/g)) {
            const title = text[1]!.replace(/\s+/g, " ").trim().toLowerCase();
            if (title.length >= 2) proofTitles.add(title);
          }
        }
      }
      const shared = [...foldTitles].filter((title) => proofTitles.has(title));
      expect(shared, `${brief.productName} proof repeats fold titles: ${shared.join(", ")}`).toEqual([]);
      const repeated = repeatedFoldNames(brief, heroChunk, proofChunk);
      expect(
        repeated,
        `${brief.productName} proof repeats first-screen titles: ${repeated.join(", ")}`,
      ).toEqual([]);
      const toldTwice = repeatedProofLines(proofChunk);
      expect(
        toldTwice,
        `${brief.productName} proof tells the same line twice: ${toldTwice.join(" | ")}`,
      ).toEqual([]);
      expect(foldTitles.size, `${brief.productName} fold has no item titles`).toBeGreaterThan(0);
      expect(proofTitles.size, `${brief.productName} proof has no item titles`).toBeGreaterThan(0);
      return { brief, fold: fold!.layout, proof: proof!.layout, html: previewHtml };
    });

    const expected = [
      { product: "Freightlane", fold: "hero-pipeline", proof: "app-shell" },
      { product: "Willowvet", fold: "feature-alternating", proof: "figure-explainer" },
      { product: "Scalehouse", fold: "hero-wire", proof: "marquee-proof" },
    ] as const;
    pages.forEach((page, i) => {
      const want = expected[i]!;
      expect(page.brief.productName).toBe(want.product);
      expect(page.fold, want.product).toBe(want.fold);
      expect(page.proof, want.product).toBe(want.proof);
    });

    const signatures = new Set(pages.map((page) => `${page.fold}|${page.proof}`));
    expect(signatures.size, `pages collapsed to ${[...signatures].join(" ; ")}`).toBe(pages.length);

    // The shape is the layout, not a renamed three-card row.
    expect(pages[0]!.html).toContain("ds-stage-rail");
    expect(pages[0]!.html).toContain("ds-hero-pipeline");
    expect(pages[0]!.html).toContain("data-app-shell");
    expect(pages[1]!.html).toContain("ds-alt-row");
    expect(pages[1]!.html).toContain("data-scrub");
    const willowHero = sectionChunk(pages[1]!.html, "hero");
    const willowRows = willowHero.match(/class="ds-alt-row[^"]*"/g) ?? [];
    expect(willowRows, "Willowvet fold must be one row per choice").toHaveLength(5);
    expect(willowHero, "Willowvet fold must not be a single list of names").not.toContain('data-figure="stack"');
    expect(pages[2]!.html).toContain("ds-cutoff-rail");
    expect(pages[2]!.html).toContain("ds-hero-wire");
    const scaleProof = sectionChunk(pages[2]!.html, "proof");
    expect(scaleProof).toContain('data-figure="stack"');
    expect(scaleProof).not.toMatch(/<ul[^>]*\bdata-proof-board\b/);
    for (const line of ["Named pieces", "Attendance counts", "A parent can check"]) {
      expect(scaleProof.match(new RegExp(`>${line}<`, "g")) ?? [], line).toHaveLength(1);
    }
    const shownLines = ["Named pieces", "Attendance counts", "A parent can check"].filter((line) =>
      scaleProof.includes(`>${line}<`),
    );
    const countWord: Record<string, number> = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
    };
    const countClaims = [
      ...scaleProof.matchAll(/\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+capabilities\b/gi),
    ];
    expect(countClaims.length, "Scalehouse proof states how many lines are shown").toBeGreaterThan(0);
    for (const claim of countClaims) {
      const raw = claim[1]!.toLowerCase();
      const stated = countWord[raw] ?? Number(raw);
      expect(stated, `says ${claim[0]} over ${shownLines.length} lines`).toBe(shownLines.length);
    }
    expect(scaleProof.toLowerCase(), "Scalehouse proof still says five").not.toMatch(/\bfive\b/);
    const freightProof = sectionChunk(pages[0]!.html, "proof");
    const load = "A load moves in order: tender, then dock, then release";
    expect(freightProof.split(load).length - 1).toBe(1);
    for (const name of ["Tender steps", "Exception queue", "Carrier roster", "Yard notes", "Rate sheet"]) {
      expect(freightProof, name).not.toContain(name);
    }
    const sideNav = freightProof.match(/data-app-views[\s\S]*?<\/ul>/)?.[0] ?? "";
    const sideNums = [...sideNav.matchAll(/>(\d{2})</g)].map((match) => match[1]!);
    const sideValues = sideNums.map((n) => Number(n));
    expect(sideValues, `side list skips: ${sideNums.join(", ")}`).toEqual(sideValues.map((_, i) => i + 1));
    // 01, 02, 03, 05 is a skip. A fifth step stays only when its line is not the load sentence again.
    expect(sideNums).not.toEqual(["01", "02", "03", "05"]);
    for (const page of pages) {
      expect(page.html).not.toMatch(/class="ds-bento"/);
    }
  });

  it("when both top capabilities are the same kind, the proof is not a copy of the fold", () => {
    const brief = sameKindBrief();
    expect(brief.features).toHaveLength(5);
    expect(brief.features.filter((f) => f.priority === "p0")).toHaveLength(2);
    const { previewHtml, spec } = designFromFeatures(brief);
    const fold = spec.sections.find((s) => s.kind === "hero");
    const proof = spec.sections.find((s) => s.id === "proof");
    expect(fold?.layout).toBe("hero-pipeline");
    expect(proof?.layout).toBe("workflow-proof");
    expect(proof?.layout).not.toBe(fold?.layout);
    const foldTitles = itemTitles(sectionChunk(previewHtml, "hero"));
    const proofTitles = itemTitles(sectionChunk(previewHtml, "proof"));
    const shared = [...foldTitles].filter((title) => proofTitles.has(title));
    expect(shared, `same-kind proof repeats fold titles: ${shared.join(", ")}`).toEqual([]);
    expect(foldTitles.size).toBeGreaterThan(0);
    expect(proofTitles.size).toBeGreaterThan(0);
    expect(previewHtml).toContain("ds-stage-rail");
    expect(previewHtml).toContain("data-workflow-proof");
    expect(previewHtml).not.toContain("Human gate");
    expect(previewHtml).not.toContain('data-workflow-step="approve"');
  });

  it("feature FAQ rows still share brief vocabulary; proof is not graded as a shared-word ceiling", () => {
    for (const brief of ordinaryBriefs()) {
      const analysis = analyzeFeatures(brief);
      const { previewHtml, spec } = designFromFeatures(brief);
      const buckets = extractAuthoredNodes(brief, previewHtml, analysis.hasApprovalWorkflow);
      const metric = contentSpecificity(buckets, brief);
      expect(Number.isFinite(metric.ratio), `${brief.productName} specificity ratio`).toBe(true);
      expect(metric.featureFaqTotal, `${brief.productName} feature FAQ rows`).toBeGreaterThan(0);
      expect(metric.featureFaqHits).toBe(metric.featureFaqTotal);
      const proof = spec.sections.find((s) => s.id === "proof");
      expect(proof?.layout).not.toBe(spec.sections.find((s) => s.kind === "hero")?.layout);
      if (proof?.layout === "marquee-proof") {
        const vocab = briefVocabulary(brief);
        const grounded = buckets.proof.filter((line) => lineSharesBriefToken(line, vocab));
        expect(grounded.length, `${brief.productName} evidence board`).toBeGreaterThan(0);
        const heroChunk = sectionChunk(previewHtml, "hero");
        const proofChunk = sectionChunk(previewHtml, "proof");
        expect(repeatedFoldNames(brief, heroChunk, proofChunk)).toEqual([]);
      }
    }
  });

  it("scores corporate/fintech “Who approves irreversible actions?” FAQ when questions() emits it", () => {
    const corporate = DesignBrief.parse({
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
      taste: { aestheticLean: "system-crafted", motion: "subtle-micro", colorMood: "neutral-professional" },
    });
    const fintech = DesignBrief.parse({
      productName: "Wiredesk",
      tagline: "Treasury controls for mid-market cash",
      audience: "treasury operators",
      businessGoal: "demos",
      siteKind: "fintech-marketing",
      lockSiteKind: true,
      features: [
        { id: "w1", name: "Wire queue", description: "Queue outbound wires with dual control", priority: "p0" },
        { id: "w2", name: "Wallet map", description: "See balances across banks in one surface", priority: "p0" },
        { id: "w3", name: "Audit export", description: "Export who approved each payment", priority: "p1" },
      ],
      taste: { aestheticLean: "conversion-sharp", motion: "light-scroll-reveals", colorMood: "neutral-professional" },
    });

    for (const brief of [corporate, fintech]) {
      const analysis = analyzeFeatures(brief);
      const { previewHtml } = designFromFeatures(brief);
      const buckets = extractAuthoredNodes(brief, previewHtml, analysis.hasApprovalWorkflow);
      expect(
        buckets.faq.some((l) => /who approves irreversible actions/i.test(l)),
        `${brief.productName} must score the approve FAQ title`,
      ).toBe(true);
      expect(
        buckets.faq.some((l) => /operators approve/i.test(l)),
        `${brief.productName} must score the approve FAQ body`,
      ).toBe(true);
      expect(previewHtml).toMatch(/Who approves irreversible actions/i);
    }
  });
});
