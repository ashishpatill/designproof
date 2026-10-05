import { NextResponse } from "next/server";
import { trace, SpanStatusCode, type Span } from "@opentelemetry/api";
import { parseDirectionPlan, parseDirectionWithGemini } from "@designproof/taste";
import { resolveGeminiKey } from "@/lib/byok";
import { recordTrainingEvent } from "@/lib/training-data-sink";

const tracer = trace.getTracer("designproof.voice");

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const transcript = typeof body.transcript === "string" ? body.transcript.trim() : "";

  if (!transcript) {
    return NextResponse.json({ error: "transcript required" }, { status: 400 });
  }

  const apiKey = resolveGeminiKey(request);
  const source = apiKey ? "gemini" : "local";

  return tracer.startActiveSpan("designproof.voice", async (span: Span) => {
    span.setAttributes({
      "designproof.voice.source": source,
      "designproof.voice.transcript_length": transcript.length,
    });

    try {
      const plan = apiKey
        ? await parseDirectionWithGemini(transcript, apiKey)
        : parseDirectionPlan(transcript);

      span.setAttributes({ "designproof.voice.preset": plan.presetId ?? "(none)" });
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();

      recordTrainingEvent(
        "voice",
        { transcript, plan, source },
        { presetId: plan.presetId ?? null },
      );

      return NextResponse.json({ ...plan, source });
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      span.end();
      throw error;
    }
  });
}
