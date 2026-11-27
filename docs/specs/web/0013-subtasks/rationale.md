# Rationale · 0013 · Nested subtasks

## Context

The Tasks matrix currently stores reusable `Task` records and has no child hierarchy. The planned feature needs arbitrary nesting, but Calendar and Profile already treat a `Task` as a standalone record. Subtasks must not change task completion, Calendar behavior, or Profile counts and activity.

Task state is persisted in the version 4 `tasks-storage` key. The Calendar and Tasks coordinator serializes writes across tabs, persists before broadcasting, and can be active in an older open tab after a new version is loaded. A task only storage format cannot safely accept new fields from an older writer, and an older coordinator does not know Subtask commands.

The matrix columns have a height limit and scroll their task lists. The existing Task component edits on double click, saves with Enter or a Save action, and cancels with Cancel, Escape, or an outside click. The accepted inline editing spec describes blur saving, which differs from the current component.

## Options considered

### Option 1: Extend the existing coordinator with separate Subtask storage

Keep `Task` unchanged, add a versioned Subtask collection under its own storage key, and include that state in the existing Calendar and Tasks command boundary.

**Pros**:

* Reuses the current task ownership, Web Lock, command queue, and cross tab broadcast.
* A legacy Task writer cannot overwrite the separate Subtask key.
* Task deletion and Subtask deletion can be handled in one ordered state change.

**Cons**:

* The coordinator must persist and roll back one additional key, and detect older owners that cannot process new commands.
* The model and coordinator need focused migration, failure, and cross tab tests.

### Option 2: Add a separate Subtask coordinator

Keep a separate Subtask store and introduce another lock, command queue, and broadcast channel alongside the Calendar and Tasks coordinator.

**Pros**:

* Subtask state and its command contract remain isolated from existing Task commands.
* A Subtask coordinator can evolve without changing Calendar command types.

**Cons**:

* Task deletion and Subtask deletion cross two independently ordered state owners, so races can leave orphan records.
* The app would operate two coordination systems for one task tree and need reconciliation between them.

### Option 3: Replace Task records with one recursive Task model

Represent both matrix tasks and checklist items as Task records with parent links.

**Pros**:

* One record type could support shared editing and completion operations.
* Parent relationships would be available to any Task consumer.

**Cons**:

* Calendar and Profile currently treat every Task as a standalone reusable task, so consumers would need new filtering and counting rules.
* Replacing the current Task model broadens migration risk beyond the requested matrix checklist.

## Rationale

The app already routes task writes through one coordinator that serializes changes across tabs. Keeping one write owner avoids a race between deleting a Task and deleting its Subtask tree. Keeping Subtasks in a separate key protects them from older code that rewrites only `tasks-storage`, while leaving the established Task shape intact for Calendar and Profile.

The older coordinator cannot safely process a new Subtask command, so the feature must detect that case and prevent a false success. Asking the older tab to refresh is simpler and safer than operating a second lock and later reconciling two state owners. The feature remains local and does not add a service, endpoint, or dependency.