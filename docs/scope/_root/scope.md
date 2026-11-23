# Scope: Elixer Focus System (repo wide)

Cross workspace concerns for the monorepo: shared packages, tooling, CI, and infrastructure. Ambitious vision to scale like Instagram or TikTok, currently in Prototype phase with increasing rigor as the product grows.

**Build approach:** Skateboard (MVP first; ship the thinnest usable whole, then grow).
**Workflow:** Prototype (just /develop, no separate verify or test steps). Fastest path for infrastructure work. Project default level of rigor.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use /develop and skip /architect. You decide when a feature is done._

## At a glance

| #   | Feature                    | Phase       | Status  |
| --- | -------------------------- | ----------- | ------- |
| 1   | Monorepo tooling           | Foundation  | done    |
| 2   | Shared code package        | Foundation  | planned |
| 3   | CI/CD improvements         | Foundation  | in-progress |
| 4   | Production database        | Foundation  | planned |

## Foundations

### 1. Monorepo tooling · done

Shared lint, format, and commit conventions with a root task runner across all workspaces. Root package.json now has lint-staged for pre-commit hooks, root scripts for lint/test/format across workspaces, and ESLint TypeScript project service config for better type awareness.

**Done when:** one command at the root runs lint, test, and format across web, app, and backend workspaces.

- [x] Build it: `/develop monorepo tooling`
- [x] Sync (record conventions): `/sync`

### 2. Shared code package · planned · needs a decision

A shared TypeScript package at the repo root (packages/shared/) that both web and mobile apps import. Right now the web app and mobile app share zero code. Both use React and will need the same domain types (Task, TaskCategory), the same Zustand stores, and the same utility functions (e.g., getCurrentTimestamp). This eliminates duplication the moment the mobile app starts implementing tasks and the timer.

**Done when:** packages/shared/ exports types, stores, and utilities; both web/ and app/ import from it without duplication.

- [ ] Design it (spec): `/architect shared code package`

### 3. CI/CD improvements · in-progress

Expand the continuous integration pipeline beyond the existing Playwright E2E workflow. A new lint-typecheck.yaml workflow now runs lint, type check, and format check on push and PR. Backend CI job still needed.

**Done when:** CI runs backend tests, web type checked build, and web E2E tests in parallel on push and PR.

- [x] Build it: `/develop ci/cd improvements` (lint & typecheck workflow done, backend CI remaining)

### 4. Production database · planned · needs a decision

Decide on the production database for the Laravel backend. The backend uses SQLite for local dev and tests (per phpunit.xml), which is fine for development but inadequate for a multi device sync app at scale. For a product aiming to grow like Instagram or TikTok, the database choice now shapes the migration strategy, model design, and performance characteristics.

**Done when:** production database is decided, documented in a spec, and the backend .env.example and migrations reflect the choice.

- [ ] Design it (spec): `/architect production database`

