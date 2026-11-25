# Verify: Profile · spec 0004 · updated 2026-11-24

_Steps derived from spec 0004 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [ ] Clear `profile-storage`, open `/profile`, and confirm the default display name is `Focus User`; save a new name, reload, and confirm it persists. Clear the name and confirm it falls back to `Focus User`. → AC-1, AC-6, AC-7
- [ ] Save a bio, reload, and confirm the saved text appears in the profile header. → AC-1, AC-6, AC-7
- [ ] Open the profile without an uploaded image. → Confirm the default avatar icon appears. → AC-1
- [ ] Add focus sessions totaling 2 hours and a break session. → Total focus hours is `2.0`. → AC-2, AC-8
- [ ] Complete two tasks and leave one open. → Tasks completed is `2`. → AC-2, AC-8
- [ ] Add focus sessions on consecutive local calendar days, then include a missing day; also check with no focus sessions. → The streak follows browser local dates and is zero with no focus sessions. → AC-2
- [ ] Change activity data. → The Focus placeholder bar stays fixed. → AC-3
- [ ] Change activity data. → The Discipline placeholder bar stays fixed. → AC-3
- [ ] Change activity data. → The Creativity placeholder bar stays fixed. → AC-3
- [ ] Complete a focus session. → Its title, duration, and completion time appear in activity. → AC-4
- [ ] Complete a task, edit its title, then reopen it; load a v1 or v2 completed task. → The completion time stays unchanged after edits, reopened tasks leave activity, and legacy timestamps use `updatedAt`. → AC-4
- [ ] Create more than five mixed session and task entries with distinct completion times. → Activity is newest first and shows only five entries. → AC-4
- [ ] With no sessions, check First Session, then complete a session. → The badge changes from locked to unlocked. → AC-5
- [ ] With no completed tasks, check First Task, then complete a task. → The badge changes from locked to unlocked. → AC-5
- [ ] Change the theme in Settings. → The profile label updates to the registry label, and the profile has no theme control. → AC-9
- [ ] Edit name and bio on the profile. → The app theme does not change. → AC-6, AC-9

## Commands

- [ ] `cd web && npm run test -- --run 'src/app/routes/(root)/__tests__/Profile.test.tsx' src/features/profile/__tests__/profile-data.test.ts src/features/profile/__tests__/profile-store.test.ts src/features/tasks/__tests__/stores/tasks-store.test.ts` → Profile and task migration tests pass, including fixed character bars. → AC-1 to AC-9

## Acceptance-criteria coverage

- AC-1 covered by steps 1 to 3 · AC-2 covered by steps 4 to 6 · AC-3 covered by steps 7 to 9 · AC-4 covered by steps 10 to 12 · AC-5 covered by steps 13 and 14 · AC-6 covered by steps 1, 2, and 16 · AC-7 covered by steps 1 and 2 · AC-8 covered by steps 4 and 5 · AC-9 covered by steps 15 and 16