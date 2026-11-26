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
