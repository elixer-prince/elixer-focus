# Design System

This document records the design system, component conventions, and visual direction for the Elixer Focus web app. Use it as a living reference when adding new features or components.

**Source:** `extracted-from-code`

## Character

Elixer Focus is a calm, focused productivity workspace. Its interface is structured and practical, with clear hierarchy, quiet supporting details, and restrained use of the theme accent. The visual language should make progress and next actions easy to understand without adding decoration that competes for attention.

## Build mandate

Extend the existing application shell and feature layouts instead of introducing a new visual language. Use the existing theme system for every color and keep all surfaces legible across the supported themes. Group related information into clear sections, use concise product specific copy, and preserve the responsive behavior of the surrounding page.

## Component & usage rules

Use the shared UI primitives for common controls. Follow the established card composition with theme driven surfaces, rounded corners, and clear section headings. Use the primary theme color to identify important actions or data, and use muted content colors for supporting text. Charts must read their colors from the active theme. Use the existing `duration-500` color transition convention, and do not rely on color alone to communicate meaning.

## Tech Stack

- **Framework:** React 19 with Vite
- **Routing:** react-router with file-based layout groups
- **Styling:** TailwindCSS v4 with DaisyUI
- **State:** Zustand with persist and immer middleware
- **Language:** TypeScript strict mode
- **Fonts:** Roboto via Google Fonts

## Theme System

### Theme Registry

The central theme registry lives in `web/src/config/themes.ts`. It exports:

- `allThemes` — an array of `ThemeInfo` objects with `value`, `label`, and `category` fields
- `validThemeNames` — a `Set` of all valid theme names for validation

Import from this file instead of hardcoding theme lists.

### Theme Inventory

The app supports 44 themes total:

- **34 DaisyUI themes** — loaded from `web/src/app/themes/default/daisyui/`
- **1 custom theme** — `elixer`, defined in `web/src/app/themes/default/elixer.css`
- **9 premium themes** — located in `web/src/app/themes/premium/`

Themes are organized by category in the theme settings page: default, custom, and premium.

### Theme Switching

The `useAppTheme` hook in `web/src/hooks/useAppTheme.ts` handles theme application:

- Validates theme names against `validThemeNames` before applying
- Uses `useLayoutEffect` (synchronous, not `useEffect`) to prevent flash of unstyled content
- Applies themes by setting the `data-theme` attribute on the document root
- The theme store (`web/src/stores/theme.ts`) persists the current theme via Zustand persist middleware

### FOUC Prevention

Flash of Unstyled Content is prevented through three mechanisms:

1. An inline CSS rule in `index.html` hides the body (`opacity: 0`) until React mounts
2. An inline script in `<head>` reads the stored theme from localStorage before CSS loads
3. `app.tsx` adds the `app-ready` class after React mounts, restoring opacity

### Theme Transitions

All theme-related color transitions use `duration-500` (500ms) across layout areas. Timer animations retain `duration-1000` for a smoother countdown experience.

## Layout Structure

### Layout Components

Five layout components define the app structure:

- **Default** (`web/src/app/layout/Default.tsx`) — main layout with Navbar, Sidebar, TimerModal, Toaster, and `<Outlet />`
- **Auth** (`web/src/app/layout/Auth.tsx`) — centered layout for login and signup pages
- **Settings** (`web/src/app/layout/Settings.tsx`) — settings pages layout with Toaster
- **Error** (`web/src/app/layout/Error.tsx`) — error page layout
- **Onboarding** (`web/src/app/layout/Onboarding.tsx`) — onboarding flow layout

### CSS Custom Properties

The layout uses CSS custom properties for dimensions:

- `--navbar-height: 5rem` — main navigation bar height
- `--sidebar-width: 14rem` — sidebar width when open
- `--music-player-height: 4rem` — floating music player height

### Responsive Behavior

The sidebar is hidden on mobile and toggled via a hamburger menu in the navbar. The main content area fills the remaining space after accounting for the sidebar width on desktop.

## Shared UI Primitives

All shared components live in `web/src/components/ui/` and are exported from the barrel file `index.ts`. Import from `@/components/ui`. Every component uses `forwardRef` and sets `displayName`.

### Button

Typed wrapper around native button elements with consistent variants.

- **Sizes:** `xs`, `sm`, `md`, `lg`
- **Colors:** `primary`, `ghost`, `outline`, `secondary`, `accent`, `neutral`
- **States:** Loading state shows a `Spinner` instead of the label
- **Props:** Extends `ButtonHTMLAttributes<HTMLButtonElement>`

### Input

Typed wrapper around native input elements with label and helper text support.

- **Sizes:** `sm`, `md`, `lg` via `inputSize` prop (not `size` to avoid conflict with native `InputHTMLAttributes.size`)
- **States:** Error state shows red border and helper text
- **Props:** `label`, `helperText`, `error`, `inputSize`, extends `InputHTMLAttributes<HTMLInputElement>`

### Badge

Small label component for status indicators and tags.

- **Sizes:** `sm`, `md`
- **Colors:** 8 color options matching the design system
- **Variants:** `default`, `soft`, `outline`

### Spinner

Loading indicator with size and color variants.

- **Sizes:** `xs`, `sm`, `md`, `lg`
- **Colors:** `primary`, `secondary`, `neutral`, `accent`

### Modal

Generic modal dialog using the native `<dialog>` element.

- **Sizes:** `sm`, `md`, `lg`
- **Features:** Backdrop click to close, Escape key dismissal, external ref support
- **Props:** `title`, `children`, `onClose`, `size`, `ref`

### Skeleton

Loading placeholder with accessible pulse animation.

- Uses `animate-pulse` class
- Sets `role="status"` for screen readers
- Optional animation toggle via prop

### ErrorBoundary

Class component that catches React render errors and shows a fallback UI.

- **Actions:** Refresh page and Go Home buttons
- Wraps all three route groups in `router.tsx`

## Feature Directory Structure

Features live in `web/src/features/` with five current features:

1. **countdown-timer** — adaptive pomodoro timer
2. **music-player** — YouTube music playback
3. **settings** — timer and theme configuration
4. **tasks** — Eisenhower matrix with drag and drop
5. **ui** — shared navigation (Navbar, Sidebar)

### Subdirectory Pattern

Each feature follows this structure:

- `components/` — React components
- `hooks/` — custom React hooks
- `stores/` — Zustand stores
- `__tests__/` — co-located test files
- `assets/` — feature-specific assets (as needed)

### Naming Conventions

- Components use PascalCase
- Each component group has an `Index.tsx` as its entry point
- Tests are co-located in `__tests__/` subdirectories next to source files
- Feature directories use kebab-case

## CSS Conventions

### TailwindCSS v4

- Uses `@import "tailwindcss"` in CSS files, not `@tailwind` directives
- DaisyUI plugin configured with `themes: all`
- Custom `@theme` block defines the Roboto font family

### Custom Animations

- `@keyframes focus-ring-pulse` in `index.css` — pulses the focus ring while the timer runs
- Components conditionally apply the `focus-ring-pulse` class
- When pulsing, components omit the inline `filter` style so CSS animations take over

### Development Utilities

- `@utility debug-border` — adds a visible border for layout debugging during development

### CSS Custom Properties

Layout dimensions are defined as CSS custom properties rather than hardcoded values. See the Layout Structure section for the full list.

## Typography

The app uses the Roboto font family, defined via the TailwindCSS v4 `@theme` block in `index.css`. The font is loaded from Google Fonts in `index.html`.

## Spacing

Spacing and layout dimensions use CSS custom properties defined in the layout components. The navbar, sidebar, and music player heights are centralized so changes propagate consistently.

## Error Handling

### Global Error Boundary

The `ErrorBoundary` component wraps all route groups in `router.tsx`. It catches render-time errors and displays a fallback UI with Refresh and Go Home actions.

### API Error Toasts

An axios interceptor in `web/src/config/axios.ts` handles API errors:

- 401 responses show a "session expired" toast
- Server errors (5xx) show a generic server error toast
- Network errors show a connection error toast

Components can use the `useErrorToast` hook from `web/src/hooks/useErrorToast.ts` for unified error display via react-hot-toast.

## Drag and Drop

The task matrix uses `@dnd-kit/react` v9 with `@dnd-kit/helpers`:

- Event types are imported from `@dnd-kit/dom`
- Handler signatures use `Parameters<DragOverEvent>[0]` and `Parameters<DragEndEvent>[0]`
- Task reordering uses the pattern: `groupByCategory` → `move` → `flattenTasks`

## Browser Throttle Prevention

The countdown timer uses the Web Audio API via the `usePreventTabThrottling` hook to play a nearly silent oscillator (0.001 volume, 220 Hz) while the timer runs. This keeps the tab exempt from browser throttling in background tabs and power-saving modes, so `setInterval` fires normally and the end beep plays automatically.

## Desktop Notifications

The countdown timer sends OS-level notifications when it ends via the Web Notification API (`useNotification` hook):

- Permission is requested on timer start
- The notification title and body include the session type (Focus, Short Break, Long Break)
- The `tag` option deduplicates notifications
- `onclick` handler focuses the window
- A `NotificationStatus` component warns when notifications are disabled
