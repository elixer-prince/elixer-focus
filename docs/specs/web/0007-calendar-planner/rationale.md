## Context

> ⚠️ Premise note: This request spans the Calendar planner, shared task reuse, recurring schedules, sleep event presentation, and a week start preference used by the Journal. They share one planning flow, so this spec keeps those Calendar integrations together. It does not own Sleep Schedule settings, actual records, or awake time derivation. Those are defined in spec [0008](../0008-sleep-schedule/index.md). Account sync and a full Tasks page redesign remain outside this decision.

The Calendar route is a placeholder and its current scope only asks for a monthly event view. The requested experience is a day first planner with four views, task occurrences that can be timed or untimed, reusable task records, customizable recurrence, and completion tracked per occurrence. The app already stores Tasks and settings locally, and the task model has its own completion state.

The progress rail and generated sleep events depend on planned Wake Up and Go to Bed times. Calendar reads those values from the shared Sleep Schedule in spec 0008, rather than keeping a second Calendar setting. The Sleep Schedule also derives awake totals from idle intervals without changing timer history. Calendar remains useful when the schedule is absent or invalid.

The app is in alpha. Account work is being handled separately and is not a prerequisite for this base flow. The current design therefore keeps data in the browser, but the user wants live updates between open tabs. Sleep records contain personal wellness information, but they are not medical records or a clinical feature.

## Options considered

### Option 1: Keep a month only calendar

Keep the existing scope intent and add date markers to tasks. This is the shortest path and would give the placeholder route a usable month view. (basis: `docs/scope/web/scope.md`)

**Pros**:

- Requires the least new data and UI.
- Fits the existing scope row with little change.

**Cons**:

- Does not provide the day timeline, untimed task area, multi day and week views, or recurrence the user asked for.
- A task with one date field cannot represent independent scheduled uses.

### Option 2: Build the calendar and recurrence engine from scratch

Use the existing React, date-fns, and drag and drop stack to implement all calendar views and recurrence logic directly. This gives complete layout control and adds no calendar dependency. (basis: `AGENTS.md`)

**Pros**:

- The timeline, sleep rail, and task cards can match the supplied screenshots closely.
- It avoids a commercial calendar plugin and reuses current project tools.

**Cons**:

- The project would own date grid, drag, resize, time zone, daylight saving, and recurrence edge cases.
- The implementation cost and long term maintenance are high for an alpha planner.

### Option 3: Use FullCalendar React and `rrule` with app owned schedule data

Use FullCalendar's free day and time grids for the views and interactions, and `rrule` for recurrence calculations. Keep task presets, rule segments, occurrences, sleep records, and preferences in the local persisted app state. Add a custom scroll wrapper and custom Calendar components for features the libraries do not provide. (basis: FullCalendar React and TimeGrid documentation, `rrule` documentation)

**Pros**:

- The core calendar views, custom three day duration, and drag or resize interactions come from a maintained calendar library.
- `rrule` covers the chosen daily, weekly, and monthly rules, including interval and exclusion behavior.
- App owned occurrence records preserve per date completion, snapshots, and edit scopes.

**Cons**:

- Custom sleep visuals, task containers, recurrence editing, and persistence still need implementation.
- The free FullCalendar packages do not include its Premium advanced horizontal scrolling plugin, so the responsive wrapper needs careful verification.
- The recurrence library's time zone behavior must be tested against the chosen local wall time and daylight saving rules.

### Option 4: Use React Big Calendar

Use React Big Calendar with its date-fns localizer and drag add on, then build the custom three day mode and sleep elements around it. (basis: React Big Calendar package documentation)

**Pros**:

- It is an open source React calendar with Month, Week, and Day views.
- It can use the date-fns version already in the project.

**Cons**:

- Its drag add on needs app supplied update logic.
- The three day mode, sleep rail, and custom task container still require additional UI work.

## Rationale

Option 3 is the best fit for a planner with four views, drag and resize, and explicit recurrence edge rules. It avoids rebuilding a calendar engine while keeping the experience and task lifecycle under app control. The free FullCalendar views plus a custom wrapper avoid a paid plugin, and the supplied screenshots and existing design system guide the custom elements. Option 2 and Option 4 leave more calendar behavior to the project. (basis: `AGENTS.md`, `docs/design.md`, user supplied screenshots, current FullCalendar documentation, RFC 5545 recurrence practices)

Scheduled occurrences must remain separate from reusable Tasks. A Task can appear in the Eisenhower Matrix and be scheduled more than once, while each occurrence owns its date, duration, and completion. Separate rule segments preserve earlier dates when a user changes a recurring plan from one date forward. A single date field on `Task` would not support these user selected behaviors. (basis: `web/src/features/tasks/types/task.ts`, `docs/specs/web/0001-inline-task-editing.md`)

The Sleep Schedule in spec 0008 is the single source for planned wake and bed times and actual records. Calendar reads those values and sends actual event changes through the feature boundary; it does not copy settings or records. Actual sleep records do not alter the planned rail. The shared week start preference is stored once and reused by Calendar and the Journal graph. Repeated range reads must not create duplicate occurrences, and local wall time must stay consistent through daylight saving changes. (basis: `docs/specs/web/0008-sleep-schedule/index.md`, `docs/scope/web/scope.md`, `docs/specs/web/0003-journal.md`, idempotent operation design, local wall time scheduling)

The installed Vercel React skill gives relevant guidance for the new React components and their performance. The composition skill applies to the complex planner component boundaries, and the web design skill supports the responsive interface review. (basis: installed Vercel community skills)

## References

**Project sources**:

- `AGENTS.md` for local persisted stores, date-fns, drag and drop, theme conventions, and the existing browser coordination pattern.
- `docs/scope/web/scope.md` for the Calendar and Sleep Schedule scope rows.
- `docs/specs/web/0008-sleep-schedule/index.md` for the canonical planned values, actual records, and awake time contract.
- `docs/specs/web/0001-inline-task-editing.md` for existing Task editing behavior.
- `docs/specs/web/0003-journal.md` for Journal calendar and chart behavior.
- `web/src/features/tasks/types/task.ts` for current Task fields.
- User supplied Structured screenshots for the date header, views, timeline, and progress rail.

**Practices & standards**:

- RFC 5545 recurrence rules for calendar interval, weekday, and monthly patterns.
- Idempotent range generation so viewing the same date range cannot create duplicate occurrences.
- Local wall time for user schedules, with an explicit daylight saving policy.

**Links**:

- FullCalendar plugin and view list: https://fullcalendar.io/docs/plugin-index
- FullCalendar React component: https://fullcalendar.io/docs/react
- FullCalendar custom time grid durations: https://fullcalendar.io/docs/timegrid-view
- `rrule` recurrence implementation: https://github.com/jkbrzt/rrule
- React Big Calendar package: https://www.npmjs.com/package/react-big-calendar
- Vercel React best practices skill: https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices