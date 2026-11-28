# Web Workspace Guidance

Follow the repository root `AGENTS.md` for shared project conventions. Read the matching skill guidance before changing React components.
Import shared task, Subtask, timer, and utility logic from `@elixer-focus/shared`; keep browser persistence and coordinator behavior in the web adapters. See [spec 0002](../docs/specs/_root/0002-shared-code-package.md).
Personal pages use `/my/profile`, `/my/journal`, `/my/brain-dump`, `/my/calendar`, and `/my/tasks`. The old top level profile, journal, calendar, and tasks paths redirect to their canonical paths, and `/my` redirects to `/my/profile`.

Routes are declared explicitly in `web/src/app/router.tsx`; file and folder names do not automatically create URLs. Keep route component folders aligned with URL and layout groups when adding or moving pages (for example, `routes/my/` for personal pages and `routes/settings/` for settings). The `routes/(root)/` folder contains the home page, `routes/my/` contains personal pages, and `routes/settings/` contains settings pages. The router assigns their paths and layouts; update `router.tsx` whenever route components move or route paths change, preserving redirects, lazy loading, and missing route behavior.

[React best practices](../.agents/skills/vercel-react-best-practices/SKILL.md) covers React implementation and performance.

[Composition patterns](../.agents/skills/vercel-composition-patterns/SKILL.md) covers component and state architecture.

[Web design guidelines](../.agents/skills/web-design-guidelines/SKILL.md) covers interface accessibility and review.
