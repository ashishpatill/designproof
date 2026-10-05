# Automatic training data (local Design Proof runs)

When **dp-proof** and **dp-design-data** are siblings:

```text
workspace/
  dp-proof/
  dp-design-data/
```

running `pnpm dev` in Design Proof **automatically**:

1. Writes session + design artifacts into `dp-design-data/training-data/`
2. Triggers `dp-design-data sync` (inbox ingest → curated SFT/DPO JSONL)

Covered flows: Capture · voice · redesign · restyle · prove/verify/matrix ·
**Studio / showcase / template HTML** (`/api/design`, `/api/design/html`).

Optional `.env.local` in dp-proof:

```bash
DP_DESIGN_DATA_REPO=/absolute/path/to/dp-design-data
# DP_TRAINING_DATA=0        # disable sink
# DP_TRAINING_DATA_SYNC=0   # write raw files but skip harness sync
```

Check: `GET /api/health/capture` → `trainingData.enabled`.
After generating a template: `training-data/raw/design/` + `training-data/curated/sft.jsonl`.
