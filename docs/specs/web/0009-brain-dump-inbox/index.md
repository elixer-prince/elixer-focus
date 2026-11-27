# 0009. Brain dump inbox

**Date**: 2026-11-26
**Status**: Accepted

## Summary

The Brain dump page gives you a quick place to write unstructured thoughts when you feel overwhelmed. Thoughts stay separate from dated Journal notes and Tasks, and remain in the browser until account sync is designed. The first version uses the current app style and adds the missing page links to mobile navigation without redesigning the mobile menu.

## Requirements

**User stories**:

- As a user who feels overwhelmed, I want to write down an unprocessed thought quickly so I can get it out of my head without classifying it.
- As a user, I want to review, find, edit, and remove thoughts separately from my Journal notes and Tasks.
- As a user, I want to reach the Brain dump page from desktop and mobile navigation.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

- **AC-1**: Opening `/my/brain-dump` in the default app layout shows a page titled `Brain dump`, followed by the helper text `Capture what's on your mind. Sort it out later.`, the capture form, search when thoughts exist, and the saved thought list. The page uses the current design system and works at mobile and desktop widths.
- **AC-2**: Desktop and mobile navigation show the same page links in the same order: Home (`/`), Journal (`/my/journal`), Brain dump (`/my/brain-dump`), Calendar (`/my/calendar`), Tasks (`/my/tasks`), and Profile (`/my/profile`). Brain dump appears after Journal. The mobile menu otherwise keeps its current appearance and behavior.
- **AC-3**: Each saved thought is an independent `BrainDumpThought` with a unique ID, plain text content, creation and update timestamps, a latest mutation ID, and nullable `userId`. Records persist in a versioned Zustand store in the current browser profile and survive reloads. New records have `userId: null`; no account login or backend is required.
- **AC-4**: The capture form has one multiline plain text field and an explicit Add button. Enter inserts a line break. The saved value is trimmed at its edges, keeps internal spaces and line breaks, has no per thought length limit, and cannot be empty or whitespace only. Duplicate text is allowed. A successful Add creates one thought, clears and refocuses the field, clears an active search, and makes the new thought visible at the top. A failed save keeps the draft available.
- **AC-5**: The list loads all saved thoughts without pagination, shows full content and a relative creation time, and sorts by `createdAt` descending. Editing a thought does not change its position. With no saved thoughts, the page shows short guidance below the capture form.
- **AC-6**: Once at least one thought exists, search filters as the user types using a case insensitive substring match against thought content. Leading and trailing query spaces are ignored, internal spaces are preserved, and result order remains unchanged. When no thought matches, the page explains that and offers a clear search action. Search is hidden when there are no saved thoughts.
- **AC-7**: Each thought has an explicit Edit action. Editing replaces its text with an inline multiline field that grows to 8 visible lines before scrolling internally. Changes save after one second of inactivity and immediately when focus leaves the editor. There is no cancel action or success indicator. Empty edits are rejected, keep the editor open with accessible feedback, and leave the saved thought unchanged. A successful edit updates `updatedAt`, not `createdAt`. A thought remains visible while being edited, then the active search is applied again when editing ends.
- **AC-8**: Each thought has an explicit Delete action. It opens the shared Modal with a short preview and Cancel and Delete actions. Cancel leaves the thought unchanged; confirming permanently deletes it, with no archive or undo. A failed delete leaves the thought in the list and reports the error.
- **AC-9**: On browsers with Web Locks and `BroadcastChannel`, all writes go through a feature owned coordinator. It serializes commands, reads the latest persisted state, persists changes before updating stores or broadcasting, and keeps supported same origin tabs in sync. Each edit carries an `updatedAt` timestamp and stable command ID. A repeated command ID is ignored, an edit with an older timestamp is ignored, and equal timestamps are resolved by the lexicographically greater command ID. An edit that loses is reported as superseded and the editor shows the latest saved text with a brief notice. If the coordinating tab closes while a write awaits its result, retrying the pending action cannot replace a newer edit. Edits are not merged.
- **AC-10**: If another tab deletes a thought while it is being edited, the current tab keeps the draft and explains that the saved thought was removed. The user can save the draft as a new thought with a fresh ID or discard it. An edit never silently recreates the deleted thought.
- **AC-11**: If the initial localStorage read or parse fails, the page shows a read error with a Retry action, does not show an empty inbox, does not accept writes, and leaves the stored value untouched. A retry reads the same value again; malformed data remains in the error state rather than being overwritten.
- **AC-12**: If a localStorage write fails, the page does not claim the change was saved, preserves the active draft, and reports the error using the existing app toast pattern. A failed delete leaves the saved thought unchanged.
- **AC-13**: If either Web Locks or `BroadcastChannel` is unavailable, the page remains usable in one tab and shows a persistent inline notice that cross tab sync is unavailable. It does not claim best effort synchronization.
- **AC-14**: The capture and search fields have accessible labels, invalid text is associated with its feedback, and Edit, Delete, Clear search, Save as new, and Discard actions are keyboard accessible. The delete dialog uses the shared Modal focus and keyboard behavior, and the sync notice is announced as a status message.

## Decision

**Chosen option**: Option 1: Dedicated local Brain dump inbox

Create a separate `BrainDumpThought` model and versioned local store. Send mutations through a feature owned tab coordinator using Web Locks and `BroadcastChannel`, and keep the page, search, and editing flow within the existing web design system.

**Implementation skills**: `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.agents/skills/vercel-react-best-practices/`) · `web-design-guidelines` (`vercel-labs/agent-skills`, `.agents/skills/web-design-guidelines/`)

## Feature design

**Page design**:

- **Source**: `docs/design.md` and the current application interface. The user plans a broader visual redesign after the planned features land.
- **Composition**: Page title and helper text, capture form, search when thoughts exist, then the full thought list.
- **Components**: Use shared `Button`, `Input`, and `Modal` components. Use a styled native `textarea` for capture and editing, matching the Journal. Add Brain dump specific capture, search, list, and thought item components. Use the same ordered page link definition for desktop and mobile so the menus do not drift.
- **Assets**: No image assets or new UI library are needed. Use the existing theme colors and icon set.
- **Rendering**: Keep all thoughts in the local list and filter in memory. Do not add pagination or virtualization in this version. Apply `content-visibility: auto` to offscreen thought items if needed to keep long lists responsive.

**Data model sketch**:

| Entity | Key and fields | Rules |
| --- | --- | --- |
| `BrainDumpThought` | `id: string`; `content: string`; `createdAt: number`; `updatedAt: number`; `lastMutationId: string`; `userId: string | null` | `id` is a required unique UUID. `content` is required plain text, nonempty after trimming edges, with no per thought length limit. Timestamps are required epoch milliseconds. `lastMutationId` is the UUID of the latest accepted command. `userId` is null until account ownership is designed. |

One future `User` may own many thoughts. Each thought may have at most one owner. There is no account foreign key in the local store today. Thoughts have no relationship to `DailyEntry`, `JournalNote`, or `Task`. IDs are unique; duplicate content is allowed. `lastMutationId` is internal synchronization metadata, not content shown to the user. There are no database indexes because this version has no server database. Thoughts remain until the user permanently deletes them.

Persist `thoughts: BrainDumpThought[]` under the `brain-dump-storage` key with the existing Zustand persist helper and Immer for array updates. Use store version `1` and `simpleMigrate` from the shared persist configuration. Catch localStorage read and write errors so a failed operation does not appear saved.

**State transitions**:

| Current state | Event | Result |
| --- | --- | --- |
| No record | Add nonblank text | Trim edges, create one record, persist it, then show it in the list. |
| Saved thought | Select Edit | Show an inline draft. The saved record remains the source of truth until a write succeeds. |
| Editing draft | One second pause or focus leaves | Save nonblank text and update `updatedAt`. Keep `createdAt` and list position unchanged. |
| Editing draft | Text becomes blank | Keep the saved record unchanged, show validation, and keep the editor open. |
| Saved thought | Select Delete | Open a confirmation modal. Cancel returns to the saved thought; confirm removes it permanently. |
| Editing draft | Another tab deletes the record | Keep an orphan draft with a notice. The user can save it as a new thought or discard it. |
| Edit command | Same command ID is received again | Do not apply it again. A command with an older timestamp is ignored; equal timestamps use the lexicographically greater command ID. A superseded editor refreshes to the latest saved text. |
| Initial read | Local storage read or parse fails | Keep the stored value untouched, show a read error, and block writes until a retry succeeds. |
| Read error | Select Retry | Read the same stored value again. Return to the ready state only after a successful read and parse. |
| Any write | Local storage write fails | Keep the form or editor draft, leave persisted state unchanged, and report the error. |

**API surface**:

There are no HTTP endpoints. Reads come from the feature store, and all writes use local actions that dispatch commands to the feature coordinator. Each write returns a `Promise` with success or failure so the UI can retain drafts when storage fails.

| Local action | Method | Key inputs | Key outputs | Auth | Key errors |
| --- | --- | --- | --- | --- | --- |
| `readThoughts` | Read | None | `ready` with records ordered by `createdAt` descending, or a read error state | None, current browser profile | Local storage read or parse failure |
| `retryReadThoughts` | Retry | None | Same `ready` or read error result as `readThoughts` | None, current browser profile | Local storage unavailable or malformed data |
| `addThought` | Create | `content: string`; stable thought ID and command ID | New `BrainDumpThought` and command result | None, current browser profile | Empty content, local storage write failure |
| `updateThought` | Update | `id: string`, `content: string`, `updatedAt: number`, stable command ID | Updated, superseded, already applied, or deleted elsewhere result | None, current browser profile | Empty content, record deleted elsewhere, local storage write failure |
| `deleteThought` | Delete | `id: string`, stable command ID | Updated thought list and command result | None, current browser profile | Local storage write failure |
| Search | Local read | `searchQuery: string` | Matching thoughts in creation order | None, current browser profile | No matches, shown as an empty state |

Search is derived in the page and is not persisted. A draft deleted in another tab uses `addThought` with a new UUID if the user chooses Save as new. No account authorization, API version, backend endpoint, or external provider is part of this feature.

**Value sourcing**:

| Action | Value produced or displayed | Source |
| --- | --- | --- |
| Add a thought | `content` | Capture textarea; trim leading and trailing whitespace, preserve internal whitespace and line breaks |
| Add a thought | `id` and command ID | `crypto.randomUUID()`, created once before dispatch and reused for a retry |
| Add a thought | `createdAt`, initial `updatedAt`, and `lastMutationId` | `getCurrentTimestamp()` and the stable create command ID |
| Edit a thought | New `content`, `updatedAt`, and `lastMutationId` | Inline draft, `getCurrentTimestamp()` when the command is created, and its stable command ID |
| Retry a read | Ready records or read error state | The same `brain-dump-storage` value; a failed parse never substitutes an empty list |
| Own a thought | `userId` | `null` until a separate account sync design provides the signed in user's ID |
| Order the list | Creation order | `createdAt`, descending; edits do not change it |
| Show capture time | Relative time label | `formatRelativeTime(createdAt)` |
| Filter the list | Search query and matches | Local input state, trimmed at the edges, lowercased, and matched as a substring against `content` |
| Show sync notice | Coordination availability | Feature coordinator checks for Web Locks and `BroadcastChannel` |
| Open Brain dump | Route and page link | `/my/brain-dump`; the desktop page link definition is also used to build the ordered mobile list |
| Confirm deletion | Thought preview | The selected thought's saved `content`, shortened for the modal when needed |

**Key invariants**:

- A thought has a unique ID and one nonblank text body. Duplicate bodies are valid separate captures.
- `createdAt` does not change after creation. A successful edit updates `updatedAt` and leaves the thought in its original list position.
- `userId` remains null until account ownership is designed. Local thoughts are not synced to a server or another device.
- Add, edit, and delete read the latest persisted state under the feature lock, persist before store updates and broadcasts, and process one command at a time.
- Every dispatched write has a stable command ID. Add also has a stable thought ID, so a retry after coordinator handoff cannot create a second record. An edit stores its latest command ID and timestamp on the thought. Repeating that ID is a no op, an older timestamp cannot replace a newer edit, and equal timestamps use the lexicographically greater command ID. Delete by ID is safe to repeat. The system does not merge text.
- A localStorage read or parse failure never initializes an apparently empty inbox or permits a write. The original stored value stays untouched until a read succeeds.
- An edit for a thought deleted in another tab never recreates that record. Its draft remains local until the user saves it as a new thought or discards it.
- When either coordination API is unavailable, the feature supports one tab only and makes that limitation visible.
- A failed localStorage write is never shown as saved. The active text remains available for correction or retry.
- Search text and edit drafts are transient page state, not persisted thought fields.

**Security model**:

Thoughts are private to the current browser profile. No sign in is required, no server request or remote telemetry is added, and `userId` remains null. Browser localStorage is not encrypted and is accessible to same origin application code and people with access to the browser profile. No regulated data use is intended.

**Critical test scenarios** (each maps to an acceptance criterion in Requirements):

- Happy path: capture two thoughts, reload, and confirm both remain in creation order with full text and relative times; verifies **AC-3**, **AC-4**, and **AC-5**.
- Validation and search: reject whitespace only input, preserve inner line breaks, allow duplicate text, filter case insensitively, trim query edges, clear a no matches state, and clear search after a successful Add; verifies **AC-4** and **AC-6**.
- Edit and delete: autosave after the pause and on blur, keep blank edits open without changing saved content, preserve creation order, cancel a delete, and permanently remove a confirmed delete; verifies **AC-5**, **AC-7**, and **AC-8**.
- Cross tab behavior: create, edit, and delete from two tabs; confirm persist before broadcast, the latest timestamped edit wins, retry after coordinator handoff does not duplicate or overwrite a newer edit, and a remotely deleted edit remains available to save as new; verifies **AC-9** and **AC-10**.
- Retry and conflict behavior: replay an Add and an edit after coordinator handoff, confirm no duplicate record or stale edit, and verify equal timestamp ties use the lexicographically greater command ID; verifies **AC-3** and **AC-9**.
- Storage behavior: simulate localStorage read, parse, and write errors; confirm the read error blocks writes without replacing stored data, while write errors preserve the draft and do not appear saved; verifies **AC-11** and **AC-12**.
- Fallback behavior: disable Web Locks or `BroadcastChannel`; confirm the inline single tab notice appears and one tab remains usable; verifies **AC-13**.
- Navigation and accessibility: verify the desktop and mobile lists have the same routes and order, the page opens at `/my/brain-dump`, and fields, feedback, dialogs, and actions work with keyboard and assistive technology; verifies **AC-1**, **AC-2**, and **AC-14**.

## Build plan

Follow the Skateboard approach by first shipping the smallest usable whole: a reachable page that captures and lists persisted thoughts. Add search and editing once the basic inbox works, while building the chosen coordination contract into the store from the start.

1. [x] Add the versioned `BrainDumpThought` store, typed commands, and feature owned coordinator. Use the shared persistence helper and Immer, persist before broadcast, add `lastMutationId` retry handling, preserve data on read errors, and add focused store and coordinator tests. Satisfies **AC-3**, **AC-9**, **AC-11**, **AC-12**, and **AC-13**.
2. [x] Wire the `/my/brain-dump` route and build the current style page with capture, empty guidance, full ordered list, relative times, and permanent delete confirmation. Update desktop and mobile navigation so both use the same ordered page links, and test the route and link list. Satisfies **AC-1**, **AC-2**, **AC-4**, **AC-5**, **AC-8**, and **AC-14**.
3. [x] Add live client side search, inline autosaving edits, blank validation, and the search and edit empty states. Cover debounce, blur, focus, and filtering behavior in component tests. Satisfies **AC-6**, **AC-7**, and **AC-14**.
4. [x] Add remote deletion draft recovery, local storage write failure handling, single tab warning behavior, and the cross tab handoff and retry cases. Run the focused feature tests and verify no server requests are made. Satisfies **AC-9**, **AC-10**, **AC-12**, **AC-13**, and **AC-14**.

## Consequences

**Positive**:

- You can capture thoughts without turning them into tasks or attaching them to a Journal date.
- The first release works before authentication and backend sync are ready.
- Current desktop and mobile navigation expose the existing pages consistently.
- Cross tab changes use browser APIs the app already relies on, with a clear fallback.

**Negative / tradeoffs**:

- The new store and coordinator add state, tests, and another local storage key to maintain.
- Browser localStorage has a total capacity limit. Long term use may require IndexedDB or account sync.
- Local thought text is not encrypted and does not follow the user to another device.
- The latest timestamped edit wins without merging. A simultaneous tie uses command ID order, so one tab can replace another tab's text.
- A malformed stored value blocks the inbox until it can be read or repaired. The first version preserves the raw value but has no in app repair tool.
- Loading every thought keeps the first version simple but may need pagination or virtualization if actual use grows.

**Neutral**:

- Personal pages use the canonical `/my/` paths, and the legacy top level paths redirect as specified in spec 0012.
- The `userId` field prepares the record shape for later ownership but does not implement account migration.

## Follow-up

- [ ] Design the broader mobile navigation appearance and behavior as a separate feature. This spec only adds the missing page links and aligns their order.
- [ ] Design account sync and a safe migration for browser local thoughts before assigning `userId` or sending text to the backend.
- [ ] Revisit IndexedDB if localStorage quota errors or observed collection size justify a different storage layer.
- [x] Coordinate the `/my/` URL structure for personal pages with this `/my/brain-dump` route. Spec [0012](../0012-personal-url-structure.md) defines the canonical paths and legacy redirects.