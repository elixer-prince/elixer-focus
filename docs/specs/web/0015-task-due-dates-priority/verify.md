# Verify: Task due dates and priority · spec 0015 · updated 2026-11-27

_Steps derived from spec 0015 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [ ] Open an active task on Home or `/my/tasks`, set a local date and time, and save → verify the persisted `dueAt` is the epoch millisecond instant for that local time and the coordinator persists the update → AC-1, AC-2, AC-3
- [ ] Clear a task deadline in its inline editor and save → verify the update uses `null`, persisted task data omits `dueAt`, and the card no longer shows a deadline → AC-2
- [ ] Change the browser timezone after setting a deadline → verify the stored instant is unchanged while the displayed local date and time changes → AC-4
- [ ] Let an active task deadline pass → verify its card shows the text `Overdue` badge, then complete the task and verify its archive card has no overdue badge → AC-5
- [ ] Set and clear a deadline on a task with Calendar recurrence or scheduled occurrences → verify Calendar fields and behavior remain unchanged → AC-6
- [ ] Select due date sort with tasks in multiple categories, including equal and missing deadlines → verify ascending order within each category, stable manual order for equal deadlines, undated tasks last, and search filters before sorting → AC-7
- [ ] Select due date sort, reload or reopen `/my/tasks`, and inspect drag behavior → verify manual order is selected by default, stored task order is unchanged, drag is disabled in due date mode, and restored in manual mode → AC-8
- [ ] Open the same task in two tabs, set its deadline in one tab → verify the persisted update and deadline display arrive in the other tab → AC-3
- [ ] Open `/my/tasks` at a wide desktop size and a narrow viewport → verify the header controls remain usable, the matrix switches from two columns to one, and category add actions remain visible → Tasks page styling follow up

## Commands

- [ ] From `web/`, run `npm run test -- --run src/features/tasks/__tests__/utils/task-due-date.test.ts src/features/tasks/__tests__/components/Task/Index.test.tsx src/features/tasks/__tests__/components/TaskPageHeader.test.tsx src/features/tasks/__tests__/stores/tasks-store.test.ts src/app/routes/my/__tests__/Tasks.test.tsx src/features/calendar/__tests__/services/calendar-coordinator.test.ts` → all 127 tests pass → AC-1 through AC-8

## Acceptance-criteria coverage

- AC-1, AC-2, and AC-3 are covered by manual steps 1, 2, and 8 plus the test command.
- AC-4 is covered by manual step 3.
- AC-5 is covered by manual step 4.
- AC-6 is covered by manual step 5.
- AC-7 is covered by manual step 6 plus the test command.
- AC-8 is covered by manual step 7 plus the test command.
