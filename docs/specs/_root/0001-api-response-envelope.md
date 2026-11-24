# 0001. Standardize API Response Envelope

**Date**: 2026-11-23
**Status**: Accepted

## Summary

Every API endpoint in this project will return JSON in the same predictable shape. The backend wraps all responses in a consistent envelope with `success`, `data`, and `message` fields. The frontend defines matching TypeScript types so every API call is fully typed. This eliminates guesswork about what a response looks like and makes error handling uniform across the app.

## Context

The backend is a fresh Laravel 12 scaffold with no API routes yet. The web app has an Axios client in `web/src/config/axios.ts` that reads raw `response.data.message` from error responses, but there is no typed API layer and no guarantee the backend will produce consistent shapes. Once the API foundation, auth API, and task sync API features start building endpoints, each controller could return JSON in a different structure. Without a standard, the frontend would need to handle multiple response shapes, error formats would be inconsistent, and pagination would vary by endpoint. This spec defines the one right way before any API endpoint is written.

## Requirements

**User stories**:

- As a backend developer, I want a consistent response helper so I do not need to decide how to shape JSON on each new endpoint.
- As a frontend developer, I want typed API responses so TypeScript catches shape mismatches at compile time.
- As a maintainer, I want all endpoints to behave the same so error handling and loading states are uniform across the app.

**Acceptance criteria** (the contract):

- **AC-1**: Every successful API response includes `success: true`, a `data` field (object or array), and a `message` string.
- **AC-2**: Every error response includes `success: false`, an `errors` object (for validation errors) or a `message` string, and an appropriate HTTP status code.
- **AC-3**: List endpoints include pagination metadata in a `meta` object with `page`, `per_page`, `total`, and `last_page` fields.
- **AC-4**: The frontend Axios interceptor extracts the envelope automatically so calling code receives the `data` payload directly on success.
- **AC-5**: TypeScript types on the frontend mirror the envelope structure, providing full type safety for any endpoint.

## Options considered

### Option 1: Standardized JSON envelope with backend helper and frontend types

Every response wraps in a consistent structure. The backend provides a trait or macro for controllers to use. The frontend defines generic TypeScript interfaces and updates the Axios interceptor to unwrap success responses.

**Pros**:

- Frontend never guesses response shape. Full type safety with generics.
- Error handling becomes uniform. One pattern for all endpoints.
- Easy to add fields later (rate limit info, request ID) without breaking clients.

**Cons**:

- Slightly more verbose than raw responses. Each response wraps data instead of returning it directly.
- Requires discipline to use the helper on every new endpoint.

### Option 2: Raw responses with frontend typing only

The backend returns whatever each endpoint naturally produces. The frontend adds TypeScript types per endpoint to document expected shapes.

**Pros**:

- No backend changes needed. Endpoints return data directly.
- Simpler for quick prototyping.

**Cons**:

- No guarantee the backend actually produces the typed shape. Types become documentation, not enforcement.
- Error formats vary wildly. Validation errors, server errors, and 404s all look different.
- Frontend must handle multiple error shapes in the interceptor. Fragile.

### Option 3: Laravel API Resources only

Use Laravel API Resource classes to shape responses on the backend. No frontend envelope types.

**Pros**:

- Laravel native pattern. API Resources are well documented and integrate with transformers.
- Shapes data consistently on the backend side.

**Cons**:

- Frontend still has no type safety. TypeScript types would be added ad hoc.
- API Resources alone do not standardize error responses. Validation errors, 422s, and 500s still vary.
- Missing the unified error handling benefit that an envelope provides.

## Decision

**Chosen option**: Option 1: Standardized JSON envelope with backend helper and frontend types

Define a consistent JSON envelope used by all API endpoints, backed by a Laravel trait on the backend and generic TypeScript types on the frontend.

## Rationale

Option 1 is the only approach that gives both sides a contract. The backend helper ensures every controller produces the same shape without remembering to do it manually. The frontend types make the contract enforceable at compile time. Option 2 leaves the backend unconstrained, so frontend types are just hopeful documentation. Option 3 solves half the problem by shaping success responses but leaves errors and the frontend untyped. For a project about to build its first API endpoints, establishing the envelope now is cheap and prevents a messy retrofit later when endpoints already return inconsistent shapes.

## Standard definition

### Backend (Laravel)

**Canonical pattern**: A trait on the base Controller that all API controllers inherit.

```php
<?php

namespace App\Http\Controllers;

trait ApiResponse
{
    protected function success($data = null, string $message = '', int $status = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    protected function error(string $message, array $errors = null, int $status = 400)
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];
        if ($errors) {
            $response['errors'] = $errors;
        }
        return response()->json($response, $status);
    }

    protected function paginated($paginator, string $message = '')
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $paginator->items(),
            'meta' => [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }
}
```

Every API controller uses this trait:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\ApiResponse;

class TaskController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $tasks = \App\Models\Task::paginate(15);
        return $this->paginated($tasks, 'Tasks retrieved');
    }

    public function show($id)
    {
        $task = \App\Models\Task::findOrFail($id);
        return $this->success($task, 'Task retrieved');
    }
}
```

**Replaces**:

- Returning raw `response()->json($data)` from controllers
- Inline `response()->json(['success' => true, ...])` with ad hoc shapes
- Laravel's default validation error format without wrapping

**Enforcement**:

- The `ApiResponse` trait is the only way to return JSON from an API controller. Code review enforces usage. A future lint rule or PHPStan check can flag direct `response()->json()` calls in API controllers.

**Rollout**:

- Enforce immediately for new code. All new API endpoints must use the trait. No existing API endpoints exist to migrate.

**Exceptions**:

- None. All API endpoints use the envelope. File downloads, streaming responses, and non-JSON responses are outside scope.

### Frontend (TypeScript)

**Canonical pattern**: Generic interfaces in a shared types file, consumed by the Axios interceptor.

```typescript
// web/src/types/api.ts

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = unknown> {
  success: true;
  data: T;
  message: string;
  meta: {
    page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}
```

The Axios interceptor unwraps the envelope on success:

```typescript
// web/src/config/axios.ts (updated)

axiosClient.interceptors.response.use(
  (response) => {
    const envelope = response.data;
    if (envelope.success === false) {
      return Promise.reject(new Error(envelope.message));
    }
    return response;
  },
  (error) => {
    // existing error handling
    throw error;
  },
);
```

API service methods use generics for type safety:

```typescript
// Example: web/src/services/tasks.ts

import axiosClient from "@/config/axios";
import type { ApiResponse } from "@/types/api";

export async function getTasks(): Promise<ApiResponse<Task[]>> {
  const { data } = await axiosClient.get<ApiResponse<Task[]>>("/tasks");
  return data;
}
```

**Replaces**:

- Reading `response.data` directly without knowing its shape
- Per endpoint ad hoc TypeScript types
- No type safety on API responses

**Enforcement**:

- TypeScript strict mode catches shape mismatches at compile time. The `ApiResponse<T>` generic is the only return type for API service methods.

**Rollout**:

- Enforce immediately for new code. The `web/src/types/api.ts` file is created as part of the API foundation feature. All new API services import from it.

**Exceptions**:

- None for JSON API calls. File downloads, WebSocket messages, and non-REST communication are outside scope.

## Consequences

**Positive**:

- Every endpoint produces predictable JSON. Frontend code is simpler and safer.
- Error handling becomes a single pattern. The Axios interceptor handles one error shape.
- Type safety catches response shape bugs at compile time, not in production.
- Pagination is consistent. Every list endpoint uses the same meta structure.

**Negative / tradeoffs**:

- Responses are slightly larger due to the envelope wrapper. Negligible for JSON APIs but measurable bandwidth overhead.
- Controllers must use the trait explicitly. A new developer might forget and return raw JSON, breaking the contract until caught by review.
- The envelope adds a layer of indirection. Debugging a raw API response requires understanding the wrapper.

**Neutral**:

- Existing Axios error interceptor in `web/src/config/axios.ts` already reads `error.response.data.message`, which aligns with the envelope. The interceptor will need a small update to handle the success envelope unwrapping.
- Laravel validation errors (422 responses) will be wrapped in the envelope's `errors` field, preserving Laravel's native field-level error format.

## Follow-up

- [x] Create the `ApiResponse` trait and `web/src/types/api.ts` as part of the Laravel API foundation feature (scope item 1)
- [x] Update the Axios interceptor in `web/src/config/axios.ts` to unwrap the success envelope
- [ ] Consider a PHPStan or Laravel Pint rule to flag direct `response()->json()` calls in API controllers

