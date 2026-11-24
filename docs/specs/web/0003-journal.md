# 0003. Journal

**Date**: 2026-11-23
**Status**: Accepted

## Summary

The Journal is a daily writing space for Elixer Focus users to reflect on their day alongside their focus session data. Each day gets one main entry with a Markdown editor, plus optional quick notes and session reflections. A calendar view shows which days have content, and stats like focus time charts, streaks, and session breakdowns provide context. Data lives in localStorage for now, designed for future backend sync when accounts are added.

## Context

Elixer Focus already tracks completed focus sessions with type, duration, and timestamp in a Zustand store persisted to localStorage. Users can run focus sessions but have no place to reflect on what they accomplished or how they felt. The Journal fills this gap by giving users a daily writing surface paired with their session data, turning raw session numbers into meaningful personal context. Without it, session history is just data with no narrative. The Journal also needs to be designed for future backend sync, as accounts are planned soon. This means the data model must support user ownership and timestamp based conflict resolution from day one, even though the initial implementation is local only.

## Requirements

**User stories**:

- As a user, I want to write a daily journal entry in Markdown so I can reflect on my focus sessions and how my day went.
- As a user, I want to see my session stats (focus time, session count) alongside my daily entry so I have context for my reflection.
- As a user, I want to browse my journal via a calendar view so I can quickly find entries from past days.
- As a user, I want to create quick notes and session reflections so I can capture thoughts outside the daily entry.
- As a user, I want to see my focus time trends and streaks so I can track my progress over time.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

- **AC-1**: Opening the Journal shows a calendar view with the current month, where days that have entries or notes are visually marked.
- **AC-2**: Clicking a day opens that day's entry in place, showing a collapsible stats section and a Markdown editor below.
- **AC-3**: The daily entry auto saves with a draft indicator after 1 second of inactivity. No explicit save button is needed.
- **AC-4**: The collapsible stats section shows total focus time, session count by type (Focus, Short Break, Long Break) for that day, derived from the existing session history store.
- **AC-5**: The Markdown editor uses @atomic-editor/editor (CodeMirror 6) with Obsidian-style inline live preview (content stored as Markdown strings) and supports bold, italic, lists, headings, and code blocks.
- **AC-6**: A "New Note" button creates a free form note with a title and Markdown body, linked to the current day's entry.
- **AC-7**: After a focus session ends, a modal dialog prompts the user to write a session reflection tied to that session. The prompt is triggered by an event from the countdown timer store.
- **AC-8**: A focus time bar chart shows daily focus time for the current week, using Chart.js.
- **AC-9**: A streak counter shows consecutive days with at least one focus session or journal entry, counting backward from the most recent day with content.
- **AC-10**: All journal data (entries and notes) is persisted in localStorage via Zustand and survives page reload.
- **AC-11**: The data model includes userId and updatedAt fields on all entities to support future backend sync.

## Options considered

### Option 1: Daily entry with Markdown editor and session stats

Each day gets one entry. Users write in Markdown with @atomic-editor/editor (CodeMirror 6). Session stats are shown in a collapsible section. Calendar navigation. Free form notes and session reflections as child records.

**Pros**:

- Clean one entry per day model matches how people think about journaling
- @atomic-editor/editor provides Obsidian-style inline live preview with reliable Markdown input rules
- Collapsible stats keep the writing area primary while making data available

**Cons**:

- @atomic-editor/editor adds bundle size (approximately 60 kb gzipped with CodeMirror 6 peers)
- react-day-picker adds a small dependency (approximately 5 kb gzipped)

### Option 2: Plain text journal with inline session summaries

Simpler approach: plain textarea, no Markdown. Session data is auto appended to each daily entry as formatted text.

**Pros**:

- No editor dependency, minimal bundle impact
- Fastest to implement

**Cons**:

- No formatting capability limits expression
- Auto appended session data cannot be edited separately from writing
- Harder to add structure later

### Option 3: Full blog style journal with separate posts

Each journal entry is an independent post with date, title, and body. No daily constraint. Tag based organization.

**Pros**:

- Maximum flexibility, supports any writing style
- Familiar blog post model

**Cons**:

- Loses the daily rhythm that makes journaling habitual
- Overly complex for the core use case of daily reflection
- No natural place to attach session stats

## Decision

**Chosen option**: Option 1: Daily entry with Markdown editor and session stats

Build a daily journal with @atomic-editor/editor Markdown editing (CodeMirror 6 with Obsidian-style inline live preview, stored as Markdown strings), collapsible session stats, calendar navigation via react-day-picker, and free form notes as child records of daily entries. Session reflections use a modal dialog triggered by the countdown timer store.

## Rationale

Option 1 matches how journaling works in practice: people write daily, not per post. The one entry per day model creates a natural habit loop. @atomic-editor/editor was chosen over TipTap because it provides reliable Markdown input rules (like # for headings) with Obsidian-style inline live preview, where formatting renders as you type while the underlying text stays as plain Markdown. TipTap was initially considered but had persistent input rule issues in the React/Vite environment that could not be resolved. The collapsible stats pattern keeps writing primary while making session context available, which the user confirmed. Chart.js was chosen for charts over Recharts because it is more customizable and avoids the generic look the user wanted to avoid. The data model is designed for future sync with userId and updatedAt fields, even though the initial implementation is local only.

## Feature design

**Data model sketch**:

**DailyEntry** (one per day)

- id: string (unique, required)
- date: string (YYYY-MM-DD, unique per user)
- userId: string (nullable now, required after accounts)
- content: string (Markdown body, required, default empty string)
- createdAt: timestamp (required)
- updatedAt: timestamp (required)

**JournalNote** (belongs to a DailyEntry)

- id: string (unique, required)
- dailyEntryId: string (foreign key to DailyEntry, required)
- userId: string (nullable now, required after accounts)
- title: string (short label, required)
- content: string (Markdown body, required)
- sessionId: string (optional, foreign key to CompletedSession for session reflections)
- noteType: enum (quick, reflection, required)
- createdAt: timestamp (required)
- updatedAt: timestamp (required)

**Relationships**

- DailyEntry 1:N JournalNote (a day can have multiple notes)
- JournalNote N:1 CompletedSession (optional, for session reflections)
- DailyEntry and JournalNote will belong to userId once accounts are added

**Existing** (no changes needed)

- CompletedSession: id, sessionType, durationInSeconds, completedAt (from session-history-store)

**State transitions**:

Not applicable. Entries and notes are created, updated, and read with no state machine.

**API surface**:

No backend API for the initial implementation. All operations are local store actions. The following actions are defined for the Zustand journal store, designed to map to future API endpoints:

| Action | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| getEntryByDate | GET | date: string (req) | DailyEntry or null | none (local) | entry not found |
| saveEntry | POST/PUT | date, content (req) | DailyEntry | none (local) | validation error |
| getNotesByDate | GET | date: string (req) | JournalNote[] | none (local) | date not found |
| createNote | POST | dailyEntryId, title, content, noteType (req), sessionId (opt) | JournalNote | none (local) | validation error |
| updateNote | PUT | noteId, title (opt), content (opt) (req at least one) | JournalNote | none (local) | not found, validation error |
| deleteNote | DELETE | noteId: string (req) | void | none (local) | not found |
| getStreak | GET | none | number (consecutive days) | none (local) | none |

**Value sourcing** (every value each action produces, computes, or displays names where it comes from):

| Action | Value produced or displayed | Source |
|---|---|---|
| Open daily entry | Markdown content | DailyEntry.content column |
| Open daily entry | Focus time for day | Derived from CompletedSession via getSessionsByDay() |
| Open daily entry | Session count by type | Derived from CompletedSession via getSessionCountsByType() |
| Calendar view | Entry presence dots | DailyEntry.date existence check |
| Calendar view | Note presence dots | JournalNote.dailyEntryId existence check |
| Focus time chart | Daily focus time bars | Derived from CompletedSession via getTotalFocusTime() per day |
| Streak counter | Consecutive day count | Derived from DailyEntry.date and CompletedSession.completedAt, computed at read time |
| Session reflection prompt | Session type and duration | CompletedSession.sessionType and durationInSeconds from the just completed session |
| New note creation | Default dailyEntryId | Current viewed day's DailyEntry.id |

**Key invariants**:

- Only one DailyEntry exists per date per user (enforced at store level)
- JournalNote.dailyEntryId must reference an existing DailyEntry
- JournalNote.sessionId, when present, must reference an existing CompletedSession
- updatedAt is always set to current timestamp on any mutation

**Security model**:

Local only for now. All data is private to the browser. After accounts are added, each DailyEntry and JournalNote will be scoped to userId, and only the owning user can read or write. No public or shared access. No regulated data is touched.

**Configuration required**:

None. No new environment variables or third party credentials are needed.

**Critical test scenarios** (each maps to an acceptance criterion in ## Requirements):

- Happy path: user opens Journal, sees calendar, clicks today, writes in Markdown editor, content auto saves, verifies AC-1, AC-2, AC-3, AC-5
- Happy path: user clicks a day with sessions, sees focus time and session count in collapsible stats, verifies AC-4
- Happy path: user creates a quick note, note appears under the daily entry, verifies AC-6
- Happy path: user completes a focus session, a modal dialog prompts for reflection, user writes and saves, verifies AC-7
- Happy path: user views the focus time chart, sees bars for the current week, verifies AC-8
- Happy path: user views streak counter, sees correct consecutive day count, verifies AC-9
- Failure case: user reloads page, journal data persists and re renders correctly, verifies AC-10
- Edge case: user opens a day with no entry, an empty entry is created and shown, verifies AC-2
- Edge case: user deletes a note, the note is removed and the daily entry remains, verifies AC-6
- Edge case: user edits a note inline, changes are saved and the note list updates, verifies AC-6

## Build plan

1. [x] Create the journal store with DailyEntry and JournalNote types, Zustand persist middleware, and core actions (getEntryByDate, saveEntry, getNotesByDate, createNote, deleteNote), satisfies **AC-2**, **AC-3**, **AC-10**, **AC-11**
2. [x] Build the calendar view component using react-day-picker with month navigation, day marking for entries and notes, and click to open day, satisfies **AC-1**
3. [x] Build the daily entry view with collapsible stats section wired to session history queries and TipTap Markdown editor below, satisfies **AC-2**, **AC-4**, **AC-5**
4. [x] Implement auto save with 1 second debounce and draft indicator in the journal store, satisfies **AC-3**
5. [x] Build the quick note creation and editing flow with title input, Markdown body, inline edit and delete actions, and note list under daily entry, satisfies **AC-6**
6. [x] Build the session reflection prompt, triggered when a focus session completes, that creates a JournalNote linked to the session, satisfies **AC-7**
7. [x] Build the focus time bar chart component using Chart.js with colors derived from CSS variables to match the active DaisyUI theme, showing weekly data derived from session history, satisfies **AC-8**
8. [x] Build the streak counter component that computes consecutive days from entries and sessions, satisfies **AC-9**
9. [x] Wire the Journal route to replace the placeholder, integrate all components, satisfies **AC-1**, **AC-2**

## Consequences

**Positive**:

- Users gain a meaningful reflection surface paired with their focus data
- The daily entry model creates a natural habit loop for consistent journaling
- TipTap provides a solid foundation for future features like templates or rich media
- Data model is sync ready for when accounts are added

**Negative or tradeoffs**:

- TipTap adds approximately 30 kb gzipped to the bundle
- Chart.js adds another approximately 70 kb gzipped
- Calendar component adds complexity to the route layout
- Local storage has size limits (approximately 5 MB), which could constrain long term journaling with rich media

**Neutral**:

- Introduces a new Zustand store alongside session history
- TipTap extensions will need to be evaluated as the feature grows
- Future sync will require a migration strategy for local to cloud data transfer

## Follow-up

- [ ] Design the accounts feature and backend sync for journal data before TipTap content grows complex
- [ ] Evaluate TipTap bundle impact after integration and consider tree shaking or lazy loading if needed
- [ ] Consider adding journal entry templates (prompts, gratitude, etc.) as a follow up feature
