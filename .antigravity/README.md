# Antigravity IDE Integration

This folder holds Antigravity-specific AI configuration for this project.

## Layout

```
.antigravity/
├── README.md                  ← this file
├── rules/                     ← auto-attached rule files
│   ├── 00-project-context.mdc
│   ├── 01-tech-stack.mdc
│   ├── 02-workflow.mdc
│   ├── 03-code-style.mdc
│   ├── 04-testing.mdc
│   ├── 05-wiki.mdc
│   └── 06-documentation-hygiene.mdc
└── skills/                    ← skill discovery
    └── wiki/
        └── SKILL.md
```

The content mirrors [`.cursor/`](../.cursor/) rules and skills to ensure consistent IDE configurations.
