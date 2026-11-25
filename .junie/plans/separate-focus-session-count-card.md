---
sessionId: session-261124-223655-1ji9
---

# Requirements

### Goal

Put the focus session count input in its own card, separate from the Focus duration card, so the duration cards no longer have an uneven content height.

### Acceptance criteria

- Update AC-1 in `docs/specs/web/0006-focus-sessions-before-long-break.md` to require a dedicated card for the count input. Keep the whole number range of 1 through 8 and the saved default of 4.
- Preserve the shared Save and Reset behavior, validation, persistence, coordinator updates, and timer cycle behavior in AC-2 through AC-8.
- Keep the existing top alignment of duration card content.

# Technical Design

### Current implementation

- `docs/specs/web/0006-focus-sessions-before-long-break.md` is Accepted and AC-1 currently places the count input in the Focus card.
- `web/src/features/settings/timer/Index.tsx` renders a three card duration grid. `FocusContainer.tsx` currently renders both the Focus duration and count inputs.
- The current scope entry for feature 46 is marked done, although the requested separate card is not implemented.
- Local edits already add `justify-start` to the duration card bodies and test that alignment. Preserve those edits.

### Proposed changes

- Update AC-1 and align the Summary, Decision, Value sourcing, critical test scenario, and Build plan references in the existing spec so they all describe the separate count card.
- Update the linked feature 46 scope entry to track the revised UI work and mark it in progress until the new requirement is implemented.
- In `Index.tsx`, add a dedicated count card to the responsive timer settings grid. Keep `FocusContainer.tsx` focused on duration and move the count input into a small container following the existing `ShortBreakContainer.tsx` pattern, using the shared `Input`, settings context, and validation hook.
- Leave the persisted session store, save and reset flow, and timer coordinator behavior unchanged.

# Testing

### Validation approach

- Update `web/src/features/settings/timer/__tests__/components/TimerSettings.test.tsx` to assert that the count control is rendered in its own card, outside the Focus duration card, and that card contents remain top aligned.
- Run the focused timer settings tests to confirm the layout change preserves existing save, reset, and validation behavior.
- Check the revised acceptance criterion and its supporting spec sections for consistent card placement and unchanged count constraints.

# Delivery Steps

### ✓ Step 1: Revise the timer cycle contract and scope entry

The written requirement and linked scope item describe the count input as a separate card and track the remaining implementation work.

- Update AC-1 in `docs/specs/web/0006-focus-sessions-before-long-break.md` to require a dedicated count card while retaining its current input range and default.
- Align the Summary, Decision, Value sourcing, critical test scenario, and Build plan wording with the revised placement.
- Update feature 46 in `docs/scope/web/scope.md` to reflect the revised card requirement and mark it in progress until implemented.

### ✓ Step 2: Separate the count control into its own settings card

Timer Settings displays the count input in a dedicated card without changing its saved behavior or timer scheduling.

- Add a count card to the responsive grid in `web/src/features/settings/timer/Index.tsx`.
- Keep `web/src/features/settings/timer/FocusContainer.tsx` for Focus duration and move the count input into a dedicated container that follows the existing settings input pattern.
- Preserve the current top alignment edits and update `web/src/features/settings/timer/__tests__/components/TimerSettings.test.tsx` to verify the count card is separate and the settings tests continue to pass.
