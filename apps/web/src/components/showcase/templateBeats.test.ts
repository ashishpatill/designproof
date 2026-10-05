import { describe, expect, it } from "vitest";
import { orderCinemaBeats, pickStill, type TemplateBeat } from "./templateBeats";

function beat(id: string, y: number, label = id): TemplateBeat {
  return { id, y, label };
}

describe("templateBeats craft-first cinema", () => {
  it("locks reel to figure → spread → proof when a craft figure exists", () => {
    const beats = [
      beat("hero", 40, "Claim"),
      beat("figure", 360, "Forme"),
      beat("template", 1200, "Template"),
      beat("spread", 900, "Spread"),
      beat("proof", 1600, "Proof"),
    ];
    const ordered = orderCinemaBeats(beats, "auto");
    expect(ordered.map((b) => b.id)).toEqual(["figure", "spread", "proof"]);
  });

  it("prefers craft figure for the still frame over template", () => {
    const beats = [
      beat("hero", 40),
      beat("figure", 360),
      beat("template", 800),
    ];
    expect(pickStill(beats, "auto").id).toBe("figure");
    expect(pickStill(beats, "figure").id).toBe("figure");
  });

  it("does not open on template when prefer is figure without a figure beat", () => {
    const beats = [beat("hero", 40), beat("spread", 400), beat("template", 900)];
    const ordered = orderCinemaBeats(beats, "figure");
    expect(ordered[0]?.id).not.toBe("template");
  });
});

describe("showcase anthology order", () => {
  it("lists distinct template keys without duplicates", async () => {
    const { ANTHOLOGY_KEYS } = await import("./ShowcaseAnthologyReel");
    expect(new Set(ANTHOLOGY_KEYS).size).toBe(ANTHOLOGY_KEYS.length);
    expect(ANTHOLOGY_KEYS.length).toBeGreaterThanOrEqual(8);
  });
});
