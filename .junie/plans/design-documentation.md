---
sessionId: session-261123-104131-i2bl
---

# Requirements

### Current State

The design system is fully implemented but undocumented. Key artifacts I've identified:

**Theme System:**

- `web/src/config/themes.ts` — central theme registry with `allThemes` (ThemeInfo array) and `validThemeNames` (Set)
- `web/src/app/themes/` — theme CSS files organized by category (default/daisyui/, default/elixer.css, premium/)
- `web/src/hooks/useAppTheme.ts` — synchronous theme application via `useLayoutEffect`, validates against `validThemeNames`
- `web/src/stores/theme.ts` — Zustand store for current theme with persist middleware
- 34 DaisyUI themes + 1 custom (elixer) + 9 premium themes = 44 total themes
- Theme transitions use `duration-500` (500ms) across all color transitions

**Layout Structure:**

- `web/src/app/layout/Default.tsx` — main layout with Navbar, Sidebar, TimerModal, Toaster, and `<Outlet />`
- `web/src/app/layout/Auth.tsx` — auth pages layout
- `web/src/app/layout/Settings.tsx` — settings pages layout
- `web/src/app/layout/Error.tsx` — error layout
- `web/src/app/layout/Onboarding.tsx` — onboarding layout
- CSS custom properties: `--navbar-height: 5rem`, `--sidebar-width: 14rem`, `--music-player-height: 4rem`

**Shared UI Primitives** (`web/src/components/ui/`):

- Button — sizes (xs, sm, md, lg), colors (primary, ghost, outline, secondary, accent, neutral), loading state with Spinner
- Input — sizes (sm, md, lg) via `inputSize` prop, error state, label, helperText
- Badge — sizes (sm, md), 8 colors, variants (default, soft, outline)
- Spinner — sizes (xs, sm, md, lg), theme colors (primary, secondary, neutral, accent)
- Modal — native `<dialog>`, sizes (sm, md, lg), backdrop click, Escape key, externalRef support
- Skeleton — `animate-pulse`, `role="status"`, optional animation toggle
- ErrorBoundary — class component, fallback UI with Refresh and Go Home actions
- All use `forwardRef` and `displayName`. Barrel export at `index.ts`.

**Feature Directory Structure:**

- `web/src/features/` — 5 features: countdown-timer, music-player, settings, tasks, ui
- Each feature has: components/, hooks/, stores/, **tests**/, assets/ (as needed)
- Components use PascalCase, Index.tsx as entry point per component group
- Tests co-located in `__tests__/` subdirectories next to source

**CSS Conventions:**

- TailwindCSS v4 with `@import "tailwindcss"` (not `@tailwind`)
- DaisyUI plugin with `themes: all`
- Custom `@theme` block for font (Roboto)
- Custom `@keyframes focus-ring-pulse` animation in `index.css`
- `@utility debug-border` for development

### Proposed Changes

Create a single file `docs/design.md` that documents all of the above as a living reference. The document will be structured as:

1. Overview and tech stack summary
2. Theme system (themes, switching, FOUC prevention, transitions)
3. Layout structure (layouts, CSS variables, responsive behavior)
4. Shared UI primitives (component inventory with props API)
5. Feature directory structure and naming conventions
6. CSS conventions (Tailwind v4, custom properties, animations)
7. Typography and spacing

### Delivery Plan Mapping

- **Stage 1:** Write the complete `docs/design.md` with all sections.
- **Stage 2:** Update the scope file to mark feature 27 as `done` and tick the Build it checkbox.

# Delivery Steps

### \* Step 1: Create docs/design.md

Write the complete design documentation file that reverse engineers the web app design system from code.

- Document the theme system: 44 themes (34 DaisyUI + 1 custom elixer + 9 premium), theme registry in `web/src/config/themes.ts`, synchronous application via `useAppTheme.ts` with `useLayoutEffect`, FOUC prevention via inline script in `index.html`, and 500ms color transitions.
- Document the layout structure: Default layout (Navbar + Sidebar + TimerModal + Toaster + Outlet), Auth layout, Settings layout, CSS custom properties (--navbar-height, --sidebar-width, --music-player-height), and responsive sidebar behavior (hidden on mobile, hamburger menu).
- Document shared UI primitives: Button, Input, Badge, Spinner, Modal, Skeleton, and ErrorBoundary with their props APIs, variants, and conventions (forwardRef, displayName, barrel export).
- Document feature directory structure: 5 features in `web/src/features/`, subdirectory pattern (components/, hooks/, stores/, **tests**/), PascalCase naming, Index.tsx entry points, and co-located tests.
- Document CSS conventions: TailwindCSS v4 syntax, DaisyUI plugin, custom @theme block, @keyframes focus-ring-pulse, @utility debug-border, and CSS custom properties.
- Document typography: Roboto font family via @theme block.
- Document spacing: CSS custom properties for layout dimensions.

### Step 2: Update scope to mark feature 27 done

Mark the design documentation feature as complete in the scope file.

- Update `docs/scope/web/scope.md` line 29: change feature 27 status from `planned` to `done`.
- Tick the Build it checkbox on line 204: `- [ ] Build it` becomes `- [x] Build it: `/develop design documentation`.
