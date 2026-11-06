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

### Web App

```bash
cd web && npm run test        # Run all tests with vitest
cd web && npm run test -- --run  # Single test run (no watch)
cd web && npm run coverage     # Generate HTML coverage report
cd web && npm run lint         # ESLint check
cd web && npm run format       # Prettier write
cd web && npm run format:check # Prettier check
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
- **TailwindCSS v4**: Uses `@import "tailwindcss"` in CSS, NOT `@tailwind` directives
- **Zustand Stores**: Use `persist` middleware; import stores from `stores/` directory
- **Theme System**: Themes located in `web/src/app/themes/` with DaisyUI themes in `default/daisyui/`
- **FOUC Prevention**: `index.html` inline CSS hides the body (`opacity: 0`) until React mounts and adds `app-ready` class in `app.tsx`. Theme is set synchronously via `useLayoutEffect` in `useAppTheme.ts` (not `useEffect`). An inline script in `<head>` reads the stored theme from localStorage before CSS loads.
- **Theme Transitions**: All theme-related color transitions use `duration-500` (500ms) across layout areas. Timer animations retain `duration-1000`.
- **API Client**: Axios instance in `web/src/config/axios.ts` with automatic Bearer token injection from localStorage
- **Testing Setup**: `web/src/testing/setup.ts` includes ResizeObserver mock (required for component tests)
- **Mock Refs in Tests**: When mocking React refs in TypeScript tests, always annotate the mock ref type explicitly (e.g., `{ current: null as YTPlayer | null }` or `{ current: null as HTMLDivElement | null }`). Without explicit typing, TypeScript infers `{ current: null }` as type `null`, which rejects any later assignment of non-null values. When mocking context providers, ensure all properties defined in the context type are present in the mock value.

## Code Style

- Tab width: 2 spaces
- TypeScript strict mode enabled
- ESLint: react-hooks + react-refresh plugins
- Prettier with tailwindcss plugin
- Commit messages: conventional commit format (enforced by husky + commitlint)

## Gotchas

- Backend tests use in-memory SQLite (configured in phpunit.xml)
- Web vitest requires globals: true and jsdom environment
- Laravel backend requires `composer install` and `php artisan key:generate` before first run
- App uses expo-router with file-based routing in `app/app/` directory
