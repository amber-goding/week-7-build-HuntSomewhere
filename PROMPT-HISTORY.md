# Prompt History — HuntSomewhere

Durable record of collaboration between the user and Claude Code on this project: what was asked, how it was redirected, what was built, why, and how it was verified. Not a transcript. Commits and PR descriptions remain canonical for *what* changed; this file holds rejected approaches, mid-session redirections, and decision rationale.

Maintained by the `prompt-history` skill (opted in via [CLAUDE.md](CLAUDE.md)). Rotates to `PROMPT-HISTORY-<YYYY>-Q<N>.md` at ~800 lines or when a calendar quarter turns.

---

## Session — 2026-10-30

### 1. Opt in to prompt history

- **Asked:** User invoked `/prompt-history`.
- **Context:** Repo contained only `README.md` and the initial commit (`02e2da6`). No `CLAUDE.md`, so the project hadn't opted in. The skill's `reference.md` (entry templates) is missing from `~/.claude/skills/prompt-history/`, so this file's format is derived from `SKILL.md` alone.
- **Decision:** Asked the user whether to opt in; they said yes.
- **Done:** Created `CLAUDE.md` (project summary from the README plus the opt-in line) and this file.
- **Verified:** N/A (documentation only). Nothing committed yet.

### 2. [Claude] Shared project plan

- **Asked:** Create `project-plan.md` as the shared source of truth for Claude and Codex, from a detailed product brief (approved stack: Next.js/TS, Neon, Prisma, OpenAI, managed auth, transactional email). No packages, app code, migrations, or commits.
- **Context:** Repo had only `README.md`, `CLAUDE.md`, and this file. Codex is installed on the machine, but `~/.codex` has no global `AGENTS.md` and no skills, so Codex would not see `CLAUDE.md` on its own.
- **Decisions (proposed, pending user override):**
  - Agent discovery: a thin repo `AGENTS.md` that points Codex to `CLAUDE.md`, `project-plan.md`, and this file, with no copied content. Codex appends to this same history file with `[Codex]` tags. Not created yet: it's the first step of M0.
  - Proposed provider defaults: Clerk (auth), MapLibre + MapTiler (maps), Resend (email), Vercel (hosting).
  - Flagged a dependency missing from the approved stack: private file storage for photos and signed documents (proposed: R2/S3 with presigned URLs).
  - Grace period left unresolved, with a placeholder default of 14 days.
  - Private-listing distance is computed only from the approximate display point, so repeated distance queries can't triangulate the exact location.
  - Explicit split of review-required vs. ordinary listing fields (plan §4.3).
  - Milestones M0–M11 total about 24–27 h against a 12–24 h window. Presentation tiers (P/S/L) in plan §10 prioritize the work without dropping any scope.
- **Done:** Wrote `project-plan.md`.
- **Verified:** Not applicable; plan only. Nothing installed, migrated, or committed.
- **Next:** M0 — create `AGENTS.md`, then feasibility checks (Maryland data sources and terms, provider accounts, email domain, written-permission requirement).

### 3. [Claude] Plan correction pass (revision 2)

- **Asked:** Documentation-only correction of `project-plan.md` covering 12 issues. No installs, code, migrations, or commits. Full scope preserved.
- **Redirections from revision 1 (what was wrong, and the fix):**
  - **M0 contradiction:** M0 banned code but required working sign-in, uploads, maps, and an OpenAI script. Split it into **M0a**, read-only research plus `AGENTS.md`, and **per-milestone integration checks** run after approval. M1 now needs only Neon and hosting.
  - **Critical path:** AI NL→filters (now M6) sits before signing, with failure-path, budget-concurrency, and ambiguity checks. Real-user testing is now **≥3 people** (M8). Signing moved to stretch (M11).
  - **Estimates:** revision 1's rows summed to 24–26.5 h (it said "24–27"), but they omitted work the corrections add: versioned review, snapshots, email outbox, a separate testing round, and three AI features with evals. Rows were rewritten and re-summed, with the arithmetic shown in the plan. Provisional totals: presentation path 19.5–30.5 h, stretch 9.5–14 h, full scope 29–44.5 h. The P path doesn't fit a 12 h window. The plan lists ordered, recorded reductions.
  - **§4.3 conflict:** exact location was both "review-required" and "edits are logged". Replaced with one process: every edit creates an immutable `ListingVersion`, and changed fields trigger `GENERAL` and/or `PRIVATE_LOCATION` review scopes. Private location values are visible only to a separate `LOCATION_REVIEWER` grant, with each view audited. They never appear in public DTOs, logs, or AI prompts.
  - **Immutable `AgreementSnapshot`** at acceptance, alternate-date acceptance, and accepted amendment. Later listing edits show a diff and never change agreements.
  - **Document status** split into completion / supersession / follow-up. `COMPLETED` is preserved on cancellation. Open invitations are revoked on cancellation or supersession. Atomic finalization under a row lock, checking the content hash.
  - **Separate `DOCUMENT_ACCESS` token** for guest retrieval of the completed copy. The guest signer sees the full document plus a read-only signer list (names, roles, status) and can act only on their own signature. The document generator has no access to private location data.
  - **Email outbox** with idempotency keys. Retries re-send emails, never re-run business actions. Tokens are minted at send time, and minting revokes earlier ones. Email (M9) precedes sharing, signing, and reminders.
  - **AI controls:** removed the claim of a hard OpenAI dashboard cap. Replaced with app-enforced budget reservation (a conditional atomic UPDATE), input and output limits, concurrency limits, and a DB + env kill switch. Citation validation now checks verbatim quotes and values, and its limits are stated. Acceptance checks added for all four AI features.
  - **Search:** ambiguous equipment, season terms, and dates become unresolved chips, never silent mappings. Distance bounds only where defensible (county boundary, or a server-computed town bucket). Otherwise labeled approximate with no guaranteed inclusion.
  - **Demo:** isolated demo actors with presenter-controlled emails, `BLOCKED_DEMO` for other recipients, and an authenticated admin-only demo outbox behind a flag, demo records only, labeled "Not delivered". No public token panel.
  - **Unverified claims:** provider capabilities marked [VERIFY]. The `~/.codex` observation in entry 2 is reworded in the plan as a dated, machine-scoped observation. Codex's `AGENTS.md` discovery is to be confirmed in M0a.
- **Done:** Rewrote `project-plan.md` (revision 2, change log §11).
- **Verified:** Re-summed milestone estimates by hand (shown in plan §9). Checked section headings for structure. No code, so nothing was executed. Nothing installed, migrated, or committed.
- **Next:** M0a — read-only feasibility research and creating `AGENTS.md`.
