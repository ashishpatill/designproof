# Design Proof — Design Training Data Curation Research Plan

> **Research plan** (literature → Design Proof mapping).  
> **Literature:** [`research/DESIGN_LLM_TRAINING_DATA_SURVEY.md`](../research/DESIGN_LLM_TRAINING_DATA_SURVEY.md)
>
> **Collector (developer-only, separate repo — does NOT ship in Design Proof):**  
> `dp-design-data` — local CLI/proxy that auto-writes episodes under
> `~/.dp-design-data/`. See that repo’s README. Design Proof product code must not
> grow a training exporter.
>
> Related: `docs/08`, `docs/10`, `research/LEARNINGS.md`, `docs/13`.  
> Does **not** replace `PLAN.md` / `BUILD.md`.

**Status:** Research · **Audience:** developers training a design model off Design Proof loops  
**Storage:** outside this monorepo only (`~/.dp-design-data`)

---

## 0. Separation of concerns (hard rule)

| Lives in Design Proof (`dp-proof`) | Lives in `dp-design-data` (private/dev repo) |
|---|---|
| Literature survey + this plan | Convert / watch / reward / SFT·DPO export CLI |
| Product loop (diagnose → redesign → proof) | Raw episodes + curated JSONL store |
| Thin **local-only** sink (`packages/design-skills` → `training-data-sink`; Studio + MCP) writing into the sibling repo | Schema for curated rows + anonymisation |
| Nothing committed as training JSONL | All local data under `training-data/` |

**Do not** commit training JSONL anywhere in Design Proof.  
**Do not** enable the sink on Vercel by default (requires `DP_TRAINING_DATA=1`).

---

## 1. How auto collection works (developer machine)

**Built into dp-proof (local/dev):** when this repo is checked out next to Design Proof as
`../dp-design-data` (or `DP_DESIGN_DATA_REPO` is set), these **Studio routes**
and **local stdio MCP tools** write automatically on every successful run
(same writer: `@designproof/design-skills/training-data-sink`):

- `/api/diagnose` · `/api/voice` · `/api/redesign` · `/api/restyle`
- `/api/proof/apply` · `/api/proof/verify` · `/api/proof/matrix`
- `/api/design` · `/api/design/html` (templates / studio / showcase websites)
- MCP (local stdio only — not a public host): `designproof_diagnose` → `raw/episodes/` ·
  `designproof_redesign` → `raw/redesign/` · `designproof_proof_verify` → `raw/proof/` ·
  `designproof_design_from_features` → `raw/design/` (same dump Studio `/api/design` writes)

`designproof_apply` still returns patch text only (never silent-applies, never invents a sink).
Missing sibling checkout ⇒ no-op with `trainingSinkStatus().reason` (e.g.
`dp-design-data_not_found`) — Frontend owns sibling install + harness CLI;
MCP does not clone or install that repo. Writes go through the shared sink, so
an already-installed sibling may still receive the same debounced `sync` as Studio.

After each write Design Proof debounces **`dp-design-data sync`** (inbox ingest + curated JSONL).

```text
dp-design-data/training-data/
  raw/episodes|shots|voice|redesign|restyle|proof|matrix|design/
  by-day/YYYY-MM-DD/<kind>/
  sessions/<sess_id>/
  inbox/          # for CLI convert/watch/sync
  curated/        # after dp-design-data sync|convert
  meta/ledger.jsonl
```

Off on Vercel unless `DP_TRAINING_DATA=1`. Disable locally with `DP_TRAINING_DATA=0`.
Skip harness spawn with `DP_TRAINING_DATA_SYNC=0`.
Confirm: `GET /api/health/capture` → `trainingData.enabled`.

Optional CLI (same repo):

```bash
cd dp-design-data && npm run build
dp-design-data convert   # uses ./training-data by default
```

---

## 2. Capability map (unchanged intent)

See survey §2: `D2C`, `C2C`, `CRITIC`, `RANK`, `AGENT`, `REPAIR`, `RESP`.  
Design Proof already emits the richest signals for `CRITIC` / `C2C` / `REPAIR`; the harness
turns those into rows. Public WebSight-style sets cover `D2C` only.

---

## 3. Research workstreams (Design Proof-side)

W0–W8 remain research readouts (survey-driven). Implementation of collection is
**owned by `dp-design-data`**, not this repo.

Design Proof-side only:

- Keep report/proposal schemas stable enough to ingest loosely  
- Keep docs pointers current  
- Never add product “Save for training” UI unless explicitly productized later

---

## 4. Immediate developer setup

```bash
# After cloning dp-design-data next to Design Proof:
cd dp-design-data && npm install && npm run build && npm link
dp-design-data proxy --listen 3100 --target http://127.0.0.1:3000
```

Artifact snapshot from the cloud agent (if you do not have the private remote yet):  
download `dp-design-data.tar.gz` from the run artifacts, then
`gh repo create dp-design-data --private --source=. --push`.

---

## Changelog

- **2026-08-09** — Collector moved to separate `dp-design-data` developer repo;
  Design Proof keeps survey + plan only.
