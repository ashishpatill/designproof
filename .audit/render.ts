import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";
import { writeFileSync, mkdirSync } from "node:fs";

const outDir = "/tmp/tell-audit/out";
mkdirSync(outDir, { recursive: true });

for (const t of DESIGN_TEMPLATES) {
  try {
    const res: any = designFromFeatures(t.brief);
    const html = res.previewHtml ?? res.html ?? res.preview?.html;
    if (!html) { console.log(t.key, "NO HTML", Object.keys(res)); continue; }
    writeFileSync(`${outDir}/${t.key}.html`, html);
    console.log(t.key.padEnd(12), String(html.length).padStart(7), "bytes");
  } catch (e) {
    console.log(t.key, "FAIL", (e as Error).message.slice(0, 300));
  }
}
