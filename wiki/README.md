---
title: Project Wiki Index
type: reference
date: 2026-07-13
tags: [wiki, index]
---

# Project Wiki

AI assistants နှင့် developers များ အတွက် project knowledge base။
User က အရာတစ်ခုခု (decision, snippet, note, ref) ထည့်လိုက်တိုင်း wiki skill က ဒီ folder ထဲ auto-save လုပ်ပေးပါမယ်။

## Structure

| Folder                         | ရည်ရွယ်ချက်                                                        |
| ------------------------------ | ------------------------------------------------------------------ |
| [architecture/](architecture/) | System design, layouts, database schemas, and verification portals |
| [decisions/](decisions/)       | Architecture Decision Records (ADR)                                |
| [conventions/](conventions/)   | Coding standards, CSS roundings, visual design guidelines          |
| [snippets/](snippets/)         | Reusable code snippets                                             |
| [notes/](notes/)               | Loose notes, session summaries, task notes                         |
| [references/](references/)     | External links, API keys, credentials manuals                      |

## Index

- [00-overview.md](00-overview.md) — project overview, stack, scripts
- [01-stack.md](01-stack.md) — tech stack details & versions
- [02-workflow.md](02-workflow.md) — git workflow, hooks, documentation dual-track
- [03-folder-map.md](03-folder-map.md) — codebase folder responsibilities (monorepo frontend & backend)
- [notes/2026-07-13-project-restructuring.md](notes/2026-07-13-project-restructuring.md) — Project documentation and IDE rules restructuring log
- [notes/2026-07-13-branding-rename-and-gating.md](notes/2026-07-13-branding-rename-and-gating.md) — Qubit Certify rename and Phase 2 gating log
- [notes/2026-07-17-git-branching-strategy.md](notes/2026-07-17-git-branching-strategy.md) — Phase 1 & Phase 2 local/remote git branching setup
- [notes/2026-07-17-verify-portal-redesign.md](notes/2026-07-17-verify-portal-redesign.md) — Premium Indigo & Obsidian redesign of the verification portal
- [notes/2026-07-20-footer-light-theme-align.md](notes/2026-07-20-footer-light-theme-align.md) — Footer aligned to Verify Portal light theme
- [notes/2026-07-20-verify-portal-soft-stone-redesign.md](notes/2026-07-20-verify-portal-soft-stone-redesign.md) — Soft stone + corporate blue Verify Portal redesign (direction A)
- [conventions/lark-task-update.md](conventions/lark-task-update.md) — mandatory Lark manual task update block after every task
- [conventions/verify-portal-design.md](conventions/verify-portal-design.md) — Phase 1 Verify Portal theme + IA convention



## How to add an entry

User က "Tailwind v4 dark mode အကြောင်း မှတ်ထားစမ်း" သို့မဟုတ် "decision တစ်ခုယူထား" လိုမျိုး ပြောလိုက်ရုံပါပဲ။ Wiki skill က သင့်တော်ရာ section မှာ auto-create/save လုပ်ပေးပါမယ်။

After implementation work, agents also update wiki + `docs/sessions/` per rule `06-documentation-hygiene` (user need not ask).
