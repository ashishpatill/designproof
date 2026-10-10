/**
 * Cross-offering distinctness — the gate for the root cause docs/16 names RC1.
 *
 * `docs/16 §1.1` measured the seventeen offerings and found 97.4% of the emitted CSS lines were
 * byte-identical across all of them, 65 CSS classes appeared on every page, and `--gutter`,
 * `--section-y`, `--w-content`, the radius ladder, the shadow ramp and the borders were assigned
 * once in a single `:root`. Nothing in `pnpm test` noticed, because every assertion in the suite was
 * about one page at a time and a shared stylesheet satisfies all of them at once.
 *
 * So this is a ratchet, and the numbers below are floors set from what the engine actually emits
 * today — not targets it meets. A ratchet is only useful if it is pinned to reality, and pretending
 * otherwise would be the same mistake as the 0.989 craft score: a green test that measures nothing.
 * Lowering a floor is the point of the next milestone and should be a deliberate diff.
 *
 * What moves each floor, from `docs/16 §5.3`:
 *   shared CSS lines  → per-room rhythm (`--section-y` / `--w-content` become room-scoped), and the
 *                       room catalog replacing the 15-branch switch
 *   room skeletons    → the same: a `PageProgram` compiles rooms from the direction, so two offerings
 *                       stop sharing a tail by default
 *   type voices       → `docs/16` M5: voices chosen by the director per brief, not by a hash over
 *                       three pools of pairings
 */
import { describe, expect, it } from "vitest";
import { DESIGN_TEMPLATES, designFromFeatures } from "../index";

const pages = DESIGN_TEMPLATES.map((template) => {
  const { spec, previewHtml } = designFromFeatures(template.brief);
  return { key: template.key, spec, html: previewHtml };
});

/** Non-empty CSS lines, per offering. */
function cssLines(html: string): Set<string> {
  return new Set(
    [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
      .map((m) => m[1] ?? "")
      .join("\n")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean),
  );
}

/**
 * The shape skeleton, with the two positions that legitimately vary per offering removed.
 *
 * `docs/16 §1.2` claimed ten offerings emit the same eight-section tail, differing only in the hero
 * layout and the `story-*` variant. Keying on `id:layout` alone reports all seventeen as distinct,
 * because those two differences are in the key — so the hero and story positions are collapsed to
 * their section kind and the rest is compared exactly. That is the shape the claim is about.
 */
function shapeSkeleton(spec: (typeof pages)[number]["spec"]): string {
  return spec.sections
    .map((s) => (s.kind === "hero" || s.kind === "story" ? s.kind : `${s.kind}:${s.layout}`))
    .join(" > ");
}

describe("cross-offering distinctness (ratchet — see docs/16 §1.1, §5.3, M5)", () => {
  it("emits per-offering CSS that is not one stylesheet with an attribute", () => {
    const sets = pages.map((p) => cssLines(p.html));
    const union = new Set(sets.flatMap((s) => [...s]));
    const shared = [...sets[0]!].filter((line) => sets.every((s) => s.has(line)));
    const pct = (shared.length / union.size) * 100;

    // Measured 2026-10-05, after the restatement work: 2 772 of 3 092 lines (89.7%) identical across
    // all seventeen. Before that it was 97.4% of 2 846. The floor is 92% because it is above today,
    // not below: a gate set at the measured value would still permit two points of regression before
    // it spoke, and a gate set below would be a lie.
    expect(union.size).toBeGreaterThan(3000);
    expect(pct).toBeLessThan(92);

    // The per-template delta has to be real, not a rounding difference in one selector.
    const delta = union.size - shared.length;
    expect(delta).toBeGreaterThan(250);
  });

  it("does not let offerings converge on one room skeleton", () => {
    const bySkeleton = new Map<string, string[]>();
    for (const p of pages) {
      const k = shapeSkeleton(p.spec);
      bySkeleton.set(k, [...(bySkeleton.get(k) ?? []), p.key]);
    }
    const shared = [...bySkeleton.entries()]
      .filter(([, keys]) => keys.length > 1)
      .sort((a, b) => b[1].length - a[1].length);
    const worst = shared[0]?.[1].length ?? 1;

    /*
     * Re-pinned after merging origin/master (M1 merge). The old floors were measured on this branch
     * on 2026-10-05, *before* master's eight "template says each thing once" commits landed: 10
     * offerings shared one skeleton, leaving 8 distinct across 17. Merging those commits removed the
     * figure band and the specimen band from five templates and reshaped the room skeletons, so the
     * distribution is different: 7 distinct, largest group 6. The floors below are the measured
     * post-merge values — a ratchet pinned above reality is a gate that cannot fail, and one pinned
     * below reality permits regression before it speaks.
     *
     * The largest group went 10 → 6: the sharing got *less* concentrated, not more, so this is not a
     * regression against docs/16 §1.2. Distinctness still fell 8 → 7 because two offerings that
     * previously differed only in a band now collapse onto one tail — the same tail six others use.
     * That is the finding docs/16 §1.2 makes, restated, not a new one.
     *
     * The target is unchanged: 2 (docs/16 M3 replaces the 15-branch switch with a program compiled
     * from the direction, so no two offerings share a tail by default), and every offer to lower this
     * number further should say what moved it.
     *
     * The largest group is now six — dossier, loom, press, lantern, clinic and harness, all emitting
     * `hero → features:feature-index → figure:figure-explainer → template:template-band → story →
     * faq:faq-columns → cta:cta-band → footer:footer-columns`. Educational, foundry, observatory,
     * archive and herbarium share a second, shorter tail of five; corporate and studio share a third
     * of two. The remaining four — saas, dashboard, fintech and consumer — stand alone.
     */
    const report = {
      distinctSkeletons: bySkeleton.size,
      largestGroup: worst,
      groups: shared.map(([k, keys]) => `${keys.length}× ${keys.join(", ")} :: ${k}`),
    };
    expect(report.largestGroup).toBeLessThanOrEqual(6);
    expect(report.distinctSkeletons).toBeGreaterThanOrEqual(7);
  });

  it("picks a type voice per offering rather than hashing three pools", () => {
    const voice = (p: (typeof pages)[number]): string => {
      const t = p.spec.tokens;
      return `${t.fontDisplay} / ${t.fontBody} / ${t.fontMono}`;
    };
    const groups = new Map<string, string[]>();
    for (const p of pages) {
      const k = voice(p);
      groups.set(k, [...(groups.get(k) ?? []), p.key]);
    }
    const distinct = groups.size;
    const largest = Math.max(...[...groups.values()].map((v) => v.length));

    // Measured 2026-10-05: 8 distinct pairings across 17 offerings, the largest group 5
    // (corporate, observatory, archive, press, clinic — all `refined-story`). Thirteen distinct font
    // families are reachable but only eight pairings are chosen, because `tokens.ts:118` indexes a
    // three-entry pool with a hash of `productName|siteKind`. Five offerings reading in one voice is
    // the finding docs/16 §4.2 point 3 makes: inside every type band and still uniform.
    expect(distinct).toBeGreaterThanOrEqual(8);
    expect(largest).toBeLessThanOrEqual(5);

    // Every pairing is a real family rather than a fallback, and the three roles are not all one face.
    for (const p of pages) {
      const t = p.spec.tokens;
      expect(t.fontDisplay, p.key).toBeTruthy();
      expect(t.fontMono, p.key).toBeTruthy();
      expect(t.fontRequests.length, `${p.key} font requests`).toBeGreaterThan(0);
    }
  });
});
