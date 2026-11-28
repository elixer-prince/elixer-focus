# 0001. Inline task editing

**Date**: 2026-11-22
**Status**: Accepted

## Summary

The task matrix lets you edit a task title and description inline. Double-click the task or focus it and press F2 to open the editor. Drag and drop is paused while editing. Press Enter or activate Save to commit changes; Escape, Cancel, or clicking outside the task cancels the edit.

## Context

Before inline editing, the task matrix let users create and move tasks, mark them complete, and delete them, but not change a task after creation. This feature closed that gap. The shipped Task component now supports inline editing, with drag disabled during editing and explicit save or cancel actions that avoid applying changes just because focus moved.

## Requirements

**User stories**:

- As a user, I want to double-click a task or focus it and press F2 to edit its title and description inline so I can fix mistakes without leaving the matrix.
- As a user, I want Enter or Save to commit my edits, and Escape, Cancel, or clicking outside to discard them, so I control when changes are applied.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

- **AC-1**: Double-clicking a task card or focusing it and pressing F2 replaces the title and description text with editable input fields. The checkbox remains visible. The delete button hides during edit.
- **AC-2**: Pressing Enter in the title field or activating Save commits the edited values to the task store. Moving focus away by itself does not save. The editor closes after a successful save.
- **AC-3**: Pressing Escape, activating Cancel, or clicking outside the task cancels the edit. The editor closes and the original values remain unchanged.
- **AC-4**: Drag-and-drop is disabled while a task is being edited. The task cannot be moved until the edit is saved or cancelled.
- **AC-5**: Saving an empty title is rejected. The editor stays open so the user can enter a non-empty title.
- **AC-6**: The description input is always shown in the editor, even if the task has no existing description. Saving an empty description is allowed (optional field).
- **AC-7**: Edited values persist across page reloads via the existing Zustand persist middleware.

## Options considered

### Option 1: Double-click inline edit (recommended)

Double-click or F2 triggers the editor. Title and description text are replaced by input fields in place. Drag is disabled during edit. Enter or Save commits changes; Escape, Cancel, or clicking outside cancels.

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

Double-click or F2 replaces the task text with inline input fields, and drag is paused during edit. Enter or Save commits the change; Escape, Cancel, or clicking outside cancels it.

## Rationale

Double-click keeps inline editing fast and keeps the user's eyes on the matrix, while F2 provides a keyboard entry point. The drag-and-drop conflict is resolved by disabling drag during edit, which is a simple state check in the useSortable hook. Explicit Enter and Save actions commit changes; Escape, Cancel, and clicking outside discard them rather than saving unexpectedly on blur. A modal dialog would add unnecessary weight for editing task text, and an edit button on hover would add visual noise to every card.

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

Transition: view → edit on double-click or F2. Edit → view on save (Enter or Save) or cancel (Escape, Cancel, or click outside).

**Key invariants**:

- Title must be non-empty on save.
- Only one task is editable at a time. Editing task A does not affect task B.
- Drag-and-drop is disabled for the editing task only. Other tasks remain draggable.

**Security model**:

Not applicable. All data is local (Zustand with persist middleware, stored in localStorage). No auth or multi-user access.

**Configuration required**:

None.

**Critical test scenarios** (each maps to an acceptance criterion in ## Requirements):

- Happy path: double-click a task or focus it and press F2, change the title, then press Enter or activate Save. Verify the displayed text updates and persists after reload, verifies **AC-1**, **AC-2**, **AC-7**
- Cancel edit: change the title, then press Escape, activate Cancel, or click outside the task. Verify the text reverts to the original value, verifies **AC-3**
- Empty title rejection: double-click a task, clear the title, and press Enter, and verify the editor stays open, verifies **AC-5**
- Drag disabled during edit: double-click a task to enter edit mode, attempt to drag it, and verify the drag does not start, verifies **AC-4**
- Description edit: double-click a task with no description, add a description, and save, and verify it displays, verifies **AC-6**

## Build plan

1. Add `updateTask` action to the Zustand task store (`tasks-store.ts`) that merges partial updates (title, description) into the existing task by ID, satisfies **AC-2**, **AC-7**
2. Add a selective hook `useUpdateTask` exported from the store, satisfies **AC-2**
3. Update the Task component (`Task/Index.tsx`) to add an `isEditing` state, a `onDoubleClick` handler that enters edit mode, and conditional rendering: input fields when editing, read-only text when viewing, satisfies **AC-1**
4. Wire save (Enter key and Save action) and cancel (Escape, Cancel action, and click outside) handlers in the Task component to call `updateTask` or revert, satisfies **AC-2**, **AC-3**
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
