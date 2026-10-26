import { describe, expect, it } from "vitest";
import {
  createSpecimenMotionJson,
  designFromFeatures,
  DesignBrief,
  listMotionPacks,
  motionPackIdsFor,
  parseSpecimenMotionJson,
  specimenMotionJsonText,
} from "../index";

describe("DesignProof motion pack registry", () => {
  it("keeps the five pack ids stable and serializable", () => {
    expect(listMotionPacks().map((pack) => pack.id)).toEqual([
      "tell-motion-timeline",
      "tell-physics-fold",
      "tell-shader-band",
      "tell-audio-caption",
      "tell-render-ship",
    ]);
    expect(listMotionPacks().every((pack) => pack.surfaces.length > 0)).toBe(true);
  });

  it("routes packs by motion level and page shape", () => {
    expect(
      motionPackIdsFor({ siteKind: "research-dossier", taste: { motion: "scroll-narrative" } }),
    ).toEqual(["tell-motion-timeline", "tell-physics-fold", "tell-audio-caption", "tell-render-ship"]);
    expect(
      motionPackIdsFor({ siteKind: "signal-observatory", taste: { motion: "immersive" } }),
    ).toContain("tell-shader-band");
    expect(motionPackIdsFor({ siteKind: "saas-marketing", taste: { motion: "none" } })).toEqual([
      "tell-render-ship",
    ]);
  });

  it("builds and round-trips the specimen.motion.json shape", () => {
    const motion = createSpecimenMotionJson({
      brief: { productName: "Dossier", siteKind: "research-dossier" },
      concept: { metaphor: "a folio opening across a hard center seam" },
      packs: ["tell-motion-timeline", "tell-physics-fold", "tell-render-ship"],
    });
    expect(motion.seek).toEqual({
      global: "window.__dpSeek",
      signature: "(timeSeconds: number) => void",
      units: "seconds",
      autoplay: false,
      clamp: true,
    });
    expect(motion.brandContract).toMatchObject({
      display: "Instrument Serif",
      body: "Source Sans 3",
      mono: "IBM Plex Mono",
      accent: "#D4714A",
      surface: "#181614",
    });
    expect(parseSpecimenMotionJson(JSON.parse(specimenMotionJsonText({
      brief: { productName: "Dossier", siteKind: "research-dossier" },
      concept: { metaphor: "a folio opening across a hard center seam" },
      packs: motion.packs,
    })))).toEqual(motion);
  });

  it("wires active packs and seek metadata into generated specimens", () => {
    const brief = DesignBrief.parse({
      productName: "Observatory",
      siteKind: "signal-observatory",
      features: [{ id: "signal", name: "Signal band" }],
      taste: { motion: "immersive" },
    });
    const { spec, previewHtml } = designFromFeatures(brief);
    expect(spec.motionPacks).toEqual([
      "tell-motion-timeline",
      "tell-shader-band",
      "tell-audio-caption",
      "tell-render-ship",
    ]);
    expect(spec.specimenMotion?.seek.global).toBe("window.__dpSeek");
    expect(previewHtml).toContain('name="specimen.motion.json"');
    expect(previewHtml).toContain('data-motion-seek="window.__dpSeek"');
    expect(previewHtml).toContain("tell-shader-band");
  });
});
