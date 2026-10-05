import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { captureUrl } from "../capture/capture-url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const url = process.env.DP_FIXTURE_URL ?? "http://localhost:3001";
const capture = await captureUrl(url);
const out = process.env.DP_CAPTURE_OUT ?? "fixtures/reports/capture.json";
const outPath = path.join(repoRoot, out);
await writeFile(outPath, JSON.stringify(capture, null, 2));
console.log(`Captured ${url} → ${outPath}`);
