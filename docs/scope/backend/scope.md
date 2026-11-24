# Scope: Elixer Focus System (backend)

Laravel 12 API backend. Currently the default Laravel skeleton; no product endpoints yet. Needed only once auth/persistence move server-side.

**Build approach:** Skateboard (MVP first; ship the thinnest usable whole, then grow).
**Workflow:** Prototype (just /develop, no separate verify or test steps). Fastest path for infrastructure work. Project default level of rigor.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use /develop and skip /architect. You decide when a feature is done._

## At a glance

| #   | Feature                    | Phase       | Status  |
| --- | -------------------------- | ----------- | ------- |
| 1   | Laravel API foundation     | Foundation  | planned |
| 2   | Auth API (tokens)          | Slice 1     | planned |
| 3   | Task sync API              | Slice 2     | planned |

## Foundations

### 1. Laravel API foundation · planned · needs a decision

Set up the API foundation before the web auth feature goes live. The Laravel backend is a default skeleton with no API routes in routes/api.php (file does not exist), no API controllers beyond the base Controller.php, and no Sanctum or Passport for token auth. The scope says auth is in progress on the web side, but the backend has nothing to authenticate against yet. This includes creating routes/api.php with the API route prefix, adding Laravel Sanctum for SPA token auth (lighter than Passport, fits the stack), wiring up bootstrap/app.php to load API routes with CORS middleware, adding the users migration password reset and email fields if not present, and creating a health check endpoint (/api/health) for CI verification.

**Done when:** API boots with routes loaded, CORS is configured, Sanctum is installed for token auth, and /api/health returns a response.

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

