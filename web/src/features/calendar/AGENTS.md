# Calendar Feature Guidance

Calendar behavior is governed by `docs/specs/web/0007-calendar-planner/index.md`.

The route is `web/src/app/routes/(root)/Calendar.tsx`. Persisted schedule data lives in `stores/calendar-store.ts`, and recurrence date generation lives in `utils/calendar-recurrence.ts`.

Send Calendar state changes through `dispatchCalendarCommand()` in `services/calendar-coordinator.ts`. The coordinator serializes writes, persists changes before broadcasting them, and uses single tab behavior when browser coordination APIs are unavailable.

Use the local date helpers in `utils/calendar-date.ts` for calendar dates. Keep saved occurrence details independent from later task edits, as required by the Calendar spec.

Calendar tests live in `__tests__/`. Run focused tests from the repository root with `npm --prefix web run test -- --run <test-file>`.

## Agent skills

- [temporal-date-api](../../../../.agents/skills/temporal-date-api/): `sensei85/skills`, JavaScript date and time design, time zones, daylight saving, and polyfill selection.
- [temporal-api](../../../../.agents/skills/temporal-api/): `blur94/skills`, Temporal types, conversions, arithmetic, and time zones.
- [migrate-to-temporal-api](../../../../.agents/skills/migrate-to-temporal-api/): `umami-creative-gmbh/agent-skills`, migration from `Date` and date libraries to Temporal.

MCP servers: `temporal-cortex/mcp` (recommended)
MCP servers: Tanod `expand_rrule` (recommended)

_Drafted by /sync from the introducing change, worth a quick human pass._
