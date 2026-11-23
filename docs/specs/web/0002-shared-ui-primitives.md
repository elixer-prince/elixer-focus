# 0002 · Shared UI primitives

**Date**: 2026-11-23
**Status**: In Progress

## Summary

Create typed React wrapper components for Button, Input, Badge, and Spinner so features can use consistent, typed components instead of raw DaisyUI class strings. This reduces duplication, makes design changes easier, and provides a single place to control the look and feel of common UI patterns. The Timer settings feature will migrate first to validate the components work in a real form.

## Context

There are no reusable base components like Button, Input, Badge, or Spinner in the web app. Every feature builds its UI from raw DaisyUI classes. For example, buttons use `btn btn-primary btn-xs` or `btn btn-ghost btn-xs`, inputs use `input input-primary input-lg`, and badges use `badge badge-sm badge-secondary badge-soft`. As the app grows, having typed React wrappers for these commonly used patterns would reduce duplication and make design changes easier. A generic Modal component already exists in `web/src/components/ui/Modal.tsx` and establishes the pattern for shared UI components with typed props and variants.

## Requirements

**User stories**:

- As a developer, I want typed Button, Input, Badge, and Spinner components so that I can build UI without memorizing DaisyUI class combinations.
- As a developer, I want consistent variants across components so that the app looks cohesive and design changes are easy to apply globally.

**Acceptance criteria**:

- **AC-1**: Button component supports sizes (xs, sm, md, lg), colors (primary, ghost, outline, secondary, accent, neutral), and states (loading, disabled).
- **AC-2**: Input component supports sizes (sm, md, lg), states (error, disabled, readonly), and props (label, helper text, type).
- **AC-3**: Badge component supports sizes (sm, md), colors (primary, secondary, accent, neutral, info, success, warning, error), and styles (default, soft, outline).
- **AC-4**: Spinner component supports sizes (xs, sm, md, lg), theme colors (primary, secondary, neutral, accent), and works standalone or inside Button loading state.
- **AC-5**: All components use forwardRef and displayName for consistency with the existing Modal pattern.
- **AC-6**: Components are exported from a barrel file at `web/src/components/ui/index.ts`.
- **AC-7**: At least one feature (Timer settings) migrates to use the shared primitives.

## Options considered

### Option 1: Typed wrappers around DaisyUI classes

Create React components that accept typed props and render DaisyUI classes internally. Each component maps props to the appropriate class combinations.

**Pros**:
- Minimal change from current usage. DaisyUI classes still work; components just provide type safety and consistency.
- Easy to migrate feature by feature. Old code continues to work alongside new components.

**Cons**:
- Still dependent on DaisyUI class names internally. Changing to a different UI library would require rewriting components.

### Option 2: Headless components with custom styling

Build components from scratch with no DaisyUI dependency, using Tailwind utilities directly.

**Pros**:
- Full control over styling. No DaisyUI coupling.
- Smaller bundle if DaisyUI classes are not used elsewhere.

**Cons**:
- Reinvents what DaisyUI already provides. More CSS to maintain.
- Breaks visual consistency with existing DaisyUI-styled elements during migration.

### Option 3: Third-party component library

Adopt a component library (e.g., Radix UI, shadcn/ui) instead of building wrappers.

**Pros**:
- Battle-tested components with accessibility built in.
- Large ecosystem and community support.

**Cons**:
- Adds a new dependency and learning curve. May conflict with DaisyUI patterns already in use.
- Overkill for a small app that already has DaisyUI for styling.

## Decision

**Chosen option**: Option 1: Typed wrappers around DaisyUI classes

Create thin, typed React components that wrap DaisyUI class combinations, following the existing Modal component pattern in `web/src/components/ui/Modal.tsx`.

## Feature design

### Component API Surface

#### Button

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "xs" | "sm" | "md" | "lg";
  color?: "primary" | "ghost" | "outline" | "secondary" | "accent" | "neutral";
  loading?: boolean;
  disabled?: boolean;
}
```

- `size`: Maps to DaisyUI size classes (btn-xs, btn-sm, btn-md, btn-lg). Default: md.
- `color`: Maps to DaisyUI color variants (btn-primary, btn-ghost, etc.). Default: primary.
- `loading`: Shows a Spinner inside the button and disables clicks. Default: false.
- `disabled`: Disables the button. Default: false.
- Accepts all native button attributes (onClick, type, children, etc.) via ButtonHTMLAttributes.
- Uses forwardRef to forward refs to the underlying button element.
- Has displayName set to "Button".

#### Input

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: "sm" | "md" | "lg";
  error?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  label?: string;
  helperText?: string;
}
```

- `size`: Maps to DaisyUI size classes (input-sm, input-md, input-lg). Default: md.
- `error`: Styles the input border red when true. Default: false.
- `disabled`: Disables the input. Default: false.
- `readonly`: Makes the input read only. Default: false.
- `label`: Renders a label above the input. Optional.
- `helperText`: Renders helper text below the input. Optional.
- Accepts all native input attributes (type, value, onChange, placeholder, etc.) via InputHTMLAttributes.
- Uses forwardRef to forward refs to the underlying input element.
- Has displayName set to "Input".

#### Badge

```typescript
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md";
  color?: "primary" | "secondary" | "accent" | "neutral" | "info" | "success" | "warning" | "error";
  style?: "default" | "soft" | "outline";
}
```

- `size`: Maps to DaisyUI size classes (badge-sm, badge-md). Default: md.
- `color`: Maps to DaisyUI color variants. Default: primary.
- `style`: Maps to DaisyUI style variants (badge-soft, badge-outline). Default: default.
- Accepts all native span attributes via HTMLAttributes.
- Uses forwardRef to forward refs to the underlying span element.
- Has displayName set to "Badge".

#### Spinner

```typescript
interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: "xs" | "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "neutral" | "accent";
}
```

- `size`: Maps to pixel dimensions (xs: 12px, sm: 16px, md: 24px, lg: 32px). Default: md.
- `color`: Maps to CSS variable colors (text-primary, text-secondary, etc.). Default: primary.
- Renders an SVG spinner animation.
- Accepts all native SVG attributes via SVGProps.
- Uses forwardRef to forward refs to the underlying SVG element.
- Has displayName set to "Spinner".

### File Structure

```
web/src/components/ui/
  Button.tsx
  Input.tsx
  Badge.tsx
  Spinner.tsx
  index.ts          (barrel export)
  Modal.tsx          (existing)
```

### Build Plan

1. Create Spinner component with size and color variants, satisfies **AC-4**
2. Create Button component with size, color, loading, and disabled variants; uses Spinner for loading state, satisfies **AC-1**, **AC-5**
3. Create Input component with size, error, disabled, readonly, label, and helperText props, satisfies **AC-2**, **AC-5**
4. Create Badge component with size, color, and style variants, satisfies **AC-3**, **AC-5**
5. Create barrel export at `web/src/components/ui/index.ts`, satisfies **AC-6**
6. Migrate Timer settings to use Button and Input primitives, satisfies **AC-7**

### Critical Test Scenarios

- Happy path: Render a Button with size="xs" and color="primary" and verify it has the correct DaisyUI classes, verifies **AC-1**
- Loading state: Render a Button with loading=true and verify it shows a Spinner and is disabled, verifies **AC-1**
- Error state: Render an Input with error=true and verify it has red border styling, verifies **AC-2**
- Badge variants: Render a Badge with color="success" and style="soft" and verify correct classes, verifies **AC-3**
- Spinner standalone: Render a Spinner with size="lg" and color="secondary" and verify correct dimensions and color, verifies **AC-4**
- Ref forwarding: Create a Button with a ref and verify the ref points to the underlying button element, verifies **AC-5**
- Barrel export: Import Button from @/components/ui and verify it resolves correctly, verifies **AC-6**
- Migration: Timer settings uses Input and Button from shared primitives and renders correctly, verifies **AC-7**

## Consequences

**Positive**:
- Features can use typed components instead of raw class strings, reducing duplication.
- Design changes (e.g., button sizing, input styling) can be made in one place.
- Type safety catches invalid variant combinations at compile time.

**Negative / tradeoffs**:
- Adds an abstraction layer over DaisyUI. Developers need to learn the component API.
- Migration is incremental. Old and new code will coexist until all features migrate.
- Components are coupled to DaisyUI class names internally. Switching UI libraries would require rewriting.

**Neutral**:
- New developers need to reference the component API instead of DaisyUI docs for common patterns.
- The barrel export adds an import path (@/components/ui) alongside direct imports.

## Migration Plan

**Strategy**: strangler

**Phases**:

1. Build the four primitives and confirm they typecheck and render correctly.
2. Migrate Timer settings (FocusContainer, ShortBreakContainer, LongBreakContainer, and the save/reset buttons) to use Input and Button.
3. Verify Timer settings still works correctly after migration.
4. Future features use the primitives by default. Existing features migrate gradually.

**Rollback**: Revert the migration commit. Old DaisyUI class usage remains in place until the next migration.

**Risks**: Timer settings may have edge cases (e.g., validation error states) not covered by the initial Input variant set. The build may need to add props if migration reveals gaps.

## Rationale

Option 1 is the right choice because the project already uses DaisyUI extensively. Building typed wrappers around existing classes is the lowest risk path: it adds type safety and consistency without changing the underlying styling. The Modal component in `web/src/components/ui/Modal.tsx` already establishes the pattern for shared UI components with typed props and variants, so the team has a reference. Option 2 would reinvent DaisyUI functionality and break visual consistency during migration. Option 3 adds unnecessary complexity and a new dependency for an app that already has a working styling system.

## Follow-up

- [ ] Consider migrating other features (Task editing, Notification status) to use the shared primitives in subsequent runs of `/develop`.
- [ ] Evaluate whether Card, Avatar, Select, and Checkbox primitives are needed as the app grows.
- [ ] Update root AGENTS.md `## Critical Patterns` to mention the shared UI primitives and the barrel export path.
