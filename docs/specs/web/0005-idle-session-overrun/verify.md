# Verify: Idle and session overrun tracking · spec 0005 · updated 2026-11-24

_Steps derived from spec 0005 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [ ] Open the app with no active timer or pending reflection. Confirm the first idle interval starts at first use, then start, pause, and resume a timer and confirm idle closes and reopens without overlap → AC-1
- [ ] Keep an idle interval open across reload and browser closure, then inspect timestamps and confirm elapsed time persists and is split at local midnight → AC-2
- [ ] Complete Focus, Short Break, and Long Break sessions with attribution enabled, then disabled. Confirm one session is recorded at its saved end time, enabled time is overrun, disabled time is idle, and changing the setting affects only future completions → AC-3
- [ ] Check the existing reflection dialog’s live elapsed value, label, and session type. Save, skip, and close separate pending reflections and confirm each resolves once → AC-4
- [ ] Open two tabs, control start, pause, and reset from either tab, close the coordinator tab, and confirm handoff with one completion and no overlap → AC-5
- [ ] With a reflection pending, confirm it appears in both tabs, draft edits synchronize, and timer controls remain disabled. Resolve from the other tab and confirm both dialogs close → AC-6
- [ ] Close every tab while a timer runs, wait past its end time, reopen multiple tabs, and confirm one session at the saved deadline with captured duration, one reflection, and caught up overrun → AC-7
- [ ] Test without Web Locks or BroadcastChannel. Confirm a clear single tab warning and no claim of cross tab accuracy → AC-8
- [ ] Select a Journal day with focus, session counts, idle, and overrun. Confirm all values show, including a day with idle time and no completed sessions → AC-9
- [ ] Check the current Monday through Sunday chart for paired focus and idle bars. Confirm overrun remains separate from both series → AC-10
- [ ] Remove a completed session with linked overrun. Confirm its overrun is removed while idle intervals remain, and inspect interval IDs, timestamps, nullable user ID, and updated timestamp → AC-11
- [ ] Load legacy active timer and pending reflection data. Confirm a stable run ID and duration are established before recovery, legacy duration uses startTimeInMinutes, pending intervals start at completedAt, and earlier idle time is not backfilled → AC-12
- [ ] Confirm a new idle startedAt comes from the current wall clock at initialization or the lifecycle transition → AC-1
- [ ] Confirm endedAt and updatedAt use the timer start or reflection resolution timestamp → AC-2
- [ ] Confirm overrun startedAt uses the saved timer deadline and its session type comes from the linked completed session → AC-3
- [ ] Compare the live elapsed display with startedAt and the current wall clock, and confirm the attribution setting selects the label → AC-4
- [ ] During recovery, vary the persisted run ID, session type, captured duration, and saved deadline, then confirm each appears in the recovered session → AC-7
- [ ] Save a draft and confirm the linked completed session supplies its type and ID, and the Journal note is created once → AC-6
- [ ] Use intervals crossing local midnight and confirm daily totals use local date overlap and linked session type → AC-9
- [ ] Compare focus totals with completed session history and current focus timer state, including a paused timer → AC-9
- [ ] Confirm weekly values derive from the existing Monday through Sunday local date ranges → AC-10
- [ ] Change attribution after one completion and confirm existing intervals keep their original classification while later completions use the new setting → AC-3
- [ ] Change timer state in one tab and confirm other tabs receive the coordinator’s persisted state → AC-5
- [ ] Confirm userId stays null and createdAt and updatedAt reflect interval creation and closure → AC-11

## Commands

- [ ] `cd web && npm run build` → TypeScript check and production build pass → AC-1 through AC-12
- [ ] `cd web && npm run lint` → ESLint passes → AC-1 through AC-12
- [ ] `cd web && npm run format:check` → formatting check passes → AC-1 through AC-12
- [ ] `cd web && npm run test -- --run src/features/countdown-timer/__tests__/utils/tracked-intervals.test.ts src/features/countdown-timer/__tests__/stores/session-history-tracking.test.ts src/features/countdown-timer/__tests__/services/timer-coordinator.test.ts src/features/countdown-timer/__tests__/stores/session-store.test.ts src/features/journal/components/SessionReflection/__tests__/SessionReflection.test.tsx src/features/journal/components/DailyEntry/__tests__/DailyEntry.test.tsx src/features/journal/components/Chart/__tests__/Chart.test.tsx src/features/journal/stores/__tests__/journal-store.test.ts` → focused interval, recovery, reflection, settings, and Journal tests pass → AC-1 through AC-12

## Acceptance-criteria coverage

- AC-1 through AC-12 are covered by the matching manual steps above. The additional value source checks exercise each row of spec 0005’s Value sourcing table.