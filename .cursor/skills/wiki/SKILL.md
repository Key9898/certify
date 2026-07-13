---
name: wiki
description: Project wiki curator. Persist any project knowledge (decisions, notes, conventions, snippets, references, architecture) into the project's `wiki/` folder. Use this skill when the user asks to remember, note, save, record, or capture knowledge for future sessions.
---

# Wiki Skill (Cursor)

This skill is the **single entry point** for persisting project knowledge into [`wiki/`](wiki/) at the repo root.

> **Note:** This is the Cursor IDE port. The Trae IDE version lives at [`.trae/skills/wiki/SKILL.md`](../../../.trae/skills/wiki/SKILL.md) and the Antigravity port lives at [`.antigravity/skills/wiki/SKILL.md`](../../../.antigravity/skills/wiki/SKILL.md). They share the same intent and folder layout — keep all in sync.

## When to invoke

Invoke automatically when the user expresses intent to remember or save something:

- "မှတ်ထားစမ်း" / "wiki ထဲ save လုပ်ပါ"
- "decision တစ်ခုယူထား" / "ADR ရေးပါ"
- "remember this" / "save to wiki" / "note this down"
- "convention သတ်မှတ်ထား"
- "snippet သိမ်းထား"
- "reference attach လုပ်ပါ"
- "architecture diagram သိမ်းထားပါ"

When in doubt: if content is **reusable across sessions / other AI agents**, save via this skill.

## Wiki folder layout

```
wiki/
├── README.md                  ← entry point & how-to
├── 00-overview.md             ← project overview
├── 01-stack.md                ← tech stack
├── 02-workflow.md             ← git workflow & hooks
├── 03-folder-map.md           ← codebase structure
├── architecture/              ← system design, diagrams
├── decisions/                 ← ADRs (NNN-title.md)
├── conventions/               ← coding standards, patterns
├── snippets/                  ← copy-paste code (markdown only)
├── notes/                     ← loose notes, ideas
└── references/                ← external links, docs
```

## How to save — classification rules

Pick **one** section. When ambiguous, ask the user (max 1 question with sensible defaults).

| User intent                        | Section         | Filename                                          |
| ---------------------------------- | --------------- | ------------------------------------------------- |
| "Why we chose X" / trade-off       | `decisions/`    | `NNN-<slug>.md` (next sequential number)          |
| "We always do X" / naming rule     | `conventions/`  | `<slug>.md`                                       |
| Architecture / diagram / data flow | `architecture/` | `<slug>.md`                                       |
| Reusable code snippet              | `snippets/`     | `<slug>.md` — markdown only, code in fenced block |
| Loose idea / scratch / TODO        | `notes/`        | `YYYY-MM-DD-<slug>.md`                            |
| External link / doc                | `references/`   | `<slug>.md`                                       |

### Slug rules

- Lowercase kebab-case
- English only (cross-platform safe — no Myanmar Unicode in filenames)
- Max ~40 chars
- Example: `cloudinary-upload-signatures.md`

## Required frontmatter

Every saved entry **must** start with YAML frontmatter:

```markdown
---
title: <Human-readable title>
type: <decision | convention | architecture | snippet | note | reference>
date: YYYY-MM-DD
tags: [<tag1>, <tag2>]
---
```

## ADR template (decisions/ only)

```markdown
---
title: <Decision title>
type: decision
date: YYYY-MM-DD
tags: [<area>]
---

# <Decision title>

## Status

Accepted (or Proposed / Deprecated / Superseded by ADR-NNN)

## Context

What is the issue / driver?

## Decision

What did we choose?

## Consequences

Positive, negative, neutral.

## Alternatives considered

- Alt A — why rejected
- Alt B — why rejected
```

## Snippet template (markdown only)

**Why `.md` only:** Prettier (and lint-staged pre-commit) parses every staged file. A `.tsx` file starting with YAML frontmatter (`---`) is invalid JS/TS and breaks the hook. Markdown wraps the same code safely.

```markdown
---
title: <Snippet title>
type: snippet
date: YYYY-MM-DD
tags: [<react>, <tailwind>, ...]
language: <ts | tsx | js | css | sh>
---

# <Snippet title>

<One-line description of when to use>

\`\`\`<language>
<copy-paste-ready code>
\`\`\`
```

## Workflow

1. **Classify** content → one of the 6 sections.
2. **Check existing files** in that folder to avoid duplicates.
3. **Compute filename** — slug + sequential number for decisions.
4. **Compose** with required frontmatter + appropriate template.
5. **Write** with the `Write` tool using absolute path under `wiki/`.
6. **Update index** if a new top-level or section doc.
7. **Confirm** to user with the file path.

## Critical rules

- **Never** skip the frontmatter — future AI agents rely on `type` / `tags` for retrieval.
- **Never** save **wiki skill entries** into `src/`, `docs/` (outside wiki), or repo root — always `wiki/<section>/`.
- **Always** absolute paths in tool calls.
- **Always** markdown `.md` for snippets.
- Burmese/Myanmar text OK inside content, but filename slug must be English.

## Dual-track documentation

This project uses **two tracks**. Do not conflate them.

| Track       | Path             | Git                                           | Purpose                                                        |
| ----------- | ---------------- | --------------------------------------------- | -------------------------------------------------------------- |
| **Wiki**    | `wiki/`          | Committed                                     | Long-term knowledge — skill entries with full YAML frontmatter |
| **Session** | `docs/sessions/` | Gitignored (`docs/sessions/` in `.gitignore`) | Local daily evidence — detail mirror after implementation work |

- **Wiki skill save targets** are only under `wiki/`. Session files are **not** classified via this skill.
- Session files use a **lighter session template** (see rule `06-documentation-hygiene.mdc`), not wiki section classification.
- After implementation work, both tracks are **mandatory companions** — see **Post-implementation checklist** below and always-on rule 06. Do not skip because the user did not say "မှတ်ထား".

## Post-implementation checklist

Run even without wiki trigger phrases (rule 06):

| If changed                | Update                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------- |
| New Impl phase            | `wiki/architecture/implementation-phases.md` + `wiki/references/pm-tracker-airtable.md` |
| UI / convention behavior  | relevant `wiki/conventions/*.md`                                                        |
| Any impl batch            | `wiki/notes/YYYY-MM-DD-<slug>.md` (committed summary + frontmatter)                     |
| Same batch                | `docs/sessions/YYYY-MM-DD-session-summary.md` (gitignored detail)                       |
| Phase count / index drift | `wiki/README.md`, `wiki/02-workflow.md`, session evidence tables                        |

## After writing

Reply concisely:

> Saved → `wiki/<section>/<filename>>`
> Type: `<type>` | Tags: `<tags>`

Optionally suggest 1 related entry if obvious.
