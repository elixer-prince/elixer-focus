# 0014. Task completion animation and archive

**Date**: 2026-11-27
**Status**: Accepted

## Summary

Completed tasks leave the active Home and Tasks lists with a brief slide out. The full Tasks page shows completed tasks in a collapsed archive, grouped by their original category, where you can reopen them. The archive is derived from completion state, so completing a task does not change Calendar availability or recurrence.

## Context

Tasks are stored in the existing task store and appear on both Home and the full Tasks page. A task records completion with `isCompleted` and `completedAt`; its separate `archivedAt` field is used by Calendar to control task availability and recurrence. Task completion and Calendar occurrence completion are already separate states.

The planned feature adds a completion animation and a place to find completed tasks. The Tasks page also has category ordering and search, and its task cards can contain Subtasks. The implementation must preserve those existing behaviors while allowing completed tasks to be reopened.

## Requirements

**User stories**:

- As a user, I want a completed task to leave my active lists so I can focus on unfinished work.
- As a user, I want to find and reopen a completed task from the Tasks page.
- As a Calendar user, I want task completion to leave my Calendar availability and recurrence unchanged.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

- **AC-1**: Completing a task from Home or the Tasks page updates its existing completion state and removes it from the active view only after the existing coordinator accepts the write. Completion does not set or clear `archivedAt`.
- **AC-2**: Home does not show an archive. After a completed task leaves the current Home category, Home shows the highest priority category that still has an incomplete task, using the existing category order. If no incomplete task remains, Home shows its existing empty task state.
- **AC-3**: The Tasks page places one archive section below the active matrix when at least one task is completed. It starts collapsed on each page load, does not remember expansion state, and is hidden when empty. When expanded, it groups tasks by their existing category in matrix order, then sorts each group by `completedAt` from newest to oldest. If `completedAt` is absent, use `updatedAt` for ordering without changing the stored record. Preserve existing task order for equal timestamps.
- **AC-4**: The existing Tasks search filters active tasks only. It does not filter the archive, and archived tasks are not included in active matrix results.
- **AC-5**: Unchecking a task in the archive reopens it. The existing completion action clears `completedAt`, updates `updatedAt`, and leaves `archivedAt` unchanged. The task leaves the archive and returns to its original category and relative task order in active views.
- **AC-6**: Completing or reopening a task does not change Calendar availability, recurrence series, or saved occurrence state. A task remains available to Calendar when it was available before the completion action. Existing `archivedAt` values and their Calendar effects remain unchanged.
- **AC-7**: The archive keeps each task's existing Subtask checklist visible. Completing or reopening a task does not change Subtask completion state.
- **AC-8**: Completion uses a brief slide out that can be interrupted by a newer task state. The motion uses `transform` and `opacity`, and is removed or reduced when `prefers-reduced-motion` is enabled. The archive disclosure is keyboard operable and exposes its expanded state. When a focused task leaves a list, focus moves to the next active task; if none remains, focus moves to the archive disclosure on Tasks or the task list on Home.
- **AC-9**: Task state continues to use the existing coordinator and persisted store. A successful update is reflected in other open tabs through the existing broadcast behavior. If persistence fails, the task stays in its current view, the existing error feedback is shown, and no completion animation is played.

## Options considered

### Option 1: Derive the archive from completion

Use the existing `isCompleted` value to select completed tasks for a Tasks page view. The archive does not add a persisted record or change Calendar state.

**Pros**:

- Reuses the existing Task model and completion action, with no data migration.
- Reopening a task naturally removes it from the archive and restores it to active views.
- Keeps task completion separate from Calendar availability and recurrence.

**Cons**:

- A completed task remains available to Calendar if it was not already archived there.
- Reopening removes the task from the archive, so the view is not a permanent completion history.
- A task completed on Home can only be found or reopened on the full Tasks page.

### Option 2: Set `archivedAt` when completing

Use the existing Calendar archive timestamp as the task completion archive marker.

**Pros**:

- Reuses an existing Task field and Calendar archive behavior.
- Removes a completed task from Calendar availability and stops its active recurrence series.

**Cons**:

- Completion would change future Calendar planning even when the user only intended to finish a task.
- Reopening would need another rule for restoring Calendar availability and recurrence.
- The saved occurrences would remain while the source task and its active recurrence behavior change.

### Option 3: Add separate persisted archive records

Create archive entries in addition to the existing Task records.

**Pros**:

- Allows an archive lifecycle or snapshot that is independent from current task completion.
- Could preserve a permanent completion history if that becomes a separate requirement.

**Cons**:

- Duplicates task state and requires synchronization when tasks are edited, reopened, or deleted.
- Adds storage and migration work for a view that only needs the existing completion state.

## Decision

**Chosen option**: Option 1: Derive the archive from completion

The archive is a view of existing Tasks where `isCompleted` is true. It does not set `archivedAt` or add persisted archive state.

**Implementation skills**: `web-design-guidelines` (`vercel-labs/agent-skills`, `.agents/skills/web-design-guidelines/`) · `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.agents/skills/vercel-react-best-practices/`) · `vercel-composition-patterns` (`vercel-labs/agent-skills`, `.agents/skills/vercel-composition-patterns/`)

## Rationale

The Task model already distinguishes current completion from Calendar archiving. Reusing `isCompleted` avoids duplicating state, while leaving `archivedAt` alone preserves the existing Calendar contract and avoids silently stopping a recurrence when someone checks off a task. The existing coordinator supplies persistence and cross tab updates, so the feature needs no new service or migration.

## Feature design

**Data model sketch**:

| Record | Fields used by this feature | Relationships |
| --- | --- | --- |
| `Task` | Existing `id`, `category`, `isCompleted`, optional `completedAt`, `updatedAt`, optional `archivedAt` | One Task can have many Subtasks, recurrence series, and scheduled occurrences |
| `Subtask` | Existing `id`, `taskId`, optional `parentSubtaskId` | Existing nested checklist remains attached to its Task |
| `RecurrenceSeries` | Existing task reference and active state | Existing series remain unchanged |
| `ScheduledOccurrence` | Existing task and optional series references | Existing occurrences remain unchanged |
| Archive view | No stored record or new field | Derived from completed Tasks and their existing category and timestamps |

The archive expansion flag is temporary Tasks page state, initialized as collapsed. It is not stored in the Task store, browser storage, or URL. No schema change or data migration is required.

**State transitions**:

| Action | Existing Task state change | View change |
| --- | --- | --- |
| Complete | Set `isCompleted` true, set `completedAt` and `updatedAt` through the existing completion action, leave `archivedAt` unchanged | Remove from active views and derive it into the Tasks archive after the coordinator accepts the write |
| Reopen | Set `isCompleted` false, clear `completedAt`, update `updatedAt`, leave `archivedAt` unchanged | Remove from the archive and restore to active views in the original category and relative order |
| Expand archive | No Task fields change | Change temporary Tasks page state only |

Active and archived task lists are derived from the current Task collection during rendering. They are not stored as separate arrays. Task completion does not cascade to Subtasks, recurrence series, or scheduled occurrences.

**API surface**:

No HTTP endpoint or backend change is required. The feature uses the existing local Task actions and coordinator.

| Local surface | Inputs | Values produced | Auth | Key errors |
| --- | --- | --- | --- | --- |
| Task completion checkbox | Task identifier and desired completion state | Updated Task completion fields after the existing coordinator action | None, existing local browser data | Existing coordinator persistence error feedback |
| Active Home and Tasks lists | Persisted Task collection and, on Tasks, existing search query | Incomplete Tasks grouped by existing category rules | None, existing local browser data | Existing task store hydration and error behavior |
| Tasks archive disclosure | Keyboard or pointer activation | Temporary expanded or collapsed state and derived completed Task groups | None, existing local browser data | None |
| Archive reopen checkbox | Task identifier and incomplete state | Updated completion fields and restored active Task | None, existing local browser data | Existing coordinator persistence error feedback |

**Value sourcing**:

| Action | Value produced or displayed | Source |
| --- | --- | --- |
| Complete Task | Completion state and completion time | Existing completion checkbox action writes `Task.isCompleted`, `Task.completedAt`, and `Task.updatedAt` |
| Active list read | Tasks that remain visible in Home and the matrix | Existing Task collection filtered by `isCompleted` false |
| Archive read | Tasks shown in the archive | Existing Task collection filtered by `isCompleted` true |
| Archive grouping | Category name and group order | Existing `Task.category` and matrix category order |
| Archive sorting | Completion time, with a fallback for older records | `Task.completedAt` descending; `Task.updatedAt` only when `completedAt` is absent; existing task order breaks ties |
| Tasks search | Search text and matching active task text | Existing Tasks search query and each active Task's title and description |
| Archive expansion | Whether the section is open | Temporary Tasks page state, initialized as false |
| Home category after completion | Next visible category | Remaining incomplete Tasks and the existing category priority order |
| Reopen Task | Restored category, order, and completion fields | Existing Task record and completion action; its category and relative task order are preserved |
| Calendar availability | Whether a Task remains available to Calendar | Existing `Task.archivedAt` and Calendar rules; this feature never changes the field |
| Recurrence and occurrence state | Whether a series remains active and the state of saved occurrences | Existing Calendar records and rules; task completion does not change them |
| Subtask checklist | Child tasks and their completion state | Existing Subtask to Task relationship and Subtask store |
| Animation preference | Whether exit motion is reduced | Browser `prefers-reduced-motion` preference |
| Write failure | Whether a completion is shown as successful | Existing coordinator result and its current error feedback |

**Key invariants**:

- `isCompleted` is the only source of archive membership. `archivedAt` is not set or cleared by completing or reopening a task.
- The archive is a derived view, not a second persisted representation of Task data.
- The archive sort fallback for a missing `completedAt` is `updatedAt`; this fallback does not repair or rewrite the record.
- Reopening preserves the Task's category and relative order in the existing collection.
- Task completion does not change Subtask, recurrence, or scheduled occurrence state.
- An unsuccessful coordinator write does not remove a Task from the active view or start its completion animation.
- Archive expansion is temporary page state and starts collapsed on each page load.

**Security model**:

Not applicable beyond the existing local browser data model. The feature adds no endpoint, account access rule, or new data destination.

**Configuration required**:

None.

**Critical test scenarios** (each maps to an acceptance criterion in Requirements):

- Complete a task from the Tasks matrix and Home, verify it leaves the active view only after a successful coordinator write, verifies **AC-1**.
- Complete the last task in Home's current category, verify Home advances to the next category with incomplete tasks and shows no archive, verifies **AC-2**.
- Expand the Tasks archive, verify it is below the matrix, grouped in matrix category order, sorted by completion time, and uses `updatedAt` only when `completedAt` is missing, verifies **AC-3**.
- Search while completed tasks exist, verify search filters active tasks only and archive contents do not change, verifies **AC-4**.
- Reopen a completed task, verify it leaves the archive, returns to its original category and relative order, and clears completion time, verifies **AC-5**.
- Complete and reopen a Task with Calendar data, verify `archivedAt`, active recurrence, and saved occurrence state are unchanged, verifies **AC-6**.
- Complete a Task with Subtasks, verify the existing checklist remains visible and each Subtask state is unchanged, verifies **AC-7**.
- Use keyboard controls and reduced motion, verify the disclosure exposes its state, focus remains useful when a card exits, and motion is removed or reduced when requested, verifies **AC-8**.
- Simulate a coordinator persistence failure and a second open tab, verify failed writes do not animate or update as complete and successful writes propagate through the existing coordinator, verifies **AC-9**.

## Build plan

The project uses the Skateboard approach, so build the thinnest usable completion and reopen flow first using existing Task data. Add the motion and cross tab regression coverage without introducing a migration or a second archive store.

1. [x] Derive incomplete Tasks for Home and the active matrix, add the collapsed archive below the matrix with category grouping, recent first ordering, active only search, and reopening through the existing completion action. Preserve Task category, order, and Subtask state. Satisfies **AC-1**, **AC-2**, **AC-3**, **AC-4**, **AC-5**, **AC-7**.
2. [x] Add the shared completion exit motion, reduced motion behavior, keyboard operable archive disclosure, and focus handoff for both task surfaces. Satisfies **AC-8**.
3. [x] Add regression coverage for Calendar independence, coordinator persistence failure, and updates across open tabs. Confirm no new schema or migration is needed. Satisfies **AC-6**, **AC-9**.

## Consequences

**Positive**:

- Completed tasks leave active views without adding persisted state or a migration.
- Reopening is a normal completion toggle, and Calendar planning remains independent.
- The existing coordinator continues to own persistence and updates across tabs.

**Negative / tradeoffs**:

- A completed Task remains available to Calendar unless it was independently archived there.
- A task completed on Home is not shown in an archive on Home; reopening it requires the Tasks page.
- A missing completion time can only be ordered approximately using `updatedAt`.

**Neutral**:

- The archive reflects current completion state, not permanent completion history.
- The archive disclosure state is not remembered after a page load.