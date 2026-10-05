import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CapturePayload } from "@designproof/schema";
import { diagnoseCapture } from "../diagnose";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const capturePath = path.join(repoRoot, process.env.DP_CAPTURE_IN ?? "fixtures/reports/capture.json");
const reportPath = path.join(repoRoot, process.env.DP_REPORT_OUT ?? "fixtures/reports/dp-report.json");
const capture = CapturePayload.parse(JSON.parse(await readFile(capturePath, "utf8")));
const report = diagnoseCapture(capture);
await writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(`Design Proof diagnosed ${report.score.total} findings → ${reportPath}`);
