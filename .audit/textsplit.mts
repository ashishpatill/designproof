import { chromium } from "playwright";
import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";
const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript({ content: "window.__name = (f) => f;" });
const probe = `(() => {
  const walk = (root) => { let t=0; const it=document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while(n=it.nextNode()){ t += (n.textContent||"").trim().length; } return t; };
  const svgChars = [...document.querySelectorAll("svg")].reduce((a,s)=>a+walk(s),0);
  const bodyChars = walk(document.body);
  const htmlText = document.body.innerText.trim().length;
  return { bodyChars, svgChars, htmlText, svgShare: bodyChars ? +(svgChars/bodyChars).toFixed(3) : 0,
    imgs: document.querySelectorAll("img,picture,video,canvas").length,
    figures: document.querySelectorAll("figure").length,
    svgCount: document.querySelectorAll("svg").length,
    h1: (document.querySelector("h1")||{}).textContent,
    domNodes: document.querySelectorAll("*").length,
    styledWithVars: getComputedStyle(document.documentElement).getPropertyValue("--w-content").trim() };
})()`;
console.log("template    domNodes  textChars  svgTextChars svgShare  h1");
for (const t of DESIGN_TEMPLATES) {
  const { previewHtml } = designFromFeatures(t.brief) as any;
  await page.setContent(previewHtml, { waitUntil: "load" });
  await page.addScriptTag({ content: "window.__name = (f) => f;" });
  await page.waitForTimeout(120);
  const r: any = await page.evaluate(probe);
  console.log(t.key.padEnd(12), String(r.domNodes).padStart(6), String(r.bodyChars).padStart(10), String(r.svgChars).padStart(11), String(r.svgShare).padStart(8), " " + String(r.h1||"").slice(0,40), "| figures:"+r.figures, "imgs:"+r.imgs, "w-content:"+r.styledWithVars);
}
await browser.close();
