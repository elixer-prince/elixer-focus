## Context

The web app stores idle and overrun time as timestamped `TrackedInterval` records. The accepted idle tracking contract leaves awake time as a future calculation and requires raw intervals and completed sessions to remain unchanged. Calendar needs planned Wake Up and Go to Bed values, actual sleep records, and a progress rail, but its provisional data model stores individual sleep events in Calendar state.

The Calendar and Settings areas already use local persisted stores. Calendar writes also have a coordinator that serializes changes across tabs. Sleep settings and actual nights need one owner that both Settings and Calendar can use, while account ownership, server storage, and cross device sync remain out of scope. Sleep values are personal wellness information, not clinical records. (basis: `docs/specs/web/0005-idle-session-overrun/index.md`, `docs/specs/web/0007-calendar-planner/index.md`, `web/src/features/calendar/services/calendar-coordinator.ts`)

## Options considered

### Option 1: Keep sleep data in Calendar

Add planned settings and actual events to Calendar's current persisted model. Settings would edit those fields through Calendar. This is the shortest path to showing sleep in the timeline. (basis: `docs/specs/web/0007-calendar-planner/index.md`, `web/src/features/calendar/stores/calendar-store.ts`)

**Pros**:

- Calendar already generates timeline events from its local state.
- It avoids introducing a second coordinator immediately.

**Cons**:

- Calendar would own values required by the separate Sleep Schedule feature.
- Awake totals would depend on Calendar state, and a future Sleep Settings surface could create a second source.

### Option 2: Split planned settings and actual records

Keep planned values in general app settings, actual records in Calendar, and derive awake totals by reading both stores and idle history. (basis: `docs/scope/web/scope.md`, `docs/specs/web/0007-calendar-planner/index.md`)

**Pros**:

- Planned preferences fit an existing Settings area.
- Actual event controls remain close to the Calendar timeline.

**Cons**:

- Planned and actual sleep data have different owners and write paths.
- A settings change, event migration, or awake calculation must reconcile several stores.

### Option 3: Sleep Schedule owns planned and actual sleep data

Give Sleep Schedule its own versioned local store and coordinator. Settings edits its planned values, Calendar reads its generated events and records actual times through its command boundary, and awake totals derive from idle history. (basis: scope item 47, `docs/specs/web/0005-idle-session-overrun/index.md`, `docs/specs/web/0007-calendar-planner/index.md`)

**Pros**:

- One feature owns planned values and actual records, and both Settings and Calendar use that source.
- The feature can derive awake totals without making Calendar the owner of timer history.
- It preserves local storage and the app's established serialized write behavior.

**Cons**:

- A separate store and coordinator add setup and maintenance work.
- Existing provisional Calendar events need a safe migration and recovery path.

## Rationale

Option 3 best matches the separate Sleep Schedule scope and the idle tracking contract. A canonical owner prevents Settings and Calendar from disagreeing about planned values, while a feature owned command boundary keeps Calendar focused on rendering and recording actual events. The additional coordinator is a real cost, but it isolates sleep writes and can reuse the existing Web Lock and `BroadcastChannel` behavior. (basis: `docs/scope/web/scope.md`, `docs/specs/web/0005-idle-session-overrun/index.md`, `web/src/features/calendar/services/calendar-coordinator.ts`)

Computing bedtime, actual duration, and awake totals at read time avoids storing values that can become stale. Keeping raw idle intervals and focus sessions untouched also preserves the accepted timer contract. The migration writes the new store before clearing its old source, and preserves unmatched values so a partial migration cannot silently discard sleep history. (basis: derived values at read time, idempotent migration, `docs/specs/web/0005-idle-session-overrun/index.md`)

## References

**Project sources** (verifiable, in this repo):

- `docs/scope/web/scope.md`, feature 47 Sleep Schedule and feature 12 Calendar.
- `docs/specs/web/0005-idle-session-overrun/index.md`, raw interval model and local persistence contract.
- `docs/specs/web/0007-calendar-planner/index.md`, Calendar views, date rules, and coordinator behavior.
- `web/src/features/calendar/services/calendar-coordinator.ts`, serialized local write and cross tab pattern.
- `web/src/features/calendar/stores/calendar-store.ts` and `web/src/features/calendar/types/calendar.ts`, provisional Calendar sleep event data.
- `web/src/features/countdown-timer/types/tracked-interval.ts` and `web/src/features/countdown-timer/stores/session-history-store.ts`, local idle interval source.
- `web/src/features/settings/calendar/Index.tsx` and `web/src/app/layout/Settings.tsx`, current Settings structure.
- `docs/design.md`, shared web design system.

**Practices & standards**:

- Compute derived values at read time instead of storing duplicate values.
- Make migrations safe to repeat and retain source data until the new write succeeds.
- Use explicit local time and daylight saving rules for calendar values.