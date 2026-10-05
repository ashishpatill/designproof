# Training-data / MCP sink

Back: [`../FEATURE-MAP.md`](../FEATURE-MAP.md) · Entry: [`../../AGENTS.md`](../../AGENTS.md)

## Goal

Every local diagnose / voice / redesign / proof / Studio design run writes a **raw episode** into sibling **dp-design-data**, then that repo’s `sync` turns inbox files into **curated SFT and DPO** JSONL.

- **SFT** — supervised fine-tune gold rows (accepted patches, gold pages).
- **DPO** — preference pairs (chosen vs rejected on the **same** brief).
- **Sink** — Design Proof’s thin writer (`training-data-sink`). Not a collector. Missing sibling ⇒ no-op.

Do **not** commit training JSONL in dp-proof. Do **not** grow a collector here.

## Done

- Shared writer: `packages/design-skills/src/training-data-sink.ts`.
- Studio routes (`/api/diagnose`, `/api/voice`, `/api/redesign`, `/api/restyle`, `/api/proof/*`, `/api/design*`) write when `../dp-design-data` or `DP_DESIGN_DATA_REPO` exists.
- MCP (2026-08-25): `designproof_diagnose` → `raw/episodes/`; `designproof_redesign` → `raw/redesign/`; `designproof_proof_verify` → `raw/proof/`; `designproof_design_from_features` → `raw/design/`.
- Research node `emit-training-episode`; `agency-run-learn` (developer-only). Off on Vercel unless `DP_TRAINING_DATA=1`.

## Remaining

Writer ≠ closed loop. Still open:

1. Prove MCP writes actually land on a real sibling checkout.
2. Inbox ingest → **curated** `sft.jsonl` / DPO JSONL (lives in dp-design-data, not here).
3. Ashish access to that sibling so the loop can be verified.

`GET /api/health/capture` → `trainingData.enabled` is a status bit, not proof of curated rows.

## How to verify

```bash
# sibling present:
ls ../dp-design-data/training-data/raw/
# after a design run: raw/design/ plus dp-design-data sync → curated/
curl -s localhost:3000/api/health/capture   # trainingData.enabled
pnpm -F @designproof/design-skills test            # training-data-sink tests
```

Disable locally: `DP_TRAINING_DATA=0`. Skip harness spawn: `DP_TRAINING_DATA_SYNC=0`.

## Skills to load first

`emit-training-episode` · `dp-mcp-tools` · `agency-run-learn`

MCP: same eleven tools — sink is not a twelfth tool.

## Related

[`docs/14_DESIGN_TRAINING_DATA_CURATION_PLAN.md`](../14_DESIGN_TRAINING_DATA_CURATION_PLAN.md) · [`OPEN_DP_DESIGN_DATA.md`](../../OPEN_DP_DESIGN_DATA.md) · [`research/DESIGN_LLM_TRAINING_DATA_SURVEY.md`](../../research/DESIGN_LLM_TRAINING_DATA_SURVEY.md)
