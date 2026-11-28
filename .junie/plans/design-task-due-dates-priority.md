---
sessionId: session-261127-045351-pt6r
---

# Requirements

### Goal and scope

Create a proposed web feature spec that makes task due dates and priority ready to build, using the choices confirmed in this conversation.

### Confirmed behavior

- The existing Eisenhower category remains the only priority model. Do not add a separate priority value.
- A task may have an exact deadline stored as optional `dueAt?: number` in epoch milliseconds. The saved instant stays fixed if the device timezone changes.
- Set or clear the deadline in the existing inline task editor.
- Show the date on active task cards on Home and Tasks. Mark overdue active tasks with a readable text badge. Do not show overdue status on completed archive cards.
- Offer an opt in due date sort on the Tasks matrix only. It sorts within each quadrant, earlier deadlines first and tasks without a deadline last. Manual order remains the default and the sort choice is temporary.

### Out of scope

- A separate priority field or metadata store.
- Changes to Calendar scheduling or recurrence behavior.
- Source code changes as part of this design task.

# Technical Design

### Current implementation

- `web/src/features/tasks/types/task.ts` defines `Task` and its five existing `TaskCategory` values.
- `web/src/features/tasks/stores/tasks-store.ts` persists tasks at version 4. Its update action accepts a restricted set of fields and routes writes through `dispatchCalendarCommand()`.
- `web/src/features/calendar/services/calendar-coordinator.ts` defines the matching `update-task` command, applies task edits, broadcasts state across tabs, and writes task persistence using its own version 4 constant.
- `web/src/features/tasks/components/Task/Index.tsx` owns inline title and description editing, selection border styling, and a `taskSurface` prop for matrix, Home, and archive cards.
- `web/src/features/tasks/components/TaskPageHeader.tsx` owns task creation and search controls. `web/src/app/routes/my/Tasks.tsx` groups active tasks by category and supports drag reordering. The Home route at `web/src/app/routes/(root)/Index.tsx` also renders task cards.
- Relevant existing tests include `web/src/features/tasks/__tests__/components/Task/Index.test.tsx`, `web/src/features/tasks/__tests__/components/TaskPageHeader.test.tsx`, `web/src/features/tasks/__tests__/stores/tasks-store.test.ts`, and `web/src/features/calendar/__tests__/services/calendar-coordinator.test.ts`.

### Key decisions

Keep one persisted `Task` record and the existing coordinator write path. The category continues to represent priority, and no new entity or relationship is introduced. Use the existing web date and time input conventions, with the selected local date and time converted to a fixed epoch instant. Keep sorting as a derived view so it does not overwrite manual task order.

### Proposed changes

The feature spec should define the optional `dueAt` contract, deadline editing and clearing, local display, overdue state, sort behavior, migration expectations, and edge cases. Its Skateboard build plan should first deliver the due date end to end through the existing Task model, editor, persistence, coordinator, and active cards. A later slice should add the temporary due date sort on the full Tasks matrix.

The implementation plan in the spec should extend the Task update field allowlist in both the store and coordinator command. It should keep the two task storage versions aligned at version 5 and ensure older records without `dueAt` remain valid and undated. It should also keep Calendar scheduling and recurrence independent of this task deadline.

### File Structure

- Add the proposed spec at `docs/specs/web/0015-task-due-dates-priority.md`.
- After the spec is confirmed, update the matching feature entry in `docs/scope/web/scope.md` with the spec link and completed design marker.
- Do not modify application source files during this design task.

### Risks

- Converting a local date and time to a fixed instant must be consistent when editing and displaying after a timezone change.
- The task store and coordinator each write task persistence, so their versions must remain aligned.
- Sorting must not silently replace the manual drag order. The selected sort view should not mutate stored ordering.
- The card border already communicates selection, so overdue status should use the chosen text badge rather than relying on a red border.

# Validation

### Spec completeness checks

- Confirm every required value has a named source, especially the deadline instant, overdue comparison, and ordering of tasks without a deadline.
- Confirm the spec describes legacy tasks without `dueAt`, clearing a deadline, completed task behavior, and preservation of manual order.
- Confirm the build plan covers the Task type, restricted update contract, versioned persistence, coordinator broadcast, Home and Tasks cards, and co located regression tests.
- Confirm the scope entry points to the proposed spec and remains planned until development begins.

No application tests are run or changed as part of the design task.

# Delivery Steps

### ✓ Step 1: Finalize the due date behavior contract

The design records the confirmed task rules and closes the remaining implementation details without adding a second priority model.

1. Record the existing Eisenhower category as the priority model and `dueAt?: number` as the optional fixed instant.
2. Define input, clearing, local display, and when an incomplete task becomes overdue.
3. Define temporary sorting within each Tasks matrix quadrant, including undated tasks, drag behavior, and interaction with search.
4. Keep Calendar scheduling and recurrence outside the due date contract.

### ✓ Step 2: Write the proposed web feature spec

A proposed spec at `docs/specs/web/0015-task-due-dates-priority.md` gives `/develop` a complete, Skateboard ordered build plan.

1. Describe the data contract and the existing Task and coordinator write path.
2. Specify synchronized task persistence version changes and compatibility for older tasks without a deadline.
3. Divide the build into a usable due date slice followed by the opt in matrix sort.
4. Include acceptance and regression scenarios for editing, overdue display, sorting, manual order preservation, and cross tab updates.

### ✓ Step 3: Link the confirmed spec from scope

The planned task entry points to the confirmed spec and remains ready for development without changing source code.

1. After confirmation, add the spec pointer and completed design marker to the task entry in `docs/scope/web/scope.md`.
2. Leave the feature planned until `/develop` starts implementation.
3. Keep the spec status `Proposed` and make no application code changes.
