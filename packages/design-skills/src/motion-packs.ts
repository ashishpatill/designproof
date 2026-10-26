import {
  type DesignBrief,
  type MotionLevel,
  type MotionPackId as MotionPackIdType,
  type SiteKind,
} from "./types";

export const MOTION_PACKS = [
  {
    id: "tell-motion-timeline",
    title: "Motion timeline",
    purpose: "Seek-safe beats bound to the brief metaphor and page shape.",
    inputs: ["DesignBrief", "ConceptSpec", "siteKind", "specimen.motion.json"],
    outputs: ["labeled timeline", "window.__dpSeek registration", "reduced-motion replacement"],
    surfaces: ["studio", "showcase", "render"],
    supportedSiteKinds: "all",
    motionLevels: ["subtle-micro", "light-scroll-reveals", "scroll-narrative", "immersive"],
  },
  {
    id: "tell-physics-fold",
    title: "Physics fold",
    purpose: "Bounded fold, stack, settle, and crease-line page-shape motion.",
    inputs: ["concept metaphor", "layout regions", "motion budget"],
    outputs: ["region settle params", "static stack", "seek labels"],
    surfaces: ["studio", "showcase", "render"],
    supportedSiteKinds: [
      "art-directed-studio",
      "consumer-craft",
      "editorial-foundry",
      "research-dossier",
      "commerce-loom",
      "field-guide",
      "press-atelier",
      "lantern-path",
    ],
    motionLevels: ["light-scroll-reveals", "scroll-narrative", "immersive"],
  },
  {
    id: "tell-shader-band",
    title: "Shader band",
    purpose: "One lazy immersive material band with an honest still fallback.",
    inputs: ["concept material", "DesignProof accent", "performance budget"],
    outputs: ["owned band id", "uniform contract", "poster still", "lazy-load gate"],
    surfaces: ["studio", "showcase", "render"],
    supportedSiteKinds: ["signal-observatory", "lantern-path", "art-directed-studio"],
    motionLevels: ["immersive"],
  },
  {
    id: "tell-audio-caption",
    title: "Audio caption",
    purpose: "Optional caption cues synced to the specimen seek clock.",
    inputs: ["approved script", "timeline labels", "locale"],
    outputs: ["caption cues", "optional audio reference", "script QA note"],
    surfaces: ["showcase", "render"],
    supportedSiteKinds: "all",
    motionLevels: ["subtle-micro", "light-scroll-reveals", "scroll-narrative", "immersive"],
  },
  {
    id: "tell-render-ship",
    title: "Render ship",
    purpose: "Frame review and repeatable poster, contact sheet, and MP4 handoff.",
    inputs: ["verified specimen", "specimen.motion.json", "proof-verify pass id"],
    outputs: ["MP4", "WebP poster", "contact sheet", "re-render command"],
    surfaces: ["showcase", "render"],
    supportedSiteKinds: "all",
    motionLevels: ["none", "subtle-micro", "light-scroll-reveals", "scroll-narrative", "immersive"],
  },
] as const satisfies readonly {
  id: MotionPackIdType;
  title: string;
  purpose: string;
  inputs: readonly string[];
  outputs: readonly string[];
  surfaces: readonly ("studio" | "showcase" | "render")[];
  supportedSiteKinds: "all" | readonly SiteKind[];
  motionLevels: readonly MotionLevel[];
}[];

export type MotionPackDefinition = (typeof MOTION_PACKS)[number];

export function listMotionPacks(): MotionPackDefinition[] {
  return MOTION_PACKS.map((pack) => ({
    ...pack,
    inputs: [...pack.inputs],
    outputs: [...pack.outputs],
    surfaces: [...pack.surfaces],
    supportedSiteKinds: pack.supportedSiteKinds === "all" ? "all" : [...pack.supportedSiteKinds],
    motionLevels: [...pack.motionLevels],
  })) as MotionPackDefinition[];
}

export function getMotionPack(id: MotionPackIdType): MotionPackDefinition {
  const pack = MOTION_PACKS.find((candidate) => candidate.id === id);
  if (!pack) throw new Error(`Unknown motion pack: ${id}`);
  return pack;
}

function supports(pack: MotionPackDefinition, brief: Pick<DesignBrief, "siteKind" | "taste">): boolean {
  const motion = brief.taste?.motion ?? "subtle-micro";
  const siteKind = brief.siteKind;
  const siteMatch =
    pack.supportedSiteKinds === "all" ||
    (pack.supportedSiteKinds as readonly SiteKind[]).includes(siteKind);
  return siteMatch && (pack.motionLevels as readonly MotionLevel[]).includes(motion);
}

/** Resolve active packs without changing the eleven-tool catalog. */
export function motionPackIdsFor(
  brief: Pick<DesignBrief, "siteKind" | "taste">,
): MotionPackIdType[] {
  return MOTION_PACKS.filter((pack) => supports(pack, brief)).map((pack) => pack.id);
}
