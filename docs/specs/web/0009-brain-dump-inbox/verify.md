# Verify: Brain dump inbox · spec 0009 · updated 2026-11-26

_Steps derived from spec 0009 acceptance criteria and value sourcing. `/check verify` runs these; `/test` can lock the durable steps._

## UI / manual

- [ ] Open `/my/brain-dump` at mobile and desktop widths. Confirm the page title, exact helper text, capture form, loading state, and short empty guidance. → AC-1
- [ ] Compare desktop and mobile navigation. Confirm the six links have the same order and routes, and Journal and Calendar still open at `/journal` and `/calendar`. → AC-2
- [ ] Add two thoughts and reload. Confirm both persist in version `1` under `brain-dump-storage`, each has a unique ID, a command ID in `lastMutationId`, timestamps, and `userId: null`. Replay an Add command and confirm it does not duplicate a thought. → AC-3
- [ ] Capture text with leading and trailing spaces, internal spaces, and line breaks. Confirm only edge whitespace is trimmed, duplicate bodies are allowed, whitespace only text is rejected, and there is no length limit. Confirm successful Add clears and refocuses capture, clears search, and places the thought first. → AC-4
- [ ] Confirm full thought text, relative creation time, and descending creation order. Edit a thought and confirm its `createdAt` and list position do not change. → AC-5
- [ ] Search with mixed case and spaces around the query. Confirm substring matching, unchanged result order, a no results message with Clear search, and hidden search when there are no saved thoughts. → AC-6
- [ ] Edit a thought. Confirm autosave after one second and on blur, blank validation remains associated with the editor, and the active search applies again after editing ends. Confirm successful edits update `updatedAt` without changing `createdAt`. → AC-7
- [ ] Open Delete and confirm the modal previews the saved text. Cancel and confirm the thought remains, then confirm deletion and verify it is permanently removed. → AC-8
- [ ] In two tabs, create, edit, and delete thoughts. Replay commands, test an older timestamp and an equal timestamp tie, and confirm the latest accepted command wins without merging text. Close one tab during a pending write and confirm retry safety and persistence before broadcast. → AC-9
- [ ] Delete a thought in one tab while its draft is open in another. Confirm the draft remains and can be saved as a new thought with a fresh ID or discarded. → AC-10
- [ ] Make the `brain-dump-storage` read or parse fail. Confirm the page shows an error rather than an empty inbox, blocks writes, preserves the stored value, and retries that same value. → AC-11
- [ ] Make local storage writes fail during Add, Edit, and Delete. Confirm the saved state stays unchanged, active text remains available, and the app reports the failure. → AC-12
- [ ] Disable Web Locks, then separately disable `BroadcastChannel`. Confirm the persistent single tab notice appears and capture still works in that tab. → AC-13
- [ ] Use the page by keyboard. Confirm labels, invalid feedback, edit and delete actions, Clear search, Save as new, Discard, modal dismissal and focus behavior, and live status announcements. → AC-14

## Value sourcing checks

- [ ] Capture text with edge spaces and internal line breaks. Confirm the stored `content` comes from the textarea, trimmed only at its edges. → AC-4
- [ ] Capture a thought and replay its Add command. Confirm its `id` and command ID originate from `crypto.randomUUID()` and replay does not add another thought. → AC-3, AC-9
- [ ] Inspect a newly saved thought. Confirm `createdAt` and initial `updatedAt` come from `getCurrentTimestamp()`, and `lastMutationId` equals its stable create command ID. → AC-3
- [ ] Edit a thought and inspect the saved record. Confirm new `content`, `updatedAt`, and `lastMutationId` come from the inline draft, the timestamp at command creation, and the stable edit command ID. → AC-7, AC-9
- [ ] Keep a malformed `brain-dump-storage` value and select Retry. Confirm the result comes from reading that same value and remains an error rather than an empty list. → AC-11
- [ ] Inspect stored new and recovered thoughts. Confirm `userId` remains `null`. → AC-3, AC-10
- [ ] Add thoughts at different creation times, then edit one. Confirm list order derives from descending `createdAt` only. → AC-5
- [ ] Confirm each thought's time label is derived from `formatRelativeTime(createdAt)`. → AC-5
- [ ] Search for a mixed case substring with edge spaces. Confirm the query comes from local input state and matches lowercase content after trimming query edges. → AC-6
- [ ] Remove either Web Locks or `BroadcastChannel`. Confirm the sync notice reflects the feature coordinator's API availability check. → AC-13
- [ ] Open `/my/brain-dump` from desktop and mobile navigation. Confirm both use the same route and ordered page link definition. → AC-1, AC-2
- [ ] Open Delete for long text. Confirm the preview comes from the selected thought's saved content and is shortened when needed. → AC-8

## Commands

- [ ] `npm --prefix web run test -- --run src/features/brain-dump/__tests__/services/brain-dump-coordinator.test.ts src/features/brain-dump/__tests__/components/BrainDumpPage.test.tsx src/features/ui/navigation/__tests__/page-links.test.tsx src/app/__tests__/router.test.ts` → all focused feature and route tests pass.
- [ ] `npm run typecheck:web` → TypeScript check passes.
- [ ] `npm run lint:web` → web lint passes.
- [ ] `npm --prefix web run build` → web production build completes.

## Acceptance-criteria coverage

AC-1 is covered by UI step 1 and value step 11. AC-2 is covered by UI step 2 and value step 11. AC-3 is covered by UI step 3 and value steps 2, 3, and 6. AC-4 is covered by UI step 4 and value step 1. AC-5 is covered by UI step 5 and value steps 7 and 8. AC-6 is covered by UI step 6 and value step 9. AC-7 is covered by UI step 7 and value step 4. AC-8 is covered by UI step 8 and value step 12. AC-9 is covered by UI step 9 and value steps 2 and 4. AC-10 is covered by UI step 10 and value step 6. AC-11 is covered by UI step 11 and value step 5. AC-12 is covered by UI step 12. AC-13 is covered by UI step 13 and value step 10. AC-14 is covered by UI step 14.