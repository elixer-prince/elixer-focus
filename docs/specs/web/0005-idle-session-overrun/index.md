# 0005. Idle and session overrun tracking

**Date**: 2026-11-24
**Status**: Accepted

## Summary

Track time when the countdown is not running and time after a session completes, without counting the same second twice. Persist timestamped intervals so the Journal can show idle and overrun time, and a future sleep schedule can derive awake time. Coordinate the timer across tabs so controls, completion, and reflection stay consistent.

## Requirements

**User stories**:

* As a user, I want idle time tracked before and between sessions, including while I am away from the app, so I can compare it with focus time.
* As a user, I want time after a session attributed to that session until I resolve its reflection, so the overrun is visible without being counted as idle.
* As a user, I want the timer, reflection, and tracked time to stay consistent across open tabs, so switching tabs does not create duplicate sessions or lose time.
* As a user, I want to see daily idle and overrun totals and compare idle with focus time for the week in the Journal.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

* **AC-1**: When tracking first initializes and there is no running timer or unresolved reflection, an idle interval starts at that time. Time before the first session, between sessions, and during a manually paused countdown is idle. Starting a countdown closes the current idle interval.
* **AC-2**: Idle and overrun are persisted as timestamped intervals. An open interval has `endedAt: null`; its elapsed time is derived from its start timestamp and the current wall clock. Intervals continue while tabs are hidden or no app tab has focus, survive reloads, browser closure, and device shutdown, are retained indefinitely, never overlap, and are split across local calendar days for reporting.
* **AC-3**: On completion of a Focus, Short Break, or Long Break session, the app records one completed session at the saved timer end time. With overrun attribution enabled, an overrun interval linked to that session begins at that time and ends when its reflection is resolved. With attribution disabled, the time after completion is idle instead. The setting defaults to enabled and only affects future completions.
* **AC-4**: Reuse the existing reflection modal for a live elapsed value; do not add a separate overrun modal. When attribution is enabled, the value is labelled as overrun and identifies the completed session type. When attribution is disabled, it is labelled as time since session end and clearly says that the interval is counted as idle. Saving, skipping, or closing the reflection resolves the pending session once.
* **AC-5**: Any supported app tab can start, pause, or reset the same timer. The coordinator serializes commands, persists each resulting state change before broadcasting it, and uses the timer run ID or session ID to make retries safe. Timer state and tracking state stay synchronized, only one tab processes timer completion side effects, and closing the coordinator tab transfers ownership automatically to another open tab.
* **AC-6**: One pending reflection is mirrored in every open app tab, and unsaved reflection text stays synchronized between them. The pending reflection remains unresolved while the user is in another tab, and its elapsed time continues. The first save, skip, or close resolves the reflection once and closes every copy. Timer controls are unavailable in all tabs until the reflection is resolved.
* **AC-7**: If all app tabs are closed when the timer expires, the next app open records the session at its saved end time, uses the active countdown duration captured when the run started, creates one pending reflection, and catches up the elapsed overrun from that time when attribution is enabled. No timer completion or reflection notification is duplicated during recovery or coordinator handoff.
* **AC-8**: If Web Locks or BroadcastChannel is unavailable, the app continues in one tab and clearly warns that cross tab control is unavailable. It does not claim best effort multi tab accuracy.
* **AC-9**: The selected Journal day shows completed focus time and session counts, total idle time, and overrun totals by session type. The stats appear when any of those values exist, including on an idle only day, and keep focus duration distinct from overrun.
* **AC-10**: The current week chart shows paired focus and idle bars for each of the seven local dates in the current week, ordered from the weekday configured by the shared `weekStartsOn` preference (Sunday by default). Overrun remains a separate daily statistic and is not included in the focus or idle chart series.
* **AC-11**: Each `TrackedInterval` has an ID, kind, start and end timestamps, optional session link, nullable `userId`, `createdAt`, and `updatedAt`. An overrun interval must link to one completed session, a session may have at most one overrun interval, and removing that session removes its overrun interval but not idle intervals.
* **AC-12**: On first initialization after upgrade, an existing active timer is assigned and persists a stable run ID and duration before completion processing. If its captured duration is absent, use the existing persisted `startTimeInMinutes` value converted to seconds. An existing pending `lastCompletedSession` without an interval gets an interval starting at its `completedAt`, classified according to the current attribution setting. If neither exists, idle begins at first feature use without backfilling earlier time.

## Decision

**Chosen option**: Option 1: Extend local stores with one tab coordinator.

Use a Web Lock for one active timer coordinator and BroadcastChannel for commands and updates. Keep local storage as the durable source for recovery. Add the interval records to session history so completion, overrun, and pending reflection can be committed together. Add the attribution setting to the existing persisted session settings.

## Feature design

**Data model sketch**:

| Record | Fields and rules |
| --- | --- |
| `TrackedInterval` (new) | `id: string`; `kind: "idle" | "overrun"`; `startedAt: number` (epoch milliseconds); `endedAt: number | null` (null while open); `sessionId: string | null`; `userId: string | null`; `createdAt: number`; `updatedAt: number` |
| Existing `CompletedSession` | `id`, `sessionType`, `durationInSeconds`, and `completedAt`; overrun type is derived through `sessionId`. A stable timer run ID is reused as `id` when completion is recovered. |
| Active timer run state | Persist `timerRunId: string` and `activeRunDurationInSeconds: number` with the timer end time. Generate the ID and capture the configured active countdown duration when a run starts; retain both across pauses and resume. Legacy timers without a captured duration use persisted `startTimeInMinutes` converted to seconds. |
| Existing session settings | Add `attributeSessionOverrun: boolean`, default `true`; increment the persisted store version and migrate old settings to `true`. |

`TrackedInterval` records are persisted locally with the existing Zustand and localStorage pattern. `userId` stays null until account ownership is available. `createdAt` is set when the interval starts; `updatedAt` changes when it closes. Closed intervals are retained indefinitely. The persisted interval list belongs with the existing session history so a session, its overrun interval, and its pending reflection can be updated together.

**State transitions**:

| Event | Transition |
| --- | --- |
| First tracking initialization with no active timer or pending reflection | Start an open idle interval at the current wall clock time. Do not backfill time before first use. |
| First feature initialization after upgrade | If a persisted timer is active without a run ID, assign and persist a run ID and duration before processing it. If a captured duration is missing, use persisted `startTimeInMinutes` converted to seconds. If a pending session exists without an interval, start overrun or idle at its `completedAt` according to the setting. Otherwise use the first use idle rule. |
| Timer starts or resumes | Close the open idle interval at the start time. |
| Timer pauses or is reset | Start idle at the pause or reset time. |
| Timer reaches zero | Commit one completed session at the saved end time. Close idle. If attribution is enabled, start overrun; otherwise continue idle. |
| Reflection is saved, skipped, or closed | Resolve the pending session once. Close overrun and start idle when overrun was enabled; if disabled, the existing idle interval continues. |
| Session is removed | Remove its linked overrun interval. Keep unrelated idle intervals. |
| Timer ends while all tabs are closed | On the next open, use the saved end time and stable run ID to recover the session once, then recover the pending reflection and overrun elapsed time. |
| Attribution setting changes | Apply the new value to future session completions only. Do not reclassify saved intervals. |

**API surface**:

There are no backend endpoints. This feature extends existing client store actions and UI surfaces.

| Surface | Action | Inputs | Output | Access and errors |
| --- | --- | --- | --- | --- |
| Shared timer | Start, pause, reset | Timer command from any same origin tab | Shared timer state; one coordinator handles side effects | Local browser state; single tab warning if coordination APIs are unavailable |
| Timer settings | Change attribution | Boolean setting | Persisted `attributeSessionOverrun` value | Local settings store |
| Reflection | Save, skip, or close | Completed session ID and shared draft text | One reflection resolution and, on save, one Journal note | Local Journal store; duplicate resolution is ignored |
| Daily Journal stats | Read a selected date | Browser local calendar date | Focus time, session counts, idle time, and overrun by type | Derived from local session and interval records |
| Weekly chart | Read current week | Seven local date ranges beginning on the persisted `weekStartsOn` preference | One focus value and one idle value per day | Derived from local session and interval records |

**Value sourcing**:

| Action | Value produced or displayed | Source |
| --- | --- | --- |
| Start idle interval | `startedAt` | First tracker initialization or a timer/reflection lifecycle transition, using the existing wall clock source |
| Close an interval | `endedAt` and `updatedAt` | The timestamp of timer start or reflection resolution |
| Open overrun | `startedAt`, `sessionId`, and session type | Saved timer end time and the completed session record |
| Display live elapsed time | Seconds since interval start | `startedAt` to current wall clock time; setting determines whether the label says overrun or counted as idle |
| Recover a completed session | Session ID, type, duration, and `completedAt` | Persisted timer run ID, current session type, `activeRunDurationInSeconds` captured at run start, or legacy `startTimeInMinutes` converted to seconds, and saved timer end time |
| Resolve reflection | Session type and draft text | Linked `CompletedSession` and synchronized modal draft; the existing Journal note action saves it once |
| Daily totals | Idle and overrun duration by local date | Overlap between interval timestamps and local day boundaries; overrun type comes from linked `CompletedSession.sessionType` |
| Focus statistics and chart values | Completed focus duration and counts | Existing session history queries; the current running focus value continues to use the existing timer state |
| Weekly chart | One focus and one idle value per weekday | Current local date, persisted `weekStartsOn` preference from Calendar, completed sessions, and interval overlap calculations |
| Attribution label | Overrun or counted as idle | Persisted `attributeSessionOverrun` value at session completion |
| Cross tab state | Timer, interval, and pending reflection state | The coordinator's persisted local state, broadcast to same origin tabs |
| Sync ownership fields | `userId`, `createdAt`, and `updatedAt` | `userId` is null until accounts are available; timestamps come from interval mutations |

**Key invariants**:

* At most one timer coordinator owns the Web Lock in a browser profile. Only it processes timer completion and sends the existing completion alert.
* Timer commands from other tabs are sent to the coordinator and applied in arrival order. It persists each state change before broadcasting it. Every tab receives state updates, and retries use the stable timer run ID or session ID.
* A stable timer run ID is persisted at start and reused as the completed session ID. Reprocessing an end time after handoff or reload cannot create another session.
* On upgrade, legacy active timer state receives a run ID and duration before processing. A legacy pending reflection starts its interval from `CompletedSession.completedAt`; other users begin tracking at first feature initialization.
* At most one `TrackedInterval` is open at once. Intervals have nonnegative durations, do not overlap, and may meet at the same timestamp.
* An idle interval has no `sessionId`. An overrun interval has one completed session link and is removed with that session.
* Daily totals split intervals at midnight in the browser's local timezone. The epoch timestamps preserve actual elapsed time across daylight saving changes.
* The Journal weekly chart uses the shared `weekStartsOn` preference from spec [0007](../0007-calendar-planner/index.md), with Sunday as the default, and includes seven consecutive local dates.
* `Date.now()` wall clock timestamps are required to reconstruct time after shutdown. Manual system clock changes can alter elapsed totals; a negative duration is clamped to zero and never displayed as negative.
* If either required coordination API is unavailable, the app warns and supports one tab only rather than claiming race free synchronization.
* No backend endpoint, credentials, or remote telemetry are added. Data remains local to the browser profile.

**Security model**:

Local only. There are no new roles, API permissions, or server data. `BroadcastChannel` shares state only between same origin tabs in the same browser profile. Reflection text uses the existing local Journal storage. `userId` is nullable until account sync is designed; this feature does not sync data to another device. No regulated data is introduced.

**Critical test scenarios** (each maps to an acceptance criterion in ## Requirements):

* Happy path: open the app for the first time, start a timer, pause it, resume it, and verify idle intervals stop and resume without overlap, verifies **AC-1**, **AC-2**.
* Happy path: complete each session type with attribution enabled, resolve the reflection, and verify a linked overrun closes once and idle resumes, verifies **AC-3**, **AC-4**.
* Edge case: disable attribution, complete a session, and verify the modal says the elapsed time is counted as idle, prior intervals remain unchanged, and the next setting value applies only to later completions, verifies **AC-3**, **AC-4**.
* Failure case: open two tabs, control the timer from each, close the coordinator, and verify automatic handoff with one completion and no overlapping intervals, verifies **AC-5**, **AC-7**.
* Failure case: close every tab while the timer is running, wait past its saved end time, reopen multiple tabs, and verify one session at the saved deadline with the captured duration, one mirrored reflection, and caught up overrun, verifies **AC-5**, **AC-6**, **AC-7**.
* Migration case: open the feature with a legacy active timer or pending reflection and verify the stable run ID and duration fallback or interval is created before recovery, without backfilling idle time, verifies **AC-1**, **AC-7**, **AC-12**.
* Edge case: edit a reflection draft in one tab, verify it appears in the other, resolve it from either tab, and verify one Journal note and all modal copies close, verifies **AC-6**.
* Failure case: run without Web Locks or BroadcastChannel and verify a clear single tab warning with no best effort cross tab claim, verifies **AC-8**.
* Happy path: select a date with idle time and no completed sessions, verify stats appear with separate focus, idle, and overrun values; verify linked session deletion removes only its overrun, verifies **AC-9**, **AC-11**.
* Happy path: view the current week with the default and a changed `weekStartsOn` preference. Verify seven paired focus and idle bars start on the configured weekday, and intervals crossing midnight split between the correct local dates, verifies **AC-2**, **AC-10**.

## Build plan

Follow the Skateboard approach by delivering the smallest complete tracking loop before expanding its reporting. These tasks form one usable release; do not ship a per tab version that can duplicate sessions as an intermediate result.

1. Add the versioned interval state and the overrun setting migration, implement idle and overrun transitions, persist the run ID and active duration, handle legacy state, and recover a timer completion at its saved deadline without duplicate session creation, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-7**, **AC-11**, **AC-12**.
2. Add the Web Lock coordinator and BroadcastChannel command and state flow, including persist before broadcast, automatic handoff, the single tab warning fallback, and the mirrored reflection with live elapsed label, synchronized draft, and one time resolution, satisfies **AC-4**, **AC-5**, **AC-6**, **AC-7**, **AC-8**.
3. Add local day interval aggregation to the Journal stats and weekly chart, including idle only days, overrun by type, and paired focus and idle bars, satisfies **AC-2**, **AC-9**, **AC-10**, **AC-11**.

## Consequences

**Positive**:

* Idle and overrun are recoverable after reload, device shutdown, or a tab handoff without overlapping totals.
* Users can control one timer from any supported tab and see one shared reflection state.
* Raw intervals preserve enough information for a future awake time view without rewriting history.

**Negative / tradeoffs**:

* Cross tab coordination and idempotent recovery add state transitions that need focused tests.
* Browsers without both coordination APIs can only guarantee single tab behavior.
* Local wall clock changes can distort elapsed time, and no prompt or notification can appear while the device is off.
* Retaining every interval indefinitely uses additional local storage over time.

**Neutral**:

* Persisted settings need a versioned migration that defaults existing users to overrun attribution enabled.
* New intervals have sync fields, but existing completed sessions and all tracking data remain local until a separate account sync design is built.

## Follow-up

* Design the future sleep schedule as a separate awake time view derived from raw idle intervals. Do not change raw idle or active session records, including sessions that run during scheduled sleep.
* Design account sync for completed sessions and tracking intervals before sending these local records to the backend; the current completed session model is not yet account scoped.