# Shared TypeScript package

## Overview

This private workspace package provides portable task, Subtask, timer settings, and utility logic for the web and Expo apps. Keep platform APIs and app specific behavior in the consuming workspaces.

## Key files

| File           | Owns                                                        |
| -------------- | ----------------------------------------------------------- |
| `package.json` | Package exports, dependencies, and workspace commands       |
| `src/tasks.ts` | Task and Subtask contracts, stores, and domain utilities    |
| `src/timer.ts` | Timer settings types, defaults, validation, and store slice |
| `src/utils.ts` | Timestamp and duration conversion helpers                   |

## Commands

Run these from the repository root:

```bash
npm run lint:shared
npm run typecheck:shared
npm run test:shared
```

## Conventions

- Import public code through `@elixer-focus/shared/tasks`, `@elixer-focus/shared/timer`, or `@elixer-focus/shared/utils`.
- Keep shared code free of React UI, browser APIs, Expo APIs, local storage, and app coordinators.
- Let consuming apps supply ID and timestamp providers, and keep persistence and coordination in their adapters.
- Keep shared Task, Subtask, and timer settings behavior in this package rather than redeclaring it in an app.

## Related spec

- [Shared code package](../../docs/specs/_root/0002-shared-code-package.md)

_Drafted by /sync from the introducing change, worth a quick human pass._
