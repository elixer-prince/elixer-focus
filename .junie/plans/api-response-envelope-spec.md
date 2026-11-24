---
sessionId: session-261123-105044-2wdh
---

### Steps

### ✓ Step 1: Create Laravel ApiResponse trait

### ✓ Step 2: Create TypeScript API response types

### ✓ Step 3: Update Axios interceptor

### ✓ Step 4: Verify type checking and linting

# Requirements

## Overview

Standardize every API response in the project to use a consistent JSON envelope. This eliminates guesswork about response shapes and enables full type safety on the frontend.

## Scope

**In Scope**:

- Laravel `ApiResponse` trait with `success()`, `error()`, and `paginated()` methods
- TypeScript `ApiResponse<T>`, `ApiErrorResponse`, and `PaginatedResponse<T>` interfaces
- Axios interceptor updates to handle the envelope
- Pagination metadata standard (`page`, `per_page`, `total`, `last_page`)

**Out of Scope**:

- Building actual API endpoints (auth, tasks, etc.)
- File downloads, streaming responses, WebSocket messages
- Automated lint enforcement (noted as follow-up)

## Key Decisions Made

- `message` field appears on every response (success and error)
- Pagination metadata lives in a `meta` object alongside `data`
- Validation errors use Laravel native format (field keys with arrays of messages)
- No extra `meta` field for request ID, rate limit info, etc. (add later when needed)

## Known Gaps (to address during build)

1. Laravel validation errors (422) bypass the controller trait—need exception handler integration
2. 404 ModelNotFoundException needs wrapping in `bootstrap/app.php`
3. Axios interceptor unwrapping should be more complete to fully satisfy AC-4

# Technical Design

## Current State

- **Backend**: Fresh Laravel 12 scaffold. `Controller.php` is empty. No API routes. No response patterns.
- **Frontend**: Axios client at `web/src/config/axios.ts` reads raw `response.data.message` from errors. No typed API layer.

## Standard Definition

### Backend: `ApiResponse` trait

Located at `backend/app/Http/Controllers/ApiResponse.php`. Three methods:

- `success($data, $message, $status)` — wraps data with `success: true`
- `error($message, $errors, $status)` — wraps errors with `success: false`
- `paginated($paginator, $message)` — wraps paginated data with `meta` object

### Frontend: TypeScript types

Located at `web/src/types/api.ts`. Three interfaces:

- `ApiResponse<T>` — generic success envelope
- `ApiErrorResponse` — error envelope with optional field-level errors
- `PaginatedResponse<T>` — paginated success with `meta` object

### Enforcement

- Trait usage enforced by code review (PHPStan rule noted as follow-up)
- TypeScript strict mode catches shape mismatches at compile time

## Files Created

- `docs/specs/_root/0001-api-response-envelope.md` — the spec (Status: Accepted)

## Files to be Created (during /develop)

- `backend/app/Http/Controllers/ApiResponse.php` — the trait ✓
- `web/src/types/api.ts` — TypeScript interfaces ✓
- Updates to `web/src/config/axios.ts` — interceptor unwrapping ✓
