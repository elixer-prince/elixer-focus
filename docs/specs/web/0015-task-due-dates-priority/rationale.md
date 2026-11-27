# Rationale: Task due dates and priority

## Context

Tasks are stored in one shared `Task` record and appear on both Home and the full Tasks page. The existing Eisenhower categories organize the matrix, and the task card already supports inline title and description editing. Task changes use a restricted update contract and pass through the Calendar coordinator, which persists task state and broadcasts successful changes to other tabs.

Task persistence is written by both the task store and the Calendar coordinator. Each currently uses storage version 4. The Tasks page also supports category grouping, search, and drag reordering, while Home displays active task cards and the Tasks page has a completed task archive. A deadline must remain distinct from Calendar scheduling and must not make a completed task appear overdue.

## Options considered

### Option 1: Extend the shared Task and coordinator

Add the optional deadline to the existing `Task` record and carry edits through the current coordinator.

**Pros**:

- Home and Tasks read one persisted value without joining another store.
- Existing persistence and cross tab update behavior remain the single write path.
- The category stays the sole priority model.

**Cons**:

- The restricted update contract and two storage version constants must stay aligned.
- A fixed instant can display as a different local time after a timezone change.

### Option 2: Store deadline metadata separately

Keep `Task` unchanged and add a separate persisted record keyed by task ID.

**Pros**:

- Deadline data would be separate from the task contract.
- More deadline specific metadata could be added without widening `Task`.

**Cons**:

- Home and Tasks would need to join task data with deadline metadata.
- A second persistence and broadcast path could drift from the task record when tasks are edited, completed, or deleted.

### Option 3: Reuse Calendar scheduling as the deadline

Represent a task deadline through the existing scheduled occurrence or recurrence data.

**Pros**:

- Calendar already handles dates and times for task scheduling.
- A deadline could appear alongside planned Calendar work.

**Cons**:

- A deadline is not a scheduled work block, and some tasks are not scheduled.
- Reusing Calendar state would couple deadlines to availability and recurrence behavior that this feature must leave unchanged.

## Rationale

The task is already the shared source used by Home and Tasks, and the existing coordinator persists and broadcasts task edits. Adding one optional timestamp there avoids a second store and keeps the implementation within the current task architecture. The current storage version is 4 in two writers, so both versions must advance together while old records remain valid without a deadline. Calendar scheduling represents planned work, not when a task is due, so reusing it would change behavior outside this feature.