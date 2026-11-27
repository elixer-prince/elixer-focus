# Calendar Settings Guidance

Calendar settings behavior follows `docs/specs/web/0007-calendar-planner/index.md` and `docs/specs/web/0008-sleep-schedule/index.md`.

`Index.tsx` reads the `weekStartsOn` preference from the Calendar store and saves changes through `dispatchCalendarCommand()`. The preference affects Calendar Week and Month views and the Journal chart.

Compose `SleepScheduleSettings` from `web/src/features/sleep-schedule/`. Keep schedule values and writes owned by that feature.

Tests live in `__tests__/`. Run focused tests from the repository root with `npm --prefix web run test -- --run <test-file>`.

_Drafted by /sync from the introducing change, worth a quick human pass._
