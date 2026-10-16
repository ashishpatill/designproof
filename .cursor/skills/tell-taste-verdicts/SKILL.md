---
name: tell-taste-verdicts
description: Implements Tell taste verdicts and voice art-direction parsing in packages/taste. Use when working on generic/drift/intentional classification, Gemini prompts, reflection validation, direction presets, parseDirection, or /api/voice.
---

# Tell taste and voice direction

> **Plan link (proposed, not shipped):** Presets here change art direction on an existing page. Under the plan, colour comes from an explicit `theme` chosen at the art-direction stage, not from a hash of the product name, and a theme change only swaps colour variables. See the [DesignProof redesign plan](https://linear.app/bimlabz/document/designproof-redesign-plan-concept-first-step-by-step-design-7f1f65ec2bc3); waiting on Ashish's decision in [BIM-203](https://linear.app/bimlabz/issue/BIM-203/decide-designproof-redesign-plan-concept-first-step-by-step-and-the).

## Scope

- `packages/taste/src/engine.ts` — Gemini + deterministic fallback
- `packages/taste/src/parse-direction.ts` — voice/text direction parsing
- `packages/taste/src/presets.ts` — editorial, precision, warm-minimal, bold-contrast, luxury, brutalist, explainer
- `apps/web/src/app/api/voice/route.ts` — browser voice refinement endpoint

## Verdict contract

- Verdicts: `generic`, `drift`, `intentional`, `uncertain`
- Rationale ≤ 3 sentences, critic voice, no apology, no emoji
- Detector `facts` are authoritative; reject rationales that contradict them
- Reflection loop: draft → validate against facts → refine once → mechanical fallback at confidence 0.5

## Voice / art-direction

1. Deterministic parser runs first (`parseDirectionPlan`) so demo works without keys
2. Gemini refines when `GEMINI_API_KEY` is present
3. Presets: `editorial`, `precision`, `warm-minimal`, `bold-contrast`, `luxury`, `brutalist`, `explainer`
4. Output: `ArtDirection` with keywords, token overrides, summary
5. When adding or steering styles, follow `docs/08_AI_DESIGN_METHODS.md` (methods + style playbook). Never put third-party author/site names in keywords or docs.

## Path differences

- MCP `tell_diagnose` calls `classifyWithTaste` when key exists
- Web `/api/diagnose` subprocess may return deterministic verdicts only
- Do not assume Gemini runs on every diagnose path

## Testing

- Mock fetch/model responses; never hit live Gemini in tests
- Assert zod validation and fallback when model JSON is invalid or contradictory

## DoD

- Every finding gets a valid `TasteVerdict`
- Brutalist/intentional fixture case can return `intentional`
- Offline demo works with zero API keys

## Related

- Rules: `.cursor/rules/tell-taste-engine.mdc`
- Agent: `.cursor/agents/taste-engineer.md`
