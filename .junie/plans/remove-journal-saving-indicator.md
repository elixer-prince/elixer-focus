---
sessionId: session-261125-192309-1lgo
---

# Requirements

### Overview & Goals

Update the journal contract to remove the visible saving indicator because it shifts the editor while typing and is not useful for longer entries.

### Functional Requirements

- Revise AC-3 in `docs/specs/web/0003-journal.md` so daily entry content still autosaves after one second of inactivity, with no visible draft or saving indicator.
- Keep the existing expectation that no explicit save button is needed.
- Keep this change limited to the spec revision. The editor implementation will be handled in a later `/develop` task.

# Technical Design

### Current Implementation

`docs/specs/web/0003-journal.md` currently requires a draft indicator in AC-3 and build step 4. In `web/src/features/journal/components/DailyEntry/Index.tsx`, `handleMarkdownChange` schedules `saveEntry` after one second and toggles `draftIndicator`; the editor conditionally renders `Saving...`. The co-located test at `web/src/features/journal/components/DailyEntry/__tests__/DailyEntry.test.tsx` does not currently test this behavior.

### Proposed Changes

Update AC-3 and the journal build plan in `docs/specs/web/0003-journal.md` to retain one second debounced autosave while removing the indicator requirement. Align any directly related test scenario wording so it checks autosave without implying a visible status. Do not edit application code or the completed historical checklist in `docs/scope/web/scope.md` as part of this spec-only task.

# Testing

### Validation Approach

- Check that AC-3 requires one second autosave and explicitly excludes a visible saving indicator.
- Check that build plan step 4 preserves the debounce and no longer requires indicator state or UI.
- Check that no remaining requirement in the journal spec contradicts the revised behavior.
- No application tests are run for this documentation-only change; the later implementation should add coverage in `DailyEntry.test.tsx` for absent indicator UI and retained debounced saving.

# Delivery Steps

### ✓ Step 1: Revise the journal autosave contract

The journal acceptance criterion describes autosave without requiring a visible status.

- Edit AC-3 in `docs/specs/web/0003-journal.md` to preserve saving after one second of inactivity and remove the draft indicator requirement.
- Retain the no explicit save button expectation.

### ✓ Step 2: Align the journal build plan and validation wording

The build plan and related test guidance consistently describe autosave without an indicator.

- Revise build plan item 4 in `docs/specs/web/0003-journal.md` to retain the debounce and omit indicator state and UI.
- Review the spec’s critical test scenario wording for contradictions; leave `web/src/features/journal/components/DailyEntry/Index.tsx`, its tests, and the historical `docs/scope/web/scope.md` checklist unchanged for this architect task.

### ✓ Step 3: Remove the editor saving indicator

The editor autosaves without displaying a saving status.

- Remove the saving indicator state and UI while retaining the one second debounced save.
- Update `DailyEntry.test.tsx` to verify debounced saving remains and no saving indicator is rendered.
