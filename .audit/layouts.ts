import { DESIGN_TEMPLATES, designFromFeatures } from "../packages/design-skills/src/index";
const rows: any[] = [];
for (const t of DESIGN_TEMPLATES) {
  const spec: any = (designFromFeatures(t.brief) as any).spec;
  rows.push({ key: t.key, kind: t.brief.siteKind, taste: t.brief.taste, sections: spec.sections.map((s: any) => `${s.kind}:${s.layout}`) });
}
const all = new Map<string, number>();
for (const r of rows) for (const s of r.sections) all.set(s, (all.get(s) ?? 0) + 1);
for (const r of rows) console.log(r.key.padEnd(12), JSON.stringify(r.taste));
console.log("\n--- section kind:layout frequency ---");
[...all.entries()].sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(String(v).padStart(3), k));
console.log("\n--- per template ---");
for (const r of rows) console.log(r.key.padEnd(12), r.sections.join(" | "));
