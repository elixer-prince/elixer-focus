# Scope: Elixer Focus System (backend)

Laravel 12 API backend. Currently the default Laravel skeleton; no product endpoints yet. Needed only once auth/persistence move server-side.

**Build approach:** Skateboard (MVP first; ship the thinnest usable whole, then grow).
**Workflow:** Alpha (run /check verify after /develop). Project default level of rigor.

_These are recommendations to keep your build orderly, not requirements._

## At a glance

| #   | Feature                    | Phase       | Status  |
| --- | -------------------------- | ----------- | ------- |
| 1   | Laravel API foundation     | Foundation  | planned |
| 2   | Auth API (tokens)          | Slice 1     | planned |
| 3   | Task sync API              | Slice 2     | planned |

## Foundations

### 1. Laravel API foundation · planned · needs a decision

Scaffold routing, CORS, and env config for the API.

**Done when:** API boots and returns a health check.

- [ ] Design it (spec): `/architect laravel api foundation`

code in `backend/`

## Slice 1: auth

### 2. Auth API (tokens) · planned · needs a decision

Login/signup endpoints issuing bearer tokens for the web client.

**Done when:** web client can auth against the API.

- [ ] Design it (spec): `/architect auth api`

## Slice 2: sync

### 3. Task sync API · planned · needs a decision

Persist and sync tasks server-side.

**Done when:** tasks sync between devices.

- [ ] Design it (spec): `/architect task sync api`
