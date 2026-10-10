/**
 * Composition — what sections exist, in what order, on which surface, in which layout.
 *
 * This is where art direction lives. Two briefs that route to the same site kind should still
 * produce visibly different pages. On a marketing page the fold and the proof follow what each
 * top capability is (a sequence, a queue, a choice, an explanation, evidence, or a ledger).
 * Capability count and top-priority count only decide how many catalogue rows, not which shape.
 *
 * Measured corridors this targets (docs/10_DESIGN_EVIDENCE.md):
 *  - page height 6.65–12.9 viewports → the argument needs 8–11 real sections, not 5 stubs
 *  - ≥ 16 headings → every section names its parts
 *  - section density variation 0.54–1.14 → bands must differ in weight, so layouts must differ
 *  - asymmetric grid share ≥ 0.08 → split layouts use unequal columns on purpose
 *  - ≥ 4 surface levels in play → surfaces alternate rather than sitting flat
 */
import type { AestheticLean, Density, LayoutVariant, SiteKind, SurfaceLevel } from "./types";

export interface SectionPlan {
  id: string;
  kind:
    | "nav"
    | "hero"
    | "metrics"
    | "features"
    | "template"
    | "figure"
    | "story"
    | "proof"
    | "pricing"
    | "compare"
    | "faq"
    | "cta"
    | "footer"
    | "app";
  layout: LayoutVariant;
  surface: SurfaceLevel;
  columns?: string;
  /**
   * This section continues the previous one's subject rather than changing it.
   *
   * Every section here used to get the same break above it, which is why a page of twelve
   * defensible sections read as twelve sections: each one took a screen, and each screen carried
   * about the same weight as the one before it. Measured, reference pages of the same overall
   * volume put roughly twice their average weight into one screen and a fifth of it into another —
   * the spread is the rhythm, and it does not come from writing more, it comes from deciding which
   * things belong on a screen together.
   *
   * A bonded section keeps the surface it inherits and drops the break, so a plan row and the table
   * that details it arrive as one chapter with two movements instead of two chapters that happen to
   * be about the same thing.
   */
  bond?: boolean;
}

export interface CompositionInput {
  siteKind: SiteKind;
  lean: AestheticLean;
  density: Density;
  featureCount: number;
  p0Count: number;
  goal: "leads" | "demos" | "trust" | "sales" | "activation";
  /** SaaS-only: interactive workflow-proof when the brief names drafts/approval. */
  hasApprovalWorkflow: boolean;
  /**
   * Declared capabilities. The first top-priority one picks the fold.
   * The second picks the proof. Absent on older callers — marketing then falls back to evidence.
   */
  capabilities?: CapabilityCue[];
}

/** One declared capability, enough to tell what kind of work it is. */
export interface CapabilityCue {
  name: string;
  description: string;
  priority: "p0" | "p1" | "p2";
}

/**
 * Kind of work, read from the capability's own name and description.
 * Not from how many capabilities the brief listed.
 */
export type CapabilityRole =
  | "sequence"
  | "queue"
  | "choice"
  | "explanation"
  | "evidence"
  | "ledger";

/**
 * One role. More specific work-shapes are tested first so a ranked queue is not
 * swallowed by a weak sequence word, and a ledger is not swallowed by "named".
 */
export function classifyCapability(name: string, description: string): CapabilityRole {
  const text = `${name} ${description}`.toLowerCase();
  if (/\b(ledgers?|cut-?offs?|wire transfers?|wires?|movements?|debits?|credits?|postings?|reconcil\w*)\b/.test(text)) {
    return "ledger";
  }
  if (/\b(queues?|triage|priorit(?:y|ies|ise|ize|ised|ized)|inbox|ranked|ranking|ranks?|backlogs?|urgen(?:t|cy)|most urgent|sorted by)\b/.test(text)) {
    return "queue";
  }
  if (/\b(choose|choice|choices|compare|comparison|options?|versus|alternatives?|side by side|pick between)\b/.test(text)) {
    return "choice";
  }
  if (/\b(how it works|explains?|explanation|mechanisms?|diagrams?|scrub|walkthroughs?|teaches?|teaching)\b/.test(text)) {
    return "explanation";
  }
  if (/\b(steps?|stages?|sequences?|pipelines?|workflows?|handoffs?|phases?|in order)\b/.test(text)) {
    return "sequence";
  }
  if (/\b(evidence|compliance|audits?|certif\w*|metrics?|kpis?|slas?|attest\w*|scorecards?|counts?|named)\b/.test(text) || /\d/.test(text)) {
    return "evidence";
  }
  return "evidence";
}

/**
 * Role → existing shape id.
 *
 * Choice has no fold id that places options next to each other; `feature-alternating` is that
 * shape. A ledger's cutoff rail is `hero-wire`, which is a fold. There is no second cutoff-rail
 * id, so a ledger proof uses `hero-wire` only when the fold is not already that rail, and a
 * ruled index (`feature-index`, not cards) when reusing the rail would copy the fold.
 */
const ROLE_FOLD: Record<CapabilityRole, LayoutVariant> = {
  sequence: "hero-pipeline",
  queue: "hero-queue",
  choice: "feature-alternating",
  explanation: "hero-mechanism",
  evidence: "metric-band",
  ledger: "hero-wire",
};

/*
 * A ledger proof is a ruled index. The cutoff rail is a fold renderer: used as a proof it
 * draws the first screen's own figure a second time, with the fold's clock labels.
 */
const ROLE_PROOF: Record<CapabilityRole, LayoutVariant> = {
  sequence: "workflow-proof",
  queue: "app-shell",
  choice: "compare-matrix",
  explanation: "figure-explainer",
  evidence: "marquee-proof",
  ledger: "feature-index",
};

export function shapesForCapabilities(cues: CapabilityCue[]): {
  first: LayoutVariant;
  proof: LayoutVariant;
  firstRole: CapabilityRole;
  proofRole: CapabilityRole;
} {
  const rank = { p0: 0, p1: 1, p2: 2 } as const;
  const ranked = [...cues].sort((a, b) => rank[a.priority] - rank[b.priority]);
  const top = ranked.filter((c) => c.priority === "p0");
  const firstCue = top[0] ?? ranked[0];
  const secondCue = top[1] ?? ranked[1] ?? firstCue;
  const firstRole: CapabilityRole = firstCue
    ? classifyCapability(firstCue.name, firstCue.description)
    : "evidence";
  const proofRole: CapabilityRole = secondCue
    ? classifyCapability(secondCue.name, secondCue.description)
    : firstRole;
  const first = ROLE_FOLD[firstRole];
  let proof = ROLE_PROOF[proofRole];
  /*
   * The proof cannot reuse the fold's shape — it would draw the first screen's own figure a second
   * time. There was a second map, `ROLE_PROOF_DISTINCT`, holding values byte-identical to
   * `ROLE_PROOF`, consulted here on the assumption that it differed; it did not, so the branch was a
   * no-op that read as if a distinction were being made. The real fallback is below.
   */
  if (proof === first) proof = first === "marquee-proof" ? "feature-index" : "marquee-proof";
  return { first, proof, firstRole, proofRole };
}

/**
 * Column ratios per lean. Equal columns everywhere is the single clearest template signature, so
 * every split layout in the system carries an intentional imbalance.
 */
/*
 * The `wide` ratio feeds layouts whose narrow track holds a section introduction, so it cannot be
 * arbitrarily extreme. At `2fr 10fr` inside a 940px container that track is 170px, which sets a
 * heading one word per line and runs its lede at sixteen characters. Asymmetry is still the point;
 * it just has to leave a readable column behind.
 */
/*
 * Hero ratios are stated from the copy's side. On a split fold the second track holds the product
 * surface, and a quarter of the screen is not enough to show one — the drawing scales down until
 * its own labels are under seven pixels, which is how a fold ends up describing a product instead
 * of showing it. Measured reference folds are between a third and all drawn matter, so the figure
 * track gets at least four twelfths wherever a split fold is chosen.
 */
const SPLIT: Record<AestheticLean, { hero: string; feature: string; wide: string }> = {
  "minimal-clean": { hero: "6fr 5fr", feature: "5fr 7fr", wide: "4fr 8fr" },
  // Conversion fold gives the figure the majority — the product has to be visible above the fold,
  // and a copy column at five twelfths still holds a 16rem floor so the headline does not collapse.
  "conversion-sharp": { hero: "5fr 7fr", feature: "5fr 7fr", wide: "7fr 5fr" },
  "system-crafted": { hero: "7fr 5fr", feature: "7fr 5fr", wide: "5fr 7fr" },
  "refined-story": { hero: "7fr 4fr", feature: "4fr 8fr", wide: "4fr 8fr" },
};

function heroLayout(siteKind: SiteKind, lean: AestheticLean): LayoutVariant {
  // First-five marketing kinds own unreplicable fold instruments — never the shared stackfold.
  if (siteKind === "saas-marketing") return "hero-pipeline";
  if (siteKind === "dashboard-webapp") return "hero-queue";
  if (siteKind === "corporate-story") return "hero-diligence";
  if (siteKind === "docs-educational") return "hero-mechanism";
  if (siteKind === "fintech-marketing") return "hero-wire";
  // Studio / consumer: short claim then labeled figure (stackfold in render).
  if (siteKind === "art-directed-studio") return "hero-statement";
  if (siteKind === "consumer-craft") return "hero-statement";
  // Foundry: hard vertical seam — paper claim | inverse type ladder. Not a stack or overfigure.
  if (siteKind === "editorial-foundry") return "hero-seam";
  if (siteKind === "research-dossier") return "hero-folio";
  if (siteKind === "signal-observatory") return "hero-chrono";
  if (siteKind === "archive-index") return "hero-register";
  if (siteKind === "commerce-loom") return "hero-loom";
  if (siteKind === "field-guide") return "hero-voucher";
  if (lean === "minimal-clean") return "hero-statement";
  if (lean === "refined-story") return "hero-editorial";
  return "hero-split";
}

/**
 * Catalogue bands. Count decides how many bands (how many rows), not which shape.
 * Marketing keeps one index shape. Other leans keep the shape they already used;
 * a second band, when the count asks for one, repeats that shape instead of swapping it.
 */
function featureLayouts(count: number, p0: number, lean: AestheticLean, siteKind?: SiteKind): LayoutVariant[] {
  // Marketing: count only decides whether a second catalogue band exists, not which shape.
  /*
   * Marketing: one catalogue, whatever the count. A second "also included" band re-listed the
   * tail of the same index under a stock heading, so every capability past the third was named in
   * two catalogues on one page.
   */
  if (siteKind === "saas-marketing") return ["feature-index"];
  if (count <= 2) return ["feature-alternating"];
  if (lean === "minimal-clean") return count >= 6 ? ["feature-index", "feature-rows"] : ["feature-rows"];
  if (lean === "refined-story") return ["feature-alternating", "feature-index"];
  // Trailing bento left a sparse two-card airway before proof. Index/rows stay dense so the
  // template and proof stage can meet the reader without a light empty band above them.
  if (p0 >= 2 && count >= 4) return ["feature-alternating", "feature-index"];
  return count >= 5 ? ["feature-index", "feature-rows"] : ["feature-index"];
}

export function planSections(input: CompositionInput): SectionPlan[] {
  const { siteKind, lean, featureCount, p0Count, goal, density } = input;
  const split = SPLIT[lean];
  const plans: SectionPlan[] = [];

  plans.push({ id: "nav", kind: "nav", layout: "nav", surface: "paper" });

  if (siteKind === "dashboard-webapp") {
    /*
     * A product surface still opens with a claim. Leading straight into the application shell was
     * the engine's worst-scoring composition: the fold filled with navigation affordances instead
     * of a decision, the largest type on the page was a table header, and the whole document came
     * in under five viewports. The interface is the proof, so it arrives after a quiet drawn beat.
     *
     * Band-variation lesson (Loop 6 + ledger): do not buy rhythm with empty 140vh voids. Insert a
     * sunken type-led template between the metric register and the dense shell so one measured
     * strip is ink-heavy and character-light — then pack shell + index + proof as density peaks.
     */
    plans.push({ id: "hero", kind: "hero", layout: "hero-queue", surface: "paper", columns: split.hero });
    // Quiet sunken valley after the queue fold — not a metric row reprinting the same priorities.
    plans.push({ id: "template", kind: "template", layout: "template-band", surface: "sunken" });
    plans.push({ id: "app", kind: "app", layout: "app-shell", surface: "paper", columns: "260px 1fr" });
    // Index bonded to the shell — legend for the board above (density peak).
    plans.push({ id: "features", kind: "features", layout: "feature-index", surface: "paper", bond: true });
    /*
     * No proof board, no step-by-step chart, and no "what is included" table. The proof board
     * printed every description twice (cut short in a drawing, then in full under it), the chart
     * listed the first four names twice over a cost curve no brief declared, and the table's own
     * lede said it was "the same list as above". The working surface above is the proof, and the
     * catalogue is the one place each capability is described.
     */
    plans.push({ id: "faq", kind: "faq", layout: "faq-columns", surface: "raised", columns: "5fr 7fr" });
    plans.push({ id: "cta", kind: "cta", layout: "cta-band", surface: "inverse" });
    plans.push({ id: "footer", kind: "footer", layout: "footer-columns", surface: "paper" });
    return plans;
  }

  /*
   * Fintech marketing — inverse-heavy, bleed-dense.
   *
   * Measured fintech-product pages sit at invertedShare ~0.7 and bleedBands ~13 (medians). A SaaS
   * plan with one inverse proof band cannot make that rhythm. This offering stacks inverse metrics,
   * an inverse template stage, inverse proof, and inverse close around paper catalogues — tone
   * moves down the scroll the way money-product sites do.
   */
  if (siteKind === "fintech-marketing") {
    plans.push({ id: "hero", kind: "hero", layout: "hero-wire", surface: "paper", columns: split.hero });
    plans.push({
      id: "features",
      kind: "features",
      layout: "feature-alternating",
      surface: "paper",
      columns: split.feature,
    });
    plans.push({ id: "template", kind: "template", layout: "template-band", surface: "inverse" });
    /*
     * One catalogue, no proof board, no send-path chapters, and no table under the lanes. The
     * "also included" band re-listed the catalogue's tail as bare names; the proof board printed
     * every description again, cut short in a drawing and then in full; the chapters listed the
     * names a fifth time under a heading written for one treasury product ("wire, wallet,
     * approval, FX") that every fintech brief received; and the table's own lede said it was "the
     * same list as above". The lanes stay, and each lane names only what it adds.
     */
    if (featureCount >= 3) {
      plans.push({ id: "pricing", kind: "pricing", layout: "pricing-lanes", surface: "raised" });
    }
    plans.push({ id: "faq", kind: "faq", layout: "faq-columns", surface: "paper", columns: "5fr 7fr" });
    plans.push({ id: "cta", kind: "cta", layout: "cta-band", surface: "inverse" });
    plans.push({ id: "footer", kind: "footer", layout: "footer-columns", surface: "paper" });
    return plans;
  }

  /*
   * Art-directed studio — figure owns the fold; the scroll stays paper-led.
   *
   * Measured art-directed-studio pages sit at foldFigure ~1.0, figureArea ~0.57, invertedShare ~0,
   * and large display type. A SaaS plan (inverse metrics → pricing → inverse CTA) is the wrong
   * skeleton: selected work, method, and a quiet template beat replace the conversion ladder.
   */
  if (siteKind === "art-directed-studio") {
    plans.push({ id: "hero", kind: "hero", layout: "hero-statement", surface: "paper", columns: split.hero });
    // Capability register on raised — stakes without inventing dark-stage metrics theatre.
    plans.push({ id: "metrics", kind: "metrics", layout: "metric-band", surface: "raised" });
    plans.push({
      id: "features",
      kind: "features",
      layout: "feature-alternating",
      surface: "paper",
      columns: split.feature,
    });
    // Quiet type-led valley — honest weight variation without empty height.
    plans.push({ id: "template", kind: "template", layout: "template-band", surface: "sunken" });
    plans.push({
      id: "story",
      kind: "story",
      layout: "story-chapters",
      surface: "paper",
      bond: true,
      columns: split.wide,
    });
    plans.push({
      id: "figure",
      kind: "figure",
      layout: "figure-explainer",
      surface: "raised",
      columns: split.wide,
    });
    if (featureCount >= 4) {
      plans.push({ id: "features-2", kind: "features", layout: "feature-index", surface: "paper" });
    }
    // No shared marquee-proof — selected-work figure + chapters already prove the craft.
    // Bolting the same "Proof / declared scope" board onto every offering is the uniqueness miss.
    plans.push({ id: "faq", kind: "faq", layout: "faq-columns", surface: "paper", columns: "5fr 7fr", bond: true });
    // One controlled inverse close for tonal range — not an inverse-heavy scroll.
    plans.push({ id: "cta", kind: "cta", layout: "cta-band", surface: "inverse" });
    plans.push({ id: "footer", kind: "footer", layout: "footer-columns", surface: "paper" });
    return plans;
  }

  /*
   * Consumer craft — figure-dense product story, paper-led, short scroll.
   *
   * Measured consumer-craft pages sit at figureArea ~0.68, foldFigure ~0.73, invertedShare ~0,
   * and moderate display (~3.2vw). They show the thing often; they do not run a SaaS pricing
   * ladder or an inverse-heavy money-product stage set.
   */
  if (siteKind === "consumer-craft") {
    plans.push({ id: "hero", kind: "hero", layout: "hero-statement", surface: "paper", columns: split.hero });
    plans.push({ id: "metrics", kind: "metrics", layout: "metric-band", surface: "raised" });
    plans.push({
      id: "features",
      kind: "features",
      layout: "feature-alternating",
      surface: "paper",
      columns: split.feature,
    });
    // Quiet drawn valley — honest weight variation against the dense product registers.
    plans.push({ id: "template", kind: "template", layout: "template-band", surface: "sunken" });
    plans.push({
      id: "figure",
      kind: "figure",
      layout: "figure-explainer",
      surface: "raised",
      columns: split.wide,
    });
    // No second feature-rows catalogue — sparse airways after marquee cut (Phase 9).
    // No shared marquee-proof — product figure + chapters are the proof for consumer craft.
    plans.push({
      id: "story",
      kind: "story",
      layout: "story-chapters",
      surface: "paper",
      bond: true,
      columns: split.wide,
    });
    plans.push({ id: "faq", kind: "faq", layout: "faq-columns", surface: "paper", columns: "5fr 7fr", bond: true });
    plans.push({ id: "cta", kind: "cta", layout: "cta-band", surface: "inverse" });
    plans.push({ id: "footer", kind: "footer", layout: "footer-columns", surface: "paper" });
    return plans;
  }

  /*
   * Editorial foundry — typography spine, hard-seam fold, paper-led scroll.
   *
   * Measured type-foundry / personal-craft / editorial-longform pages sit at foldFigure ~0.97,
   * figureArea ~0.38, invertedShare ~0, display ~3.3vw, alignment axes ~6. They are not SaaS
   * conversion ladders, studio selected-work grids, or consumer product plates: the argument is
   * the type system itself. Hard seam + type ladder + marginalia + colophon are the craft that
   * generic engines do not invent from a theme pack.
   */
  if (siteKind === "editorial-foundry") {
    plans.push({ id: "hero", kind: "hero", layout: "hero-seam", surface: "paper", columns: "1fr 1fr" });
    // Cut catalogue — indexed list on a shared rail, not metric theatre.
    plans.push({
      id: "features",
      kind: "features",
      layout: "feature-index",
      surface: "paper",
      columns: split.wide,
    });
    // Optical-size ladder as the teaching figure (foundry signature).
    plans.push({
      id: "figure",
      kind: "figure",
      layout: "figure-explainer",
      surface: "raised",
      columns: split.wide,
    });
    // Quiet sunken valley — honest weight variation without empty height.
    plans.push({ id: "template", kind: "template", layout: "template-band", surface: "sunken" });
    // Marginalia essay — annotations hang in the outer column (editorial-longform craft).
    plans.push({
      id: "story",
      kind: "story",
      layout: "story-marginalia",
      surface: "paper",
      bond: true,
      columns: "7fr 5fr",
    });
    // No second feature-alternating catalogue — empty airways after marquee cut.
    // Cut slips live inside the marginalia essay (foundry mid-page proof).
    // No shared marquee-proof — type ladder + marginalia already prove foundry craft.
    plans.push({ id: "faq", kind: "faq", layout: "faq-columns", surface: "paper", columns: "5fr 7fr", bond: true });
    // Colophon close on paper — not inverse demo-booking theatre.
    plans.push({ id: "cta", kind: "cta", layout: "cta-band", surface: "paper" });
    plans.push({ id: "footer", kind: "footer", layout: "footer-columns", surface: "paper" });
    return plans;
  }

  /*
   * Research dossier — capital briefing / research-editorial craft.
   *
   * Measured capital-brand + research-editorial + editorial-brand pages sit at high alignment
   * axes (~6–8), strong spine conformity, quiet display, and dense bleed rhythm — not SaaS
   * conversion ladders, foundry seams, or studio selected-work grids. Folio masthead + dossier
   * plate + chapter rail + verso/recto footnotes + imprint are the craft a theme pack will not
   * invent from taste controls.
   */
  if (siteKind === "research-dossier") {
    plans.push({ id: "hero", kind: "hero", layout: "hero-folio", surface: "paper", columns: split.wide });
    // Briefing index — catalog of instruments, not metric theatre.
    plans.push({
      id: "features",
      kind: "features",
      layout: "feature-index",
      surface: "paper",
      columns: split.wide,
    });
    // Teaching figure: the dossier plate redrawn with pin callouts (body slot).
    plans.push({
      id: "figure",
      kind: "figure",
      layout: "figure-explainer",
      surface: "raised",
      columns: split.wide,
    });
    // Quiet sunken valley — third surface + honest weight variation.
    plans.push({ id: "template", kind: "template", layout: "template-band", surface: "sunken" });
    // Verso/recto spread with footnote register (dossier signature essay).
    plans.push({
      id: "story",
      kind: "story",
      layout: "story-spread",
      surface: "paper",
      bond: true,
      columns: "1fr 1fr",
    });
    // No second feature-rows catalogue — sparse airways after marquee cut (Phase 9).
    // No shared marquee-proof — verso/recto spread is the dossier proof instrument.
    plans.push({ id: "faq", kind: "faq", layout: "faq-columns", surface: "paper", columns: "5fr 7fr", bond: true });
    // Imprint close on paper — not inverse demo theatre.
    plans.push({ id: "cta", kind: "cta", layout: "cta-band", surface: "paper" });
    plans.push({ id: "footer", kind: "footer", layout: "footer-columns", surface: "paper" });
    return plans;
  }

  /*
   * Signal observatory — enterprise telemetry / instrument-desk craft.
   *
   * Measured enterprise-observability + enterprise-data pages sit at high figure area
   * (~0.4–0.78), mid fold figure, moderate-to-high alignment axes, and instrument-dense
   * matter — not SaaS conversion, foundry seams, or dossier folios. Chronometer + scrub
   * rail + signal lattice + chrono essay + calibration are craft a theme pack will not invent.
   */
  if (siteKind === "signal-observatory") {
    plans.push({ id: "hero", kind: "hero", layout: "hero-chrono", surface: "paper", columns: split.wide });
    // Channel index — named signals, not metric theatre.
    plans.push({
      id: "features",
      kind: "features",
      layout: "feature-index",
      surface: "paper",
      columns: split.wide,
    });
    // Teaching figure: lattice redrawn with channel callouts.
    plans.push({
      id: "figure",
      kind: "figure",
      layout: "figure-explainer",
      surface: "raised",
      columns: split.wide,
    });
    plans.push({ id: "template", kind: "template", layout: "template-band", surface: "sunken" });
    // Event waterfall — instrument-time spans (observatory signature; not essay+aside).
    plans.push({
      id: "story",
      kind: "story",
      layout: "story-chrono",
      surface: "paper",
      bond: true,
    });
    // No second feature-rows catalogue — sparse airways after marquee cut (Phase 9).
    // No shared marquee-proof — event waterfall is the observatory proof instrument.
    plans.push({ id: "faq", kind: "faq", layout: "faq-columns", surface: "paper", columns: "5fr 7fr", bond: true });
    // Calibration close on paper — not inverse demo theatre.
    plans.push({ id: "cta", kind: "cta", layout: "cta-band", surface: "paper" });
    plans.push({ id: "footer", kind: "footer", layout: "footer-columns", surface: "paper" });
    return plans;
  }


  /*
   * Archive index — award-index / ledger-index craft.
   *
   * Measured award-index pages sit at foldFigure ~0.54, figureArea ~0.58, invertedShare ~0,
   * very quiet display (~1–3vw), ~3 alignment axes, extreme spine conformity, high ink
   * variation — not SaaS, foundry seams, dossier folios, or observatory instruments.
   * Quiet register + index-ledger owning the fold + A–Z rail + entry essay + Registry close
   * are craft a theme pack will not invent from taste controls.
   */
  if (siteKind === "archive-index") {
    plans.push({ id: "hero", kind: "hero", layout: "hero-register", surface: "paper", columns: split.wide });
    plans.push({
      id: "features",
      kind: "features",
      layout: "feature-index",
      surface: "paper",
      columns: split.wide,
    });
    plans.push({
      id: "figure",
      kind: "figure",
      layout: "figure-explainer",
      surface: "raised",
      columns: split.wide,
    });
    plans.push({ id: "template", kind: "template", layout: "template-band", surface: "sunken" });
    plans.push({
      id: "story",
      kind: "story",
      layout: "story-entry",
      surface: "paper",
      bond: true,
      columns: "7fr 5fr",
    });
    // No second feature-rows catalogue — that left Cross stamps / Registry close as empty airways.
    // Cross-stamp register lives inside the entry folio (concept-true mid-page proof).
    // No shared marquee-proof — entry folio essay is Stamp Roll's proof, not a SaaS board.
    plans.push({ id: "faq", kind: "faq", layout: "faq-columns", surface: "paper", columns: "5fr 7fr", bond: true });
    plans.push({ id: "cta", kind: "cta", layout: "cta-band", surface: "paper" });
    plans.push({ id: "footer", kind: "footer", layout: "footer-columns", surface: "paper" });
    return plans;
  }

  /*
   * Commerce loom — merchandising press craft.
   *
   * Measured commerce-platform / brand-product-agency pages are figure-forward with quiet-to-
   * moderate display and almost no inverse theatre. Soft theme packs answer with card grids and
   * glass heroes. This offering invents unreplicable loom grammar: size-tape rail, warp/weft SKU
   * loom owning the fold (with free textile photos), hangtag essay, Care label close.
   */
  if (siteKind === "commerce-loom") {
    plans.push({ id: "hero", kind: "hero", layout: "hero-loom", surface: "paper", columns: split.wide });
    plans.push({
      id: "features",
      kind: "features",
      layout: "feature-index",
      surface: "paper",
      columns: split.wide,
    });
    plans.push({
      id: "figure",
      kind: "figure",
      layout: "figure-explainer",
      surface: "raised",
      columns: split.wide,
    });
    plans.push({ id: "template", kind: "template", layout: "template-band", surface: "sunken" });
    plans.push({
      id: "story",
      kind: "story",
      layout: "story-hangtag",
      surface: "paper",
      bond: true,
    });
    // No second feature-rows catalogue — sparse airways after marquee cut (Phase 9).
    // No shared marquee-proof — care-tag stack is the loom proof instrument.
    plans.push({ id: "faq", kind: "faq", layout: "faq-columns", surface: "paper", columns: "5fr 7fr", bond: true });
    plans.push({ id: "cta", kind: "cta", layout: "cta-band", surface: "paper" });
    plans.push({ id: "footer", kind: "footer", layout: "footer-columns", surface: "paper" });
    return plans;
  }

  /*
   * Docs / mechanism explainer — teaching surface with a real weight valley.
   *
   * Generic path stacked medium-density bands (metrics + features + chapters + compare) so
   * section-weight variation collapsed (~0.34). Dedicated plan: stackfold figure, scrub instrument,
   * catalogue, quiet sunken template, dense chapter register, dense compare, inverse close.
   * No metric theatre — the scrub owns the stakes.
   */
  if (siteKind === "docs-educational") {
    // Scrub owns the fold — do not bury the instrument under a second stackfold hero.
    plans.push({ id: "hero", kind: "hero", layout: "hero-mechanism", surface: "paper", columns: split.hero });
    // Quiet valley after the scrub peak — titles-only horizon (see renderTemplate).
    plans.push({ id: "template", kind: "template", layout: "template-band", surface: "sunken" });
    plans.push({
      id: "features",
      kind: "features",
      layout: "feature-index",
      surface: "paper",
      columns: split.wide,
    });
    plans.push({
      id: "story",
      kind: "story",
      layout: "story-chapters",
      surface: "raised",
      bond: true,
      columns: split.wide,
    });
    plans.push({ id: "compare", kind: "compare", layout: "compare-matrix", surface: "raised", bond: true });
    // Inverse close is the dense peak against the sunken template valley.
    plans.push({ id: "cta", kind: "cta", layout: "cta-band", surface: "inverse" });
    plans.push({ id: "footer", kind: "footer", layout: "footer-columns", surface: "paper" });
    return plans;
  }


  /*
   * Press atelier — brand-agency / production craft.
   *
   * Measured brand-agency and brand-product-agency pages sit at foldFigure ~0.9–1.0,
   * figureArea ~0.4–0.52, invertedShare ~0, quiet-to-moderate display (~1.5–3.8vw),
   * ~3–6 alignment axes, dense bleeds — not SaaS, archive ledgers, dossier folios,
   * or observatory instruments. Registration-framed fold + press-sheet owning the fold
   * + signature rail + overlapping forme stack with densitometer + Pressroom close are craft
   * a theme pack will not invent from taste controls.
   */
  if (siteKind === "press-atelier") {
    plans.push({ id: "hero", kind: "hero", layout: "hero-press", surface: "paper", columns: split.wide });
    plans.push({
      id: "features",
      kind: "features",
      layout: "feature-index",
      surface: "paper",
      columns: split.wide,
    });
    plans.push({
      id: "figure",
      kind: "figure",
      layout: "figure-explainer",
      surface: "raised",
      columns: split.wide,
    });
    plans.push({ id: "template", kind: "template", layout: "template-band", surface: "sunken" });
    plans.push({
      id: "story",
      kind: "story",
      layout: "story-gather",
      surface: "paper",
      bond: true,
    });
    // No second feature-rows catalogue — sparse airways after marquee cut (Phase 9).
    // No shared marquee-proof — overlapping forme stack is the press proof instrument.
    plans.push({ id: "faq", kind: "faq", layout: "faq-columns", surface: "paper", columns: "5fr 7fr", bond: true });
    plans.push({ id: "cta", kind: "cta", layout: "cta-band", surface: "paper" });
    plans.push({ id: "footer", kind: "footer", layout: "footer-columns", surface: "paper" });
    return plans;
  }

  /*
   * Lantern path — cinematic night-walk craft.
   *
   * Art-directed + editorial-longform corridors favour figure-owned folds and quiet display.
   * Soft dark glow pages answer with WebGL tourism chrome. This offering invents an unreplicable
   * night atlas: chapter waypoint rail, path-plate cartograph owning the fold, ember essay, Ember close.
   */
  if (siteKind === "lantern-path") {
    plans.push({ id: "hero", kind: "hero", layout: "hero-path", surface: "paper", columns: split.wide });
    plans.push({
      id: "features",
      kind: "features",
      layout: "feature-index",
      surface: "paper",
      columns: split.wide,
    });
    plans.push({
      id: "figure",
      kind: "figure",
      layout: "figure-explainer",
      surface: "raised",
      columns: split.wide,
    });
    plans.push({ id: "template", kind: "template", layout: "template-band", surface: "sunken" });
    plans.push({
      id: "story",
      kind: "story",
      layout: "story-ember",
      surface: "paper",
      bond: true,
    });
    // No second feature-rows catalogue — sparse airways after marquee cut (Phase 9).
    // No shared marquee-proof — night trail is the lantern proof instrument.
    plans.push({ id: "faq", kind: "faq", layout: "faq-columns", surface: "paper", columns: "5fr 7fr", bond: true });
    plans.push({ id: "cta", kind: "cta", layout: "cta-band", surface: "paper" });
    plans.push({ id: "footer", kind: "footer", layout: "footer-columns", surface: "paper" });
    return plans;
  }

  /*
   * Care pathway — clinical rounds craft.
   *
   * Health-pathway corridors favour figure-owned folds and quiet display on cool paper.
   * SaaS deal pipelines answer with stage chips. This offering invents an unreplicable
   * clinical atlas: care stage rail, care-plate pathway spine owning the fold, rounds ladder, Chart close.
   */
  if (siteKind === "care-pathway") {
    plans.push({ id: "hero", kind: "hero", layout: "hero-rounds", surface: "paper", columns: split.wide });
    plans.push({
      id: "features",
      kind: "features",
      layout: "feature-index",
      surface: "paper",
      columns: split.wide,
    });
    plans.push({
      id: "figure",
      kind: "figure",
      layout: "figure-explainer",
      surface: "raised",
      columns: split.wide,
    });
    plans.push({ id: "template", kind: "template", layout: "template-band", surface: "sunken" });
    plans.push({
      id: "story",
      kind: "story",
      layout: "story-rounds",
      surface: "paper",
      bond: true,
    });
    // No second feature-rows catalogue — sparse airways after marquee cut (Phase 9).
    // No shared marquee-proof — rounds ladder is the care proof instrument.
    plans.push({ id: "faq", kind: "faq", layout: "faq-columns", surface: "paper", columns: "5fr 7fr", bond: true });
    plans.push({ id: "cta", kind: "cta", layout: "cta-band", surface: "paper" });
    plans.push({ id: "footer", kind: "footer", layout: "footer-columns", surface: "paper" });
    return plans;
  }

  /*
   * Agent harness — local coding-agent session craft.
   *
   * Turn tape + permit-plate + sticky steer pin own the fold. Not a SaaS pipeline, not a queue
   * console, not workflow-proof. Story turn-ledger and Done close land in a later pass.
   */
  if (siteKind === "agent-harness") {
    plans.push({ id: "hero", kind: "hero", layout: "hero-helm", surface: "paper", columns: split.wide });
    plans.push({
      id: "features",
      kind: "features",
      layout: "feature-index",
      surface: "paper",
      columns: split.wide,
    });
    plans.push({
      id: "figure",
      kind: "figure",
      layout: "figure-explainer",
      surface: "raised",
      columns: split.wide,
    });
    plans.push({ id: "template", kind: "template", layout: "template-band", surface: "sunken" });
    plans.push({
      id: "story",
      kind: "story",
      layout: "story-chapters",
      surface: "paper",
      bond: true,
    });
    plans.push({ id: "faq", kind: "faq", layout: "faq-columns", surface: "paper", columns: "5fr 7fr", bond: true });
    plans.push({ id: "cta", kind: "cta", layout: "cta-band", surface: "paper" });
    plans.push({ id: "footer", kind: "footer", layout: "footer-columns", surface: "paper" });
    return plans;
  }

  /*
   * Field guide — herbarium / voucher craft.
   *
   * Personal-craft + brand-agency corridors favour figure-dense paper surfaces and quiet display.
   * Soft theme packs answer with floating glass card collages. This offering invents unreplicable
   * voucher grammar: taxon rail, template plate (pressed silhouette + free botanical photo),
   * dichotomous voucher key (ladder + stacked sheets), Voucher close.
   */
  if (siteKind === "field-guide") {
    plans.push({ id: "hero", kind: "hero", layout: "hero-voucher", surface: "paper", columns: split.wide });
    plans.push({
      id: "features",
      kind: "features",
      layout: "feature-index",
      surface: "paper",
      columns: split.wide,
    });
    plans.push({
      id: "figure",
      kind: "figure",
      layout: "figure-explainer",
      surface: "raised",
      columns: split.wide,
    });
    plans.push({ id: "template", kind: "template", layout: "template-band", surface: "sunken" });
    plans.push({
      id: "story",
      kind: "story",
      layout: "story-range",
      surface: "paper",
      bond: true,
    });
    // No second feature-rows catalogue — sparse airways after marquee cut (Phase 9).
    // No shared marquee-proof — dichotomous voucher key is the field-guide proof instrument.
    plans.push({ id: "faq", kind: "faq", layout: "faq-columns", surface: "paper", columns: "5fr 7fr", bond: true });
    plans.push({ id: "cta", kind: "cta", layout: "cta-band", surface: "paper" });
    plans.push({ id: "footer", kind: "footer", layout: "footer-columns", surface: "paper" });
    return plans;
  }

  // Marketing fold follows the first top-priority capability. Other kinds keep their signature fold.
  const roleShapes = siteKind === "saas-marketing" ? shapesForCapabilities(input.capabilities ?? []) : null;
  plans.push({
    id: "hero",
    kind: "hero",
    layout: roleShapes?.first ?? heroLayout(siteKind, lean),
    surface: "paper",
    columns: split.hero,
  });

  // Catalog folds (pipeline / posture / queue / wire) already name the capabilities.
  // A metric row of the same titles under the fold reads as a paired screenshot, not stakes.
  const foldOwnsCatalog =
    siteKind === "saas-marketing" || siteKind === "corporate-story";
  if (!foldOwnsCatalog) {
    plans.push({ id: "metrics", kind: "metrics", layout: "metric-band", surface: lean === "refined-story" ? "raised" : "inverse" });
  }

  const featureVariants = featureLayouts(featureCount, p0Count, lean, siteKind);
  featureVariants.forEach((layout, i) => {
    plans.push({
      id: i === 0 ? "features" : `features-${i + 1}`,
      kind: "features",
      layout,
      surface: i === 0 ? "paper" : "raised",
      columns: layout === "feature-alternating" ? split.feature : undefined,
    });
    /*
     * A drawn screen between the catalogue and whatever follows it.
     *
     * Reference pages put a beat here: something that reaches the edges of the screen, carries one
     * line of text, and separates two dense screens so both read as dense. Without it every band on
     * the page weighs the same, which is the structural signature this engine was measured against
     * and lost on.
     */
    if (i === 0) {
      plans.push({ id: "template", kind: "template", layout: "template-band", surface: "sunken" });
    }
  });

  // Proof follows the second top-priority capability and is bonded to the template above
  // so a light airway cannot open between the drawn product and the proof.
  // It must not reuse the fold's shape. A sequence is a stage-by-stage proof, not a quote strip.
  plans.push({
    id: "proof",
    kind: "proof",
    layout: roleShapes?.proof ?? "marquee-proof",
    surface: "inverse",
    bond: true,
    columns: roleShapes?.proof === "app-shell" ? "260px 1fr" : split.feature,
  });

  /*
   * SaaS has no chapter register. It listed every capability a fifth time in "editorial order"
   * under a heading written for one sample product, directly after the catalogue and the proof had
   * already told each of them. Corporate keeps its chapters.
   */
  if (siteKind !== "saas-marketing") {
    plans.push({
      id: "story",
      kind: "story",
      layout: "story-chapters",
      // Raised after inverse proof so the sequence lands as a lit register, not another paper void.
      surface: "raised",
      bond: true,
      columns: split.wide,
    });
  }

  // Fintech / studio / consumer / educational / archive return earlier — only SaaS/corporate here.
  if (siteKind === "saas-marketing" && featureCount >= 3) {
    const lanes = goal === "sales" || goal === "leads" || goal === "demos";
    if (lanes) {
      // The lanes are the comparison: each one names only what it adds. A matrix under them
      // printed the same capability list a second time and said so in its own lede.
      plans.push({ id: "pricing", kind: "pricing", layout: "pricing-lanes", surface: "raised" });
    } else {
      plans.push({ id: "compare", kind: "compare", layout: "compare-matrix", surface: "paper" });
    }
  }

  if (siteKind === "corporate-story") {
    plans.push({ id: "compare", kind: "compare", layout: "compare-matrix", surface: "raised" });
  }

  // FAQ answers the table above it. Bonded, the compare+faq pair is the densest beat on the page —
  // the peak the quiet statement band is measured against. Separated, both were medium screens and
  // the rhythm flattened.
  plans.push({ id: "faq", kind: "faq", layout: "faq-columns", surface: "paper", columns: "5fr 7fr", bond: true });
  plans.push({ id: "cta", kind: "cta", layout: "cta-band", surface: "inverse" });
  plans.push({ id: "footer", kind: "footer", layout: "footer-columns", surface: "paper" });

  return plans;
}

/**
 * Display size in px at 1440, chosen per site kind and lean.
 * Corpus corridor: 3.19–6.11 % of viewport width, i.e. roughly 46–88px at this width.
 */
export function displaySizeFor(siteKind: SiteKind, lean: AestheticLean, density: Density): number {
  let px = 68;
  if (siteKind === "corporate-story") px = 78;
  if (siteKind === "docs-educational") px = 60;
  if (siteKind === "dashboard-webapp") px = 62;
  if (siteKind === "fintech-marketing") px = 70;
  // Studio stack fold: display stays an event, but short enough that the labeled figure enters the fold.
  if (siteKind === "art-directed-studio") px = 66;
  // Consumer craft speaks in a shorter voice — product owns the fold, not a 90px headline.
  if (siteKind === "consumer-craft") px = 56;
  // Foundry display is restrained (~3.3vw / ~48px) — the ladder and seam own the fold, not a shout.
  if (siteKind === "editorial-foundry") px = 48;
  // Quiet display — capital/research editorial refs sit ~1.2–3.5vw, not SaaS shout.
  // Floor at band p10 (3.16vw @1440 ≈ 45.5px); 48 keeps room without shouting.
  if (siteKind === "research-dossier") px = 48;
  // Observatory: display ~4–5vw corridor; lattice owns the fold, not a shout.
  if (siteKind === "signal-observatory") px = 52;
  // Archive index: VERY quiet display — award-index corridor; ledger owns the fold.
  if (siteKind === "archive-index") px = 48;
  // Commerce loom: quiet-moderate display — weave owns the fold, not a shout.
  if (siteKind === "commerce-loom") px = 50;
  // Field guide: quiet display — template plate owns the fold.
  if (siteKind === "field-guide") px = 50;
  // Press atelier: quiet-moderate display — brand-agency corridor; press sheet owns the fold.
  if (siteKind === "press-atelier") px = 50;
  // Lantern path: quiet-moderate display — path plate owns the fold, not a shouty claim.
  if (siteKind === "lantern-path") px = 50;
  // Care pathway: quiet-but-in-band display (~3.3vw) so care-plate still owns the fold.
  if (siteKind === "care-pathway") px = 48;
  if (siteKind === "agent-harness") px = 48;
  if (lean === "refined-story") px += 6;
  if (lean === "minimal-clean") px -= 6;
  if (lean === "conversion-sharp") px += 2;
  if (density === "information-rich") px -= 6;
  if (density === "sparse") px += 4;
  // Foundry clamps to the low corridor; studio may sit slightly above the general ceiling.
  if (siteKind === "editorial-foundry") return Math.max(44, Math.min(54, px));
  if (siteKind === "research-dossier") return Math.max(46, Math.min(54, px));
  if (siteKind === "signal-observatory") return Math.max(48, Math.min(58, px));
  if (siteKind === "archive-index") return Math.max(45, Math.min(52, px));
  if (siteKind === "commerce-loom") return Math.max(46, Math.min(56, px));
  if (siteKind === "field-guide") return Math.max(47, Math.min(54, px));
  if (siteKind === "press-atelier") return Math.max(46, Math.min(56, px));
  if (siteKind === "lantern-path") return Math.max(46, Math.min(56, px));
  if (siteKind === "care-pathway") return Math.max(44, Math.min(52, px));
  if (siteKind === "agent-harness") return Math.max(44, Math.min(52, px));
  const ceiling = siteKind === "art-directed-studio" ? 88 : 86;
  return Math.max(48, Math.min(ceiling, px));
}

/** Body size — corpus median 16px, with denser surfaces running smaller. */
export function bodySizeFor(density: Density, siteKind: SiteKind): number {
  // Dashboard still needs a readable prose measure on the claim/FAQ screens; 14px in a mid
  // column was reading as a 34ch body voice against a 44ch floor.
  if (siteKind === "dashboard-webapp") return density === "information-rich" ? 15 : 16;
  if (density === "information-rich") return 16;
  if (density === "sparse") return 18;
  return 17;
}

/** Modular ratio between the large steps of the type ladder. */
export function typeRatioFor(lean: AestheticLean, density: Density): number {
  if (lean === "refined-story") return 1.5;
  if (lean === "minimal-clean") return 1.32;
  if (density === "information-rich") return 1.3;
  return 1.414;
}
