---
sessionId: session-261123-033126-1gxa
---

# Requirements

## Overview & Goals

Create typed React wrapper components for Button, Input, Badge, and Spinner so features can use consistent, typed components instead of raw DaisyUI class strings. This reduces duplication, makes design changes easier, and provides a single place to control the look and feel of common UI patterns.

## User Stories

- As a developer, I want typed Button, Input, Badge, and Spinner components so that I can build UI without memorizing DaisyUI class combinations.
- As a developer, I want consistent variants across components so that the app looks cohesive and design changes are easy to apply globally.

## Acceptance Criteria

- **AC-1**: Button component supports sizes (xs, sm, md, lg), colors (primary, ghost, outline, secondary, accent, neutral), and states (loading, disabled).
- **AC-2**: Input component supports sizes (sm, md, lg), states (error, disabled, readonly), and props (label, helper text, type).
- **AC-3**: Badge component supports sizes (sm, md), colors (primary, secondary, accent, neutral, info, success, warning, error), and styles (default, soft, outline).
- **AC-4**: Spinner component supports sizes (xs, sm, md, lg), theme colors (primary, secondary, neutral, accent), and works standalone or inside Button loading state.
- **AC-5**: All components use forwardRef and displayName for consistency with the existing Modal pattern.
- **AC-6**: Components are exported from a barrel file at `web/src/components/ui/index.ts`.
- **AC-7**: At least one feature (Timer settings) migrates to use the shared primitives.

## Scope

**In Scope**: Button, Input, Badge, Spinner components with typed props. Barrel export. Timer settings migration.

**Out of Scope**: Card, Avatar, Select, Checkbox components. Migration of other features (to follow later).

# Technical Design

## Current Implementation

No reusable base components exist. Every feature uses raw DaisyUI classes:

- Buttons: `btn btn-primary btn-xs`, `btn btn-ghost btn-xs`, `btn btn-sm btn-ghost` (found in Modal.tsx, Task/Index.tsx, NotificationStatus.tsx, TaskPageHeader.tsx)
- Inputs: `input input-primary input-lg` (found in FocusContainer.tsx, ShortBreakContainer.tsx, LongBreakContainer.tsx)
- Badges: `badge badge-sm badge-secondary badge-soft` (found in MusicSwitcher/Option.tsx)
- Spinner: does not exist yet

The Modal component at `web/src/components/ui/Modal.tsx` establishes the pattern: typed props, variants, forwardRef, displayName.

## Key Decisions

- **Typed wrappers around DaisyUI** rather than headless components or third-party library. Minimal change, reuses existing styling, easy to migrate incrementally.
- **forwardRef + displayName** on all components to match the Modal pattern and enable ref forwarding for focus management.
- **Barrel export** from `ui/index.ts` for clean imports (`@/components/ui`).
- **Timer settings** as the first migration target. It uses Input (3 fields) and Button (save/reset), providing a real form validation scenario.

## Proposed Changes

### Button (`web/src/components/ui/Button.tsx`)

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "xs" | "sm" | "md" | "lg";
  color?: "primary" | "ghost" | "outline" | "secondary" | "accent" | "neutral";
  loading?: boolean;
}
```

Maps size to btn-xs/btn-sm/btn-md/btn-lg. Maps color to btn-primary/btn-ghost/etc. Loading shows a Spinner inside and disables clicks. Default size: md, color: primary.

### Input (`web/src/components/ui/Input.tsx`)

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: "sm" | "md" | "lg";
  error?: boolean;
  label?: string;
  helperText?: string;
}
```

Maps size to input-sm/input-md/input-lg. Error styles the border red. Label renders above, helperText below. Default size: md.

### Badge (`web/src/components/ui/Badge.tsx`)

```typescript
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md";
  color?:
    | "primary"
    | "secondary"
    | "accent"
    | "neutral"
    | "info"
    | "success"
    | "warning"
    | "error";
  style?: "default" | "soft" | "outline";
}
```

Maps size to badge-sm/badge-md. Maps color and style to DaisyUI variants. Default size: md, color: primary.

### Spinner (`web/src/components/ui/Spinner.tsx`)

```typescript
interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: "xs" | "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "neutral" | "accent";
}
```

Renders an SVG spinner animation. Size maps to pixel dimensions (xs: 12px, sm: 16px, md: 24px, lg: 32px). Color maps to CSS variables (text-primary, etc.). Default size: md, color: primary.

### Barrel Export (`web/src/components/ui/index.ts`)

Re-exports all UI components from a single file for clean imports.

### Migration: Timer Settings

Replace raw DaisyUI classes in FocusContainer, ShortBreakContainer, LongBreakContainer, and the save/reset buttons with Button and Input from the shared primitives.

## File Structure

```
web/src/components/ui/
  Button.tsx       (new)
  Input.tsx        (new)
  Badge.tsx        (new)
  Spinner.tsx      (new)
  index.ts         (new - barrel export)
  Modal.tsx        (existing)
```

## Migration Plan

**Strategy**: strangler — build primitives first, then migrate Timer settings incrementally.

1. Build Spinner (no dependencies)
2. Build Button (depends on Spinner for loading state)
3. Build Input (independent)
4. Build Badge (independent)
5. Create barrel export
6. Migrate Timer settings to use Input and Button

**Rollback**: Revert the migration commit. Old DaisyUI class usage remains.

**Risks**: Timer settings may reveal gaps in the Input variant set (e.g., validation edge cases). The build may need to add props if migration uncovers them.

# Delivery Steps

### ✓ Step 1: Write the spec file

Create docs/specs/web/0002-shared-ui-primitives.md with the complete spec including all component API surfaces, prop interfaces, build plan, and migration strategy.

### ✓ Step 2: Confirm spec and update scope

Present the spec for user confirmation. On approval, update docs/scope/web/scope.md to link the spec, tick the design decision box, and add build milestones for the Timer settings migration.
