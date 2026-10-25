/** Exact per-node occurrence counts for one name in one section. */
import { chromium } from "playwright";
import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";

const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript({ content: "window.__name = (f) => f;" });
const t = DESIGN_TEMPLATES.find((x) => x.key === "observatory")!;
await page.setContent(designFromFeatures(t.brief).previewHtml as never as { previewHtml: string }, { waitUntil: "load" });
await page.addScriptTag({ content: "window.__name = (f) => f;" });
await page.waitForTimeout(1500);

const rows = (await page.evaluate(`(() => {
  const key = "live window";
  const norm = (s) => (s || "").replace(/\\s+/g, " ").trim().toLowerCase();
  const out = [];
  for (const section of document.querySelectorAll("[data-section]")) {
    if (section.dataset.section !== "hero") continue;
    const walk = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, {
      acceptNode(n) { const p = n.parentElement; return p && (p.tagName === "SCRIPT" || p.tagName === "STYLE") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; },
    });
    let node;
    while ((node = walk.nextNode())) {
      const raw = node.textContent || "";
      const t = norm(raw);
      let c = 0, i = 0;
      while ((i = t.indexOf(key, i)) !== -1) { c += 1; i += key.length; }
      if (c) out.push({ c, raw: raw.trim().slice(0, 120), tag: node.parentElement?.tagName, cls: node.parentElement?.getAttribute("class") });
    }
  }
  return out;
})()`)) as Array<{ c: number; raw: string; tag: string; cls: string }>;
for (const r of rows) console.log(`×${r.c}  <${r.tag} class="${r.cls}">\n     ${JSON.stringify(r.raw)}`);
await ctx.close();
await browser.close();
