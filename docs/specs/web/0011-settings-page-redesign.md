# 0011. Settings page redesign

**Date**: 2026-11-26
**Status**: Accepted

## Summary

Refresh the Calendar, Timer, and Themes settings screens so they feel clear and consistent with the rest of Elixer Focus. Keep the existing sections, controls, routes, and behavior. On mobile, use the same partial drawer pattern as the regular navigation, with only the three settings destinations.

## Context

The web settings area has three destinations: Calendar, Timer, and Themes. The desktop sidebar shows their links, but the mobile header hides those links. Each screen already has working controls and established behavior, including sleep schedule settings within Calendar, saved timer preferences, and theme search and selection.

The project design system describes a calm, focused workspace with clear hierarchy, restrained accent color, theme driven surfaces, and responsive layouts. The settings behavior is defined in specs [0006](0006-focus-sessions-before-long-break.md), [0007](0007-calendar-planner/index.md), and [0008](0008-sleep-schedule/index.md). The mobile drawer interaction is defined in spec [0010](0010-mobile-navigation-redesign.md). This redesign should preserve those contracts.

## Requirements

**User stories**:

- As a person using Elixer Focus, I want the settings screens to feel clear and consistent so I can find and use my preferences comfortably.
- As a mobile user, I want to move between Calendar, Timer, and Themes settings without losing access to the page content.

**Acceptance criteria**:

- **AC-1**: Calendar, Timer, and Themes keep their current routes, sections, controls, and order. The redesign does not change validation, saving, persistence, theme selection, sleep schedule behavior, timer behavior, or feedback described by the existing settings specs.
- **AC-2**: The shared settings layout and all three screens follow `docs/design.md`: clear visual hierarchy, restrained theme accent use, legible theme driven surfaces, and consistent spacing and section treatment. Color is not the only way to distinguish a selected control or active destination.
- **AC-3**: On mobile, the settings header includes a navigation control that opens the same partial left drawer pattern as spec [0010](0010-mobile-navigation-redesign.md). The drawer starts below the existing `5rem` header, uses `min(18rem, 68vw)` width, stays out of document flow, does not move the page, and has no dimming layer. It contains Calendar (`/settings/calendar`), Timer (`/settings/timer`), and Themes (`/settings/themes`) in the same order as the desktop settings sidebar. The active destination is identified, and selecting a link navigates and closes the drawer.
- **AC-4**: The mobile settings drawer exposes its expanded state and controlled navigation landmark to assistive technology. Keyboard users can reach and activate every link with visible focus. Escape and an outside pointer action close the drawer, Escape returns focus to its trigger, and the drawer motion is removed when reduced motion is requested. The drawer is hidden at the existing desktop breakpoint.
- **AC-5**: Calendar, Timer, and Themes remain usable across supported mobile and desktop widths. Their existing controls and content fit the available layout without unintended horizontal page overflow.

## Options considered

### Option 1: Polish the existing settings area in place

Improve the current settings shell and screens while keeping their routes, content groups, and behavior. Add mobile settings navigation using the established partial drawer pattern.

**Pros**:

- Preserves established settings behavior and the three existing routes.
- Uses the project design system and the already accepted drawer pattern.
- Keeps the change focused on presentation and mobile access.

**Cons**:

- Existing screen structure limits how much the redesign can simplify the settings experience.
- The mobile drawer still covers part of the page while open.

### Option 2: Build a replacement settings shell alongside the current one

Create a separate settings layout and move each existing settings screen into it after checking the new presentation.

**Pros**:

- Allows the new layout to be developed without immediately changing the current shell.
- Offers a staged route for a broad settings overhaul.

**Cons**:

- Requires two settings shells and navigation patterns during the transition.
- Adds migration and testing work without a behavior change that needs gradual rollout.

### Option 3: Replace the settings routes with one consolidated screen

Combine Calendar, Timer, and Themes into a single settings page with sections instead of separate destinations.

**Pros**:

- Puts every setting in one place.
- Removes the need to navigate between settings sections.

**Cons**:

- Changes the current information structure and page length despite the request to polish the existing screens.
- Increases the chance of regressions across unrelated settings behavior.

## Decision

**Chosen option**: Option 1: Polish the existing settings area in place

Keep the current routes and screen content, improve their presentation using the existing design system, and give mobile users a partial drawer containing only the three settings destinations.

## Rationale

The three settings screens already have separate, working responsibilities and their behavior is specified in the Calendar, Sleep Schedule, and timer settings contracts. The stated goal is visual polish, not a change to the settings model or the way people use each control. Improving the existing screens keeps that scope small and preserves the current routes and saved data.

The regular mobile navbar already has an accepted partial drawer pattern that keeps the page in place and leaves part of it visible. Reusing its layout and interaction for the three settings links addresses the missing mobile navigation without adding a new pattern or including unrelated app destinations.

## Feature design

**Data model sketch**:

No new data model, persisted field, or migration is needed. Calendar, Timer, Sleep Schedule, and theme values continue to use their existing stores and coordinators as defined in specs 0006, 0007, and 0008.

**State transitions**:

| State | Event | Result |
| --- | --- | --- |
| Drawer closed | Activate the settings navigation trigger | Open the partial drawer without moving the page. |
| Drawer open | Activate the trigger, press Escape, or use an outside pointer action | Close the drawer. Escape returns focus to the trigger. |
| Drawer open | Activate Calendar, Timer, or Themes | Navigate to the selected settings route and close the drawer. |

Settings control state transitions remain unchanged and continue to follow their existing feature specifications.

**API surface**:

There are no HTTP endpoints. The settings area uses existing local state, coordinators, and React Router routes.

| Local surface | Inputs | Outputs | Access | Key errors |
| --- | --- | --- | --- | --- |
| Settings navigation | Trigger activation, current route, selected settings link | Drawer open state, active destination, and selected route | Current browser session | Existing route handling |
| Calendar settings | Current week start and existing Sleep Schedule controls | Existing saved preferences and Sleep Schedule state | Current browser profile | Existing validation and storage feedback in specs 0007 and 0008 |
| Timer settings | Existing duration, cycle, and overrun controls | Existing timer preferences and coordinator updates | Current browser profile | Existing validation and storage feedback in specs 0005 and 0006 |
| Theme settings | Search text and selected theme | Filtered theme choices and saved active theme | Current browser profile | Existing empty search result behavior |

**Value sourcing**:

| Action | Value produced or displayed | Source |
| --- | --- | --- |
| Render settings destinations | Labels, routes, icons, and order | `settingsLinks` in the settings sidebar constants |
| Identify active destination | Current settings route | React Router active link state |
| Render drawer open state | Whether the settings drawer is open | Existing transient `navbarIsOpen` state in `navbar-store`, as specified in spec 0010 |
| Render drawer position and size | Header height and drawer width | `--navbar-height` and the drawer dimensions in spec 0010 |
| Render Calendar settings | Week start and Sleep Schedule values | Existing Calendar and Sleep Schedule stores and specs 0007 and 0008 |
| Render Timer settings | Durations, session count, and overrun preference | Existing timer settings and session stores, as specified in 0005 and 0006 |
| Render theme choices | Theme names and preview colors | `allThemes` and the active theme store |
| Render visual surfaces | Theme colors, cards, focus treatment, and spacing | `docs/design.md` and the existing shared UI components |

**Key invariants**:

- The three settings routes and their content groups stay unchanged.
- Existing setting values, validation, persistence, and coordinator behavior remain authoritative.
- The settings drawer contains only the three settings destinations and follows the interaction contract in spec 0010.
- Desktop settings navigation remains a sidebar; the redesign does not replace the main app navigation.
- All settings surfaces use the active theme and existing shared components where they fit.
- No new dependency, asset, server API, or configuration is introduced.

**Security model**:

This is a presentation change. It adds no data access or permissions. Settings remain local to the current browser profile under the existing feature contracts.

**Configuration required**:

None.

**Critical test scenarios**:

- Open the mobile settings drawer, confirm its three links and order, navigate between all three routes, and verify active state and drawer dismissal. Verify page position, trigger state, keyboard focus, outside dismissal, Escape focus return, reduced motion, and desktop hiding. Verifies **AC-3** and **AC-4**.
- Render Calendar and confirm the week start and Sleep Schedule controls remain available and their existing save, validation, recovery, and error behavior is unchanged. Verifies **AC-1** and **AC-5**.
- Edit Timer settings, exercise validation and reset, save a valid change, and confirm the existing timer state and coordinator behavior remain unchanged. Verifies **AC-1** and **AC-5**.
- Search and select themes, confirm the selected theme remains applied and persisted, and confirm no results are still communicated when a search has no matches. Verifies **AC-1** and **AC-5**.
- Check the shared shell and all three screens at supported narrow and wide viewport sizes, across available themes, and confirm readable hierarchy, visible focus, and no unintended horizontal page overflow. Verifies **AC-2** and **AC-5**.

## Build plan

Follow the Skateboard approach by first making all settings destinations reachable in the existing responsive shell, then polishing each screen without changing its controls or saved behavior.

1. Add the mobile settings trigger and partial drawer using the established navigation pattern, the three `settingsLinks`, and the required accessible open and close behavior. Keep the desktop sidebar. Satisfies **AC-3** and **AC-4**.
2. Refine the shared settings shell and Calendar screen presentation while preserving the existing week start and Sleep Schedule sections and behavior. Satisfies **AC-1**, **AC-2**, and **AC-5**.
3. Refine the Timer screen presentation while preserving its existing controls, validation, save, reset, and coordinator behavior. Satisfies **AC-1**, **AC-2**, and **AC-5**.
4. Refine the Themes screen presentation while preserving search, theme previews, selection, and persistence. Satisfies **AC-1**, **AC-2**, and **AC-5**.
5. Add or update focused settings navigation and presentation tests, then run existing settings tests to confirm established behavior remains intact. Satisfies **AC-1** through **AC-5**.

## Consequences

**Positive**:

- The settings screens will share a clearer visual treatment without changing what their controls do.
- Mobile users will have direct access to every settings destination.
- The implementation reuses the established design system and navigation behavior.

**Negative / tradeoffs**:

- The partial drawer still covers some page content while open.
- Keeping the existing groups and order means this work will not consolidate or shorten the settings screens.

**Neutral**:

- Existing stores, coordinators, routes, and saved settings remain the source of truth.
- No data migration or server change is needed.

## Follow-up

None.