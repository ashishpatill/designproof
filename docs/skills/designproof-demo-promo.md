# designproof-demo-promo: specimen demo and promo video
> **DesignProof-owned stub.** Learned from public patterns only (PR #106 tip `4a55640`, plan §2b). Nothing vendored, forked, submoduled, or copied. Not a Tell MCP (Model Context Protocol) tool; the catalog stays eleven today and nineteen by replacement (BIM-203). No public MCP endpoint.

**Status:** near-term (Keep, learn). **Inspiration:** video-shotcraft, HyperFrames, Remotion (+ its skills).

## Purpose
A DesignProof-native pipeline under Demo Director / `tell-demo-script` that films **verified** specimens for the open-source demo-video gate. It runs outside `POST /api/design`, outside Studio stages, and outside the eleven-tool catalog.

## Learned
- Shot recipes (scroll, hover, reveal, hold) turn a page capture into a watchable demo.
- Deterministic HTML-to-MP4 rendering makes demos reproducible from the same specimen and tokens.
- Treating a composition as code means demos can be re-rendered when the specimen changes.

## We build
- Specimen capture (Playwright), then our shot list, then an MP4. Tokens come from DesignProof (optional Figma brand-token path).
- Every clip is tied to a proof-verify pass id. Unverified pages are never filmed.

## Non-goals
Adding Remotion as a product dependency outside the demo/promo path (and a Remotion licence check comes before any commercial use). Installing their skills as dependencies. A new public MCP host or staged design tool.

## Acceptance cues
- One 30–60 s demo rendered from a verified specimen, re-renderable with one command.
- `apps/` and `packages/` gain no new dependency.
