# Personal design-data companion — **developer machine only**

This checkout improves the **Design Proof design engine** for maintainers. It does **not**
run for end users on Vercel/demo hosts.

End-user learning (Ashish's directions, priorities, tools) lives in the browser as
`UserDesignProfile` — see `.cursor/skills/dp-user-session-learn` and
`apps/web/src/lib/user-session-learn.ts`.

## Two loops

| Loop | Audience | Storage | Trigger |
|---|---|---|---|
| **Dev corpus** | Design Proof developers | Private `dp-design-data` checkout | `agency:run` when pointer present |
| **User session** | Product users | `localStorage` on their machine | Voice/direction/tool use in the web app |

## Enable (developer workstation)

Create gitignored `research/design-data.local.json`:

```json
{
  "path": "../dp-design-data",
  "repoUrl": "git@github.com:<you>/dp-design-data.git",
  "pull": true
}
```

Or:

```bash
export DP_DESIGN_DATA=/absolute/path/to/dp-design-data
export DP_DEV_CORPUS=1   # required when using env alone
```

Disabled automatically when `VERCEL=1` (unless `DP_DEV_CORPUS=1`), `DP_PUBLIC_DEMO=1`,
or `DP_DISABLE_DEV_CORPUS=1`.

## Expected layout in the data repo

```
dp-design-data/
  boards.seeds.json
  agency-engine-memory.json
  LEARNINGS.md
  aggregate.json               # optional
  measurements/ref-*.json      # optional
  runs/<run-id>/LEARN.md
```

## What Design Proof does (dev only)

1. **Start of `agency:run`** — merge memory, prefer design-data seeds, corridor digests.
2. **End of every run** — automatic `agency:learn`, then write-back memory/LEARNINGS.

Third-party URLs stay in the data repo / gitignored boards files only.
