/**
 * Layout audit gate — the defects the craft score cannot see.
 *
 * `research/critique.json` reads a rendered page as populations of scalars (type sizes, contrasts,
 * paddings, hue counts, shadow coverage, transition durations). A page can sit inside every band
 * while a headline renders one word per line, a sentence is clipped mid-word, a section's content
 * spills past its own band, or the hero carries a 1160×320px hole.
 *
 * `scripts/design-research/layout-audit.ts` already detects exactly those. It was never wired to
 * anything, so the engine's committed craft score ran at 0.989 while its own author-facing audit
 * reported a vacant corporate hero. This gate closes that loop: every offering is rendered, probed
 * in a real browser, and must come back clean.
 *
 * Measured 2026-10-05, before the gate existed:
 *   dashboard  vacancy    480×480 inside the hero (fill 0.78)
 *   corporate  vacancy    1160×320 inside the hero (fill 0.64) + one sentence printed 3×
 *   fintech    vacancy    1160×260 inside the hero (fill 0.71)
 *   foundry    vacancy    440×360 inside the hero (fill 0.84)
 *   harness    clipped    span.ds-turn-label "You can redirect without starting over."
 *
 * `AUDIT_PROBE` is imported from the research script rather than reimplemented, so the gate and the
 * operator-facing audit can never disagree about what a defect is.
 */
import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AUDIT_PROBE } from "../../../../scripts/design-research/layout-audit";
import { DESIGN_TEMPLATES, designFromFeatures } from "../index";

/**
 * Vacancy has a legitimate authored form — a quiet beat sized to its content is deliberate, and the
 * probe reports the rectangle it found in `gap`. So the gate names the ones it tolerates instead of
 * filtering on a fill ratio nobody chose.
 *
 * A previous version dropped any vacancy whose fill was ≥ 0.6. That quietly disagreed with
 * `pnpm research:audit`, which uses the probe's own thresholds: an operator running the documented
 * command saw six defects while this gate passed. Both now use the probe's threshold, the gate
 * scrolls the page before probing for the same reason `auditBriefs` does, and the open ones are
 * enumerated here so the count cannot grow without a test failure.
 *
 * These are fold-composition problems, not copy — a band that reserves a screen and fills a corner of
 * it. `docs/16` M2 is the fix: `ArtDirection.fold` naming a dominant element, which is the only thing
 * that puts matter where the void is.
 *
 * Measured 2026-10-05 (`pnpm research:audit`), and the `dashboard-app` hero is the one this file's
 * own header already documented at 480×480:
 *
 *   dashboard     hero      500×480   fill 0.78
 *   corporate     hero     1160×320   fill 0.64
 *   fintech       hero     1160×260   fill 0.71
 *   studio        features  960×260   fill 0.82
 *   consumer      figure    540×300   fill 0.78
 *   foundry       hero      440×360   fill 0.84
 *
 * Fixed by the restatement work and must not return: `corporate-story`'s diligence lede painted 3×,
 * and `harness`'s `span.ds-turn-label` clipped mid-sentence.
 */
const KNOWN_VACANCIES: Record<string, string[]> = {
  dashboard: ["hero"],
  corporate: ["hero"],
  fintech: ["hero"],
  studio: ["features"],
  consumer: ["figure"],
  foundry: ["hero"],
};

/** Every defect kind except vacancy blocks on its own. */
const BLOCKING = ["overflow", "clipped", "starved", "collision", "repetition", "vacancy", "ghosting"] as const;

interface ProbeResult {
  overflow: Array<{ section: string; el: string; by: number }>;
  clipped: Array<{ el: string; text: string; scroll: number; client: number }>;
  starved: Array<{ el: string; text: string; width: number }>;
  collision: Array<{ a: string; b: string }>;
  repetition: Array<{ count: number; text: string }>;
  vacancy: Array<{ section: string; height: number; fill: number; gap: string }>;
  ghosting: Array<{ el: string; over: string }>;
}

/** Playwright's `evaluate` runs in the page, where esbuild's `__name` helper does not exist. */
const NAME_SHIM = "window.__name = (f) => f;";

function summarise(key: string, kind: string, items: unknown[]): string {
  return `${key}: ${kind} ×${items.length} — ${JSON.stringify(items.slice(0, 4))}`;
}

describe("layout audit gate (all offerings)", () => {
  let browser: Browser;

  beforeAll(async () => {
    /*
     * Plain `chromium.launch()`, on purpose.
     *
     * This gate was written with `channel: "chrome"`, which resolves to a *system-installed* Google
     * Chrome and ignores Playwright's browser cache entirely. That made it the only call site in the
     * repo on a different browser from every other — 26 scripts and packages all use the shared
     * cache, and this one silently needed a separate install. It also meant the suite could pass on a
     * machine where `pnpm research:*` could not run at all, which is part of how the two instruments
     * came to disagree about the same render.
     *
     * The shared cache is the convention: one chromium build per Playwright version per user, at
     * `~/Library/Caches/ms-playwright`, installed once with `pnpm browsers:install`. All three
     * workspace manifests declare the same `playwright` range, so pnpm resolves one version and there
     * is one build to install.
     */
    browser = await chromium.launch();
  }, 60_000);

  afterAll(async () => {
    // Explicit timeout: the default 10s hook budget is not enough to tear down a browser that has
    // seventeen rendered pages behind it, and a teardown timeout reads as a suite failure.
    await browser?.close();
  }, 60_000);

  it("renders every offering with no reader-visible layout defect", async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.addInitScript({ content: NAME_SHIM });

    const failures: string[] = [];

    for (const template of DESIGN_TEMPLATES) {
      const { previewHtml } = designFromFeatures(template.brief);
      await page.setContent(previewHtml, { waitUntil: "load" });
      await page.addScriptTag({ content: NAME_SHIM });
      await page.waitForTimeout(250);
      /*
       * Scroll the whole page, exactly as `auditBriefs` does in the operator script, then return to
       * the top before probing. A section held under a reveal transform measures as its neighbour's
       * overlap until it has entered, so an unscrolled probe is not measuring the page a reader sees.
       * Without this the gate and `pnpm research:audit` disagree on the same render.
       */
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.8;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo({ top: y, left: 0, behavior: "instant" });
          await new Promise((r) => setTimeout(r, 90));
        }
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
      await page.waitForTimeout(400);

      const result = (await page.evaluate(AUDIT_PROBE)) as ProbeResult;

      for (const kind of BLOCKING) {
        const items = result[kind] as unknown[];
        if (!items?.length) continue;

        if (kind === "vacancy") {
          // Tolerated only where it is enumerated above, and only in that exact section.
          const tolerated = new Set(KNOWN_VACANCIES[template.key] ?? []);
          const found = (result.vacancy as ProbeResult["vacancy"][]).filter(
            (v) => !tolerated.has(v.section),
          );
          if (found.length) failures.push(summarise(template.key, kind, found));
          continue;
        }


        failures.push(summarise(template.key, kind, items));
      }
    }

    await context.close();

    expect(
      failures,
      `Layout audit found reader-visible defects. Run \`pnpm research:audit <briefId>\` to inspect one page.\n${failures.join("\n")}`,
    ).toEqual([]);
  }, 300_000);

  /**
   * A capability may be named at most twice on one screen.
   *
   * The count is of *painted* text: HTML text nodes plus SVG `<text>`. `aria-label`,
   * `data-rail-label` and `data-view` describe an element that already paints its name, so counting
   * them would double-report the same occurrence.
   *
   * Measured 2026-10-05, before the gate: `saas` printed "Account scoring" 8× inside its hero
   * (rail button label, rail caption, two SVG figure labels, index mark, plate title, list row) and
   * `dashboard` printed "Priority queue" 9×. Both are the fold restating one name instead of
   * showing one thing.
   */
  it("does not name a capability more than twice on one screen", async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.addInitScript({ content: NAME_SHIM });

    const probe = `(() => {
      const names = window.__names || [];
      const norm = (s) => (s || "").replace(/\\s+/g, " ").trim().toLowerCase();
      const out = [];
      for (const section of document.querySelectorAll("[data-section]")) {
        const parts = [];
        const walk = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, {
          acceptNode(n) {
            const p = n.parentElement;
            return p && (p.tagName === "SCRIPT" || p.tagName === "STYLE") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
          },
        });
        let node;
        while ((node = walk.nextNode())) parts.push(node.textContent || "");
        /*
         * Joined with no separator, then normalised once.
         *
         * \`join(" ")\` injects whitespace the reader never sees, so a name split across two adjacent
         * elements matched twice and the count was an artefact of the probe rather than a repeat on
         * the page. It reported \`signal-observatory\` naming "Live window" 3× in its hero when the
         * headline ends "...under one live window" and the lattice plate prints "Live window": two
         * painted runs, read as three. Joining without a separator and collapsing whitespace once
         * counts the runs a reader can actually see, and it is stricter than counting per text node
         * — which is how all 17 offerings were verified at 2 or fewer.
         */
        const hay = norm(parts.join(""));
        for (const name of names) {
          const key = norm(name);
          if (!key) continue;
          let count = 0;
          let i = 0;
          while ((i = hay.indexOf(key, i)) !== -1) { count += 1; i += key.length; }
          if (count > 2) out.push({ section: section.dataset.section, name, count });
        }
      }
      return out;
    })()`;

    const failures: string[] = [];

    for (const template of DESIGN_TEMPLATES) {
      const names = template.brief.features.map((feature) => feature.name);
      const { previewHtml } = designFromFeatures(template.brief);
      await page.setContent(previewHtml, { waitUntil: "load" });
      await page.addScriptTag({ content: NAME_SHIM });
      await page.addScriptTag({ content: `window.__names = ${JSON.stringify(names)};` });
      await page.waitForTimeout(180);

      const repeats = (await page.evaluate(probe)) as Array<{ section: string; name: string; count: number }>;
      for (const repeat of repeats) {
        failures.push(`${template.key}: "${repeat.name}" named ${repeat.count}× in [${repeat.section}]`);
      }
    }

    await context.close();

    expect(
      failures,
      `A screen that names one capability more than twice is restating instead of showing.\n${failures.join("\n")}`,
    ).toEqual([]);
  }, 300_000);
});
