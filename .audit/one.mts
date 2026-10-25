/** Corporate hero: every painted occurrence of one capability name, with element paths. */
import { chromium } from "playwright";
import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";

const KEY = process.argv[2] ?? "one visual language";
const KEY_KIND = process.argv[3] ?? "corporate";
const SECTION = process.argv[4] ?? "hero";

const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript({ content: "window.__name = (f) => f;" });

const t = DESIGN_TEMPLATES.find((x) => x.key === KEY_KIND)!;
const names = t.brief.features.map((f) => f.name);
await page.setContent(designFromFeatures(t.brief).previewHtml as never as { previewHtml: string }, { waitUntil: "load" });
await page.addScriptTag({ content: "window.__name = (f) => f;" });
await page.addScriptTag({ content: `window.__names = ${JSON.stringify(names)};` });
await page.waitForTimeout(300);

const rows = (await page.evaluate(`(() => {
  const key = ${JSON.stringify(KEY)};
  const norm = (s) => (s || "").replace(/\\s+/g, " ").trim().toLowerCase();
  const out = [];
  for (const section of document.querySelectorAll("[data-section]")) {
    if (section.dataset.section !== ${JSON.stringify(SECTION)}) continue;
    const parts = [];
    const walk = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, {
      acceptNode(n) { const p = n.parentElement; return p && (p.tagName === "SCRIPT" || p.tagName === "STYLE") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; },
    });
    let node;
    while ((node = walk.nextNode())) {
      const raw = node.textContent || "";
      const t2 = norm(raw);
      let c = 0, i = 0;
      while ((i = t2.indexOf(key, i)) !== -1) { c += 1; i += key.length; }
      if (c) {
        const el = node.parentElement;
        const bits = [];
        for (let n2 = el; n2 && n2 !== document.body && bits.length < 5; n2 = n2.parentElement) {
          const cls = typeof n2.className === "string" && n2.className ? "." + n2.className.trim().split(/\\s+/).slice(0, 2).join(".") : "";
          bits.unshift(n2.tagName.toLowerCase() + cls);
        }
        out.push({ c, path: bits.join(">"), raw: raw.trim().slice(0, 120) });
      }
    }
    const joined = norm(parts.join(""));
    let jc = 0, j = 0;
    while ((j = joined.indexOf(key, j)) !== -1) { jc += 1; j += key.length; }
    const joinedSpaced = norm(parts.join(" "));
    let sc = 0, s = 0;
    while ((s = joinedSpaced.indexOf(key, s)) !== -1) { sc += 1; s += key.length; }
    out.push({ c: 0, path: "== joined(no-sep)=" + jc + " joined(space)=" + sc + " perNodeSum=", raw: "" });
  }
  return out;
})()`)) as Array<{ c: number; path: string; raw: string }>;

let sum = 0;
for (const r of rows) {
  if (r.c === 0) { console.log(r.path + " " + r.path.match(/perNodeSum=\d+/)?.[0]); continue; }
  sum += r.c;
  console.log(`×${r.c}  ${r.path}\n     ${JSON.stringify(r.raw)}`);
}
console.log(`\nper-node sum: ${sum}`);
await ctx.close();
await browser.close();
