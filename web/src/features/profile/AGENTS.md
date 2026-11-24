# AGENTS.md

Profile behavior is governed by `../../../../docs/specs/web/0004-profile-page/index.md`.

`stores/profile-store.ts` persists identity details. `utils/profile-data.ts` derives stats, activity, and badge state from the session and task stores. Keep derived calculations out of the identity store.

Components in `components/` present profile data. Shared store hooks are exported through `@/stores`.

Component and data tests live in `__tests__/`. Browser flows live in `web/e2e/profile.spec.ts`. Run web tests from `web/` with `npm run test -- --run`.

_Drafted by /sync from the introducing change, worth a quick human pass._
