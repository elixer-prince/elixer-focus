# 0013. Nested subtasks

**Date**: 2026-11-26
**Status**: Accepted

## Summary

Add nested checklists to the Tasks matrix without turning checklist items into full `Task` records. Store Subtasks in their own versioned browser key, and keep their writes under the existing Calendar and Tasks coordinator (the shared write owner across tabs). Each parent shows progress for its direct children, and each level supports adding, editing, deleting, and keyboard accessible sibling reordering.

## Requirements

**User stories**:

* As a person using the Tasks matrix, I want to break a task into nested steps so that I can track progress without creating separate matrix tasks.
* As a person using the Tasks matrix, I want to see progress for each parent checklist so that I can understand what remains at every level.
* As a person using the Tasks matrix, I want to organize and maintain checklist items in place so that the task tree remains useful as my work changes.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

* **AC-1**: On the Tasks matrix only, a person can expand and collapse a task's nested checklist. Every node with children starts collapsed and shows the completed count and total count for its direct children, including nested Subtask nodes. A tree can be nested to any depth without an application imposed depth limit. The current matrix column height and scrolling behavior remain in place. Home, Calendar, and Profile do not gain Subtask controls or changed Subtask behavior.
* **AC-2**: Each expanded Task or Subtask has an inline title field at the end of its child list. Enter adds a new child with its title trimmed, `isCompleted` false, and a position after its siblings. Empty or whitespace only input adds nothing. Duplicate sibling titles are allowed, there is no added title length limit, and successful submission clears the field. Escape clears only the draft and leaves the field available.
* **AC-3**: A person can enter inline title editing by double clicking a Subtask title or focusing its title and pressing Enter. Enter or Save commits a trimmed nonblank title. Cancel, Escape, or clicking outside cancels the edit. An empty title is rejected and leaves the editor open. Only the edited Subtask's `updatedAt` changes.
* **AC-4**: Toggling a Task or Subtask completion checkbox changes only that record. Parent and child completion states are independent, and completing a parent does not complete its descendants. Progress is derived from completed direct children only. Subtask completion does not change Profile task totals, the First Task badge, or the recent activity feed.
* **AC-5**: Deleting a leaf Subtask removes it immediately. Deleting a Task or Subtask with descendants first asks for confirmation. Cancel preserves the full tree. Confirm removes that node and all its descendants, then closes the position gaps among its former siblings. Deleting a Task also removes every Subtask in its tree.
* **AC-6**: A person can reorder siblings by pointer drag or keyboard drag. A move cannot change the parent of a Subtask. Each sibling group has unique dense integer positions starting at zero. Concurrent moves are applied in coordinator order against the latest sibling list. A move whose source or target is no longer in the same sibling group fails without dropping any record.
* **AC-7**: Subtasks persist under the separate versioned `subtasks-storage` key and remain available after reload. Existing `Task` records and the version 4 `tasks-storage` key remain unchanged. The new key initializes to an empty Subtask list for existing users. A legacy Task writer cannot erase the Subtask key, and legacy Task deletion is reconciled as subtree deletion when the updated coordinator next owns the state.
* **AC-8**: All Subtask mutations use the Calendar and Tasks coordinator. The coordinator state handshake advertises Subtask command support; a response without that capability is treated as a legacy owner. While a legacy coordinator owns the lock, Subtask controls are disabled with a clear request to refresh the older tab, and no command is reported as successful. A local storage write failure uses the existing error toast, does not apply or broadcast the change as saved, and leaves an unsaved add or edit draft available for retry. If Web Locks or `BroadcastChannel` is unavailable, the feature remains usable in one tab.

## Decision

**Chosen option**: Option 1, extend the existing coordinator with separate Subtask storage.

Keep `Task` records in `tasks-storage`. Add a separate version 1 `subtasks-storage` key and a flat collection of Subtask records. Extend the existing Calendar and Tasks coordinator snapshot and commands to handle that collection. When an older coordinator owns the lock, block Subtask mutations and ask the person to refresh that tab rather than sending a command that the older code could silently ignore.

**Implementation skills**: `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.agents/skills/vercel-react-best-practices/`) · `vercel-composition-patterns` (`vercel-labs/agent-skills`, `.agents/skills/vercel-composition-patterns/`) · `web-design-guidelines` (`vercel-labs/agent-skills`, `.agents/skills/web-design-guidelines/`)

## Feature design

**Data model sketch**:

| Entity | Fields and constraints |
| --- | --- |
| Existing `Task` | Unchanged. `id: string` remains the root Task reference. |
| `Subtask` | `id: string` UUID, required. |
| `Subtask` | `taskId: string`, required reference to the owning Task. |
| `Subtask` | `parentSubtaskId: string | null`, null for a top level Subtask and otherwise the ID of its immediate parent. |
| `Subtask` | `title: string`, required, trimmed, and nonblank. No added maximum length. |
| `Subtask` | `isCompleted: boolean`, required and initially false. No `completedAt` field. |
| `Subtask` | `position: integer`, required. Positions are unique and dense from zero within each sibling group. |
| `Subtask` | `createdAt: number` and `updatedAt: number`, required, using the existing Task timestamp format. |
| Persisted Subtask state | Separate `subtasks-storage` key, version 1, containing the flat Subtask collection. It is owned by the Calendar and Tasks coordinator. |

**Relationships**:

* A Task owns zero or more Subtasks through `taskId`.
* A Subtask has zero or more children through their `parentSubtaskId`. A child has exactly one immediate parent, and its `taskId` must match that parent's Task.
* A top level Subtask has a null `parentSubtaskId`. A descendant has one nonnull parent ID. The tree has no fixed depth limit.
* Sibling position uniqueness is scoped to the pair `taskId` and `parentSubtaskId`. Sibling titles are not unique.

**State transitions**:

* A new Subtask starts incomplete and is appended to its sibling group.
* Toggling completion changes only the selected record's `isCompleted` value and `updatedAt`. Reopening it sets `isCompleted` to false. No completion timestamp is stored.
* Renaming changes only the selected Subtask's title and `updatedAt`.
* Deleting a node removes its full descendant tree and reindexes the remaining siblings. Deleting a Task removes all Subtasks with its `taskId`.
* Expansion state is interface state, not persisted data. Nodes with children start collapsed after a reload.

**API surface**:

Subtask actions are local store commands, not HTTP endpoints. Authentication is not required.

| Local action | Method | Key inputs | Key outputs | Auth | Key errors |
| --- | --- | --- | --- | --- | --- |
| Read a Task tree | Read | Task ID and parent Subtask IDs | Children ordered by `position` and each parent's direct child count | None, browser profile only | Unknown Task, unavailable local storage |
| Add a child | Write | Task ID, nullable parent Subtask ID, title | New Subtask ID, timestamps, incomplete state, position at end | None, browser profile only | Blank title, missing Task or parent, legacy coordinator, local storage failure |
| Rename a Subtask | Write | Subtask ID and title | Updated title and `updatedAt` | None, browser profile only | Blank title, unknown Subtask, legacy coordinator, local storage failure |
| Toggle completion | Write | Subtask ID and completion boolean | Updated completion state and `updatedAt` | None, browser profile only | Unknown Subtask, legacy coordinator, local storage failure |
| Delete a Task or Subtask | Write | Task or Subtask ID and confirmation when it has descendants | Removed subtree and reindexed siblings | None, browser profile only | Unknown record, cancelled confirmation, local storage failure |
| Reorder siblings | Write | Moved Subtask ID and target sibling ID, or end of the current group | Updated dense positions for the affected siblings | None, browser profile only | Missing source or target, different sibling group, legacy coordinator, local storage failure |

**Value sourcing**:

| Action | Value produced or displayed | Source |
| --- | --- | --- |
| Read a Task tree | Root and nested children | `subtasks-storage` records matching the selected Task ID and each `parentSubtaskId` |
| Render a progress count | Completed count and total count for each parent | Its direct children, counting `isCompleted` values; no stored aggregate |
| Add a Subtask | Task ID, nullable parent ID, title | Selected Task or parent row, plus the inline title field after trimming |
| Create a Subtask | ID, default completion, timestamps, and position | `crypto.randomUUID()`, false, `getCurrentTimestamp()`, and the end of the current sibling group |
| Rename or complete a Subtask | New title or completion value and `updatedAt` | Inline editor or checkbox, plus `getCurrentTimestamp()` |
| Delete a subtree | Descendant IDs and confirmation count | Parent links in the current Subtask collection |
| Reorder siblings | Moved ID, target ID, and resulting positions | Drag or keyboard event, applied to the latest shared sibling list by the coordinator |
| Restore or synchronize state | Task and Subtask collections | Their respective persisted keys and the Calendar and Tasks coordinator snapshot |
| Check coordinator compatibility | Whether Subtask controls are enabled | The active owner's state handshake capability; a missing capability means legacy owner |

**Key invariants**:

* Each Subtask references one existing Task. A nonnull parent ID references a Subtask in that same Task tree.
* Create does not support reparenting, and reorder is limited to siblings. Invalid parent links and cycles are rejected.
* Every sibling group has dense, unique integer positions starting at zero. Add, delete, and reorder preserve this rule.
* Progress counts only direct children. A grandchild affects its immediate parent count, not the root Task count unless it is itself a direct child.
* A parent Task's completion state is independent from every Subtask state. Subtask changes do not update a Task's `updatedAt` or affect Profile task totals, badges, or activity.
* Deleting a Task or Subtask with descendants requires confirmation and removes the entire tree. A missing Task detected after a legacy Task deletion is cleaned up when the updated coordinator next owns state.
* Deep tree traversal is iterative so unlimited nesting does not depend on the JavaScript call stack. Browser storage capacity remains the practical limit on total records.
* All writes are serialized through the Calendar and Tasks coordinator. A move applies to the latest sibling group in queue order. If its source or target no longer exists in that group, it fails without changing state.
* The new Subtask storage key is not written by legacy Task code. The coordinator state handshake advertises Subtask command support; a missing capability means the owner is legacy. Subtask controls stay unavailable until that tab refreshes or closes.
* Coordinator persistence completes before state is applied or broadcast. On a write error, the existing error toast is shown and the update is not reported as saved.

**Security model**:

Subtasks are private data in the current browser profile, like existing Tasks. There is no Subtask API, account authorization, server storage, cross device sync, or external provider. Browser storage is not encrypted and is available to same origin application code. This feature adds no regulated data requirement.

**Critical test scenarios** (each maps to an acceptance criterion in `## Requirements`):

* Build a three level tree, verify every node starts collapsed, expand it, and verify each parent shows only its direct completed and total counts. Verify Home, Calendar, and Profile remain unchanged. Verifies **AC-1**, **AC-4**.
* Add a child at the Task and Subtask levels. Verify trimming, default incomplete state, end position, duplicate titles, blank rejection, Enter clearing, and Escape clearing only the draft. Verifies **AC-2**.
* Edit by double click and keyboard. Verify Enter and Save commit, Cancel, Escape, and outside click discard, and an empty title keeps the editor open. Verifies **AC-3**.
* Complete and reopen a parent and a child in different orders. Verify no completion cascades, direct counts update, and Profile totals and feed do not change. Verifies **AC-4**.
* Delete a leaf, cancel a descendant confirmation, confirm a nested subtree deletion, and delete a Task with children. Verify cancelled trees remain intact, confirmed trees disappear, and sibling positions are dense. Verifies **AC-5**, **AC-6**.
* Reorder with pointer and keyboard inside a sibling group. Verify a move cannot change parent, queued moves apply in sequence, and a missing source or target fails without losing another child. Verifies **AC-6**, **AC-8**.
* Load a version 4 `tasks-storage` value with no Subtask key. Verify Tasks remain unchanged, version 1 `subtasks-storage` starts empty, and Subtasks persist after reload. Verify a legacy Task writer cannot erase the separate key. Verifies **AC-7**.
* Keep an older coordinator as lock owner. Verify Subtask controls show a refresh message and no command is reported successful. Close or refresh the old tab and verify Subtask commands work under the updated owner. Verify a legacy Task deletion is reconciled without leaving orphan Subtasks. Verifies **AC-7**, **AC-8**.
* Fail a local storage write while adding, editing, deleting, and reordering. Verify the prior data remains in effect, no unsaved change is broadcast as saved, the existing error toast appears, and an add or edit draft remains available for retry. Verifies **AC-8**.
* Disable Web Locks or `BroadcastChannel`. Verify the Task matrix remains usable in one tab. Verifies **AC-8**.

## Build plan

The project uses the Skateboard approach, so build a thin but usable nested checklist first, then add the remaining editing and organization paths without replacing the Task system.

- [x] 1. Add the Subtask type and a version 1 `subtasks-storage` store, then extend the Calendar and Tasks coordinator snapshot, command handling, persistence rollback, and state handshake capability marker. Initialize existing users with an empty collection and cover the storage and coordinator contract. Satisfies **AC-7**, **AC-8**.
- [x] 2. Build the expandable recursive checklist in the existing Task card. Add inline child creation, independent completion, direct child counts, collapsed initial state, keyboard accessible expand and edit entry, and existing column scrolling. This delivers the first usable end to end checklist. Satisfies **AC-1**, **AC-2**, **AC-4**.
- [x] 3. Add validated inline rename and confirmed subtree deletion. Update Task deletion to remove its Subtask tree, reconcile legacy Task deletion, and test that Profile activity remains based on Task records. Satisfies **AC-3**, **AC-5**, **AC-7**.
- [x] 4. Add keyboard and pointer sibling reordering with dense positions and coordinator ordered move commands. Test concurrent updates, stale targets, and sibling boundaries. Satisfies **AC-6**, **AC-8**.

## Migration plan

**Strategy**: In place extension with a separate local storage key.

**Phases**:

1. Add the version 1 `subtasks-storage` key with an empty collection default. Leave version 4 `tasks-storage` and existing Task records unchanged. Extend the coordinator to include Subtasks in state snapshots and to restore prior values if any key in the write fails.
2. Add coordinator capability detection. If the state handshake lacks Subtask support, preserve the Subtask key and block Subtask commands with a refresh message until the updated coordinator owns state.
3. When the updated coordinator receives Task state without a Task that owns Subtasks, remove those now orphaned Subtasks as part of the next coordinated persistence.

**Rollback**: Older application code ignores `subtasks-storage` and leaves its records intact. Subtask controls remain unavailable until the updated code returns. If an older tab deletes a Task, the Subtask records remain isolated and are removed when the updated coordinator next reconciles the Task collection.

**Risks**: Subtask edits are temporarily unavailable while an older tab owns the coordinator. A storage write can fail while rolling back a multi key update; the coordinator must keep the original error visible and must not apply or broadcast the failed change.

## Consequences

**Positive**:

* People can track detailed work without filling the Eisenhower matrix with checklist steps.
* Existing Calendar and Profile behavior stays based on the unchanged Task model.
* Subtask writes reuse the existing cross tab command boundary, and a separate key protects the new collection from legacy Task writers.

**Negative / tradeoffs**:

* The coordinator now manages another persisted collection and must roll back a multi key write if one part fails.
* An older open tab can temporarily prevent Subtask edits until it is refreshed or closed.
* Deep expanded trees can occupy substantial space inside a capped column. The existing list scroll remains the way to reach hidden rows.
* Browser local storage has finite capacity and is not encrypted or synchronized to another device.

**Neutral**:

* No existing Task record migration or backend schema change is needed.
* Progress counts are derived when read, not stored as duplicate values.

## Follow-up

* [ ] Reconcile the blur save rule in `docs/specs/web/0001-inline-task-editing.md` with the current Task component, which uses Save and Cancel actions and cancels on an outside click.