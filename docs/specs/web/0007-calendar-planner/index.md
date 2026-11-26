# 0007. Calendar planner

**Date**: 2026-11-25  
**Status**: In Progress

## Summary

This spec turns the placeholder Calendar page into a planner for tasks, time blocks, and recurring plans. It uses the existing task records, while saving each scheduled use separately so its date, time, and completion stay independent. The planner starts with local browser storage and gains the sleep schedule view when the shared Sleep Schedule feature provides its times.

## Requirements

**User stories**:

- As a person using Elixer Focus, I want to plan tasks across a day, several days, a week, or a month so that I can see and shape my schedule.
- As a person using Elixer Focus, I want to reuse tasks and track each scheduled occurrence independently so that repeat plans do not require retyping or share completion state.
- As a person using Elixer Focus, I want the planner to reflect my sleep plan and actual sleep times so that I can understand my day and sleep history.

**Acceptance criteria**:

- **AC-1**: Calendar opens on today in Day view and offers Day, Multi-Day with three dates, Week with seven dates, and Month views. Previous and next navigation move by one day, three days, seven days, or one month based on the selected view. Multi-Day begins with the selected date as its first column. Day, Multi-Day, and Week show a 24 hour timeline. Month uses compact task markers, and selecting a date opens that date in Day view. Multi-Day and Week columns remain horizontally scrollable on narrow screens so task details stay readable.
- **AC-2**: A user can schedule an existing task or create one from Calendar. Tasks created in the Tasks page are available in Calendar, and Calendar created tasks use the shared Task records and appear in the existing Eisenhower Matrix. New tasks default to the `uncategorised` category and a 30 minute duration. Task page completion remains independent from scheduled occurrence completion. A planned date remains separate from a task due date. The existing Matrix layout is not redesigned.
- **AC-3**: A scheduled task can be timed or untimed. Untimed tasks appear in a separate container. A timed task has both a local start time and a duration. Duration choices include 15 minute steps through two hours and a custom value from one to 1440 minutes. Exact form entry allows any minute, while dragging snaps to five minutes. Timed tasks may cross midnight.
- **AC-4**: A recurring series supports daily, weekly on chosen weekdays, and monthly by date or weekday ordinal patterns. Each rule segment has an interval and can have no end, an inclusive end date, or an occurrence count. A count applies to that segment and includes only dates that produce an occurrence. Weekly cycles are anchored to the series start, not the display week setting. A month without a matching day or weekday ordinal is skipped. Weekday values use Sunday as zero through Saturday as six. Recurrences use the current device time zone. A nonexistent spring daylight saving time shifts forward by the time gap, and a repeated fall time uses its earlier occurrence.
- **AC-5**: Scheduled occurrences have independent completion state and completion time. Users can edit or delete this occurrence, this and future occurrences, or the entire series. A this and future edit creates a new dated rule segment and preserves earlier occurrences. An entire series edit applies across all segments and saved occurrences. Editing a recurrence rule regenerates saved dates in its scope, retaining completion only for dates that still occur under the revised rule. Deleting one recurring occurrence prevents it from being generated again. Deleting this and future removes saved occurrences on and after the selected date; deleting the entire series removes all its occurrences. Editing or archiving a task preset leaves existing occurrence snapshots unchanged. Removing a task preset preserves already created occurrences and stops its active series from creating new ones.
- **AC-6**: Users can drag timed tasks to change their start time and resize them to change duration, with form controls for precise edits. Overlapping task blocks are allowed but show a warning and suggest the next available slot on the same date. Conflict detection compares actual intervals across midnight, including an occurrence that starts on a prior date. If no slot fits on the selected date, the warning remains and no suggestion is shown.
- **AC-7**: When shared Sleep Schedule settings are available, Calendar uses their planned Wake Up and Go to Bed times to show generated events and the day progress rail to the left of the timeline. Planned times are read only in Calendar. If those settings are absent, Calendar remains usable and hides the sleep events and rail. Sleep events appear on their actual local calendar dates, including when a planned awake window crosses midnight. Marking today records the current time; past dates allow an actual time to be entered or edited; future dates cannot be marked. A checked event can be unchecked to clear its record. Actual sleep duration is derived from a Bed record and the following Wake record, assigned to the Wake date. The rail uses planned times, shows past dates as full and future dates as empty, and actual sleep logs do not change the plan.
- **AC-8**: Settings adds a Calendar section with a week start preference for any weekday, defaulting to Sunday. The preference controls Calendar Week and Month layouts and the Journal bar graph, but not the Journal date picker.
- **AC-9**: Task, schedule, preference, and sleep data persist in the local browser store and synchronize between open tabs. A Calendar and Tasks command coordinator reads the latest state under a Web Lock, persists before broadcasting through BroadcastChannel, and serializes writes so the latest accepted write wins. If either browser API is unavailable, the feature remains usable in one tab. A failed local write uses the existing error toast and is not reported as saved. Calendar does not add server APIs, account authentication, external calendar connections, or cross device sync.

## Decision

**Chosen option**: Use FullCalendar React's free day and time grids with a custom scroll wrapper, and use `rrule` to calculate recurrence dates. Keep tasks, rule segments, occurrences, sleep records, and the week start preference in the app's local persisted state. The planner owns the schedule data; the shared Sleep Schedule remains the source of planned wake and bed times. (basis: `AGENTS.md`, current FullCalendar and `rrule` documentation)

**Implementation skills**: `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.agents/skills/vercel-react-best-practices/`) · `vercel-composition-patterns` (`vercel-labs/agent-skills`, `.agents/skills/vercel-composition-patterns/`) · `web-design-guidelines` (`vercel-labs/agent-skills`, `.agents/skills/web-design-guidelines/`)

## Feature design

**Data model sketch**:

| Entity | Fields and constraints |
| --- | --- |
| Existing `Task` | Keep `id: string`, `title: string`, optional `description: string`, `category`, `isCompleted: boolean`, `isSelected: boolean`, `createdAt: number`, `updatedAt: number`, and optional `completedAt: number`. Add optional `defaultDurationMinutes: integer` with a 30 minute fallback and optional `archivedAt: number`. Task page completion remains independent. |
| `RecurrenceSeries` | `id: string`, required `taskId: string`, required local `startDate: YYYY-MM-DD`, and `isActive: boolean`. One task can own many series. `startDate` anchors weekly intervals across all rule segments. |
| `RecurrenceRuleSegment` | `id: string`, required `seriesId: string`, required local `effectiveFrom: YYYY-MM-DD`, optional inclusive local `effectiveThrough: YYYY-MM-DD`, `frequency: daily \| weekly \| monthly`, `interval: integer >= 1`, optional `weekdays: number[]` for weekly rules (Sunday is zero), optional `monthlyMode: dayOfMonth \| weekdayOrdinal`, optional `monthDay: 1..31`, optional `weekday: 0..6` (Sunday is zero), optional `weekdayOrdinal: 1..5 or last`, optional local `startTime: HH:mm` and `durationMinutes: integer`. Segment start time and duration are both present or both absent; if a timed segment omits duration, use the Task default or 30 minute fallback. Optional inclusive `endDate: YYYY-MM-DD` or `occurrenceCount: integer >= 1`. End date and count are mutually exclusive. Missing both means no end. A count applies to this segment and counts generated dates, not only materialized dates. |
| `ScheduledOccurrence` | `id: string`, required `taskId: string`, optional `seriesId: string` and `segmentId: string` (both present for recurring items, both absent for one time items), required local `date: YYYY-MM-DD`, optional local `startTime: HH:mm` and `durationMinutes: integer`, task title and optional description and category snapshots, `isCompleted: boolean`, optional `completedAt: number`, and `isSkipped: boolean`. A timed item has both time and duration; an untimed item has neither. Duration is one to 1440 minutes. |
| `SleepEventRecord` | `id: string`, local `date: YYYY-MM-DD`, `type: wake \| bed`, and required `actualAt: number` timestamp. One record per event type per date. No record means the generated event is unmarked. Planned time is read from shared Sleep Schedule settings. |
| App preference | `weekStartsOn: 0..6`, stored with persisted settings. Sunday is zero and the default. |

**Relationships**:

- A `Task` can have many `RecurrenceSeries` records and many `ScheduledOccurrence` records.
- A `RecurrenceSeries` has many dated rule segments. A segment has many occurrences. Recurring occurrences link to their task, series, and source segment. One time occurrences link only to their task.
- Generated occurrences are saved when a date range is viewed. A series segment and local date pair is unique, so revisiting a range cannot create duplicates. `effectiveThrough` and `endDate` include their stated local date.
- Sleep records are separate from task records. Actual sleep duration is derived from the recorded Bed and following Wake timestamps, not stored.

**State transitions**:

- An occurrence changes from scheduled to completed when `isCompleted` becomes true and `completedAt` is set. Unchecking clears both. A deleted recurring occurrence is marked skipped so it cannot be regenerated.
- Deleting one occurrence marks it skipped. Deleting this and future ends the series before that date. Deleting the entire series removes its segments and occurrences.
- Archiving a task ends its active series but preserves already created occurrences.
- A sleep event changes from unrecorded to recorded when its actual time is saved. It can be edited or cleared.

**API surface**:

Calendar uses local store actions, not HTTP endpoints. All actions run against the persisted app state and require no account authentication.

| Local action | Method | Key inputs | Key outputs | Auth | Key errors |
| --- | --- | --- | --- | --- | --- |
| Materialize visible recurrence range | Write | Local date range, active rule segments | Saved occurrences for the range | None, browser profile only | Invalid rule, local storage write failure |
| Read calendar range | Read | Local date range, view mode | Saved occurrences and available sleep records | None, browser profile only | Local storage read failure |
| Create task | Write | Title, optional description, category, optional default duration | Shared Task id and details | None, browser profile only | Invalid task details, local storage write failure |
| Create or edit occurrence | Write | Task id, date, optional start time and duration, edit scope | Saved occurrence and overlap state | None, browser profile only | Invalid time or duration, invalid edit scope, local storage write failure |
| Create or edit recurrence | Write | Task id, segment start date, frequency, interval, pattern, end rule, optional time and duration, edit scope | Series and rule segments | None, browser profile only | Invalid rule, conflicting end conditions, local storage write failure |
| Delete occurrence or series | Write | Occurrence or series id, deletion scope | Updated series and remaining occurrences | None, browser profile only | Unknown item, invalid scope, local storage write failure |
| Complete or skip occurrence | Write | Occurrence id, completion or skip action | Updated occurrence state and timestamp | None, browser profile only | Unknown occurrence, local storage write failure |
| Archive task preset | Write | Task id | Archived task and ended active series, with existing occurrences retained | None, browser profile only | Unknown task, local storage write failure |
| Record, edit, or clear sleep event | Write | Event type, local date, actual time for a past date, or clear action | Sleep event record or cleared state and derived duration when paired | None, browser profile only | Future date, invalid local time, local storage write failure |
| Set week start | Write | Weekday from zero through six | Updated shared preference | None, browser profile only | Invalid weekday, local storage write failure |

**Value sourcing**:

| Action | Value produced or displayed | Source |
| --- | --- | --- |
| Open a date range | Local date, time labels, and date columns | Selected date and the browser's current device time zone |
| List reusable tasks | Title, description, category, and default duration | Non archived `Task` records; missing duration uses 30 minutes |
| Create a scheduled task | Date, local start time, duration, and task details | User input, or the chosen task's defaults; new tasks default to `uncategorised` and 30 minutes |
| Materialize a recurrence range | Saved occurrences for each recurrence date | Active series, original series start date, rule segment fields, visible local date range, and current device time zone |
| Render a recurrence | Occurrence dates and times | Saved occurrences generated from rule segments by `rrule` |
| Show conflicts | Overlap warning and next available slot | Timed intervals intersecting the selected date, including overnight items, plus the requested duration |
| Render Month view | Compact task markers | Saved occurrences in the displayed month |
| Render sleep events and progress | Planned Wake Up and Go to Bed times and awake window | Shared Sleep Schedule settings for the displayed local dates; the current local time and selected date determine rail fill; if settings are absent, no sleep events or rail |
| Record actual sleep | Actual timestamp and sleep duration | Current device time for today, entered time for past dates, and paired Bed and following Wake records |
| Delete occurrence or series | Skipped occurrence, shortened series, or removed series and items | Occurrence or series id and selected deletion scope |
| Archive task preset | Archive time and stopped active series | Task id and current local time; existing occurrences remain unchanged |
| Render weekly layouts and Journal chart | First weekday and ordered daily values | Persisted `weekStartsOn`; Journal values remain sourced from existing session history |

**Key invariants**:

- A scheduled date is separate from any task due date.
- A task is reusable data. Each scheduled occurrence owns its date, time, duration, completion, and task detail snapshot. Editing or archiving a task does not change saved occurrence snapshots.
- A recurrence rule segment has either an end date, an occurrence count, or neither. An occurrence count counts only dates that produce an occurrence.
- Weekly interval cycles use the original `RecurrenceSeries.startDate`, even after a later rule segment begins.
- Weekly and monthly weekday values use Sunday as zero and Saturday as six. Rule segment `effectiveThrough` and `endDate` are inclusive.
- A timed rule segment has both a start time and duration, or neither. An omitted duration on a timed segment uses the linked Task default or 30 minute fallback.
- A recurring occurrence has both a series id and segment id. A one time occurrence has neither.
- A timed occurrence has a start time and a duration from one to 1440 minutes. An untimed occurrence has neither.
- An occurrence cannot be both completed and skipped. `isCompleted` is true exactly when `completedAt` is present.
- Overlap never prevents saving. The suggestion searches only the selected date and does not move the item automatically.
- Actual sleep records do not change planned sleep times or the progress rail.
- Calendar and Journal use the same week start preference for the selected views. Recurrence intervals do not depend on that display preference.
- Cross tab writes use a Calendar and Tasks command coordinator. When available, it acquires a Web Lock, reads the latest state, persists the update, then broadcasts it through BroadcastChannel. The latest serialized write wins. If either API is unavailable, use one tab. A failed local write uses the existing error toast and must not appear saved.

**Security model**:

Task schedules and sleep records are private personal wellness data stored only in the current browser profile. This version has no account authentication, server storage, cross device sync, or external calendar provider. Local browser storage is not encrypted and is accessible to same origin application code. The feature makes no clinical or regulated health data claim. Users can clear actual sleep records by unchecking the event.

**Configuration required**:

None. No new environment variables, secrets, or external service credentials are required.

**Critical test scenarios**:

- Happy path: create a shared task in each page, schedule a timed and an untimed occurrence, navigate all four views, and confirm persisted state synchronizes to a second tab. Verifies **AC-1**, **AC-2**, **AC-3**, and **AC-9**.
- Recurrence edge: generate a monthly 31st rule through February, confirm February is skipped, the occurrence count includes only actual occurrences, daylight saving gap and repeated time rules are honored, and an edited future segment leaves earlier items intact. Verifies **AC-4** and **AC-5**.
- Time conflict: create overlapping timed tasks, confirm saving is allowed, the warning appears, and the suggested slot fits on the same date or is absent when no gap fits. Verifies **AC-6**.
- Sleep behavior: with no Sleep Schedule settings, confirm the planner works without sleep events; with settings, confirm planned times drive the rail, actual records are editable, and a Bed plus following Wake produces duration for the Wake date. Verifies **AC-7**.
- Preference behavior: change week start from Settings and confirm Calendar Week and Month and the Journal bar graph update while the Journal date picker does not. Verifies **AC-8**.
- Failure case: simulate a local storage write failure and unavailable browser coordination APIs, confirm the error toast appears and one tab remains usable without showing an unsaved change as saved. Verifies **AC-9**.
- Access boundary: confirm task, occurrence, and sleep changes use local state and do not call a server or external calendar. Verifies **AC-9**.

## Build plan

The project uses the Skateboard approach, so the first slice is a usable day planner with local task reuse and persistence. Later slices add the richer views and rules without blocking that first usable flow.

1. [x] Add a versioned local schedule model and migrate existing task records with a 30 minute duration fallback. Build the Day view with task selection or creation, timed and untimed occurrences, and cross tab local persistence. Keep task page completion independent. Satisfies **AC-1**, **AC-2**, **AC-3**, and **AC-9**.
2. [x] Add FullCalendar's Day, three date, Week, and Month views, date navigation, compact Month markers, and the custom narrow screen scroll wrapper. Add the Settings week start preference and apply it to Calendar and the Journal chart. Satisfies **AC-1** and **AC-8**.
3. Add `rrule` based recurrence generation for visible date ranges, persisted rule segments, occurrence exceptions, and the selected edit and delete scopes. Recompute saved occurrences only within the affected scope and preserve completion for dates that remain scheduled. Satisfies **AC-4** and **AC-5**.
4. Add drag and resize behavior, exact time editing, overlap warnings, and same date next slot suggestions. Satisfies **AC-3** and **AC-6**.
5. Connect the optional sleep layer to the shared Sleep Schedule values, then add generated events, actual time records, derived duration, and the planned time progress rail. Do not implement duplicate Calendar sleep settings. This slice depends on the Sleep Schedule scope and spec being aligned first. Satisfies **AC-7**.

## Consequences

**Positive**:

- Existing Task records can be reused without making task completion, planned dates, or due dates the same concept.
- A user can start with the local Day planner before accounts or Sleep Schedule settings exist.
- FullCalendar and `rrule` handle much of the date grid and recurrence calculation, while app owned records preserve task behavior.
- Cross tab updates follow a pattern already used by the app.

**Negative / tradeoffs**:

- Calendar still needs custom UI for the progress rail, untimed container, task details, recurrence editing, and sleep tracking.
- The free FullCalendar core does not provide its Premium horizontal scroll grid, so the custom wrapper needs responsive verification.
- Persisting generated occurrences and rule segments adds local state and migration work.
- Sleep tracking cannot be complete until the shared Sleep Schedule feature provides the planned times.

**Neutral**:

- Existing local tasks receive a duration fallback during store migration; no server database migration is needed.
- Newly created Calendar tasks appear in the existing Eisenhower Matrix, but this feature does not redesign its layout.
- Actual sleep duration is derived when read, not stored as a second value.

## Follow-up

- [ ] Align the planned Sleep Schedule scope and design so it provides the chosen Wake Up and Go to Bed times per local date. The current scope instead derives awake totals from idle intervals. Do this before implementing the Calendar sleep integration.
- [ ] Account ownership and cross device sync remain out of scope. Revisit local data migration and per account ownership when the account feature is designed.
- [ ] The installed `vercel-react-best-practices` skill applies to web React code and is not yet recorded in project guidance. Capture it in `web/AGENTS.md` and link that file from the root `AGENTS.md` before implementation.
- [ ] The installed `vercel-composition-patterns` skill applies to web React component design and is not yet recorded in project guidance. Capture it in `web/AGENTS.md` and link that file from the root `AGENTS.md` before implementation.
- [ ] The installed `web-design-guidelines` skill applies to web interface review and is not yet recorded in project guidance. Capture it in `web/AGENTS.md` and link that file from the root `AGENTS.md` before implementation.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).