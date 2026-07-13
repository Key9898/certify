---
title: Codebase Structure Reorganization
type: note
date: 2026-07-13
tags: [restructure, ide-integration, wiki]
---

# Codebase Structure Reorganization

Restructured the Certify project's documentation, rules, and skills files to match the layout of the `ai-poc-frontend` project.

## Changes Completed

1. **IDE Customizations:**
   - Created `.cursor/README.md` and `.cursor/rules/` containing rules `00` through `06` covering project context, stack, git hooks, style, test, and doc hygiene.
   - Built custom `wiki` curation skill files inside `.cursor/skills/wiki/SKILL.md`, `.trae/skills/wiki/SKILL.md`, and `.antigravity/skills/wiki/SKILL.md`.
2. **Wiki Creation:**
   - Setup `wiki/` directory at the root.
   - Created `README.md`, `00-overview.md`, `01-stack.md`, `02-workflow.md`, and `03-folder-map.md`.
   - Initialized empty folders: `architecture/`, `decisions/`, `conventions/`, `snippets/`, `notes/`, `references/`.
3. **Session Logs Integration:**
   - Created local-only `docs/sessions/` folder and appended it to the root `.gitignore` to prevent committing session details.
