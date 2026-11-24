# 0001. Inline task editing

**Date**: 2026-11-22
**Status**: Accepted

## Summary

The task matrix currently lets you create and move tasks, but not edit them after creation. This spec adds inline editing so you can double-click a task to change its title and description right on the card. Drag and drop is paused while editing to avoid conflicts. Changes save when you press Enter or click away, and Escape cancels.

## Context

The task matrix (feature 7) is already built and working. Users can create tasks, drag them across Eisenhower categories, mark them complete, and delete them. But once a task is created, there is no way to fix a typo, add a description, or clarify the title. This makes the task matrix feel incomplete: you can add tasks but not refine them. The gap is small to fix (the store already persists tasks via Zustand, and the Task component renders each field), but it needs careful handling of the double-click trigger so it does not fight the existing drag-and-drop behavior from @dnd-kit/react v9.

## Requirements

**User stories**:

- As a user, I want to double-click a task to edit its title and description inline so I can fix mistakes and add detail without leaving the matrix.
- As a user, I want my edits to save automatically when I finish typing so I do not lose changes.
- As a user, I want to cancel an edit with Escape so I can back out without saving.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

- **AC-1**: Double-clicking a task card replaces the title and description text with editable input fields. The checkbox remains visible. The delete button hides during edit.
- **AC-2**: Pressing Enter or moving focus away (blur) saves the edited values to the task store. The input fields revert to read-only text.
- **AC-3**: Pressing Escape cancels the edit. The input fields revert to the original values without saving.
- **AC-4**: Drag-and-drop is disabled while a task is being edited. The task cannot be moved until the edit is saved or cancelled.
- **AC-5**: Saving an empty title is rejected. The editor stays open so the user can enter a non-empty title.
- **AC-6**: The description input is always shown in the editor, even if the task has no existing description. Saving an empty description is allowed (optional field).
- **AC-7**: Edited values persist across page reloads via the existing Zustand persist middleware.

## Options considered

### Option 1: Double-click inline edit (recommended)

Double-click triggers the editor. Title and description text are replaced by input fields in place. Drag is disabled during edit. Enter or blur saves, Escape cancels.

**Pros**:

- Natural interaction: double-click to edit is a well-known pattern. No extra UI chrome.
- Minimal code change: only the Task component and store need updates.

**Cons**:

- Double-click timing must not conflict with drag start. Need a small delay or explicit check.

### Option 2: Edit button on hover

An edit icon appears on hover. Clicking it opens the inline editor.

**Pros**:

- No risk of conflicting with drag, since the trigger is a separate button.

**Cons**:

- Adds visual clutter to every task card. Extra hover state to maintain. Less discoverable than double-click for a dense matrix.

### Option 3: Modal dialog edit

Click opens a modal dialog with all task fields.

**Pros**:

- Clear separation between editing and browsing. Easy to add more fields later.

**Cons**:

- Heavier interaction for a simple fix. Breaks the user's focus on the matrix layout. Overkill for editing two text fields.

## Decision

**Chosen option**: Option 1: Double-click inline edit

Double-click replaces the task text with inline input fields, drag is paused during edit, and Enter or blur saves the change.

## Rationale

Double-click is the standard way to edit text inline. It keeps the interaction fast and keeps the user's eyes on the matrix. The drag-and-drop conflict is resolved by disabling drag during edit, which is a simple state check in the useSortable hook. A modal dialog would work but adds unnecessary weight for editing two fields. An edit button on hover adds visual noise to every card. This approach adds the least code and the least visual change, fitting the Skateboard build approach of shipping the thinnest usable whole.

## Feature design

**Data model sketch**:

No schema change. The Task type remains unchanged:

```typescript
type Task = {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  isCompleted: boolean;
  isSelected: boolean;
  createdAt: number;
};
```

One new store action is added: `updateTask(id, updates)` that merges partial updates into the existing task. This follows the same pattern as `toggleTaskCompletion`.

**State transitions**:

Each task card has two visual states:

- **View mode** (default): shows read-only text, draggable, deletable.
- **Edit mode**: shows input fields, not draggable, delete button hidden.

Transition: view → edit on double-click. Edit → view on save (Enter/blur) or cancel (Escape).

**Key invariants**:

- Title must be non-empty on save.
- Only one task is editable at a time. Editing task A does not affect task B.
- Drag-and-drop is disabled for the editing task only. Other tasks remain draggable.

**Security model**:

Not applicable. All data is local (Zustand with persist middleware, stored in localStorage). No auth or multi-user access.

**Configuration required**:

None.

**Critical test scenarios** (each maps to an acceptance criterion in ## Requirements):

- Happy path: double-click a task, change the title, press Enter, and verify the displayed text updates and persists after reload, verifies **AC-1**, **AC-2**, **AC-7**
- Cancel edit: double-click a task, change the title, press Escape, and verify the text reverts to the original value, verifies **AC-3**
- Empty title rejection: double-click a task, clear the title, and press Enter, and verify the editor stays open, verifies **AC-5**
- Drag disabled during edit: double-click a task to enter edit mode, attempt to drag it, and verify the drag does not start, verifies **AC-4**
- Description edit: double-click a task with no description, add a description, and save, and verify it displays, verifies **AC-6**

## Build plan

1. Add `updateTask` action to the Zustand task store (`tasks-store.ts`) that merges partial updates (title, description) into the existing task by ID, satisfies **AC-2**, **AC-7**
2. Add a selective hook `useUpdateTask` exported from the store, satisfies **AC-2**
3. Update the Task component (`Task/Index.tsx`) to add an `isEditing` state, a `onDoubleClick` handler that enters edit mode, and conditional rendering: input fields when editing, read-only text when viewing, satisfies **AC-1**
4. Wire save (Enter key and blur) and cancel (Escape key) handlers in the Task component to call `updateTask` or revert, satisfies **AC-2**, **AC-3**
5. Add title validation: reject empty title on save, keep editor open, satisfies **AC-5**
6. Disable drag-and-drop during edit by conditionally passing the ref or using the `disabled` option in `useSortable`, satisfies **AC-4**
7. Add co-located tests in `__tests__/components/Task/Edit.test.tsx` covering all acceptance criteria, satisfies **AC-1** through **AC-7**

## Consequences

**Positive**:

- Tasks are now fully editable. The matrix feels complete as a working tool.
- Inline editing is fast: no modal, no page navigation.

**Negative / tradeoffs**:

- Double-click timing: if the user double-clicks too fast while dragging, the second click could fire before drag starts. The edit lock (AC-4) mitigates this, but the timing window exists.
- The Task component grows slightly more complex with the edit state machine.

**Neutral**:

- The `updateTask` store action is a general pattern that other features (e.g., task priority, due dates) can reuse later.

## Follow-up

- [ ] Consider adding a visual indicator (e.g., a subtle background highlight) when a task is in edit mode, so the user knows which card is locked
