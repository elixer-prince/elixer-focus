# Verify: subtasks · spec 0013 · updated 2026-11-26

_Steps derived from spec 0013 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [ ] On `/tasks`, create a Task with root and nested Subtasks, then collapse and reopen the lists. Confirm each parent shows only its direct completion count and nodes with children start collapsed. Confirm Home, Calendar, and Profile do not show checklist controls. → AC-1, AC-4
- [ ] Use two Tasks and several parents with different positions. Expand each tree and confirm reads include only the selected Task and parent, with children ordered by `position`. → AC-1
- [ ] Complete a root child and a grandchild. Confirm the Task count includes only root children, while each Subtask count includes only its direct children. → AC-1, AC-4
- [ ] Add a child from a specific Task or Subtask row using a padded title. Confirm the stored Task ID, parent ID, and trimmed title match those inputs. → AC-2
- [ ] Add another sibling. Confirm its ID is unique, completion defaults to false, timestamps are current, and position appends to that sibling group. → AC-2
- [ ] Add duplicate titles and try a blank or whitespace only title. Confirm duplicate titles are allowed and blank titles add nothing. Enter submits and clears the field; Escape clears only the draft and leaves the field available. → AC-2
- [ ] Rename and toggle one Subtask. Confirm only its title or completion value and `updatedAt` change. Reopen completed parents and children in different orders, and confirm completion does not cascade or change Profile totals, badges, or activity. → AC-3, AC-4
- [ ] Edit by double click and keyboard. Confirm Enter and Save commit, while Cancel, Escape, and an outside click discard; a blank title keeps the editor open with an error. → AC-3
- [ ] Delete a leaf, then cancel a subtree deletion. Confirm the tree remains intact. Confirm deletion and check that only the selected node and its descendants disappear, the confirmation count comes from parent links, and former siblings are reindexed. Delete a Task with descendants and confirm it asks first. → AC-5
- [ ] Reorder siblings with pointer and keyboard, including a move to the end. Confirm a move cannot change its parent and each sibling group has dense positions. Issue concurrent moves and confirm they apply to the latest shared group in coordinator order. → AC-6, AC-8
- [ ] Reload and synchronize both storage keys. Confirm version 5 `tasks-storage` records stay unchanged, version 1 `subtasks-storage` holds the tree, and missing Task references are removed when the updated coordinator next owns state. → AC-7, AC-8
- [ ] Keep an older coordinator tab open. Confirm Subtask controls show a refresh message and commands are not reported as saved. Close or refresh it and confirm edits work under the updated owner. → AC-7, AC-8
- [ ] Fail a local storage write while adding, editing, deleting, and reordering. Confirm prior data remains in effect, no failed change is broadcast as saved, the error toast appears, and add or edit drafts remain available for retry. → AC-8
- [ ] Disable Web Locks or `BroadcastChannel`. Confirm the Task matrix remains usable in one tab. → AC-8

## Commands

- [ ] `cd web && npm run test -- --run src/features/calendar/__tests__/services/calendar-coordinator.test.ts` → coordinator tests pass → AC-6, AC-7, AC-8
- [ ] `cd web && npm run test -- --run src/features/tasks/__tests__/components/Task/SubtaskChecklist.test.tsx` → recursive checklist tests pass → AC-1, AC-2, AC-3, AC-4, AC-5, AC-8
- [ ] `cd web && npm run test -- --run src/features/tasks/__tests__/components/Task/Index.test.tsx` → Task card tests pass → AC-1, AC-5
- [ ] `cd web && npm run test -- --run src/features/tasks/__tests__/components/Task/DeleteButton.test.tsx` → Task deletion tests pass → AC-5
- [ ] `cd web && npm run test -- --run src/features/tasks/__tests__/components/Column/Index.test.tsx` → Column integration tests pass → AC-1
- [ ] `cd web && npm run test -- --run src/features/tasks/__tests__/components/Column/TaskList.test.tsx` → Task list tests pass → AC-1
- [ ] `npm run typecheck:web` → type check passes → AC-1 through AC-8
- [ ] `cd web && npm run lint` → lint passes → AC-1 through AC-8

## Acceptance-criteria coverage

- AC-1 and AC-4 are covered by the first three UI steps.
- AC-2 is covered by the fourth, fifth, and sixth UI steps.
- AC-3 is covered by the seventh and eighth UI steps.
- AC-5 is covered by the ninth UI step.
- AC-6 is covered by the tenth UI step.
- AC-7 is covered by the eleventh and twelfth UI steps.
- AC-8 is covered by the tenth, twelfth, thirteenth, and fourteenth UI steps.