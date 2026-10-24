import type { TellDetector } from "@tell/schema";

/**
 * Dated DesignProof tells registry.
 *
 * One row per `TellDetector`. `status` says how the tell should be treated
 * (`ban` — do not ship; `warn` — judge in context). `enforcedInProof` says what
 * `tell_proof_verify` actually does today: only enforced rows fail the gate on
 * their own. Never claim enforcement the code does not perform.
 *
 * `fixProcedure` is a *procedure* — derive the replacement from the subject,
 * then re-measure. The registry deliberately publishes no fixed font, colour,
 * gradient or spacing recipe: a recipe becomes tomorrow's tell.
 *
 * `since` is an ISO date for rows added under this registry, or "baseline" for
 * rows that predate it. Keep dates truthful — they are how a tell is retired.
 */
export type TellRegistryEntry = {
  detector: TellDetector;
  id: string;
  status: "ban" | "warn";
  since: string;
  enforcedInProof: boolean;
  /** What a reader sees when the tell is present. */
  tell: string;
  /** Procedure for the replacement. Never a font/colour recipe. */
  fixProcedure: string;
  /** What the detector emits as evidence. */
  evidence: string;
};

export const TELLS_REGISTRY: readonly TellRegistryEntry[] = [
  {
    detector: "SystemFontTell",
    id: "tell-system-font",
    status: "warn",
    since: "baseline",
    enforcedInProof: false,
    tell: "One default-class typeface carries most roles, so the page reads as the framework default.",
    fixProcedure:
      "Derive the type choice from the subject and its era; name a display face and a text face, then run the swap test with a stranger's name.",
    evidence: "Primary family, share of roles, roles affected.",
  },
  {
    detector: "GradientCrutchTell",
    id: "tell-gradient-crutch",
    status: "warn",
    since: "baseline",
    enforcedInProof: false,
    tell: "A decorative gradient stands in for an idea on the hero or a large band.",
    fixProcedure:
      "Replace the gradient with a colour field, image or material that carries meaning for this subject; keep a gradient only if it encodes something measurable (light, depth, data).",
    evidence: "Gradient CSS sample.",
  },
  {
    detector: "ShadowEverywhereTell",
    id: "tell-shadow-everywhere",
    status: "warn",
    since: "baseline",
    enforcedInProof: false,
    tell: "Nearly every container floats at the same elevation, so nothing is actually elevated.",
    fixProcedure:
      "Assign elevation to a real layer order; where nothing floats, remove the shadow instead of softening it.",
    evidence: "Repeated shadow value and count.",
  },
  {
    detector: "RadiusMonotoneTell",
    id: "tell-radius-monotone",
    status: "warn",
    since: "baseline",
    enforcedInProof: false,
    tell: "One radius is applied to every surface regardless of role.",
    fixProcedure:
      "Tie each radius to a material or role decision; a single radius everywhere means no decision was made.",
    evidence: "Repeated radius value and count.",
  },
  {
    detector: "AcidAccentTell",
    id: "tell-acid-accent",
    status: "warn",
    since: "baseline",
    enforcedInProof: false,
    tell: "A high-saturation accent sits on a near-black surface as the only colour idea.",
    fixProcedure:
      "Derive the accent from the subject's own world (material, place, product) and check it earns attention on one element at a time.",
    evidence: "Accent hex, usage count, surface hex.",
  },
  {
    detector: "EmojiChromeTell",
    id: "tell-emoji-chrome",
    status: "warn",
    since: "baseline",
    enforcedInProof: false,
    tell: "Emoji are used as interface chrome — headings, buttons, nav.",
    fixProcedure:
      "Replace emoji chrome with the page's own marks or words; personality belongs in the composition, not in chrome.",
    evidence: "Emoji count.",
  },
  {
    detector: "CenteredEverythingTell",
    id: "tell-centered-everything",
    status: "warn",
    since: "baseline",
    enforcedInProof: false,
    tell: "Most large blocks are centred, so every section announces itself the same way.",
    fixProcedure:
      "Set an asymmetric reading axis tied to the content (a left index, an off-centre plate) and keep centring for genuinely centred statements.",
    evidence: "Centred block ratio.",
  },
  {
    detector: "GrayMushTell",
    id: "tell-gray-mush",
    status: "warn",
    since: "baseline",
    enforcedInProof: false,
    tell: "Several near-identical neutrals blur into mush instead of forming a ramp.",
    fixProcedure:
      "Collapse near-duplicate neutrals into one named neutral ramp, then let contrast carry hierarchy.",
    evidence: "Near-duplicate gray clusters.",
  },
  {
    detector: "BoilerplateCopyTell",
    id: "tell-boilerplate-copy",
    status: "warn",
    since: "baseline",
    enforcedInProof: false,
    tell: "Proof titles and sequence headlines shared across AI-built pages.",
    fixProcedure:
      "Rewrite the claim from this subject's inventory (numbers, materials, places) and delete any line that could belong to another product.",
    evidence: "Matching copy patterns.",
  },
  {
    detector: "TitleOnFoldTell",
    id: "tell-title-on-fold",
    status: "ban",
    since: "2026-10-24",
    enforcedInProof: true,
    tell: "The primary title starts below the fold or is cut by it, so the first screen shows no headline.",
    fixProcedure:
      "Decide what the first screen is for, then fit the title and one action above the fold line; do not shrink type to make it fit.",
    evidence: "Title top/bottom vs fold height, screenshot region at the fold.",
  },
  {
    detector: "FrameGutterTell",
    id: "tell-frame-gutter",
    status: "warn",
    since: "2026-10-24",
    enforcedInProof: false,
    tell: "Every wide band is the same centred column with equal side margins, so the page never uses its frame.",
    fixProcedure:
      "Break the single centred column once where the subject earns it (a full-bleed plate, an off-axis index) while keeping one composed column rather than many.",
    evidence: "Dominant left/right gutter, share of wide bands on it, screenshot region of one band.",
  },
  {
    detector: "BlankStretchTell",
    id: "tell-blank-stretch",
    status: "warn",
    since: "2026-10-24",
    enforcedInProof: false,
    tell: "A dead vertical band taller than half a screen sits between two content runs.",
    fixProcedure:
      "Fill the dead band with content that belongs there, or remove the spacing; blank space must be a measured rest, not an accident.",
    evidence: "Gap height and position, screenshot region of the gap.",
  },
  {
    detector: "MobileFirstScreenTell",
    id: "tell-mobile-first-screen",
    status: "ban",
    since: "2026-10-24",
    enforcedInProof: true,
    tell: "The phone's first screen is the desktop hero squeezed — no title, starved text, an image-only fold, or sideways overflow.",
    fixProcedure:
      "Compose the phone first screen on its own terms: choose what the phone reader sees first (title, one action, one image) instead of squeezing the desktop hero.",
    evidence: "Mobile fold text/heading/button/media numbers vs the desktop fold, mobile screenshot region.",
  },
];

const BY_DETECTOR = new Map(TELLS_REGISTRY.map((entry) => [entry.detector, entry]));

export function tellRegistryEntry(detector: TellDetector): TellRegistryEntry | undefined {
  return BY_DETECTOR.get(detector);
}

/** The fix hint a finding carries. Falls back to a neutral procedure for unregistered tells. */
export function fixHintFor(detector: TellDetector): string {
  return (
    tellRegistryEntry(detector)?.fixProcedure ??
    "Name what the tell replaces in this subject's own terms, change one thing, then re-measure the rendered page."
  );
}

/** Detectors whose presence fails the proof gate on its own (see registry `enforcedInProof`). */
export const PROOF_GATE_BANS: ReadonlySet<TellDetector> = new Set(
  TELLS_REGISTRY.filter((entry) => entry.enforcedInProof).map((entry) => entry.detector),
);
