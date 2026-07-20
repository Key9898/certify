---
title: Lark manual task update block
type: convention
date: 2026-07-20
tags: [lark, documentation, hygiene, workflow]
---

# Lark manual task update block

After every completed implementation task (or logical batch), the agent **must** end the reply with one consolidated, copy-paste-ready block for the user to paste into Lark manually.

## Rules

- Always emit — user does not need to ask.
- One block per finished task/batch (not fragmented across multiple messages).
- Keep it scannable for status updates: title, what changed, files, docs paths, QA / next step.
- Prefer English for Lark paste unless the user asks for Myanmar.
- Place the block at the **end** of the final response, clearly labeled so the user can select-all copy.

## Template

```text
【Lark Task Update】
Date: YYYY-MM-DD
Branch: <branch>
Status: Done

Title:
<short task title>

Summary:
- <bullet 1>
- <bullet 2>

Key files:
- path/to/file

Docs updated:
- wiki/notes/...
- docs/sessions/...
- docs/CHANGELOG.md (if touched)
- docs/PROGRESS.md (if touched)

QA / Next:
- <check or follow-up>
```

## Related

- Always-on rule: `.cursor/rules/06-documentation-hygiene.mdc` (step 5)
- Dual-track wiki + session remains mandatory alongside this Lark block
