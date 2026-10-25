/**
 * Cross-offering distinctness measurement — the numbers the M1 ratchet test is pinned to.
 *
 * Three questions docs/16 asks of the seventeen offerings:
 *   1. How much of the emitted CSS is byte-identical across all of them?
 *   2. Do their room sequences differ, or do ten of them share one skeleton?
 *   3. Do they pick different type voices, or is it a hash over three pools?
 */
import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";

const pages = DESIGN_TEMPLATES.map((t) => {
  const { spec, previewHtml } = designFromFeatures(t.brief);
  return { key: t.key, spec, html: previewHtml };
});

/* ---------- 1. shared CSS ---------- */
const cssOf = (html: string): string[] => {
  const blocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1] ?? "");
  return blocks
    .join("\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
};
const perTemplate = pages.map((p) => new Set(cssOf(p.html)));
const sharedAll = [...perTemplate[0]!].filter((line) => perTemplate.every((s) => s.has(line)));
const unionAll = new Set(perTemplate.flatMap((s) => [...s]));
const charsAll = perTemplate.map((s) => [...s].reduce((a, l) => a + l.length + 1, 0));
const charsShared = sharedAll.reduce((a, l) => a + l.length + 1, 0);
console.log("=== CSS ===");
console.log(`templates            ${pages.length}`);
console.log(`non-empty lines (min/max)  ${Math.min(...perTemplate.map((s) => s.size))} / ${Math.max(...perTemplate.map((s) => s.size))}`);
console.log(`union of all lines   ${unionAll.size}`);
console.log(`lines in ALL ${pages.length}   ${sharedAll.length}  (${((sharedAll.length / unionAll.size) * 100).toFixed(1)}% of union)`);
console.log(`CSS chars shared     ${((charsShared / charsAll.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}% mean`);

/* ---------- 2. room sequences ---------- */
const seqOf = (spec: (typeof pages)[number]["spec"]): string =>
  spec.sections.map((s) => `${s.id}:${s.layout}`).join(" > ");
const seqs = pages.map((p) => seqOf(p.spec));
const bySeq = new Map<string, string[]>();
for (const p of pages) {
  const k = seqOf(p.spec);
  bySeq.set(k, [...(bySeq.get(k) ?? []), p.key]);
}
console.log("\n=== room sequences ===");
console.log(`distinct sequences   ${bySeq.size} of ${pages.length}`);
const shared = [...bySeq.entries()].filter(([, keys]) => keys.length > 1).sort((a, b) => b[1].length - a[1].length);
for (const [k, keys] of shared) {
  console.log(`  ×${keys.length}  ${keys.join(", ")}`);
  console.log(`        ${k}`);
}
console.log(`unique sequences     ${pages.length - shared.length}`);

/* ---------- 3. type voices ---------- */
console.log("\n=== type voices ===");
// The pairing lands on DesignSpec.tokens as fontDisplay / fontBody / fontMono (types.ts:355-359).
// `display`/`body`/`mono` do not exist on tokens, so reading those reported every template as
// identical for the wrong reason.
const voice = (spec: (typeof pages)[number]["spec"]): string => {
  const t = spec.tokens;
  return [t.fontDisplay, t.fontBody, t.fontMono].join(" / ");
};
const voices = pages.map((p) => voice(p.spec));
const distinctVoices = new Set(voices).size;
console.log(`distinct pairings    ${distinctVoices} of ${pages.length}`);
const byVoice = new Map<string, string[]>();
for (const p of pages) {
  const k = voice(p.spec);
  byVoice.set(k, [...(byVoice.get(k) ?? []), p.key]);
}
for (const [k, keys] of byVoice) {
  console.log(`  ×${keys.length}  ${k}`);
  console.log(`        ${keys.join(", ")}`);
}
const reqs = pages.map((p) => p.spec.tokens.fontRequests.length);
console.log(`font requests per page  min ${Math.min(...reqs)} / max ${Math.max(...reqs)}`);
const families = new Set(pages.flatMap((p) => [p.spec.tokens.fontDisplay, p.spec.tokens.fontBody, p.spec.tokens.fontMono]));
console.log(`distinct font families across all 17  ${families.size}`);
