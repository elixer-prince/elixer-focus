# 0006. Focus sessions before a long break

**Date**: 2026-11-24
**Status**: Accepted

## Summary

The timer already stores a limit for how many Focus sessions happen before a Long Break, but Timer Settings does not let you change it. This decision adds a saved count from one to eight, with four as the default, to the Focus settings card. Saved changes use the existing timer coordinator so the shared timer applies the new limit consistently across tabs.

## Context

The web timer stores session durations, `sessionCountLimit`, and `currentSessionCount` in one persisted Zustand store. The limit defaults to four and already drives session scheduling. The `SessionCount` display shows the current count against that limit, but the Timer Settings page has no control for changing it.

Timer settings use draft values and a shared Save changes and Reset flow. Timer transitions are coordinated across tabs when Web Locks and BroadcastChannel are available. The coordinator serializes commands and broadcasts persisted state, while unsupported browsers are explicitly limited to one tab. A settings update that bypasses the coordinator could leave an active coordinator using an older limit.

## Requirements

**User stories**:

* As a user, I want to choose how many Focus sessions happen before a Long Break so the timer cadence fits my preference.
* As a user, I want the selected count to persist and stay consistent across supported tabs so the shared timer follows my setting.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

* **AC-1**: The Focus card in Timer Settings provides a number input labelled for the number of Focus sessions before a Long Break. It accepts whole numbers from 1 through 8 and initializes from the saved limit, which defaults to 4.
* **AC-2**: The count is a draft until the existing Save changes action is used. The existing Reset action discards the draft and restores the saved count. Saving the count with duration edits commits them through the same form.
* **AC-3**: Blank, fractional, below minimum, or above maximum values show inline validation, remain in the input for correction, and prevent all timer setting drafts from being saved.
* **AC-4**: The selected limit persists in the existing session store across reloads. The timer display shows the existing cycle progress against the selected limit.
* **AC-5**: After a Focus session completes or is skipped, the timer schedules a Long Break directly when that session reaches or exceeds the selected limit. Earlier Focus sessions are followed by Short Breaks. The cycle count resets when a Long Break is scheduled and remains zero when the Long Break ends and Focus resumes.
* **AC-6**: Skipping a Focus session advances the cycle count. Manually switching away from Focus does not advance it.
* **AC-7**: A saved limit change does not interrupt or reset the active timer or cycle progress. The new limit is evaluated when the next Focus session ends or is skipped. If the limit is lowered below current progress during a Short Break, let that break end and run the next Focus session before scheduling a Long Break.
* **AC-8**: In supported multi tab operation, a saved limit is applied by the timer coordinator and becomes visible in the other tabs after the coordinator broadcasts state. If multiple tabs save different values, the last command processed by the coordinator wins. When the coordination APIs are unavailable, the existing single tab fallback and warning remain in effect.

## Options considered

### Option 1: Extend the existing timer settings and coordinator

Expose the existing saved limit in the Focus card, retain its current session store field, and send saved changes through the timer coordinator.

**Pros**:

* Reuses the persisted field and scheduling logic that already exist.
* Keeps one source of truth for the current cycle and the configured limit.
* Extends the existing settings draft and cross tab patterns with a small change.

**Cons**:

* The settings form and coordinator both need a new path for the limit.
* The coordinator still cannot guarantee cross tab behavior in browsers missing its required APIs.

### Option 2: Add separate cycle settings and migrate to them

Create a separate persisted cycle configuration, then transition scheduling and settings to use it alongside the existing limit.

**Pros**:

* Separates cycle cadence from session duration settings if cycle configuration grows later.
* Allows a deliberate transition period before replacing the current source.

**Cons**:

* Adds duplicate persisted state and a migration for a value already present in the session store.
* Requires synchronizing or reconciling two limits while both are in use.

### Option 3: Replace the current scheduler

Rewrite the timer scheduling flow and its session counter while adding the setting.

**Pros**:

* Could consolidate the scheduling paths if broader timer behavior needs to change.

**Cons**:

* Expands a settings gap into a rewrite of working timer behavior.
* Increases regression risk without being required to expose the existing limit.

## Decision

**Chosen option**: Option 1: Extend the existing timer settings and coordinator

Add the number input to the Focus card, save the existing `sessionCountLimit` through a coordinator command, and keep the current cycle counter and scheduler.

**Implementation skills**: `playwright-best-practices` (`currents-dev/playwright-best-practices-skill`, `.agents/skills/playwright-best-practices/`)

## Rationale

The missing capability is a control for a value the timer already stores and uses. Keeping that value in `SessionState` avoids a second source of truth and means no data migration is needed. The timer coordinator is the existing authority for cross tab transitions, so sending the update through its serialized command queue avoids a stale limit in the active tab.

A separate cycle store would add migration and synchronization work without a current need for more cycle settings. Replacing the scheduler would increase risk while changing behavior that already implements the requested cycle. A feature flag is not warranted for this small local setting change; the runner up is a flag, which would add branches without materially reducing its limited rollout risk.

## Feature design

**Data model sketch**:

No new entity, field, or relationship is needed. Reuse the existing single persisted `SessionState` in the Zustand store saved under `session-storage`:

| Field | Type and rules |
| --- | --- |
| `sessionCountLimit` | Required integer from 1 through 8, default 4. This is the saved user setting and the existing scheduling threshold. |
| `currentSessionCount` | Required integer, default 0. This is the existing persisted progress counter and is not replaced. |

The model has no primary key, foreign keys, or entity relationships because it is a local singleton store. Existing users retain the saved limit; a state without a saved limit uses the store default of 4. No store version change or migration is required.

**State transitions**:

| Event | Result |
| --- | --- |
| Focus completes or is skipped | Compare `currentSessionCount + 1` with `sessionCountLimit`. If the result reaches or exceeds the limit, schedule Long Break and reset the count to 0. Otherwise schedule Short Break and increment the count. |
| Short Break completes | Schedule Focus. Keep the cycle count. |
| Long Break completes | Schedule Focus with the cycle count at 0. |
| User manually switches session type | Change the selected session and reset its timer as today. Do not increment the cycle count. |
| User saves a new limit | Apply and persist it through the coordinator without changing the active timer or progress. Evaluate it when the next Focus session ends or is skipped. A current Short Break still leads to Focus. |
| Two tabs save different limits | Apply commands in coordinator order. The last processed command supplies the saved limit. |
| Coordination APIs are unavailable | Keep the existing single tab behavior and warning; do not claim multi tab synchronization. |

**API surface**:

There are no backend endpoints. The feature extends existing client store actions, the timer settings form, and the timer coordinator.

| Surface | Action and inputs | Output | Access and errors |
| --- | --- | --- | --- |
| Timer Settings | Edit a whole number from 1 through 8, then use Save changes or Reset | Draft or saved `sessionCountLimit` | Local browser setting. Invalid drafts stay visible and block the shared save. |
| Timer coordinator | Apply a `set-session-count-limit` command with the validated integer | Persisted limit and a state broadcast to supported tabs | Same origin tabs. Commands are serialized; unsupported coordination uses the existing single tab warning. |
| Timer display | Read `currentSessionCount` and `sessionCountLimit` | Show cycle progress as current count over limit | Existing local session store values. |

**Value sourcing**:

| Action | Value produced or displayed | Source |
| --- | --- | --- |
| Initialize the Focus card input | Saved session limit | `SessionState.sessionCountLimit`, defaulting to 4 in the existing store |
| Validate a draft | Whole number from 1 through 8 | User input, checked before the shared save |
| Reset the count draft | Saved count | `SessionState.sessionCountLimit` |
| Save the count | New persisted limit | Validated draft sent as a coordinator command |
| Display cycle progress | Current count and configured limit | `SessionState.currentSessionCount` and `SessionState.sessionCountLimit` |
| Choose the next break | Whether the next session is Short Break or Long Break | Current session type, `currentSessionCount`, and `sessionCountLimit` in the coordinator's session store |
| Resolve simultaneous saves | Which saved limit remains | The order in which the coordinator processes setting commands |

**Key invariants**:

* `sessionCountLimit` is a whole number from 1 through 8 and defaults to 4.
* The existing persisted `currentSessionCount` remains the only cycle progress counter.
* Only a Focus completion or Skip advances cycle progress. Manual session switching does not.
* Changing the limit does not reset current progress or the active timer. Scheduling uses the saved limit when the next Focus session ends or is skipped. A current Short Break still leads to Focus.
* The coordinator applies saved limit changes in command order. Its existing single tab fallback remains the only guarantee when cross tab APIs are unavailable.
* The existing `SessionCount` display reads the same persisted progress and limit values.

**Security model**:

Local only. The setting is stored in the browser's local storage through the existing Zustand persist middleware. There are no new roles, server permissions, or backend data. Same origin tabs share the setting through the existing coordinator. No regulated data is introduced.

**Configuration required**:

None. No new environment variables, credentials, or third party services are needed.

**Critical test scenarios** (each maps to an acceptance criterion in Requirements):

* Happy path: load Timer Settings, see the saved count or default 4, save a new allowed count, reload, and confirm the value and timer display persist, verifies **AC-1**, **AC-2**, **AC-4**.
* Reset: edit the count, press Reset, and confirm the saved count returns to the input and the draft is discarded, verifies **AC-2**.
* Invalid input: try a blank, fractional, below minimum, and above maximum value; confirm inline feedback, retained draft, and no timer settings are saved, verifies **AC-3**.
* Cycle scheduling: with limits of 1, 4, and 8, verify earlier Focus sessions lead to Short Breaks and the limit reaching Focus session leads directly to Long Break, verifies **AC-5**.
* Cycle behavior: skip a Focus session and verify it advances the count; manually switch away from Focus and verify it does not, verifies **AC-5**, **AC-6**.
* Mid cycle change: change the limit during Focus and verify the timer and progress are not reset. Also lower the limit below progress during a Short Break and verify that Focus still starts after the break, with Long Break scheduled when that Focus session ends or is skipped, verifies **AC-7**.
* Cross tab update: open two app pages in the same browser context, save from a non coordinator tab, and verify the coordinator applies and broadcasts the limit; save different values from both tabs and verify the last processed command wins, verifies **AC-8**.
* Fallback: run without Web Locks or BroadcastChannel and verify the local tab still applies the setting while showing the existing single tab warning, verifies **AC-8**.

## Build plan

Follow the Skateboard approach by delivering the smallest complete setting flow, including its effect on the shared timer, before considering broader cycle features.

- [x] Extend the timer settings draft context and provider with the count, add the number input to the Focus card, and include it in dirty state, validation, shared Save changes, and Reset. Keep invalid drafts visible and prevent the full settings form from saving, satisfies **AC-1**, **AC-2**, **AC-3**.
- [x] Add a coordinator command for the validated limit and apply it to the existing session store through the serialized command queue. Confirm persistence, broadcast, follower rehydration, last processed save behavior, and single tab fallback, satisfies **AC-4**, **AC-7**, **AC-8**.
- [x] Verify the existing scheduler and `SessionCount` display against limits 1 through 8. Add or update focused tests for completion, skip, manual switching, cycle reset, and a changed limit taking effect when the next Focus session ends or is skipped, satisfies **AC-5**, **AC-6**, **AC-7**.

## Consequences

**Positive**:

* Users can adjust the focus cycle without adding another persisted setting or replacing timer scheduling.
* The active timer coordinator receives the saved value, so supported tabs use one limit.
* The existing progress display reflects the chosen limit without adding another display surface.

**Negative / tradeoffs**:

* The settings form gains another draft and validation path, and the coordinator gains a command to test and maintain.
* Browsers without the required coordination APIs retain the existing single tab limitation.
* Lowering the limit below current progress can temporarily show progress above the new limit until the active Focus session ends.

**Neutral**:

* No data migration is needed because the limit and cycle counter already exist in the persisted session store.
* The timer's current Skip and manual switch behaviors remain distinct.

## Follow-up

None.