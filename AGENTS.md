# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Structure

This is a monorepo with 3 distinct applications:

- `web/` - React 19 + Vite web app (primary focus)
- `app/` - Expo (React Native) mobile app
- `backend/` - Laravel 12 PHP API

## Build approach

Skateboard (MVP first; ship the thinnest usable whole, then grow).

## Commands (Non-Standard)

### Root (Monorepo)

```bash
npm run lint            # Lint web and app
npm run lint:web        # Lint web only
npm run lint:app        # Lint app only
npm run test            # Run web tests
npm run test:web        # Run web tests only
npm run test:backend    # Run backend tests
npm run format          # Prettier write all files
npm run format:check    # Prettier check all files
```

### Web App

```bash
cd web && npm run test        # Run all tests with vitest
cd web && npm run test -- --run  # Single test run (no watch)
cd web && npm run coverage     # Generate HTML coverage report
cd web && npm run lint         # ESLint check
cd web && npm run format       # Prettier write
cd web && npm run format:check # Prettier check
cd web && npx playwright test  # Run E2E tests with Playwright
cd web && npm run build        # Full build with forced type check (tsc -b --force)
```

### Backend

```bash
cd backend && composer test   # Runs phpunit with config:clear
cd backend && composer dev     # Runs 4 services: artisan serve, queue, logs, vite
```

### App (Expo)

```bash
cd app && npm run start        # Start Expo
cd app && npm run android      # Run on Android
cd app && npm run web           # Run web version
```

## Critical Patterns

- **Path Aliases**: Both `web/` and `app/` use `@/*` alias. In web, `@/*` maps to `web/src/*`. In app, `@/*` maps to `app/*`.
- **Co-located Tests**: Test files in `web/src/features/*/` are in `__tests__/` subdirectories next to source files (not separate test folder)
- **Shared UI Primitives**: Typed React wrappers for Button, Input, Badge, Spinner, Skeleton, and ErrorBoundary at `web/src/components/ui/`. Import from the barrel `@/components/ui`. All use `forwardRef` and `displayName`. Input uses `inputSize` prop instead of `size` to avoid conflict with native `InputHTMLAttributes.size`. Skeleton uses `animate-pulse` with `role="status"` for accessible loading placeholders. ErrorBoundary is a class component that catches render errors with a fallback UI showing refresh and go-home actions. Spec [0002](docs/specs/web/0002-shared-ui-primitives.md).
- **Error Handling**: Global `ErrorBoundary` wraps all three route groups in `router.tsx`. API errors are handled by an axios interceptor in `web/src/config/axios.ts` that shows contextual toasts (401 session expired, server errors, network errors). Components can use the `useErrorToast` hook from `web/src/hooks/useErrorToast.ts` for unified error display via react-hot-toast.
- **TailwindCSS v4**: Uses `@import "tailwindcss"` in CSS, NOT `@tailwind` directives
- **Zustand Stores**: Use `persist` middleware with `createPersistOptions()` from `@/stores/persist-config`; import stores from the central barrel `@/stores`. Stores with nested array state (tasks, session history, journal) use `immer` middleware for direct draft mutations.
- **Markdown Editor**: The Journal uses `@atomic-editor/editor` (CodeMirror 6) with Obsidian-style inline live preview. Content is stored as Markdown strings via `onMarkdownChange` callback. Use `documentId` prop to force remount when switching dates. Import CSS: `import "@atomic-editor/editor/styles.css"`. Spec [0003](docs/specs/web/0003-journal.md).
- **Calendar**: The Journal uses react-day-picker v10 with a custom `MonthCaption` component for navigation arrows flanking the month name. Use `hideNavigation` prop and `useDayPicker()` hook for navigation. Import `subMonths`/`addMonths` from `date-fns`.
- **Charts**: The Journal uses Chart.js v4 with `react-chartjs-2` for bar charts. Register scales and elements via `Chart.register()`. Use CSS variable colors (e.g., `var(--bc)`) for theme-aware styling.
- **Session Reflection Trigger**: The session history store exposes `lastCompletedSession` (set by `addSession()`) and `clearLastCompletedSession()`. The `SessionReflectionModal` component in the layout files subscribes via `useLastCompletedSession()` and opens the reflection modal automatically on every page. The flag is cleared when the modal closes.
- **Design System**: Documented in [docs/design.md](docs/design.md) — theme system, layout structure, shared UI primitives, feature directory structure, CSS conventions, and more.
- **Theme System**: Themes located in `web/src/app/themes/` with DaisyUI themes in `default/daisyui/`. Central theme registry in `web/src/config/themes.ts` exports `allThemes` (array of ThemeInfo with value, label, and category) and `validThemeNames` (Set). Import from there instead of hardcoding theme lists.
- **FOUC Prevention**: `index.html` inline CSS hides the body (`opacity: 0`) until React startup effects restore the timer and set the theme, then `provider.tsx` adds the `app-ready` class. Theme is set synchronously via `useLayoutEffect` in `useAppTheme.ts` (not `useEffect`). An inline script in `<head>` reads the stored theme from localStorage before CSS loads.
- **Theme Transitions**: All theme-related color transitions use `duration-500` (500ms) across layout areas. Timer animations retain `duration-1000`.
- **API Client**: Axios instance in `web/src/config/axios.ts` with automatic Bearer token injection from localStorage
- **API Response Envelope**: Every API response uses a consistent JSON envelope with `success`, `data`, and `message` fields. The Laravel backend provides an `ApiResponse` trait at `backend/app/Http/Controllers/ApiResponse.php` with `success()`, `error()`, and `paginated()` methods. The frontend defines matching TypeScript types at `web/src/types/api.ts`: `ApiResponse<T>`, `ApiErrorResponse`, and `PaginatedResponse<T>`. The Axios interceptor rejects responses where `success` is `false` and types error messages via `ApiErrorResponse`. Spec [0001](docs/specs/_root/0001-api-response-envelope.md).
- **Testing Setup**: `web/src/testing/setup.ts` includes ResizeObserver mock (required for component tests)
- **Mock Refs in Tests**: When mocking React refs in TypeScript tests, always annotate the mock ref type explicitly (e.g., `{ current: null as YTPlayer | null }` or `{ current: null as HTMLDivElement | null }`). Without explicit typing, TypeScript infers `{ current: null }` as type `null`, which rejects any later assignment of non-null values. When mocking context providers, ensure all properties defined in the context type are present in the mock value.
- **Markdown Editor in Tests**: Mock `@atomic-editor/editor` in component tests. The editor is a controlled component; pass `markdownSource` and `onMarkdownChange` as controlled props. Test the component shell, not editor internals.
- **Drag and Drop**: Uses `@dnd-kit/react` v9 with `@dnd-kit/helpers`. Import event types from `@dnd-kit/dom` (not `@dnd-kit/abstract`) and use `Parameters<DragOverEvent>[0]` / `Parameters<DragEndEvent>[0]` for handler signatures. Task reordering uses `groupByCategory` + `move` + `flattenTasks` pattern in both `Tasks.tsx` and `Index.tsx` (home page).
- **E2E Testing**: Playwright runs against `localhost:5173` with Firefox browser. Config in `web/playwright.config.ts`. E2E tests in `web/e2e/` are excluded from Vitest via `vite.config.ts`. On CI, `page.evaluate()` requires `page.goto("/")` before accessing localStorage in Firefox.
- **Browser Throttle Prevention**: The countdown timer uses Web Audio API (`usePreventTabThrottling` hook) to play a nearly silent oscillator (0.001 volume, 220 Hz) while the timer runs. This keeps the tab exempt from browser throttling in background tabs and power-saving modes, so `setInterval` fires normally and the end beep plays automatically.
- **Desktop Notifications**: The countdown timer sends OS-level notifications when it ends via the Web Notification API (`useNotification` hook). Permission is requested on timer start. The notification title and body include the session type (e.g., "Focus", "Short Break", "Long Break") via the `sessionType` parameter. The `tag` option deduplicates notifications, and `onclick` focuses the window. A `NotificationStatus` component shows warnings when notifications are disabled and error messages when they fail. OS-specific settings instructions are provided by `getNotificationSettingsInstruction()` in `web/src/utils/browser.ts`.
- **Focus Ring Pulse**: The countdown timer focus ring pulses via a CSS `@keyframes` animation (`focus-ring-pulse` in `index.css`) while the timer runs. Components conditionally apply the `focus-ring-pulse` class and omit the inline `filter` style using spread (`...(isPulsing ? {} : { filter: "..." })`) so CSS animations take over. Setting `filter: undefined` in React still renders the property, blocking animations.

## Code Style

- Tab width: 2 spaces
- TypeScript strict mode enabled
- ESLint: react-hooks + react-refresh plugins, plus no-console (warn), no-duplicate-imports (error), unused-vars with underscore ignore pattern
- Prettier with tailwindcss plugin (root config at `.prettierrc.json`, app config at `app/.prettierrc.json`)
- Commit messages: conventional commit format (enforced by husky + commitlint)
- Pre-commit hook runs `lint-staged` (Prettier on staged files only)

## Gotchas

- Backend tests use in-memory SQLite (configured in phpunit.xml)
- Web vitest requires globals: true and jsdom environment
- E2E tests in `web/e2e/` are excluded from Vitest; run them with `npx playwright test`
- Playwright e2e tests run on GitHub Actions (Ubuntu) via `.github/workflows/playwright.yaml` on push to main/alpha/beta
- **Lint & TypeCheck CI** runs on push and PR via `.github/workflows/lint-typecheck.yaml` on main/alpha/beta, linting web and app, type checking web, and checking Prettier format
- **Playwright does not run locally on macOS 12** — Playwright dropped support for macOS 12 (Monterey). Do not attempt to install Playwright browsers or run E2E tests locally. E2E tests only run on CI. Once the local macOS version is upgraded, local Playwright will work again.
- **TypeScript incremental build cache hides errors** — `tsc -b` uses `.tsbuildinfo` cache files and may skip type-checking files it considers unchanged. The build script uses `tsc -b --force` to always check all files. If you run `tsc -b` without `--force` locally, you may miss type errors that Vercel catches on fresh builds.
- **Mock type assertions in tests** — When mocking DOM types like `HTMLDialogElement` in tests, use `as unknown as Type` instead of `as Type` to satisfy strict TypeScript checking. Follow the pattern in `web/src/testing/setup.ts` and existing test files.
- **HTMLDialogElement mocks in tests** — jsdom does not support `showModal()` or `close()` on `<dialog>` elements. Mocks are provided in `web/src/testing/setup.ts`; components using native dialog methods will work in tests without additional setup.
- Laravel backend requires `composer install` and `php artisan key:generate` before first run
- App uses expo-router with file-based routing in `app/app/` directory

## Agent skills

- [playwright-cli](.agents/skills/playwright-cli/): microsoft/playwright-cli, Playwright CLI conventions and best practices
- [playwright-dev](.agents/skills/playwright-dev/): microsoft/playwright, Playwright development internals
- [playwright-best-practices](.agents/skills/playwright-best-practices/): currents-dev/playwright-best-practices-skill, E2E testing best practices
