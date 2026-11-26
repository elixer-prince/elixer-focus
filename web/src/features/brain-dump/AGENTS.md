# Brain dump Feature Guidance

Brain dump behavior is governed by `docs/specs/web/0009-brain-dump-inbox/index.md`.

The route is `web/src/app/routes/(root)/Bin.tsx`, and the page composition is in `components/BrainDumpPage.tsx`. Keep capture and thought editing in the feature components, and use the shared UI primitives for buttons, inputs, and the delete modal.

Persist thoughts through the versioned Zustand store in `stores/brain-dump-store.ts`. Route every write through `dispatchBrainDumpCommand()` in `services/brain-dump-coordinator.ts`; the coordinator validates stored data and persists before updating state or broadcasting. Preserve drafts and the original stored value when reads or writes fail.

Keep search and edit drafts in page state. New thoughts use trimmed plain text, retain internal whitespace, and remain ordered by `createdAt`; edits do not change creation order. Keep the desktop and mobile page links sourced from the shared ordered link definition.

The coordinator starts in both app layouts. Component and coordinator tests live in `__tests__/`. Run focused tests from the repository root with `npm --prefix web run test -- --run <test-file>`.

_Drafted by /sync from the introducing change, worth a quick human pass._
