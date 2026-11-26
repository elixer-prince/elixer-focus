# Sleep Schedule Feature Guidance

Sleep Schedule behavior is governed by `docs/specs/web/0008-sleep-schedule/index.md`. Calendar's consuming contract is in `docs/specs/web/0007-calendar-planner/index.md`.

`stores/sleep-schedule-store.ts` persists schedule settings, actual records, and migration recovery under `sleep-schedule-storage`. Settings show the target duration in hours, while the stored value remains minutes.

Send every settings, record, and recovery change through `dispatchSleepScheduleCommand()` in `services/sleep-schedule-coordinator.ts`. The coordinator serializes writes, persists before broadcasting, and falls back to one tab when browser coordination APIs are unavailable.

Use the pure calculations in `utils/sleep-schedule.ts` for planned events, awake windows, actual events, and idle totals. Local date and time behavior uses the shared helpers in `web/src/features/calendar/utils/calendar-date.ts`.

`services/sleep-schedule-migration.ts` imports legacy Calendar sleep events. Keep the Calendar source until the imported Sleep Schedule state has persisted successfully.

Settings and Calendar components are in `components/`. Tests live in `__tests__/`. Run focused tests from the repository root with `npm --prefix web run test -- --run <test-file>`.

_Drafted by /sync from the introducing change, worth a quick human pass._
