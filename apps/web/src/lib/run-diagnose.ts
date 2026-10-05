import { captureUrl, diagnoseCapture, loadDesignDoc, shouldApplyDesignDoc } from "@designproof/core";
import { DesignProofReport, type Finding, type TasteVerdict } from "@designproof/schema";
import { classifyWithTaste } from "@designproof/taste";

function scoreOf(verdicts: TasteVerdict[], findings: Finding[]) {
  return {
    total: findings.length,
    generic: verdicts.filter((v) => v.verdict === "generic").length,
    drift: verdicts.filter((v) => v.verdict === "drift").length,
    intentional: verdicts.filter((v) => v.verdict === "intentional").length,
    uncertain: verdicts.filter((v) => v.verdict === "uncertain").length,
  };
}

/** Run capture + diagnose in-process (reliable in Docker / Vercel). */
export async function runDiagnose(url: string): Promise<DesignProofReport> {
  try {
    const designDoc = shouldApplyDesignDoc(url) ? await loadDesignDoc() : undefined;
    const base = diagnoseCapture(await captureUrl(url), undefined, designDoc);
    // Match MCP: enrich with Gemini taste when a key is present; deterministic otherwise.
    const verdicts = await classifyWithTaste(base.findings, base.fingerprint, {
      apiKey: process.env.GEMINI_API_KEY,
    });
    return DesignProofReport.parse({ ...base, verdicts, score: scoreOf(verdicts, base.findings) });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Capture pipeline failed: ${detail}`, { cause: error });
  }
}
