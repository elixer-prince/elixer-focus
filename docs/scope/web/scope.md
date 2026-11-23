# Scope: Elixer Focus System (web)

A focus and productivity web app: an adaptive pomodoro timer, an Eisenhower task matrix, and a music player, built to entice the user to complete tasks. Solo dev learning project, free, no deadline; the gamified and social vision is deferred to later slices.

**Build approach:** Skateboard (MVP first; ship the thinnest usable whole, then grow).
**Workflow:** Prototype (just /develop, no separate verify or test steps). Fastest path for infrastructure work. Project default level of rigor.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use /develop and skip /architect. You decide when a feature is done._

## At a glance

| #   | Feature                            | Phase                 | Status      |
| --- | ---------------------------------- | --------------------- | ----------- |
| 1   | Stack & architecture               | Foundation            | existing    |
| 2   | Coding standards & tooling         | Foundation            | existing    |
| 3   | Design system & UI foundation      | Foundation            | existing    |
| 4   | Data model & local persistence     | Foundation            | existing    |
| 29  | Store persist versioning           | Foundation            | done        |
| 30  | Countdown volatile state cleanup   | Foundation            | done        |
| 31  | Task updatedAt tracking            | Foundation            | done        |
| 33  | Session history and statistics     | Foundation            | done        |
| 20  | Zustand store improvements         | Foundation            | done        |
| 25  | Reusable Modal component           | Foundation            | done        |
| 26  | Shared UI primitives               | Foundation            | done        |
| 24  | Theme validation fix               | Foundation            | done        |
| 28  | Console log cleanup                | Foundation            | done        |
| 22  | Error handling and loading         | Foundation            | done        |
| 23  | Performance audit                  | Foundation            | done        |
| 27  | Design documentation               | Foundation            | done        |
| 21  | API response types                 | Foundation            | done        |
| 5   | Countdown timer (adaptive pomodoro) | Slice 1 (core loop)   | existing    |
| 6   | Music player                       | Slice 1 (core loop)   | existing    |
| 7   | Task matrix (Eisenhower)           | Slice 1 (core loop)   | existing    |
| 18  | Task editing (inline)              | Slice 1 (core loop)   | done        |
| 8   | Timer settings                     | Slice 2 (settings)    | done        |
| 32  | Timer keyboard shortcuts           | Slice 2 (settings)    | cancelled   |
| 9   | Theme settings                     | Slice 2 (settings)    | done        |
| 35  | Music player custom playlist       | Slice 2 (settings)    | done        |
| 36  | Music player progress display      | Slice 2 (settings)    | done        |
| 40  | Music player song validation       | Slice 2 (settings)    | done        |
| 41  | Music player default song fix      | Slice 2 (settings)    | done        |
| 42  | Music player live stream fix       | Slice 2 (settings)    | done        |
| 43  | Music player duplicate songs fix   | Slice 2 (settings)    | done        |
| 44  | Music player dedup migration fix   | Slice 2 (settings)    | done        |
| 10  | Journal                            | Slice 3 (pages)       | in-progress |
| 11  | Profile                            | Slice 3 (pages)       | in-progress |
| 12  | Calendar                           | Slice 3 (pages)       | in-progress |
| 13  | Brain dump (Bin)                   | Slice 3 (pages)       | in-progress |
| 19  | Subtasks (nested)                  | Slice 3 (pages)       | planned     |
| 37  | Task search and filtering          | Slice 3 (pages)       | planned     |
| 38  | Task completion animation and archive | Slice 3 (pages)   | planned     |
| 39  | Task due dates and priority        | Slice 3 (pages)       | planned     |
| 34  | Adaptive duration logic            | Slice 3 (pages)       | planned     |
| 14  | Auth (login/signup)                | Slice 4 (auth)        | in-progress |
| 15  | Onboarding flow                    | Slice 4 (auth)        | in-progress |
| 16  | Gamification & streaks             | Slice 5 (future)      | planned     |
| 17  | Social features                    | Slice 5 (future)      | planned     |

## Foundations

### 1. Stack & architecture · existing

React 19 + Vite scaffold with react-router, providers, and layouts; boots locally.

code in `web/`

### 2. Coding standards & tooling · existing

ESLint, Prettier, Husky, commitlint, and Vitest wired up for the web app. Improved with lint-staged for pre-commit formatting, stricter ESLint rules (no-console warnings, no-duplicate-imports, unused-vars with underscore ignore), type-aware parsing for e2e files, root-level scripts covering web and app linting, Prettier config for app/, and a CI workflow for lint and type-check on push and PR.

code in `web/`, `.husky/`, `.github/workflows/`

### 3. Design system & UI foundation · existing

TailwindCSS v4, DaisyUI themes, shared UI components, navbar, sidebar, modals, toasts.

code in `web/src/features/ui/`, `web/src/app/themes/`

### 4. Data model & local persistence · existing

Zustand stores with persist middleware for tasks, countdown state, settings, and theme.

code in `web/src/stores/`, `web/src/features/*/stores/`

### 29. Store persist versioning · done

Six of seven persisted stores have no version or migration handler. If the data model changes (e.g., adding a field to Task), old localStorage data will deserialize without migration, potentially producing undefined values. Only the music player store uses version and migrate.

**Done when:** all persisted stores declare a version number and provide a migrate function so model changes do not corrupt existing data.

code in `web/src/stores/`, `web/src/features/*/stores/`

- [x] Build it: `/develop store persist versioning`
- [x] Test it: `/test store persist versioning`

### 30. Countdown volatile state cleanup · done

The countdown store persists timerRunning, timerPaused, remainingTimeInSeconds, and elapsedTimeInSeconds. These are volatile runtime values that can produce an inconsistent state on page reload (e.g., timerRunning is true but the interval is not actually running). The Countdown provider already saves timerEndTime to localStorage separately for tab throttle resilience.

**Done when:** the countdown store excludes volatile runtime fields from persistence using partialize, so only stable configuration data is persisted.

code in `web/src/features/countdown-timer/stores/countdown-store.ts`

- [x] Build it: `/develop countdown volatile state cleanup`

### 31. Task updatedAt tracking · done

The Task type has createdAt but no updatedAt. With inline editing (feature 18) and planned subtasks (feature 19), tracking when a task was last modified is useful for sync, audit, or sorting purposes.

**Done when:** Task type includes updatedAt, the store updates it on every mutation, and the matrix displays or sorts by it where appropriate.

code in `web/src/features/tasks/types/task.ts`, `web/src/features/tasks/stores/tasks-store.ts`, `web/src/features/tasks/components/Task/Index.tsx`, `web/src/utils/date.ts`

- [x] Build it: `/develop task updatedAt tracking`

### 33. Session history and statistics · done

Store completed sessions with timestamp, type, and duration in the session store. This enables the Journal feature to display daily focus stats and feeds into Gamification later.

**Done when:** completed sessions are recorded with metadata and can be queried by date range.

code in `web/src/features/countdown-timer/types/completed-session.ts`, `web/src/features/countdown-timer/stores/session-history-store.ts`, `web/src/features/countdown-timer/hooks/useCountdownInterval.ts`

- [x] Build it: `/develop session history and statistics`

### 20. Zustand store improvements · done

Organize the Zustand stores which are split between web/src/stores/ (theme, date) and feature level stores (countdown-timer/stores/, tasks/stores/, music-player/stores/, ui/navigation/Navbar/stores/). There is no central index or barrel export, and the store configuration (persist key naming, storage engine) is repeated across stores. Immer is installed but not used in any store, which would make immutable updates cleaner for nested state like tasks with subtasks. Default songs are hardcoded inside the music player store, coupling data to state management.

**Done when:** all stores re export from a central index, use a shared persist configuration helper, apply Immer middleware for cleaner immutable updates, and default song data is decoupled from the store.

code in `web/src/stores/`, `web/src/features/*/stores/`

- [x] Build it: `/develop zustand store improvements`

### 25. Reusable Modal component · done

The current `Modal.tsx` imports from the countdown timer stores and displays timer specific content. It is not a reusable shared component. A generic modal that accepts title, children, and onClose props would serve settings confirmations, task deletion, onboarding, and any future need.

**Done when:** a generic Modal component exists, the timer modal consumes it, and the component handles focus trapping and escape key dismissal.

code in `web/src/components/ui/Modal.tsx`, `web/src/features/countdown-timer/components/TimerModal.tsx`

- [x] Build it: `/develop reusable modal component`

### 26. Shared UI primitives · done

There are no reusable base components like Button, Input, Card, Badge, Avatar, or Spinner. Every feature builds its own UI from raw DaisyUI classes. As the app grows, having typed React wrappers for commonly used patterns would reduce duplication and make design changes easier.

**Done when:** core primitives (Button, Input, Badge, Spinner) exist as typed components with consistent variants, and at least one feature migrates to use them.

- [x] Design it (spec): `/architect shared UI primitives`
- [x] Build it: `/develop shared UI primitives`
  - [x] Spinner component with size and color variants
  - [x] Button component with size, color, loading, and disabled variants
  - [x] Input component with size, error, disabled, readonly, label, and helperText props
  - [x] Badge component with size, color, and style variants
  - [x] Barrel export at ui/index.ts
  - [x] Migrate Timer settings to use Input and Button

      Spec [0002](../specs/web/0002-shared-ui-primitives.md)

### 24. Theme validation fix · done

The `useAppTheme` hook validates themes against a hardcoded `VALID_THEMES` set that includes only the 36 DaisyUI themes. The custom `elixer` theme and premium themes (anime, BR characters, effects) defined in `web/src/app/themes/` are not included, so setting them programmatically is rejected as invalid.

**Done when:** all custom and premium themes are accepted by the validator, and the list stays in sync with the actual theme files.

code in `web/src/config/themes.ts`, `web/src/hooks/useAppTheme.ts`, `web/src/features/settings/theme/components/Index.tsx`

- [x] Build it: `/develop theme validation fix`

### 28. Console log cleanup · done

The `useAppTheme` hook uses `console.log` and `console.error` for debugging. The project has `no-console` set to warn in ESLint, but for a production hook these should be replaced with a proper logging utility or removed.

**Done when:** no console statements remain in `useAppTheme.ts` and the hook works correctly without them.

- [x] Build it: `/develop console log cleanup`

### 22. Error handling and loading · done

Add a global error boundary component that catches React render errors and shows a fallback UI. Create a unified error toast hook that both the axios interceptor and components can use. Add loading skeleton patterns in the shared UI feature for async routes (auth, settings). The router has a 404 page but no global error boundary beyond the layout level error element.

**Done when:** a global error boundary catches render errors, API errors surface consistently via a toast hook, and async routes show loading skeletons.

code in `web/src/components/ui/ErrorBoundary.tsx`, `web/src/components/ui/Skeleton.tsx`, `web/src/hooks/useErrorToast.ts`, `web/src/config/axios.ts`, `web/src/app/router.tsx`

- [x] Build it: `/develop error handling and loading`

### 23. Performance audit · done

Analyze the bundle size and performance of large dependencies. The web app uses GSAP with ScrollTrigger and SplitText (both registered globally in app.tsx). GSAP is a large dependency; if animations are only used in a few components, lazy loading GSAP or using CSS animations for simple cases could reduce the initial bundle. SplitText is a Club GSAP plugin that may not be necessary for the current UI.

**Done when:** bundle analysis is run, GSAP contribution is measured, and lazy loading or CSS alternatives are implemented for components that do not need GSAP eagerly.

Results: GSAP was registered globally in app.tsx but not used anywhere in the codebase. Removing it reduced the JS bundle from 620 kB to 497 kB (gzip: 211 kB to 162 kB, a 23 percent reduction). The 500 kB chunk size warning is now cleared. Dependencies `gsap` and `@gsap/react` are removed from package.json.

code in `web/src/app/app.tsx`, `web/package.json`

- [x] Build it: `/develop performance audit`

### 27. Design documentation · done

There is no `design.md` recording design system decisions, component inventory, or visual direction. The design system exists only as code. Future contributors would need to reverse engineer the patterns from the codebase.

**Done when:** `docs/design.md` documents the theme system, layout structure, shared component conventions, and naming patterns.

- [x] Build it: `/develop design documentation`

### 21. API response types · done

Define a consistent JSON response envelope so every API call returns the same shape. The Laravel backend provides an ApiResponse trait with success, error, and paginated methods. The frontend defines matching TypeScript types (ApiResponse<T>, ApiErrorResponse, PaginatedResponse<T>) and an Axios interceptor that unwraps the envelope automatically.

**Done when:** the ApiResponse trait exists, TypeScript types match the envelope, and the Axios interceptor normalizes responses.

code in `backend/app/Http/Controllers/ApiResponse.php`, `web/src/types/api.ts`, `web/src/config/axios.ts`

- [x] Design it (spec): `/architect api response types`
- [x] Build it: `/develop api response types`

      Spec [0001](../specs/_root/0001-api-response-envelope.md)

## Slice 1: core focus loop (MVP)

### 5. Countdown timer (adaptive pomodoro) · existing

Adaptive countdown with focus/break sessions, session switching, focus ring, and alerts.

code in `web/src/features/countdown-timer/`

### 6. Music player · existing

Play from a predefined list or a YouTube link; Spotify integration; volume and playback controls.

code in `web/src/features/music-player/`

### 7. Task matrix (Eisenhower) · existing

Drag-and-drop tasks across the Eisenhower categories with a persisted store.

code in `web/src/features/tasks/`

### 18. Task editing (inline) · done

Double-click a task in the matrix to edit title and description inline on the card. Drag-and-drop is paused while editing so the two interactions do not conflict.

**Done when:** user can double-click a task, edit its fields inline, and save changes that persist.

- [x] Design it (spec): `/architect task editing`
- [x] Build it: `/develop task editing`
  - [x] Add updateTask store action and hook (AC-2, AC-7)
  - [x] Inline editor UI with double-click trigger (AC-1, AC-6)
  - [x] Save, cancel, and validation logic (AC-2, AC-3, AC-5)
  - [x] Disable drag during edit (AC-4)
  - [x] Co-located tests (AC-1 through AC-7)
- [x] Test it: `/test task editing`
- [x] Verify it: `/check verify task editing`
      Spec [0001](../specs/web/0001-inline-task-editing.md)

## Slice 2: settings & themes

### 8. Timer settings · done

Configure focus, short break, and long break durations with validation. Card-based UI with save and reset functionality, toast notifications, and auto-sync with the countdown timer.

**Done when:** timer settings persist and drive the countdown timer.

- [x] Finish remaining pieces: `/develop timer settings`
  - [x] Add Toaster to Settings layout
  - [x] Replace alert() with react-hot-toast notifications
  - [x] Remove redundant localStorage saves (session store persists automatically)
  - [x] Add reset button to discard unsaved changes
  - [x] Improve UI with card-based layout
  - [x] Clean up container component styling
  - [x] Co-located tests (47 tests across 7 files)
- [x] Test it: `/test timer settings`
- [x] Verify it: `/check verify timer settings`

code in `web/src/features/settings/timer/`

### 32. Timer keyboard shortcuts · cancelled

Keyboard shortcuts were removed because they conflict with typing on the tasks page and will conflict with future social media features (comments, chats, friend requests). Shortcuts like Space, R, and S fire while the user is trying to type normally.

### 9. Theme settings · done

Pick and preview a theme; persist the choice across sessions. The page displays all 36 DaisyUI themes as circular color previews with a search filter. Selection is saved automatically via Zustand persist middleware and applied app-wide with smooth 500ms transitions.

**Done when:** theme selection persists and applies app-wide.

- [x] Finish remaining pieces: `/develop theme settings`
  - [x] Theme settings page with header, description, and search filter
  - [x] Theme grid with all 36 DaisyUI themes as visual previews
  - [x] Toast notification on theme change
  - [x] Theme persistence via Zustand store (already existed)
  - [x] Co-located tests (18 tests across 3 files)
- [x] Test it: `/test theme settings`

code in `web/src/features/settings/theme/`

### 35. Music player custom playlist · done

Let users add their own YouTube links as favorites. A text input in the MusicSwitcher dropdown accepts a YouTube URL, extracts the video ID, and appends it to the songs array in localStorage.

**Done when:** user can add, remove, and play custom YouTube songs alongside default songs.

- [x] Build it: `/develop music player custom playlist`

code in `web/src/features/music-player/`

### 36. Music player progress display · done

Add a thin progress bar to the floating player that reads currentTime and duration from the YouTube player. Shows current position and time remaining.

**Done when:** floating player displays a progress bar with current time and duration.

- [x] Build it: `/develop music player progress display`

### 40. Music player song validation · done

When adding a custom YouTube song, the player has no way to know if the video still exists. Users can add broken links that silently fail to play. Also, the default Lofi Girl song (jfKfPfyJRdk) was removed from YouTube and no longer plays.

**Done when:** adding a custom song checks via YouTube oEmbed API that the video exists before adding it, and the default Lofi Girl song is updated to the current stream.

- [x] Build it: `/develop music player song validation`

code in `web/src/features/music-player/`

### 41. Music player default song fix · done

The default Lofi Girl song (jfKfPfyJRdk) was removed from YouTube and no longer plays. Even after updating the default song file, existing users still see the broken video because the store persists the songs array to localStorage. Additionally, a new Linkin Park lofi song was requested as a default.

**Done when:** the store migrates away the defunct video ID from persisted state, and the Linkin Park lofi song is added as a recommended default.

- [x] Build it: `/debug lofi girl not playing`

code in `web/src/features/music-player/`

### 42. Music player live stream fix · done

The default Lofi Girl song was replaced with a 24/7 live stream (rFZHOHl-L8A) which reports an enormous duration, breaking the progress bar. Additionally, the store migration did not merge new default songs (like Linkin Park) into existing persisted playlists, so users never saw newly added defaults.

**Done when:** the live stream is replaced with a regular video with finite duration, and the store migration merges missing default songs into persisted state.

- [x] Build it: `/debug lofi girl still not playing`

code in `web/src/features/music-player/`

### 43. Music player duplicate songs fix · done

The store migration for version 7 merged missing default songs into the persisted playlist, but some users ended up with duplicate entries in the dropdown. Songs appeared twice because the migration combined persisted state with defaults without deduplicating.

**Done when:** the store migration deduplicates the songs array by ID so each song appears only once.

- [x] Build it: `/debug duplicate songs in dropdown`

code in `web/src/features/music-player/`

### 44. Music player dedup migration fix · done

The version 8 deduplication migration was added after some users were already at version 8 in their localStorage, so the migration never ran for them. Their song list still contained duplicates from the version 7 migration.

**Done when:** the store version is bumped to 9 with a deduplication migration that runs for users whose localStorage was already at version 8.

- [x] Build it: `/debug duplicate songs still showing`

code in `web/src/features/music-player/`

## Slice 3: placeholder pages

### 10. Journal · in-progress · needs a decision

Placeholder route; implement a journaling surface for daily reflections.

**Done when:** journal page renders entries and persists them locally.

- [ ] Design it (spec): `/architect journal`

code in `web/src/app/routes/(root)/Journal.tsx`

### 11. Profile · in-progress · needs a decision

Placeholder route; implement a profile page for the user.

**Done when:** profile page shows user info and basic preferences.

- [ ] Design it (spec): `/architect profile`

code in `web/src/app/routes/(root)/Profile.tsx`

### 12. Calendar · in-progress · needs a decision

Placeholder route; implement a calendar view for scheduled focus and tasks.

**Done when:** calendar page renders a monthly view with events.

- [ ] Design it (spec): `/architect calendar`

code in `web/src/app/routes/(root)/Calendar.tsx`

### 13. Brain dump (Bin) · in-progress · needs a decision

Placeholder route; implement a brain dump inbox for quick capture.

**Done when:** bin page captures and lists quick notes.

- [ ] Design it (spec): `/architect brain dump`

code in `web/src/app/routes/(root)/Bin.tsx`

### 19. Subtasks (nested) · planned

Tasks can contain subtasks, and subtasks can contain their own subtasks, forming a tree. Each subtask has a title, a done state, and an order position. The parent task shows a progress indicator based on completed subtasks.

**Done when:** user can add, edit, delete, and reorder subtasks within any task, with unlimited nesting depth and progress tracking on parent tasks.

- [ ] Design it (spec): `/architect subtasks`

### 37. Task search and filtering · planned

Add a search input in the TaskPageHeader that filters tasks by title or description across all quadrants. Helps users find specific tasks as the matrix grows.

**Done when:** user can type a search query and see only matching tasks across all columns.

- [ ] Build it: `/develop task search and filtering`

### 38. Task completion animation and archive · planned

Add a slide out animation when a task is completed. Move completed tasks to a collapsed archive section to keep the matrix clean.

**Done when:** completed tasks animate out and move to an archive section that can be expanded.

- [ ] Build it: `/develop task completion animation and archive`

### 39. Task due dates and priority · planned

Add an optional due date field to the Task type with visual indicators (e.g., red border for overdue). Makes the Eisenhower matrix more actionable.

**Done when:** tasks can have due dates, overdue tasks are visually highlighted, and tasks can be sorted by due date.

- [ ] Build it: `/develop task due dates and priority`

### 34. Adaptive duration logic · planned

Make the timer truly adaptive by adjusting break or focus duration based on user patterns. If a user consistently skips breaks, suggest shorter breaks. If they complete many sessions in a row, suggest a longer break.

**Done when:** timer suggests adjusted durations based on skip frequency and consecutive session count.

- [ ] Build it: `/develop adaptive duration logic`

## Slice 4: auth & onboarding

### 14. Auth (login/signup) · in-progress · needs a decision

Placeholder auth routes; implement real login and signup flows.

**Done when:** users can sign up, log in, and stay signed in.

- [ ] Design it (spec): `/architect auth`

code in `web/src/app/routes/auth/`

### 15. Onboarding flow · in-progress · needs a decision

Placeholder onboarding steps; implement the first-run flow.

**Done when:** new users complete onboarding and land on home.

- [ ] Design it (spec): `/architect onboarding`

code in `web/src/app/routes/onboarding/`

## Slice 5: future vision (deferred)

### 16. Gamification & streaks · planned · needs a decision

Streaks, session counts, and rewards to entice task completion. Deferred until core is solid.

**Done when:** streaks and session stats are tracked and shown.

- [ ] Design it (spec): `/architect gamification`

### 17. Social features · planned · needs a decision

Social media style features (sharing, leaderboards, community). Deferred; massive scope.

**Done when:** users can share progress and view others.

- [ ] Design it (spec): `/architect social features`

