# Cursor IDE Integration

This folder holds Cursor-specific AI configuration for this project.

## Layout

```
.cursor/
├── README.md                  ← this file
├── rules/                     ← auto-attached rule files (.mdc)
│   ├── 00-project-context.mdc
│   ├── 01-tech-stack.mdc
│   ├── 02-workflow.mdc
│   ├── 03-code-style.mdc
│   ├── 04-testing.mdc
│   ├── 05-wiki.mdc
│   └── 06-documentation-hygiene.mdc  ← alwaysApply: wiki + session after impl
└── skills/                    ← skill discovery (mirrors .trae/skills/ & .antigravity/skills/)
    └── wiki/
        └── SKILL.md
```

## How Cursor loads these

- **Rules** (`.cursor/rules/*.mdc`): Cursor auto-attaches these as system context for every chat. Frontmatter `description` + `globs` decide when each rule applies. Rule `06-documentation-hygiene.mdc` is `alwaysApply: true` — after implementation work, update wiki + `docs/sessions/` without the user asking.
- **Skills** (`.cursor/skills/<name>/SKILL.md`): Cursor's agent can invoke skills by name when relevant. `description` frontmatter is the trigger surface.

The same skill content also lives at [`.trae/skills/wiki/`](.trae/skills/wiki/SKILL.md) for Trae IDE and [`.antigravity/skills/wiki/`](.antigravity/skills/wiki/SKILL.md) for Antigravity. All are kept in sync.

## Updating

When editing rules or skills, update Trae, Cursor, and Antigravity copies to keep them in sync manually.
