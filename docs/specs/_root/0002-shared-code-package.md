# 0002. Shared code package

**Date**: 2026-11-27
**Status**: In Progress

## Summary

This spec defines one private TypeScript package for the web and Expo apps. It shares task and timer rules without moving browser storage or cross tab coordination into mobile code. The web keeps its current saved data, while the mobile foundation uses memory only until its task and timer features add persistence.

## Context

The repo wide scope calls for a package under `packages/shared/` so both apps can use the same domain types, Zustand stores, and utilities. The web already has task, Subtask, and timer settings stores. The Expo app is still a starter, but its foundation needs access to shared code before mobile task and timer screens are built.

The current web task and Subtask stores use local storage and the Calendar and Tasks coordinator. The timer settings share a persisted session store with web only runtime counters. The stores also depend on browser persistence and coordination behavior that must not become assumptions inside code imported by Expo.

The apps need one source for task rules, but they do not need shared persisted values yet. Account and sync work is planned separately, so shared entities remain identity neutral and app adapters can add account scope later. The Laravel backend is not part of this package.

## Requirements

**User stories**:

* As a web and mobile developer, I want one Task and Subtask contract so both apps use the same domain rules without duplicate definitions.
* As an Expo developer, I want to import the package from the mobile foundation so future task and timer features can build on it.
* As an existing web user, I want the extraction to preserve my tasks, Subtasks, and timer settings.

**Acceptance criteria** (the contract):

* **AC-1**: The private root registers `web`, `app`, and `packages/shared` as npm workspaces. `@elixer-focus/shared` has TypeScript source exports at `@elixer-focus/shared/tasks`, `@elixer-focus/shared/timer`, and `@elixer-focus/shared/utils`. One root lock file is canonical, the old app lock files are removed, app specific dependencies stay in their workspace manifests, both apps declare Zustand for local React bindings, and `backend` stays outside these workspaces.
* **AC-2**: The shared package exports the confirmed `Task`, `TaskCategory`, `TaskUpdate`, `Subtask`, and `TimerSettings` contracts, `createTaskStore`, `createSubtaskStore`, `createTimerSettingsSlice`, and the portable task, Subtask, timestamp, and duration utilities. Consumers do not redeclare these types or duplicate their implementations.
* **AC-3**: Web code uses the package as its source for the shared task and timer behavior. The Expo foundation imports and instantiates the shared stores with memory only, without adding task or timer screens. No shared module imports browser APIs, Expo APIs, local storage, React UI, or the Calendar and Tasks coordinator.
* **AC-4**: Existing web data remains readable and retains its behavior under `tasks-storage` version 5, `subtasks-storage` version 1, and `session-storage` version 2. Task writes and Subtask writes remain under the existing coordinator, and timer preference state composes into the existing web session store without moving its counters.
* **AC-5**: Store factories receive an ID generator. Web supplies `crypto.randomUUID()` and Expo supplies `Crypto.randomUUID()` from `expo-crypto`; both produce UUID version 4 strings. Timestamp values remain epoch milliseconds from `Date.now()`.
* **AC-6**: Existing Task creation defaults, Task update behavior, timer settings defaults and validation, Subtask invariants, and invalid operation errors remain unchanged. Failed web persistence is not reported as saved or broadcast as a successful change.
* **AC-7**: The shared package has focused unit tests, and root checks cover package lint, web and Expo type checking, and the package and web test suites.

## Options considered

### Option 1: Private npm workspace package with source exports

Create `packages/shared` as an internal npm workspace. The apps import its TypeScript source through named area subpaths, and app adapters keep platform storage and coordination outside the package.

**Pros**:

* Both apps compile against one package and one source for shared rules.
* No publish step, generated output, or new build tool is needed.
* App specific storage and native dependencies remain in the app that owns them.

**Cons**:

* Installs and lock file ownership move to the repo root.
* Both bundlers and root checks must resolve workspace source correctly.
* Platform adapters remain necessary around persistence and web coordination.

### Option 2: Local file dependencies

Keep the existing independent app installs and add relative file dependencies pointing to `packages/shared`.

**Pros**:

* Existing app lock files and install boundaries can remain in place.
* The package can still have a normal manifest and public exports.

**Cons**:

* Local package updates and lock file refreshes are easier to miss.
* Expo and Vite resolution would need separate verification and may require extra configuration.
* The repo has more than one install path to maintain.

### Option 3: Copy web code into mobile

Keep the web implementation as it is and copy types and helpers into the mobile app when its features are built.

**Pros**:

* The web app needs no package or install changes now.
* Mobile can choose different implementations for platform behavior.

**Cons**:

* Task rules and utilities would immediately have duplicate sources.
* The copies can diverge, which conflicts with the repo wide scope.

## Decision

**Chosen option**: Option 1: Private npm workspace package with source exports

Set the root package to private, register `web`, `app`, and `packages/shared` as npm workspaces, and use one root lock file in place of the old app lock files. Create private `@elixer-focus/shared` under `packages/shared` and expose TypeScript source through the three selected subpaths. Keep each app's dependencies in its own manifest, shared package dependencies in the shared manifest, and the backend outside these workspaces.

The package uses Zustand vanilla store factories and a timer settings slice. Web adapters bind stores to React, supply browser persistence, and retain coordinator routing. The Expo foundation creates memory only stores and supplies an app local UUID provider from `expo-crypto`. No shared package code imports React, browser globals, Expo APIs, or storage implementations.

Use the existing Zustand and Immer libraries with one exact version across the workspaces. Declare `zustand` version `5.0.11` as a peer dependency of the shared package and as a direct dependency of both apps, so each app binds the vanilla store to its own React runtime. Declare `immer` version `11.1.3` as a shared package dependency and keep the web version aligned. Add `expo-crypto` version `15.0.8` only to `app`; it supplies Expo's UUID version 4 provider and does not become a dependency of the shared package.

The Task and Subtask data shapes stay unchanged. `TaskUpdate` continues to use `dueAt: null` to clear a due date. Share Task and Subtask state logic, task ordering and archive rules, task search, due date sorting, Subtask tree operations, timestamp and duration helpers, and timer preference defaults and validation. Keep localized date formatting, UI labels, timer runtime state, browser persistence, and coordination in app adapters.

Web retains `tasks-storage` version 5, `subtasks-storage` version 1, and `session-storage` version 2. Compose the shared timer settings slice into the existing web session store so its current session type and counters stay in place. Do not add `userId` to shared entities. Future account ownership and local data migration belong to the auth and sync designs.

**Implementation skills**: `vercel-react-native-skills` (`boostbrothers/agent-skills-fe`, `.agents/skills/vercel-react-native-skills/`)

## Rationale

Both apps are in one repo and need the same task rules, so an npm workspace gives them one local package boundary without adding registry publishing or a build system. A root lock file is a real install workflow change, but it is less fragile than separately refreshing relative file dependencies. Keeping app dependencies in their own manifests also respects the Expo native dependency boundary.

The web stores already have important persistence and coordinator behavior. Moving those side effects into the shared package would couple Expo to browser APIs and could break task data or cross tab writes. Store factories and a settings slice let the package own domain behavior while each app keeps the storage adapter it needs. Using the same UUID version with secure app supplied generators avoids relying on one runtime's global crypto implementation.

The package remains local and identity neutral because authentication and sync are planned separately. This avoids adding an account field before the account model exists, while leaving each app able to scope its future storage adapter by account.

## Feature design

**Data model sketch**:

| Entity | Fields and rules | Keys and relationships |
| --- | --- | --- |
| `Task` | Required `id: string`, `title: string`, `category: TaskCategory`, `isCompleted: boolean`, `isSelected: boolean`, `createdAt: number`, and `updatedAt: number`. Optional `description: string`, `completedAt: number`, `defaultDurationMinutes: number`, `archivedAt: number`, and `dueAt: number`. New Tasks default to uncategorised, incomplete, unselected, and 30 minutes. | Primary key `id`. A Task owns zero or more Subtasks. |
| `TaskCategory` | Exact string union: `urgent-important`, `not-urgent-important`, `urgent-not-important`, `not-urgent-not-important`, and `uncategorised`. | Value on `Task.category`, not a separate record. |
| `TaskUpdate` | Partial updates for `title`, `description`, `defaultDurationMinutes`, and `archivedAt`; `dueAt` accepts a number or `null`. | `null` is an update command to clear the field and is never stored on `Task`. |
| `Subtask` | Required `id: string`, `taskId: string`, `parentSubtaskId: string | null`, `title: string`, `isCompleted: boolean`, `position: number`, `createdAt: number`, and `updatedAt: number`. Titles are trimmed and nonblank, with no added length limit. | Primary key `id`; `taskId` references `Task.id`; nullable parent reference points to a Subtask in the same Task tree. |
| `TimerSettings` | Required `focusDuration: number`, `shortBreakDuration: number`, `longBreakDuration: number`, `sessionCountLimit: number`, and `attributeSessionOverrun: boolean`. Defaults are 25, 5, and 15 minutes, 4 sessions, and overrun enabled. Durations are finite and at least 1; the count is an integer from 1 through 8. | One local settings slice per app. Runtime session type and counters are not shared. |

Subtask siblings have dense, unique integer positions starting at zero. Duplicate sibling titles are allowed. A Task completion change does not change Subtask completion, and parent and child completion remain independent. The tree has no fixed depth limit and cannot contain cycles.

Task and Subtask persistence remains separate in the web adapter. The shared package does not own a database, storage key, or account identifier. Expo memory stores are temporary and do not persist across app restarts.

**API surface**:

There are no HTTP endpoints. These are local TypeScript imports and function calls.

| Local module | Method or call | Key inputs | Key outputs | Auth | Key errors |
| --- | --- | --- | --- | --- | --- |
| `@elixer-focus/shared/tasks` | Import types and call `createTaskStore` or `createSubtaskStore` | Existing Task and Subtask actions, app supplied ID generator, optional app persistence adapter | Zustand store state and actions, plus Task and Subtask types | None | Invalid Subtask relationships or reorder targets throw descriptive errors; persistence errors stay in the app adapter. |
| `@elixer-focus/shared/timer` | Import types and compose `createTimerSettingsSlice` | Existing timer preference values and validated settings actions | Timer defaults, settings state, and actions | None | Invalid values are rejected by the existing settings validation before persistence. |
| `@elixer-focus/shared/utils` | Import pure functions | Task or Subtask arrays, search query, timestamps, or durations | Derived ordering, archive groups, search results, tree operations, and converted time values | None | Invalid tree operations fail fast and do not silently change state. |

`createTaskStore` and `createSubtaskStore` return vanilla Zustand stores. Each accepts an ID generator and optional persistence options. Web supplies its existing persistence keys, versions, and migrations; Expo omits persistence and keeps the instance in memory. App code binds a store to its local React runtime with Zustand. `createTimerSettingsSlice` returns shared preference state and actions for composition into an app owned store.

**Value sourcing**:

| Action | Value produced or displayed | Source |
| --- | --- | --- |
| Create a Task | UUID, title, category, initial status, duration, and timestamps | App supplied ID generator; caller title and optional description or category; existing defaults; `getCurrentTimestamp()` using `Date.now()` |
| Update a Task | Changed fields and `updatedAt` | Existing Task action input and current Task; update timestamp from `getCurrentTimestamp()` |
| Update a Task deadline | Number or absent `dueAt` | Existing update command input; `null` explicitly removes the field before persistence |
| Complete or reopen a Task | Completion state, optional `completedAt`, and `updatedAt` | Existing completion action, current Task, and `getCurrentTimestamp()` |
| Create a Subtask | UUID, owner Task, optional parent, trimmed title, incomplete state, timestamps, and position | App supplied ID generator; selected Task or parent; inline title after trimming; current sibling list; `getCurrentTimestamp()` |
| Reorder or delete Subtasks | Descendant set and resulting sibling positions | Current Subtask collection, `taskId`, `parentSubtaskId`, and requested move or delete action |
| Show task groups or search results | Category order, archive grouping, due date order, and matches | Current Task array, category constants, `completedAt` with `updatedAt` fallback, `dueAt`, and query input |
| Initialize timer preferences | Three durations, session count limit, and overrun setting | Existing session store defaults and persisted `session-storage` values |
| Save timer preferences | Validated setting values | Existing settings form input; durations must be finite and at least 1, count must be an integer from 1 through 8 |
| Apply web Task or Subtask writes | Persisted state and cross tab update | Existing coordinator command, latest coordinator state, and the three existing storage keys and versions |
| Apply future account scope | Account identity | Not produced by this package; a future app storage or API adapter supplies it |

**Key invariants**:

* Shared source exports are imported through the three public subpaths. The package does not import from web aliases or app paths.
* The package contains no local storage, Web Locks, BroadcastChannel, React UI, Expo API, or account identity.
* Web Task and Subtask writes continue through the Calendar and Tasks coordinator. State is persisted before it is applied or broadcast. A failed write is not reported as saved.
* Existing storage keys, versions, and migrations remain `tasks-storage` version 5, `subtasks-storage` version 1, and `session-storage` version 2.
* The web timer settings slice shares preferences only. Current session type, previous session type, and counters stay in the web store.
* A Subtask references an existing Task. A nonnull parent belongs to the same Task. Sibling positions are dense and unique, and parent links cannot cycle.
* Task completion and Subtask completion remain independent. Deleting a Task continues to remove its Subtask tree through the coordinator.
* Web and Expo ID providers return secure UUID version 4 strings. The package does not generate IDs from a platform global.
* Shared Task and timer entities have no `userId`. Future account ownership is applied in adapters.
* Utilities operate on the apps' existing local arrays. The package adds no remote workload, pagination rule, logging, or telemetry.

**Security model**:

This package adds no server endpoint, account authorization, secrets, or new data destination. Web data remains in the current browser profile. Expo state is memory only until a future mobile feature selects durable storage. The package adds no regulated data requirement. Account scope and migration of pre account data are deferred to the upcoming auth and sync designs.

**Configuration required**:

None. `expo-crypto` is a native app dependency and needs no environment variable or credential.

**Critical test scenarios**:

* Import each public subpath from web and Expo, instantiate the selected store factories, and run root type checks and package tests. Verifies **AC-1**, **AC-2**, **AC-3**, **AC-7**.
* Create Tasks and Subtasks with web and Expo ID providers. Verify both return UUID version 4 strings and the shared factories preserve defaults and timestamp units. Verifies **AC-5**, **AC-6**.
* Exercise nested Subtask validation, duplicate IDs, wrong Task parents, cycles, dense sibling positions, stale reorder targets, and subtree deletion. Verify invalid operations throw without silently corrupting state. Verifies **AC-2**, **AC-6**, **AC-7**.
* Load existing web values from all three storage keys and verify they remain unchanged after extraction. Simulate a failed write and an older coordinator owner; confirm the existing error, rollback, capability, and no false success behavior. Verifies **AC-4**, **AC-6**, **AC-7**.
* Save timer preferences through the existing web session store and coordinator. Verify defaults and validation, the persisted key and version, and unchanged runtime counters. Verifies **AC-4**, **AC-6**.
* Verify the package produces no user ID, server request, or persisted mobile value, and that app adapters can add account scope later without changing shared entity fields. Verifies **AC-3**, **AC-5**.

## Build plan

Use the Skateboard approach by first making one useful Task contract available to both apps, then add Subtask and timer behavior while preserving the web stores. The package remains usable after the first slice, and later slices expand the shared surface without moving platform side effects into it.

1. Make the root package private, register `web`, `app`, and `packages/shared` as npm workspaces, replace the child app lock files with the canonical root lock file, and create the private package with the three TypeScript source subpaths. Export the Task contract first and add a smoke import in each app. Satisfies **AC-1**, **AC-2**, **AC-3**.
2. Move Task state and pure task helpers into the shared package, add the app supplied ID generator, and adapt web stores around the shared factory while preserving the existing coordinator and storage contract. Add focused tests for Task defaults, updates, archive behavior, search, and due date sorting. Satisfies **AC-2**, **AC-3**, **AC-4**, **AC-5**, **AC-6**.
3. Move Subtask types, store logic, and tree operations into shared source. Keep the web coordinator as the write owner and preserve the separate key, rollback, and older tab capability behavior. Add tests for tree invariants and invalid operations. Satisfies **AC-2**, **AC-3**, **AC-4**, **AC-6**, **AC-7**.
4. Add the shared timer settings slice and compose it into the existing web session store without moving runtime counters or changing its persistence version. Add the Expo memory store instance and its `expo-crypto` ID provider in the app manifest. Satisfies **AC-3**, **AC-4**, **AC-5**, **AC-6**.
5. Add shared package lint, type check, and Vitest scripts to root validation. Run web and app type checks, shared and web tests, and an Expo package resolution smoke build. Satisfies **AC-1**, **AC-3**, **AC-7**.

## Consequences

**Positive**:

* Web and mobile use one Task and Subtask contract and one implementation of portable domain rules.
* The existing web storage, timer runtime, and cross tab coordinator remain authoritative.
* Expo can consume the package before task and timer screens are designed.

**Negative / tradeoffs**:

* The root lock file becomes the install source for the participating npm workspaces, so app installs move to the repo root workflow.
* Web and app adapters still need their own wiring for persistence, React subscriptions, and coordination.
* Expo state is intentionally not durable in this feature, and account ownership is not solved.

**Neutral**:

* No database schema, API endpoint, environment variable, or publish process is added.
* `backend` remains outside the TypeScript workspace package.

## Follow-up

* [ ] Add `vercel-react-native-skills` to `app/AGENTS.md` and add a root `AGENTS.md` pointer so future Expo implementation follows the installed guidance.
* [ ] Connect the official Expo MCP in your Junie MCP settings. After connection, record it in `app/AGENTS.md` and the root context file.
* [ ] Design account scoped storage and the migration of local pre account Tasks and timer settings in the upcoming auth and sync specs.
* [ ] Select durable native storage when the mobile task and timer features are designed. Until then, Expo stores remain memory only.