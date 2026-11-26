# 0008. Sleep Schedule

**Date**: 2026-11-26
**Status**: Accepted

## Summary

You set a daily wake time, and the app calculates bedtime from a target sleep duration that you can change. You can override bedtime with a warning and record actual sleep locally. Calendar reads the same schedule for planned events and a progress rail, while awake totals come from idle intervals without changing the raw tracking data.

## Requirements

**User stories**:

- As a person using Elixer Focus, I want one daily sleep plan and actual sleep records so that Calendar and Settings use the same values.
- As a person using Elixer Focus, I want to see awake idle time by local date so that I can understand my day without changing timer history.
- As a person using Elixer Focus, I want Calendar to show my planned awake window and current time so that I can see the day's progress.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

- **AC-1**: Settings provides one daily Sleep Schedule. A new profile starts with no wake time, a target sleep duration of 480 minutes, and no bedtime override. A configured target is a whole number from 60 through 960 minutes in 15 minute steps. Wake and override values use local `HH:mm` clock values. Clearing the schedule clears wake time and bedtime override, keeps the target duration, and preserves actual records.
- **AC-2**: With no override, the planned bedtime is the target elapsed duration before the next planned wake occurrence. A manual bedtime override is placed at its first local occurrence after wake, on the same date when later and the next date when earlier or equal. Settings shows the resulting planned duration and a warning while the override is active, and can reset to automatic calculation. A target duration change recalculates bedtime only when no override is active. Schedule changes apply to all displayed dates and do not change actual records. Schedule clock values use the browser's current local time zone. A skipped local time moves forward by the daylight saving gap, and a repeated local time uses its earlier occurrence. If the browser time zone changes, schedule and planned event dates recalculate in the new current zone.
- **AC-3**: Until wake time is configured, Calendar shows no planned sleep events or rail and marks awake totals unavailable. Invalid persisted schedule values do not generate events, a rail, or totals. Settings explains that the schedule needs repair, and invalid values and actual records are not silently replaced.
- **AC-4**: Calendar reads planned Wake Up and Go to Bed events from Sleep Schedule and does not edit planned values. Day, Multi Day, and Week views show a vertical progress rail for the planned awake windows. The rail renders each window segment within its local date, including a continuation at midnight. On today, segments ending before current time are full, the segment containing current time fills to that time, and later segments are empty. Past date segments are full and future date segments are empty. A separate visible horizontal current time line and `NOW` label appear on today in time grid views. Month shows compact sleep markers without a rail or awake total. Actual sleep records do not move the rail.
- **AC-5**: Calendar records one actual sleep night per local bedtime date. Recording a bed today uses the current timestamp; past dates allow time entry and correction; future actual times are rejected. A wake can be recorded only for an existing bed record, and its timestamp must be after bedtime and not in the future. If several incomplete bed records precede the wake timestamp, Calendar updates the most recent earlier bed without a wake. If no bed exists, Calendar disables the wake action and explains why. Clearing wake leaves the bed record incomplete. Clearing bedtime deletes the whole night, with confirmation if a wake time would also be removed. When both values exist, actual sleep duration is derived from their timestamps and displayed on the wake date. Actual timestamps remain fixed instants and render in the current browser time zone if it changes; the stored `sleepDate` key remains the bedtime date from record creation.
- **AC-6**: Calendar shows an awake idle total for each date in Day, Multi Day, and Week views, but not Month. The total is the intersection of `TrackedInterval` records with `kind: "idle"` and planned awake windows. Open intervals end at the current time. Awake time is split at local midnight and attributed to the date where each part occurred. When no valid plan exists, the total is unavailable rather than zero. Sleep Schedule never changes tracked intervals or completed sessions.
- **AC-7**: Sleep Schedule settings and actual records persist in a versioned local browser store. A dedicated Sleep Schedule coordinator serializes writes, persists before broadcasting state across tabs, and uses the existing single tab fallback when Web Locks or `BroadcastChannel` is unavailable. A failed write is not reported as saved and uses the existing error toast. If concurrent tabs write different values, the last command processed wins.
- **AC-8**: Migration moves provisional Calendar `SleepEventRecord` values into Sleep Schedule. Each wake pairs with the nearest earlier unpaired bed by actual timestamp. A bed without a wake becomes an incomplete night. Unmatched wakes and invalid or duplicate source values are preserved in a recovery archive, not used as actual sleep or awake totals. Settings lets the person review, export as JSON, or delete recovery data. Migration is safe to repeat and does not clear the Calendar source until the Sleep Schedule write succeeds.
- **AC-9**: Sleep settings, actual records, and migration recovery remain local to the current browser profile. The feature adds no account ownership, server storage, cross device sync, external calendar service, or clinical claim. Sessions that occur during planned sleep remain in session history unchanged.

## Decision

**Chosen option**: Option 3: Sleep Schedule owns planned and actual sleep data

Create a dedicated Sleep Schedule store and command coordinator. Settings edits it, and Calendar reads planned events, actual records, progress windows, and awake totals through the feature boundary. Calendar sends actual event changes to Sleep Schedule and keeps no second copy of sleep data. Calendar's consuming contract is in spec [0007](../0007-calendar-planner/index.md).

## Feature design

**Data model sketch**:

| Entity | Key | Fields and constraints |
| --- | --- | --- |
| `SleepScheduleSettings` | One singleton per browser profile | `wakeTime: HH:mm` or null, unset initially; `targetSleepDurationMinutes: integer`, default 480, range 60 through 960 in 15 minute steps; `bedTimeOverride: HH:mm` or null, unset initially. No calculated bedtime is stored. |
| `ActualSleepRecord` | `id: string`; unique `sleepDate: YYYY-MM-DD` | `sleepDate` is the bedtime date in the browser's local zone when the record is created and remains the record key if that zone later changes; `bedAt: epoch milliseconds` is required; `wakeAt: epoch milliseconds` or null until wake is recorded. One record per bedtime date. |
| `SleepEventMigrationRecovery` | `id: string` | `legacyEvent: unknown` preserves the raw source value; `reason: unmatchedWake`, `invalidEvent`, or `duplicateSleepDate` explains why it was not imported as an actual sleep record. Excluded from sleep duration and awake totals. |

The settings singleton and actual records live in `sleep-schedule-storage` through the existing Zustand persistence pattern. There is one settings object and zero or more independent actual records, with no foreign key or settings version reference. A settings change therefore updates generated plans for every displayed date without changing actual history. Recovery entries are migration data, not a second active sleep model.

**State transitions**:

| State or event | Result |
| --- | --- |
| Wake time is unset | No planned events, rail, or awake total. The target duration remains 480 minutes unless changed. |
| Wake time is set and override is absent | The schedule is automatic. Bedtime is derived from the next wake and target duration. |
| A bedtime override is set | The schedule is manual. Its first clock occurrence after wake is used, and Settings shows the resulting duration and warning. Clearing the override returns to automatic calculation. |
| Wake time is cleared | Return to unconfigured state, clear the override, keep target duration and actual history. |
| Bedtime is recorded | Create an incomplete actual record with `wakeAt: null`. |
| Wake is recorded | Set `wakeAt` on the most recent earlier incomplete record after validating it is later than `bedAt` and not in the future. |
| Wake is cleared | Set `wakeAt` to null and keep the bed record. |
| Bedtime is cleared | Delete the actual record. Confirm first if it also removes a recorded wake. |
| Legacy events are migrated | Import valid bed and paired wake timestamps; preserve unmatched or invalid source values in recovery data. Clear the temporary Calendar source only after the new store is persisted. |

**Planned time rules**:

- The schedule repeats every local day. It has no weekday variations or dated setting versions.
- For a wake occurrence, calculate automatic bedtime by subtracting the target elapsed duration from the next local wake occurrence. This keeps the duration exact across daylight saving changes and allows the bed event to fall on the same or following local date.
- A manual override is a local clock value. Place it at the first matching occurrence strictly after wake. If the override is earlier than or equal to wake, it falls on the following local date. The time until the next wake is the displayed planned duration, which may differ from the target.
- A missing or invalid schedule does not produce planned events. Invalid saved values remain available for the Settings repair message; actual records are preserved.
- Actual timestamps are epoch milliseconds and remain fixed instants. The local `sleepDate` key is captured from the bedtime date when the record is written and does not change. Timestamp event dates and clock labels use the browser's current local time zone, so they can move on Calendar if that zone changes. Planned schedule dates also use the current local time zone.

**Persistence and migration**:

- Keep `SleepScheduleSettings`, actual records, and recovery entries in version 1 of the dedicated `sleep-schedule-storage` store. Use a separate lock and broadcast channel from the Calendar and Tasks coordinator.
- Bump the Calendar store to version 2. Its migration retains old `sleepEventRecords` in a temporary pending migration field and removes them from active Calendar data. The Sleep Schedule coordinator imports them by actual timestamp. A wake pairs with the nearest earlier bed without a wake. An unpaired bed becomes an incomplete record. An unmatched wake, invalid event, or duplicate date is preserved with its raw value and recovery reason.
- Persist the imported Sleep Schedule state before asking the Calendar coordinator to clear the pending migration field. Keep stable source IDs so a retry after a partial failure does not duplicate records or recovery entries. If the Sleep Schedule write fails, keep the Calendar source and report the failure.
- The recovery section in Sleep Settings can review the preserved entries, export them as JSON, or explicitly delete them. Export and deletion do not change actual records or totals.

**API surface**:

There are no HTTP endpoints. Settings and Calendar use the Sleep Schedule store for reads and a feature owned command coordinator for writes.

| Local surface | Method | Key inputs | Key outputs | Access | Key errors |
| --- | --- | --- | --- | --- | --- |
| Read settings | Read | None | Settings values and recovery count | Current browser profile | Invalid saved settings are reported for repair |
| Save settings | Write | `wakeTime`, target duration, optional bedtime override | Persisted settings and derived planned values | Current browser profile | Invalid clock value, invalid duration, local write failure |
| Clear schedule | Write | None | Unconfigured settings, retained target and actual history | Current browser profile | Local write failure |
| Read planned range | Read | Local start and end dates, current time zone | Planned wake and bed events plus awake window boundaries | Current browser profile | Invalid date range, invalid saved settings |
| Read actual sleep range | Read | Local start and end dates | Records whose bed or wake event falls in the range, with actual timestamps and event state | Current browser profile | Invalid date range, local storage read failure |
| Record actual bed | Write | `sleepDate`, optional actual timestamp | Created or updated actual record | Current browser profile | Future date or timestamp, invalid date, local write failure |
| Record actual wake | Write | Actual record ID selected as the most recent earlier incomplete bed, optional actual timestamp | Updated record and derived duration when paired | Current browser profile | Unknown record, missing bed, wake not after bed, future timestamp, local write failure |
| Edit or clear actual event | Write | Record ID, event type, optional corrected timestamp or clear action | Updated record or deleted night | Current browser profile | Unknown record, invalid timestamp, confirmation required when clearing a bed also removes wake |
| Read awake totals | Read | Local date range and current time | Per date idle seconds and display duration | Current browser profile | No valid plan, interval store unavailable |
| Review or export recovery | Read | None | Raw preserved events and JSON export | Current browser profile | Recovery data unavailable |
| Delete recovery | Write | Recovery entry IDs or clear all | Updated recovery archive | Current browser profile | Unknown entry, local write failure |

All settings and actual event writes go through the Sleep Schedule coordinator. It reads the latest persisted state, applies each command in order, persists the result, then broadcasts it. Calendar reads the same Sleep Schedule state and sends actual event commands to it; it does not write sleep fields into `calendar-storage`. When coordination APIs are unavailable, one tab remains usable. A failed local write does not update the interface as saved.

**Value sourcing**:

| Action | Value produced or displayed | Source |
| --- | --- | --- |
| Initialize Sleep Settings | Wake time, target duration, bedtime override | Sleep Schedule settings; initial values are null, 480 minutes, and null |
| Validate target duration | Whole number from 60 through 960 in 15 minute steps | Settings input and the limits in AC-1 |
| Calculate planned bedtime | Local event date and instant | Next daily wake, target duration, browser local time zone, and daylight saving rule in AC-2; an override replaces the calculated value |
| Show override warning | Planned duration and difference from target | Override instant and next wake instant, compared with `targetSleepDurationMinutes` |
| Render planned Calendar events | Wake and bed labels and times | Derived planned range from Sleep Schedule settings |
| Render progress rail | Awake segment bounds and current fill | Intersections of planned awake windows with the selected local date, and current time from the browser |
| Render actual sleep events | Actual bed and wake event state | Sleep Schedule records whose bed or wake timestamp falls on the displayed date in the current browser time zone; `sleepDate` remains the original record key |
| Render current time marker | Current local time and `NOW` label | Browser current time and current local time zone |
| Record actual bed or wake | Actual timestamp | Current time for an event recorded today, or the person's local time entry for a past date |
| Display actual sleep duration | Elapsed duration and wake date | `wakeAt - bedAt`, displayed on the local date of `wakeAt`; duration is not persisted |
| Display awake total | Idle seconds and formatted duration per local date | Intersections of planned awake windows with `TrackedInterval` values of kind `idle`; open intervals end at current time and each part is attributed to its local date |
| Review migration recovery | Raw event and recovery reason | Provisional Calendar `SleepEventRecord` source values |
| Resolve local date and time | Local date, event date, clock labels, daylight saving resolution | Browser's current local time zone |

Awake totals sum elapsed seconds and display complete minutes, rounding down any remaining seconds. Derived totals are computed when read, not saved.

**Key invariants**:

- Sleep Schedule is the only owner of planned wake time, target duration, bedtime override, and actual sleep records. Calendar has no duplicate sleep settings or actual record array.
- A valid planned schedule requires a valid wake time and target duration. The target is 60 through 960 minutes in 15 minute steps. A manual override is a valid `HH:mm` value and may change the resulting duration; it is allowed with a warning.
- Calculated bedtime is not persisted. A target change recalculates automatic bedtime; an active override remains until cleared and its warning is recalculated.
- There is at most one actual record per `sleepDate`. `bedAt` is required. `wakeAt` is null or later than `bedAt`; neither actual timestamp can be in the future.
- Actual duration and awake totals are derived values, not stored fields.
- Awake totals use only idle tracked intervals inside planned awake windows. Overrun intervals and completed sessions are not counted as idle, and no interval or session is rewritten.
- Planned settings changes apply to past and future displayed dates. They never alter actual sleep records.
- Recovery entries are never rendered as actual sleep events and never contribute to totals.
- Sleep data is local to the browser profile. The feature makes no server or cross device sync claim.

**Security model**:

Sleep settings, actual records, and recovery data are personal wellness information in local browser storage. There is no account authorization, server access, external calendar service, or cross device sync. Local storage is not encrypted and is available to same origin application code. This is not a clinical feature or a regulated medical record system.

**Critical test scenarios** (each maps to an acceptance criterion in Requirements):

- Happy path: configure wake time and target, confirm the calculated bedtime, add a manual override, and reset it to automatic, verifies **AC-1**, **AC-2**.
- Time edge: calculate planned events across a daylight saving gap and repeated hour, then load malformed saved settings and confirm events, rail, and totals are unavailable while actual records remain, verifies **AC-2**, **AC-3**.
- Calendar rail: verify the fill begins at planned wake and ends at planned bedtime, an awake window crossing midnight renders in both local dates, past and future segments have the expected fill, and the horizontal current time line remains visible independently, verifies **AC-4**.
- Actual event lifecycle: record a bed today, reject a wake without a bed and a future timestamp, record and correct a valid wake, clear wake, and confirm clearing a bed removes the full night, verifies **AC-5**.
- Awake totals: intersect idle intervals with planned awake windows, include an open interval only through now, split a midnight crossing across dates, and prove source intervals and sessions are unchanged, verifies **AC-6**.
- Migration: import paired and bed only legacy events, preserve unmatched or invalid events for review and JSON export, delete recovery data, and retry migration without duplicates, verifies **AC-7**, **AC-8**.
- Cross tab and failure: change settings and actual records from another tab, verify persisted broadcast state; disable coordination APIs and verify single tab use; fail a local write and verify it is not shown as saved, verifies **AC-7**.
- Privacy boundary: exercise settings and Calendar actions and verify that no server or external calendar request is made, verifies **AC-9**.

## Build plan

Follow the Skateboard approach by first shipping a usable plan from Settings through to the Calendar rail, then adding actual tracking and derived awake totals.

1. [x] Add the versioned Sleep Schedule model, local persistence, validation, and pure planned time calculations. Cover local dates, daylight saving, missing settings, and invalid values. Satisfies **AC-1**, **AC-2**, **AC-3**.
2. [x] Add the dedicated Sleep Schedule command coordinator and Settings section. Reuse the established Web Lock, persistence, broadcast, fallback, and error patterns. Start coordination in the main and Settings layouts. Satisfies **AC-1**, **AC-2**, **AC-3**, **AC-7**, **AC-9**.
3. [x] Connect Calendar read paths to Sleep Schedule. Render planned events, the wake to bed rail, the separate current time line, and no schedule state without duplicating sleep data. Satisfies **AC-3**, **AC-4**.
4. [x] Add actual bed and wake commands, Calendar recording and correction controls, duration derivation, and the legacy migration with recovery review and export. Remove active Calendar ownership only after the new store has persisted migrated values. Satisfies **AC-5**, **AC-7**, **AC-8**, **AC-9**.
5. [x] Derive awake idle totals from `TrackedInterval` values and planned awake windows, then show per date totals in Day, Multi Day, and Week views. Satisfies **AC-3**, **AC-6**.

## Consequences

**Positive**:

- Settings and Calendar use one source for planned values and actual sleep records.
- The Calendar rail follows the planned awake window, while the independent current time line shows the current instant.
- Awake totals reuse idle history without changing tracked intervals or completed sessions.
- Local storage keeps this feature usable before accounts or server storage exist.

**Negative / tradeoffs**:

- A feature owned store and coordinator add another local key, synchronization path, and migration to maintain.
- Changes to the current plan update generated planned times for past dates because this version does not keep dated schedule history.
- Awake totals are unavailable until a valid wake time is configured.
- Browser local storage is not encrypted, and browsers without coordination APIs provide only single tab guarantees.

**Neutral**:

- Actual sleep duration and awake totals are derived when read, so neither value can become stale as a separately persisted field.
- Legacy Calendar events need a recovery path even though the current Calendar page does not create them.

## Follow-up

- [ ] Revisit account ownership, a pinned time zone, and cross device sync when those features are designed. They remain outside this local browser feature.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).