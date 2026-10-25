/** Observatory hero: print every capability name occurrence, however many there are. */
import { chromium } from "playwright";
import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";

const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript({ content: "window.__name = (f) => f;" });
const t = DESIGN_TEMPLATES.find((x) => x.key === "observatory")!;
const names = t.brief.features.map((f) => f.name);
await page.setContent(designFromFeatures(t.brief).previewHtml as never as { previewHtml: string }, { waitUntil: "load" });
await page.addScriptTag({ content: "window.__name = (f) => f;" });
await page.addScriptTag({ content: `window.__names = ${JSON.stringify(names)};` });
await page.waitForTimeout(180);

for (const wait of [0, 300, 1200]) {
  if (wait) await page.waitForTimeout(wait);
  const rows = (await page.evaluate(`(() => {
    const names = window.__names || [];
    const norm = (s) => (s || "").replace(/\\s+/g, " ").trim().toLowerCase();
    const out = [];
    for (const section of document.querySelectorAll("[data-section]")) {
      const parts = [];
      const walk = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, {
        acceptNode(n) { const p = n.parentElement; return p && (p.tagName === "SCRIPT" || p.tagName === "STYLE") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; },
      });
      let node; while ((node = walk.nextNode())) parts.push(node.textContent || "");
      const hay = norm(parts.join(" "));
      for (const name of names) {
        const key = norm(name); if (!key) continue;
        let c = 0, i = 0;
        while ((i = hay.indexOf(key, i)) !== -1) { c += 1; i += key.length; }
        out.push({ section: section.dataset.section, name, count: c });
      }
    }
    return out;
  })()`)) as Array<{ section: string; name: string; count: number }>;
  const bad = rows.filter((r) => r.count > 0 && r.count > 2);
  console.log(`\n=== after extra ${wait}ms ===`);
  for (const r of bad) {
    console.log(`  ${r.section.padEnd(10)} ${r.count}  ${r.name}`);
    const hits = (await page.evaluate(`(() => {
      const section = [...document.querySelectorAll("[data-section]")].find(s => s.dataset.section === ${JSON.stringify(r.section)});
      const key = ${JSON.stringify(r.name.toLowerCase())};
      const norm = (s) => (s || "").replace(/\\s+/g, " ").trim().toLowerCase();
      const out = [];
      const walk = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, { acceptNode: () => NodeFilter.FILTER_ACCEPT });
      let node;
      while ((node = walk.nextNode())) {
        const t = norm(node.textContent || "");
        if (!t.includes(key)) continue;
        const el = node.parentElement;
        const bits = [];
        for (let n = el; n && n !== document.body && bits.length < 4; n = n.parentElement) {
          const cls = typeof n.className === "string" && n.className ? "." + n.className.trim().split(/\\s+/).slice(0,2).join(".") : "";
          bits.unshift(n.tagName.toLowerCase() + cls);
        }
        out.push({ path: bits.join(">"), text: (node.textContent||"").trim().slice(0,70), attrs: el.outerHTML.slice(0,180) });
      }
      return out;
    })()`)) as Array<{ path: string; text: string; attrs: string }>;
    for (const h of hits) console.log(`      ${h.path}\n        ${JSON.stringify(h.text)}\n        ${h.attrs}`);
  }
}
await ctx.close();
await browser.close();
