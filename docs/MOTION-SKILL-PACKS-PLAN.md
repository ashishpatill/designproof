# DesignProof motion skill packs — plan (learn, don’t copy)

**Status:** docs-only plan. No codegen on this branch until Tech Lead (TL) gates after room review.  
**Branch:** `feat/motion-skillpack-learn-dont-copy` (shared with Model Context Protocol / MCP Plugin Expert; Design Expert owns taxonomy, phases, regen order, and site/gallery handoffs).  
**Base tip:** `2cf7a576` on `origin/master`. **Do not** merge from or into `feat/hosted-e2e-neon-auth` (P0 hosted auth + checkout stays Frontend-only).  
**Catalog:** eleven Tell MCP tools today — this plan does **not** add MCP tools. Motion packs are Cursor / Studio / demo skills, not catalog expansion.  
**Decision context:** concept-first redesign and staged MCP growth still wait on Linear **BIM-203**; this plan does not reopen that. Motion remains a **review** between art direction and refinement (see `docs/QUALITY-BAR.md`), not a ninth stage.

Acronyms on first use:
- **MCP** = Model Context Protocol  
- **TL** = Tech Lead  
- **PR** = pull request  
- **CTA** = call to action  
- **INP** = Interaction to Next Paint  
- **WebGL** = Web Graphics Library  
- **GLSL** = OpenGL Shading Language  
- **GPU** = graphics processing unit  
- **MP4** = MPEG-4 Part 14 video container  
- **AV** = audio/video  
- **OSS** = open-source software  
- **DOM** = Document Object Model  

Brand contract (locked): **Instrument Serif** / **Source Sans 3** / **IBM Plex Mono**; accent **`#D4714A`** on **`#181614`**. Never default to Inter + `#2563EB`. Uniqueness = **different page shape**, not a palette swap. Stacked images, motion, artistic, unique — Crease-class bar.

**Study notes:** capability study lives **off-repo** (internal box study). This OSS plan lists DesignProof inventions only. Agents authoring packs must not paste foreign skill files into context; use this taxonomy + brand/brief grammar only.

---

## 1. Executive intent

Beat **open-design** galleries and seekable composition-style delivery **without** cloning third-party stacks, skills, or default brand recipes.

We learn the *shape* of:
- programmable animation via **`seek(t)`** (deterministic frame at time `t`) + encode, not generative video;
- pipeline **Brief → Structured Data → Animation Engine → Frame Review → Video Render → Campaign Variants**;
- separating brand / scenes / variants from the engine (our bind is ConceptSpec / DesignBrief / siteKind — not a generic SaaS campaign file with Inter + blue);
- a quality loop: storyboard → timing → phone-size → brand/facts → full AV → contact sheet → human approval.

We invent **DesignProof-native** skill packs (`tell-*` / `designproof-*`) that:
1. Bind structured data to our **ConceptSpec / DesignBrief / siteKind** grammar.
2. Drive Studio specimens, showcase motion, README demo video, and (later) optional promo encodes — all gated by proof / tells registry, never unverified pages.
3. Prefer `transform` / `opacity`, respect INP budget, use `prefers-reduced-motion` **replacement**, lazy WebGL behind an immersive flag.
4. Pass the **swap test**: change brand → concept, first-screen metaphor, and copy must change; motion choreography must not be a recolored clone.

**Non-goals for this plan file:** hosted auth, checkout products, Free/Maker/Studio caps, MCP catalog growth, vendoring third-party composition engines into `apps/` or `packages/` as product dependencies, big codegen.

---

## 2. Capability study (off-repo)

Capability study lives off-repo (internal box study). OSS plan lists DesignProof inventions only.

Private Learn/Beat notes extract, for each capability area, **one pattern we keep as learning** and **one DesignProof-native invention that beats it**. No forks, no installing foreign skill packs, no copy-paste of foreign skill bodies into this tree. Capability areas covered (patterns only): timeline choreography, spring/physics feel, GPU 2D/3D bands, particles, vector paths, shader transitions, asset budgets, browser-capture discipline, optional voiceover/captions, transport clocks, timeline trim/contact sheet, and encode/mux delivery.

**Article-shaped patterns → DesignProof beats** (vendor-neutral; no third-party product names)

| Pattern shape | DesignProof beat |
|---|---|
| Brand/scenes/variants file separate from engine | `specimen.motion.json` + existing `DesignBrief` / ConceptSpec / `siteKind` — Instrument Serif stack, `#D4714A` on `#181614` |
| `seek(t)` + closed-form springs | Pack recipes emit seek-safe timelines; leading/trailing edge springs; container vs text offsets |
| Reusable compositions + agent skill packs | Named `tell-*` packs below; stronger uniqueness + proof gate |
| Quality loop + contact sheet | Align with tells registry + proof-verify / anti-slop; no film of unverified pages |
| Campaign matrix (hooks × formats × CTAs) | Matrix = README demo × gallery loop × per-template motion specimen — not a random agency ad product |

---

## 3. Skill taxonomy (DesignProof-owned packs)

Five packs for the next version. Each is a **skill pack** (docs stub → `.cursor/skills` runtime → optional `packages/design-skills` helpers). **None** is a new MCP tool.

### 3.1 `tell-motion-timeline`

| | |
|---|---|
| **Purpose** | Author a seek-safe motion timeline bound to brief beats (hero enter, proof stack, CTA pulse, chapter turns). |
| **Inputs** | `DesignBrief` / ConceptSpec, `siteKind`, approved art-direction tokens, optional `specimen.motion.json` |
| **Outputs** | Timeline recipe (labels, durations, easings), `window.__dpSeek` registration plan, reduced-motion replacement map |
| **Plugs** | Studio generate (motion review), showcase specimens, README demo shot list |
| **Non-goals** | Generative video; wall-clock `setInterval` animation; MCP catalog entry |

### 3.2 `tell-physics-fold`

| | |
|---|---|
| **Purpose** | Page-shape physics: fold, stack, settle, crease-line reveals that sell the concept metaphor. |
| **Inputs** | Metaphor from concept stage; layout regions; motion budget |
| **Outputs** | Spring/settle params per region; static stack for reduced-motion |
| **Plugs** | Crease / dossier / foundry / loom specimens first |
| **Non-goals** | Full rigid-body sims in default marketing pages |

### 3.3 `tell-shader-band`

| | |
|---|---|
| **Purpose** | One intentional shader/WebGL band with still fallback and accent-uniform contract. |
| **Inputs** | Concept material, accent `#D4714A`, performance budget |
| **Outputs** | Owned GLSL snippet id, poster still, lazy-load gate |
| **Plugs** | Observatory / lantern / studio siteKinds; immersive flag only |
| **Non-goals** | Full 3D app shell; pasted public shader toys; particles as default hero |

### 3.4 `tell-audio-caption`

| | |
|---|---|
| **Purpose** | Optional demo voiceover + captions synced to seek clock for README / gallery videos. |
| **Inputs** | Approved script, timeline labels, locale |
| **Outputs** | Caption WebVTT (Web Video Text Tracks), optional audio bed, QA against the script |
| **Plugs** | README demo video, `feat/site-motion-gallery` embeds |
| **Non-goals** | Auto-voice every Studio generation; shipping voice model weights in the web app |

### 3.5 `tell-render-ship`

| | |
|---|---|
| **Purpose** | Brief → prototype → animate → **frame review** → render → ship artifacts (MP4, poster, contact sheet). |
| **Inputs** | Verified specimen URL or HTML, timeline, proof-verify pass id |
| **Outputs** | MP4 + WebP poster + contact sheet + re-render command |
| **Plugs** | Extends `docs/skills/designproof-demo-promo.md`; Demo Director / `tell-demo-script`; Web Designer gallery |
| **Non-goals** | Adding an optional composition engine as a dependency of `apps/web` without licence review; shipping a desktop capture suite runtime; auto-publish to `master` |

**Related existing skills (do not duplicate):** `motion-stack-craft`, `scroll-reveal-once`, `scroll-narrative-craft`, `ambient-atmosphere-craft`, `designproof-demo-promo`, `designproof-anti-slop`, `designproof-diagram`. New packs **route through** these nodes where `routeSkills` already lists them.

**Stub home:** `docs/skills/` (plan) → `.cursor/skills/<name>/SKILL.md` (runtime) → helpers in `packages/design-skills/src/` only when a typed API is needed (mirror `demo-promo` pattern).

---

## 4. Integration map + template regen order

### 4.1 Integration map

```
docs/skills/*-stub.md          → plan of record (this work)
.cursor/skills/tell-*/SKILL.md → agent procedure (later PRs)
packages/design-skills/src/    → typed helpers (timeline parse, seek registry types) when needed
apps/web showcase + Studio     → consume recipes in specimens (Web Designer / Frontend)
scripts/*motion*               → capture/probe (extend carefully; stay DesignProof-owned)
README + docs/media            → demo MP4 / posters (render-ship)
```

**MCP:** catalog stays **eleven**. No tool-schema change in this track. If entitlement ever needs a schema touch, ping MCP Plugin Expert separately — not part of motion packs.

### 4.2 Template regen order (quality bar: stacked images, motion, artistic, unique)

1. **Crease** (`sport-matchday` / crease routes) — golden depth bar; multipage; first motion specimen + first README demo candidate.  
2. **Distinct siteKinds with strong metaphor (second wave):** `research-dossier`, `signal-observatory`, `editorial-foundry`, `lantern-path`.  
3. **Conversion / product (third wave):** `saas-marketing`, `fintech-marketing`, `art-directed-studio`, `consumer-craft` — motion must change **page shape**, not only accent.  
4. **Remaining catalog keys** only after swap test + anti-slop pass on waves 1–3.  
5. **Pause** clinic / loom drops still pending BIM-203 — do not invest motion regen in proposed-drop templates until Ashish decides.

Each regen PR: one template family, proof-verify evidence, motion contact sheet, reduced-motion screenshot, swap-test A/B evidence, no auth-branch files.

---

## 5. Site revamp + animated gallery + README video (handoffs)

| Phase | Owner | Branch | Exit check |
|---|---|---|---|
| **P0** Hosted Free/Maker/Studio end-to-end (auth, abuse, checkout) | Frontend | `feat/hosted-e2e-neon-auth` | TL green on auth+abuse+checkout path; **untouched by this plan** |
| **P1a** This plan + taxonomy in-room | Design Expert (+ MCP notes as needed) | `feat/motion-skillpack-learn-dont-copy` | Room ack; docs-only PR draft; no codegen |
| **P1b** Skill stubs for five packs | Design Expert | same or follow-up docs PR | Stubs under `docs/skills/` linked from `docs/skills/README.md` |
| **P1c** Landing + animated sample gallery | Web Designer | `feat/site-motion-gallery` | Gallery shows **real** specimen loops (or honest “not ready”); DesignProof tokens; past peer gallery depth without cloning IA |
| **P1d** Template motion regen (Crease first) | Frontend (after Auth not starved) + Design Expert recipes | separate `feat/motion-regen-crease` etc. | Crease multipage + motion review evidence |
| **P1e** README demo video | Web Designer + Frontend render path via `tell-render-ship` | gallery branch or `docs/media` PR | 30–60 s MP4 from **verified** Crease (or honest interim), re-render command documented |
| **P1f** Optional composition encode path | Frontend | only after licence note signed off | Optional composition engine **not** required for gallery CSS/WebM loops |

**Web Designer contract:** consume pack names + token lock from this doc; do not invent Inter/violet; do not block on an optional composition engine — CSS/WebM/seek-DOM loops are enough for gallery MVP.

**Frontend contract:** do not take CPU/disk from P0 Auth; render path lands after Auth headroom; never merge motion into auth branch.

**Product Ops:** verify branches/PRs from GitHub/Vercel only; no live ship claim from this track.

---

## 6. Branch / PR strategy (no collision with P0 Auth)

| Rule | Detail |
|---|---|
| Base | Always `origin/master` @ current tip (today `2cf7a576`) |
| Shared plan branch | `feat/motion-skillpack-learn-dont-copy` — MCP + Design Expert; docs first |
| Forbidden | Merge from/to `feat/hosted-e2e-neon-auth`; committing auth/checkout route gates here |
| Gallery | `feat/site-motion-gallery` — Web Designer |
| Regen | One branch per template family (`feat/motion-regen-crease`, …) |
| Ship | Branch + PR only; `master` auto-publishes designproof.site — TL gate before merge |
| Commits | Ashish-only messages; no co-authored-by bots/models |
| Draft PR | Docs-only title: `docs: motion skill packs plan (learn, don’t copy)` — **draft** until room ack |

Local worktree used for this write-up: `/workspace/designproof-motion-plan` (box). Does not touch Ashish’s Mac checkout rules.

---

## 7. OpenCode loop recipe (plan → stub → iterate, disk-safe)

- Binary: `/home/box/.local/bin/opencode`  
- Models: free tier only (`glm-5.3-flash-free`, `mimo-v2.6-flash-free`, or current free pin — **not** paid).  
- Scope per loop: **one** artifact (critique of this plan **or** one skill stub).  
- Working dir: this worktree only; never auth worktree.  
- Disk: keep ≥2 GiB free; no `node_modules` reinstall in the loop; no full optional composition-engine install in plan phase.  
- Output: fold useful critique into this file; **do not** dump raw model slop into the repo.  
- Stop: after plan PR is up; stubs are a follow-up loop.

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| **Licence — optional composition engine** | Review commercial/use-case limits before any product dependency. Prefer DOM + system encode-binary path for the OSS demo gate. |
| **Licence — encode binary / capture suites** | Document deploy flags and copyleft implications at encode stage; **do not vendor** a desktop capture suite runtime into the product tree. |
| **Performance** | INP ≤ 200 ms target; one shader band; particle density caps; still fallbacks; probe with existing motion scripts. |
| **Uniqueness bar** | Swap test + anti-slop + “page shape ≠ palette”; prior rejection of sameness-only template PRs is the warning. |
| **P0 starvation** | Explicit ownership split; motion regen waits if Developer disk/CPU tight. |
| **Catalog creep** | Packs are skills, not MCP tools; eleven remains until BIM-203 says otherwise. |
| **Unverified film** | `tell-render-ship` refuses encode without proof-verify pass id. |
| **Recipe fragmentation** | One central `specimen.motion.json` schema before five stubs emit private dialects. |

---

## 9. Immediate next actions (after room ack)

1. Design Expert: add five stubs under `docs/skills/` + README table rows.  
2. Web Designer: start `feat/site-motion-gallery` against this taxonomy (Crease loop first).  
3. Frontend: keep P0 Auth; queue Crease motion regen when headroom exists.  
4. MCP Plugin Expert: only if a future entitlement/schema touch appears — not required for packs.  
5. Product Ops: track draft PR; no production claim.

---

## 10. References (in-repo)

- `docs/QUALITY-BAR.md` — Crease / peer gallery bar; motion as review  
- `docs/TOOLS-AND-SKILLS.md` — honest registry; external motion shortlist policy  
- `docs/skills/designproof-demo-promo.md` — demo/promo stub  
- `docs/DESIGN-ENGINE-BEAT-PLAN.md` — motion taxonomy context  
- `docs/design-engine-revamp-plan.html` §2b — learn, don’t copy  
- `packages/design-skills/src/templates.ts` — siteKind / template keys  

Private capability study (box-local Learn/Beat notes) — **not** shipped in this repository and not a public doc path.

---

## 11. Study extraction discipline (anti-drift)

**Per-library study note (before any stub authoring):** one short paragraph in the **private** study file: (a) pattern kept, (b) why a verbatim port would fail our uniqueness bar, (c) DesignProof recipe name it feeds. **Not** pasted foreign READMEs or skill bodies in agent context while authoring.

**Agent anti-copy rule:** when writing a DesignProof pack stub or recipe, do **not** load foreign skill files into context. Use only this plan’s pattern columns + our brand/brief grammar.

**“Learned the shape” checklist (must pass before a pack is “runtime”):**
1. Metaphor or page-shape binding is explicit (not easing-only).
2. Tokens are DesignProof stack only (no Inter / `#2563EB` defaults).
3. Seek-safe (`autoplay: false` or equivalent; `window.__dpSeek`).
4. Reduced-motion **replacement** specified.
5. Swap-test evidence attached on at least one specimen (see below).

### Swap test — operational (regen PR checklist)

Owner: author of the template regen PR. Evidence in the PR body:
1. Render specimen A (original brief).
2. Render specimen B with an **unrelated** brand + audience (same siteKind).
3. Pass only if concept one-liner, first-screen metaphor, and primary copy differ; motion labels may share timing grammar but **must not** ship identical DOM choreography that ignores the new metaphor.
4. Attach two contact-sheet strips (A/B) + one reduced-motion still each.

Add to every regen PR (§4.2): proof-verify id, motion contact sheet, reduced-motion stills, **swap-test A/B evidence**.

### Schema contract before stubs diverge

**One** `specimen.motion.json` schema (Zod in `packages/design-skills` or `@tell/schema` when implemented) owned centrally **before** five pack stubs emit private dialects. Fields (proposed): `version`, `siteKind`, `conceptId`, `beats[]` `{id,label,t0,t1}`, `seekRegistry` (`__dpSeek`), `reducedMotion`, `proofVerifyId?`. Packs reference beats by id; they do not invent parallel timeline formats.

### Sequencing fix (gallery vs regen)

Ship **gallery MVP Crease loop** (P1c) on the motion recipe frozen in the plan/stubs **before** opening Crease regen PRs that change choreography — so README demo (P1e) does not film a superseded pass. If regen must land first, re-render demo in the same PR train.
