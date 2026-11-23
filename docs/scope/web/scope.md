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
| 5   | Countdown timer (adaptive pomodoro) | Slice 1 (core loop)   | existing    |
| 6   | Music player                       | Slice 1 (core loop)   | existing    |
| 7   | Task matrix (Eisenhower)           | Slice 1 (core loop)   | existing    |
| 8   | Timer settings                     | Slice 2 (settings)    | done        |
| 9   | Theme settings                     | Slice 2 (settings)    | done        |
| 10  | Journal                            | Slice 3 (pages)       | in-progress |
| 11  | Profile                            | Slice 3 (pages)       | in-progress |
| 12  | Calendar                           | Slice 3 (pages)       | in-progress |
| 13  | Brain dump (Bin)                   | Slice 3 (pages)       | in-progress |
| 14  | Auth (login/signup)                | Slice 4 (auth)        | in-progress |
| 15  | Onboarding flow                    | Slice 4 (auth)        | in-progress |
| 16  | Gamification & streaks             | Slice 5 (future)      | planned     |
| 17  | Social features                    | Slice 5 (future)      | planned     |
| 18  | Task editing (inline)              | Slice 1 (core loop)   | done        |
| 19  | Subtasks (nested)                  | Slice 3 (pages)       | planned     |
| 20  | Zustand store improvements         | Foundation            | planned     |
| 21  | API response types                 | Foundation            | planned     |
| 22  | Error handling and loading         | Foundation            | planned     |
| 23  | Performance audit                  | Foundation            | planned     |

## Foundations

### 1. Stack & architecture · existing

React 19 + Vite scaffold with react-router, providers, and layouts; boots locally.

code in `web/`

### 2. Coding standards & tooling · existing

ESLint, Prettier, Husky, commitlint, and Vitest wired up for the web app.

code in `web/`

### 3. Design system & UI foundation · existing

TailwindCSS v4, DaisyUI themes, shared UI components, navbar, sidebar, modals, toasts.

code in `web/src/features/ui/`, `web/src/app/themes/`

### 4. Data model & local persistence · existing

Zustand stores with persist middleware for tasks, countdown state, settings, and theme.

code in `web/src/stores/`, `web/src/features/*/stores/`

### 20. Zustand store improvements · planned

Organize the Zustand stores which are split between web/src/stores/ (theme, date) and feature level stores (countdown-timer/stores/, tasks/stores/, music-player/stores/, ui/navigation/Navbar/stores/). There is no central index or barrel export, and the store configuration (persist key naming, storage engine) is repeated across stores. Immer is installed but not used in any store, which would make immutable updates cleaner for nested state like tasks with subtasks.

**Done when:** all stores re export from a central index, use a shared persist configuration helper, and apply Immer middleware for cleaner immutable updates.

- [ ] Build it: `/develop zustand store improvements`

### 21. API response types · planned · needs a decision

Define TypeScript response types for the axios client at web/src/config/axios.ts. Currently all API calls will return any until contracts are defined. When the backend starts serving real endpoints, this becomes a maintenance risk without typed responses.

**Done when:** API response types exist in a shared location, the axios client returns a consistent Result type with data, error, and status, and a response interceptor normalizes Laravel responses.

- [ ] Design it (spec): `/architect api response types`

### 22. Error handling and loading · planned

Add a global error boundary component that catches React render errors and shows a fallback UI. Create a unified error toast hook that both the axios interceptor and components can use. Add loading skeleton patterns in the shared UI feature for async routes (auth, settings). The router has a 404 page but no global error boundary beyond the layout level error element.

**Done when:** a global error boundary catches render errors, API errors surface consistently via a toast hook, and async routes show loading skeletons.

- [ ] Build it: `/develop error handling and loading`

### 23. Performance audit · planned

Analyze the bundle size and performance of large dependencies. The web app uses GSAP with ScrollTrigger and SplitText (both registered globally in app.tsx). GSAP is a large dependency; if animations are only used in a few components, lazy loading GSAP or using CSS animations for simple cases could reduce the initial bundle. SplitText is a Club GSAP plugin that may not be necessary for the current UI.

**Done when:** bundle analysis is run, GSAP contribution is measured, and lazy loading or CSS alternatives are implemented for components that do not need GSAP eagerly.

- [ ] Build it: `/develop performance audit`

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

### 19. Subtasks (nested) · planned

Tasks can contain subtasks, and subtasks can contain their own subtasks, forming a tree. Each subtask has a title, a done state, and an order position. The parent task shows a progress indicator based on completed subtasks.

**Done when:** user can add, edit, delete, and reorder subtasks within any task, with unlimited nesting depth and progress tracking on parent tasks.

- [ ] Design it (spec): `/architect subtasks`

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

