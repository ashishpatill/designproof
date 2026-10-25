import { chromium } from "playwright";
import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";

const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript({ content: "window.__name = (f) => f;" });

const probe = `(() => {
  const nodes = Array.from(document.querySelectorAll("img,video,canvas,picture,svg"));
  const set = new Set(nodes);
  const outermost = [];
  for (const m of nodes) {
    let a = m.parentElement, nested = false;
    while (a) { if (set.has(a)) { nested = true; break; } a = a.parentElement; }
    if (nested) continue;
    const r = m.getBoundingClientRect();
    if (r.width < 24 || r.height < 24) continue;
    outermost.push({ tag: m.tagName, cls: (m.getAttribute("class")||"").slice(0,40), dataFigure: m.getAttribute("data-figure"), w: Math.round(r.width), h: Math.round(r.height), area: Math.round(r.width*r.height), texts: m.querySelectorAll("text").length, paths: m.querySelectorAll("path,line,rect,circle,polyline").length });
  }
  const pageH = document.documentElement.scrollHeight;
  const vw = innerWidth, vh = innerHeight;
  const figureArea = outermost.reduce((a,n)=>a+n.area,0);
  return { vw, vh, pageH, nodes: nodes.length, outermost: outermost.length,
    figureAreaRatio: +(Math.min(1, figureArea/(vw*pageH))).toFixed(4),
    figureAreaPx: figureArea, pageAreaPx: vw*pageH,
    sizes: outermost.map(n=>n.w+"x"+n.h).slice(0,40),
    kinds: outermost.map(n=>(n.dataFigure||n.tag)+":"+(n.texts>0?"text":"notext")).slice(0,40),
    imgCount: document.querySelectorAll("img").length,
    imgArea: Array.from(document.querySelectorAll("img")).reduce((a,m)=>{const r=m.getBoundingClientRect();return a+r.width*r.height;},0) };
})()`;

for (const t of ["saas", "herbarium", "dashboard"]) {
  const tpl = DESIGN_TEMPLATES.find((x) => x.key === t)!;
  const { previewHtml } = designFromFeatures(tpl.brief) as any;
  await page.setContent(previewHtml, { waitUntil: "load" });
  await page.addScriptTag({ content: "window.__name = (f) => f;" });
  await page.waitForTimeout(200);
  const r: any = await page.evaluate(probe);
  console.log("\n===", t, "===");
  console.log("img count", r.imgCount, "img area", r.imgArea, "| outermost figures", r.outermost, "svg/img nodes", r.nodes);
  console.log("figureAreaRatio", r.figureAreaRatio, "=", r.figureAreaPx, "/", r.pageAreaPx);
  console.log("sizes:", r.sizes.join(" "));
  console.log("kinds:", r.kinds.join(" "));
}
await browser.close();
