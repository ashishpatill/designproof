/** Dump every occurrence of a repeated capability name inside its section, with the element path. */
import { chromium } from "playwright";
import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";

const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript({ content: "window.__name = (f) => f;" });

const probe = `(() => {
  const names = window.__names || [];
  const norm = (s) => (s || "").replace(/\\s+/g, " ").trim().toLowerCase();
  const path = (el) => {
    const bits = [];
    for (let n = el; n && n !== document.body && bits.length < 4; n = n.parentElement) {
      const cls = typeof n.className === "string" && n.className ? "." + n.className.trim().split(/\\s+/).slice(0,2).join(".") : "";
      bits.unshift(n.tagName.toLowerCase() + cls);
    }
    return bits.join(">");
  };
  const out = [];
  for (const section of document.querySelectorAll("[data-section]")) {
    for (const name of names) {
      const key = norm(name);
      if (!key) continue;
      const hits = [];
      const walk = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, {
        acceptNode(n) {
          const p = n.parentElement;
          return p && (p.tagName === "SCRIPT" || p.tagName === "STYLE") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        },
      });
      let node;
      while ((node = walk.nextNode())) {
        const t = norm(node.textContent || "");
        let i = 0;
        while ((i = t.indexOf(key, i)) !== -1) {
          hits.push({ path: path(node.parentElement), text: (node.textContent || "").trim().slice(0, 90) });
          i += key.length;
        }
      }
      if (hits.length > 2) out.push({ section: section.dataset.section, name, count: hits.length, hits });
    }
  }
  return out;
})()`;

const only = process.argv[2];
for (const t of DESIGN_TEMPLATES) {
  if (only && t.key !== only) continue;
  const names = t.brief.features.map((f) => f.name);
  const { previewHtml } = designFromFeatures(t.brief) as never as { previewHtml: string };
  await page.setContent(previewHtml, { waitUntil: "load" });
  await page.addScriptTag({ content: "window.__name = (f) => f;" });
  await page.addScriptTag({ content: `window.__names = ${JSON.stringify(names)};` });
  await page.waitForTimeout(120);
  const rows = (await page.evaluate(probe)) as Array<{ section: string; name: string; count: number; hits: Array<{ path: string; text: string }> }>;
  for (const r of rows) {
    console.log(`\n${t.key}  [${r.section}]  "${r.name}"  ×${r.count}`);
    for (const h of r.hits) console.log(`   · ${h.path}\n     ${JSON.stringify(h.text)}`);
  }
}
await browser.close();
