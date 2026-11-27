# 0015. Task due dates and priority

**Date**: 2026-11-27
**Status**: Accepted

## Summary

The existing Eisenhower category remains the only task priority model. This decision adds an optional exact due time to each task, stored as one fixed instant. The first build slice will let you set and clear a deadline and see it on active cards, then a second slice will add temporary due date sorting to the Tasks matrix without changing saved task order.

## Requirements

**User stories**:

- As a user, I want to set or clear an exact task deadline so I can manage when work is due.
- As a user, I want to see upcoming and overdue deadlines on active task cards so I can act on them.
- As a user, I want an optional due date view on the Tasks page while keeping my manual task order intact.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

- **AC-1**: `Task` has an optional `dueAt?: number` field in epoch milliseconds. The value represents one fixed instant. The existing `category` remains the only priority model, and no separate priority field or metadata record is added. Existing tasks without `dueAt` remain valid and undated.
- **AC-2**: You can set or clear the deadline in the existing inline task editor. The entered local date and time are converted to epoch milliseconds when saved. Clearing removes the stored `dueAt` field. The update command accepts a number to set the deadline and `null` as an explicit clear value; `null` is not stored on `Task`.
- **AC-3**: Task deadline edits use the existing task update path through `dispatchCalendarCommand()`. The task store and Calendar coordinator both write task persistence at version 5. A successful update is persisted and broadcast to other open tabs through the existing coordinator behavior.
- **AC-4**: Active task cards on Home and the Tasks page display the due date and time when `dueAt` is present. The display uses the browser's current locale and timezone. A task without `dueAt` has no deadline display. Changing device timezone changes the displayed local time, not the saved instant.
- **AC-5**: An active task is overdue when `Date.now()` is later than its `dueAt`. Show a readable `Overdue` text badge on overdue active cards. Do not rely on card border color for overdue status, because the border continues to indicate selection. Completed archive cards never display overdue status.
- **AC-6**: Setting or clearing `dueAt` does not change `archivedAt`, Calendar availability, scheduled occurrences, or recurrence behavior.
- **AC-7**: The Tasks matrix offers an opt in due date sort. Manual order is the default. When selected, sort tasks by ascending `dueAt` within each existing category, keep tasks with equal deadlines in their existing manual order, and place tasks without a deadline after dated tasks. Apply the existing search filter before sorting its matching tasks. Home ordering is unchanged.
- **AC-8**: The selected sort is temporary view state and resets to manual order when the Tasks page is reopened or reloaded. Sorting is derived and never updates stored task order. Disable drag reordering while due date sort is selected; switching back to manual order restores drag reordering and the saved manual order.

## Decision

**Chosen option**: Option 1: Extend the shared Task and coordinator

Keep the deadline on the existing `Task` record and use its current coordinator write path. Keep `category` as the only priority model and keep Calendar scheduling separate.

## Feature design

**Data model sketch**:

| Record | Fields used by this feature | Relationships |
| --- | --- | --- |
| `Task` | Existing `category` remains priority. Add optional `dueAt?: number`, an epoch millisecond instant. | No new relationship or record. |
| Task persistence | Existing `tasks-storage` key, version 5 in both the task store and Calendar coordinator. | Existing store and coordinator remain the only persistence path. |

Version 4 task records have no deadline. Keep them valid and undated; do not backfill or infer a deadline. Persisted task records contain a number or omit `dueAt`, never store `null`.

**State transitions**:

| Action | State change | View result |
| --- | --- | --- |
| Set deadline | Store the selected local date and time as epoch milliseconds in `Task.dueAt`. | Active cards show the deadline in the current local timezone. |
| Clear deadline | Send `null` in the update command and remove `Task.dueAt`. | Deadline display and overdue badge are absent. |
| Deadline passes | `Date.now()` becomes later than `Task.dueAt` while `isCompleted` is false. | Active card shows the `Overdue` text badge. |
| Select due date sort | Change temporary Tasks page view state only. | Tasks are sorted within their categories without changing stored order. |

**API surface**:

There is no HTTP API. Extend the existing `update-task` coordinator command. Its `taskId` identifies the task; `updates.dueAt` accepts an epoch millisecond number to set the deadline or `null` to clear it. The Task record itself contains only an optional number.

**Value sourcing**:

| Action | Value produced or displayed | Source |
| --- | --- | --- |
| Set deadline | Fixed deadline instant in epoch milliseconds | The date and time selected in the inline editor, interpreted in the browser's current timezone when saved. |
| Clear deadline | No deadline value on the task | The editor's explicit clear action, sent as `null` through the update command and removed before persistence. |
| Display deadline | Local date and time | `Task.dueAt`, formatted with the browser's current locale and timezone. |
| Determine overdue state | Overdue or not overdue | Active status from `Task.isCompleted`, `Task.dueAt`, and the current instant from `Date.now()`. Overdue means `Date.now() > dueAt`. |
| Sort tasks | Category order, deadline order, and manual order for ties | Existing `Task.category` groups, `Task.dueAt`, and the existing task array order. Undated tasks sort last. |
| Filter before sorting | Matching task set | Existing Tasks page search query and its current matching behavior. |

**Key invariants**:

- `Task.category` remains the only priority classification.
- The saved deadline instant does not change when the device timezone changes. Its local display may change.
- Active cards on Home and Tasks show deadlines. Only overdue active tasks show an `Overdue` badge, and completed archive cards never show that badge.
- Deadline edits do not change Calendar schedule, recurrence, occurrence, or archive state.
- Due date sorting is a derived view. It never writes or replaces manual task order.
- Due date sorting runs within existing categories, after search filtering, with undated tasks last.
- Drag reordering is unavailable while due date sort is selected.

**Security model**:

No change. Tasks remain local browser data handled by the existing task store and coordinator. No new API, role, or access rule is introduced.

**Configuration required**:

None.

**Critical test scenarios** (each maps to an acceptance criterion in ## Requirements):

- Set a local date and time, verify the saved `dueAt` is an epoch millisecond instant and the task update uses the coordinator, verifies **AC-1**, **AC-2**, **AC-3**.
- Clear a deadline, verify `dueAt` is absent from the persisted task and no deadline display remains, verifies **AC-2**.
- Load an existing version 4 task without `dueAt`, verify it remains valid and undated after the version 5 migration, verifies **AC-1**, **AC-3**.
- Update a deadline in one tab and verify the successful change appears in another tab, verifies **AC-3**.
- Change the browser timezone after setting a deadline, verify local display changes while the stored instant remains the same, verifies **AC-4**.
- Verify due date and time on active Home and Tasks cards, no deadline UI for undated tasks, an `Overdue` text badge only after the instant passes, and no overdue UI on completed archive cards, verifies **AC-4**, **AC-5**.
- Set and clear a deadline on a task with Calendar scheduling or recurrence, verify the Calendar fields and behavior remain unchanged, verifies **AC-6**.
- Sort tasks within categories, verify ascending deadlines, stable manual order for equal deadlines, undated tasks last, and search results filtered before sorting, verifies **AC-7**.
- Reopen or reload the Tasks page after selecting due date sort, verify manual order is selected by default and stored task order is unchanged, verifies **AC-8**.
- Verify drag is disabled in due date sort and restored in manual order, with the original manual order preserved, verifies **AC-8**.

## Build plan

### Slice 1: Due date end to end

1. Add optional `dueAt?: number` to `Task` and extend the restricted update fields in the task store and matching `update-task` coordinator command. Use `null` as the explicit clear value in the command and remove the field from the stored task when clearing, satisfies **AC-1**, **AC-2**.
2. Advance the task store and Calendar coordinator task storage versions together from 4 to 5. Preserve existing migrations and keep version 4 tasks without `dueAt` valid and undated, satisfies **AC-1**, **AC-3**.
3. Add setting and clearing the local date and time to the existing inline task editor. Convert the selected local date and time to the fixed epoch instant and save through the existing coordinator path, satisfies **AC-2**, **AC-3**.
4. Show the locally formatted deadline and readable overdue text badge on active task cards on Home and Tasks. Leave completed archive cards and Calendar state unchanged, satisfies **AC-4**, **AC-5**, **AC-6**.
5. Add or extend co located regression tests for `Task/Index.test.tsx`, `tasks-store.test.ts`, and `calendar-coordinator.test.ts` to cover editing, clearing, legacy records, overdue display, and cross tab updates, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-4**, **AC-5**, **AC-6**.

### Slice 2: Temporary Tasks matrix sort

6. Add temporary due date sort state and a control to the full Tasks matrix. Derive sorted groups from the existing categories and task array, filter by the existing search query first, sort by deadline within each category, preserve manual order for equal deadlines, and place undated tasks last, satisfies **AC-7**, **AC-8**.
7. Disable drag reordering while the due date view is selected. Restore drag when manual order is selected, and ensure the derived sort never updates stored task order, satisfies **AC-8**.
8. Add or extend co located Tasks page tests for default and reset behavior, search interaction, category boundaries, equal and missing deadlines, drag availability, and manual order preservation, satisfies **AC-7**, **AC-8**.

## Consequences

**Positive**:

- A deadline is available from the same Task record on both active task surfaces.
- Task categories remain the only priority model, and manual ordering remains intact.
- Calendar scheduling and recurrence stay independent from task deadlines.

**Negative / tradeoffs**:

- A fixed instant may display at a different local date or time after a timezone change.
- The task store and coordinator must keep their task persistence versions aligned.
- Due date labels and overdue badges add information to active cards, and due date sort temporarily changes their displayed order.

**Neutral**:

- Existing tasks need no deadline backfill. They remain undated until a user sets a due date.