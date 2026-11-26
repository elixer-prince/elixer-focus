# Verify: Calendar · spec 0007 · updated 2026-11-25

_Steps derived from spec 0007 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [ ] Open `/calendar` and confirm today appears in Day view. Use previous and next and confirm each moves exactly one local date. → Day view and local date source → AC-1
- [ ] Select a task with a description, category, and 45 minute default duration. Schedule it at 09:00 and confirm those task details and duration are copied into the occurrence. Complete the reusable task in Tasks and confirm its scheduled occurrence remains incomplete. → Task fields and saved duration source → AC-2
- [ ] Create a new timed task at 23:30 for 60 minutes and an untimed task. Confirm the timed plan continues into the following local day, the untimed plan stays outside the time grid, and the task appears in Tasks. Reuse the new task and confirm its default duration is 30 minutes. → Local time, new task, and duration sources → AC-2, AC-3
- [ ] Open Calendar in two tabs, create a plan in one, and confirm it appears in the other. Remove the plan and confirm the reusable task remains. → Shared local state and occurrence identity → AC-9
- [ ] Set the device timezone to a region with a daylight saving transition, navigate across that date, and confirm the day and time grid follow local time. Restore the original timezone afterward. → Device timezone source → AC-1

## Commands

- [ ] `cd web && npx vitest run --coverage.enabled=false src/features/calendar/__tests__ 'src/app/routes/(root)/__tests__/Calendar.test.tsx' 'src/app/routes/(root)/__tests__/Tasks.test.tsx' src/features/tasks/__tests__/stores/tasks-store.test.ts src/features/tasks/__tests__/components` → 104 tests pass, including persistence fallback and write failure cases → AC-1, AC-2, AC-3, AC-9

## Acceptance-criteria coverage

- AC-1: steps 1 and 5 cover the Day view and local date source. Other view modes remain in the next build milestone.
- AC-2: steps 2, 3, and 4 cover reusable tasks, creation, and occurrence removal.
- AC-3: step 3 covers timed, untimed, and overnight plans.
- AC-9: step 4 and the command cover tab coordination, local persistence, and fallback behavior.
- AC-4 through AC-8: deferred to later build milestones and not covered by this slice.

## Milestone 2 update · 2026-11-25

The views and shared week start preference are now implemented. This update supersedes the earlier coverage note for AC-1 and AC-8.

- [ ] Open `/calendar` and confirm today appears in Day view. Switch to Multi Day, Week, and Month, then confirm three dates, seven dates, and compact task markers. → AC-1
- [ ] Use previous and next in each view and confirm navigation moves by one day, three days, seven days, or one month. Confirm Multi Day begins with the selected date. → AC-1
- [ ] Select a date in Month and confirm it opens in Day view. At a narrow screen width, confirm Multi Day and Week scroll horizontally so task details remain readable. → AC-1
- [ ] In Settings, set the week start to Wednesday and reload. Confirm the saved preference remains Wednesday, Calendar Week and Month start on Wednesday, the Journal chart begins on Wednesday, and the Journal date picker is unchanged. → persisted `weekStartsOn` source → AC-8
- [ ] With two tabs open, change the week start in Settings in one tab and confirm the other tab updates. → persisted preference and cross tab coordination → AC-8, AC-9

### Current acceptance criteria coverage

- AC-1: The Day check above and the new view, navigation, Month selection, and narrow screen checks cover the Calendar views.
- AC-8: The saved preference and Journal chart check above cover the shared week start value.
- AC-4 through AC-7 remain deferred to later build milestones.

## Milestone 3 update · 2026-11-25

Recurrence rules and occurrence lifecycle are now built. This update adds coverage for AC-4 and AC-5 and the remaining value sources. Drag and resize behavior and the optional sleep layer are still pending.

### UI / manual

- [ ] Open Calendar in Day, Multi Day, Week, and Month views. Confirm the selected date, time labels, and columns follow the device time zone. → selected date and device time zone source → AC-1
- [ ] Confirm the reusable task list excludes archived tasks and uses 30 minutes when a task has no saved default duration. → non archived Task records and duration fallback source → AC-2
- [ ] Create and schedule a new task, then schedule an existing task. Confirm task details, category, duration, and completion remain independent from each saved occurrence, and new tasks appear in Tasks and the Matrix. → user input and task defaults source → AC-2, AC-3
- [ ] Create daily, weekly, and monthly recurring plans. Check chosen weekdays, intervals anchored to the original series start, monthly date and weekday ordinal patterns, inclusive end dates, and occurrence counts that count only matching dates. Confirm a monthly 31st rule skips February. → active series, original start date, rule fields, visible range, and device time zone source → AC-4
- [ ] Revisit and change visible date ranges. Confirm each occurrence is rendered from its saved rule segment and the same segment date is not duplicated. Test a spring daylight saving gap and a repeated fall time in the device time zone. → saved occurrences generated by `rrule` source → AC-4
- [ ] Mark an occurrence done and undo it. Edit one occurrence, this and following, and the entire series. Confirm earlier dates stay unchanged for a future edit, full series edits retain dated segment boundaries, and completion remains only on dates that still occur. → occurrence id, edit scope, revised rule, and saved completion source → AC-5
- [ ] Delete one recurring occurrence and revisit its date, then delete this and following, then the entire series. Confirm the skipped date is not regenerated, future deletion retains earlier occurrences, and full deletion removes the series and its occurrences. → occurrence or series id and deletion scope source → AC-5
- [ ] Update or archive a task preset after an occurrence is saved, then remove a task preset. Confirm saved occurrence snapshots stay unchanged and the removed or archived task no longer generates occurrences. → task id and archive time source → AC-5
- [ ] Create overlapping timed plans, including one that crosses midnight. Confirm the conflict warning appears, a suggested slot fits on the same date when possible, and no suggestion appears when none fits. → actual timed intervals and requested duration source → AC-6
- [ ] In Month view, create plans on dates inside the displayed month and confirm compact markers reflect saved occurrences in that month. → saved occurrences in the displayed month source → AC-1
- [ ] Check Calendar with and without Sleep Schedule settings. When settings exist, confirm planned Wake Up and Go to Bed times drive the read only events and progress rail across local dates. → shared sleep settings, selected date, and local time source → AC-7
- [ ] Record, edit, and clear actual sleep events for today and past dates. Confirm future dates cannot be marked and duration is derived from a Bed record and the following Wake record on the Wake date. → current device time, entered past time, and paired records source → AC-7
- [ ] Change the week start in Settings and reload. Confirm Calendar Week and Month and the Journal chart use the saved weekday while the Journal date picker does not. → persisted `weekStartsOn` source → AC-8
- [ ] With two tabs open, change a plan and a week start preference in one tab and confirm the other updates. Simulate a storage write failure and unavailable coordination APIs; confirm the error is shown and one tab remains usable. → persisted local state and cross tab coordinator source → AC-9

### Commands

- [ ] `npm run typecheck:web` and `npm run lint:web` → both pass → AC-4, AC-5
- [ ] `npm --prefix web run test -- --run --maxWorkers=2 'src/features/calendar/__tests__/services/calendar-coordinator.test.ts' 'src/features/calendar/__tests__/utils/calendar-recurrence.test.ts' 'src/app/routes/(root)/__tests__/Calendar.test.tsx'` → all 32 tests pass → AC-4, AC-5
- [ ] `npm --prefix web run build` → production build succeeds → AC-4, AC-5

### Current acceptance criteria coverage

- AC-1 through AC-3 and AC-8 through AC-9: covered by the earlier checks and Milestone 2 update above.
- AC-4 and AC-5: covered by the recurrence creation, rule, edit, delete, completion, snapshot, and archive checks in this update.
- AC-6 remains pending the drag, resize, and conflict milestone. AC-7 remains pending alignment with the shared Sleep Schedule feature.

## Milestone 4 update · 2026-11-26

The drag, resize, and conflict milestone is now built. The shared Sleep Schedule integration was already complete; this update supersedes the earlier notes that AC-6 and AC-7 were pending.

### UI / manual

- [ ] Open `/calendar`, check the selected local date and device time zone in Day, Multi Day, Week, and Month, navigate by each view interval, and open a Month date in Day view. → AC-1 · selected date and device time zone
- [ ] Reuse an active task with a saved duration, then check archived tasks are excluded and missing duration falls back to 30 minutes. → AC-2 · active Task records and duration fallback
- [ ] Create and schedule tasks using user input and defaults. Check task details, category, duration, timed and untimed placement, exact minute entry, five minute drag snapping, resize, and an overnight task. → AC-2, AC-3 · user input and task defaults
- [ ] Create daily, weekly, and monthly rules, then view several ranges and check interval anchors, matching dates, end rules, occurrence counts, and daylight saving behavior. → AC-4 · active series, original start date, rule fields, visible range, and device time zone
- [ ] Revisit generated dates and confirm each saved occurrence follows its rule segment without duplicates. → AC-4 · saved occurrences generated from rule segments
- [ ] Edit and delete one occurrence, future occurrences, and a whole series. Check completion retention, skipped dates, and archived task snapshots. → AC-5 · occurrence or series identifiers, edit scope, deletion scope, and archive time
- [ ] Create overlapping tasks, including one starting on the prior date and crossing midnight. Check warnings, a fitting next slot on the same date, and no suggestion when none fits. → AC-6 · actual timed intervals and requested duration
- [ ] Check Month markers against saved occurrences in the displayed month. → AC-1 · saved occurrences in the month
- [ ] Check planned sleep events, awake rails, current time, and totals with valid and invalid Sleep Schedule settings. → AC-7 · shared sleep settings, selected date, local time, and tracked idle intervals
- [ ] Record, edit, and clear sleep events for today and past dates. Check future entries are rejected and duration is derived from paired records on the wake date. → AC-7 · device time, entered past time, and paired records
- [ ] Change the saved week start and check Calendar Week, Calendar Month, and the Journal chart while the Journal date picker stays unchanged. → AC-8 · persisted `weekStartsOn`
- [ ] Use two tabs to check task, schedule, and preference synchronization. Simulate storage failure and unavailable browser coordination APIs; check the error and single tab fallback. → AC-9 · persisted local state and coordinator

### Commands

- [ ] `npm run typecheck:web` and `npm run lint:web` → both pass → AC-3, AC-6
- [ ] `npm --prefix web run test -- --run 'src/app/routes/(root)/__tests__/Calendar.test.tsx' src/features/calendar/__tests__/utils/calendar-conflicts.test.ts` → 20 tests pass → AC-3, AC-6
- [ ] `npm --prefix web run build` → production build succeeds → AC-3, AC-6

### Acceptance-criteria coverage

- AC-1: steps 1 and 8 cover the date range and Month marker sources.
- AC-2: steps 2 and 3 cover reusable tasks, task fields, and defaults.
- AC-3: step 3 covers timed, untimed, overnight, exact entry, drag, and resize behavior.
- AC-4: steps 4 and 5 cover recurrence rules and saved generated occurrences.
- AC-5: step 6 covers occurrence lifecycle and task snapshots.
- AC-6: step 7 covers overlap detection and same date suggestions.
- AC-7: steps 9 and 10 cover planned and actual sleep values.
- AC-8: step 11 covers the shared week start preference.
- AC-9: step 12 and the commands cover local persistence and fallback behavior.
