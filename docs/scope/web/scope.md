# Scope: Elixer Focus System (web)

A focus and productivity web app: an adaptive pomodoro timer, an Eisenhower task matrix, and a music player, built to entice the user to complete tasks. Solo dev learning project, free, no deadline; the gamified and social vision is deferred to later slices.

**Build approach:** Skateboard (MVP first; ship the thinnest usable whole, then grow).
**Workflow:** Alpha (run /check verify after /develop). Project default level of rigor.

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
| 8   | Timer settings                     | Slice 2 (settings)    | in-progress |
| 9   | Theme settings                     | Slice 2 (settings)    | in-progress |
| 10  | Journal                            | Slice 3 (pages)       | in-progress |
| 11  | Profile                            | Slice 3 (pages)       | in-progress |
| 12  | Calendar                           | Slice 3 (pages)       | in-progress |
| 13  | Brain dump (Bin)                   | Slice 3 (pages)       | in-progress |
| 14  | Auth (login/signup)                | Slice 4 (auth)        | in-progress |
| 15  | Onboarding flow                    | Slice 4 (auth)        | in-progress |
| 16  | Gamification & streaks             | Slice 5 (future)      | planned     |
| 17  | Social features                    | Slice 5 (future)      | planned     |

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
## Slice 2: settings & themes

### 8. Timer settings · in-progress

Configure focus, short break, and long break durations with validation.

**Done when:** timer settings persist and drive the countdown timer.

- [ ] Finish remaining pieces: `/develop timer settings`

code in `web/src/features/settings/timer/`

### 9. Theme settings · in-progress

Pick and preview a theme; persist the choice across sessions.

**Done when:** theme selection persists and applies app-wide.

- [ ] Finish remaining pieces: `/develop theme settings`

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

