# Scope: Elixer Focus System (repo-wide)

Cross-workspace concerns for the monorepo: tooling, shared packages, CI.

**Build approach:** Skateboard.
**Workflow:** Alpha. Project default level of rigor.

_These are recommendations to keep your build orderly, not requirements._

## At a glance

| #   | Feature              | Phase      | Status  |
| --- | -------------------- | ---------- | ------- |
| 1   | Monorepo tooling     | Foundation | planned |

## Foundations

### 1. Monorepo tooling · planned · needs a decision

Shared lint/format/commit conventions and a root task runner across workspaces.

**Done when:** one command runs lint/test across web, app, and backend.

- [ ] Design it (spec): `/architect monorepo tooling`
