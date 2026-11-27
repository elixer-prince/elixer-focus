# 0010. Mobile navigation redesign

**Date**: 2026-11-26
**Status**: Accepted

## Summary

The mobile menu will become a side drawer that slides over part of the page, rather than expanding across the whole screen. The page will not move when the drawer opens, and the top bar will keep its current five rem height. All current page links will remain in the same order as desktop navigation.

## Context

The web app has a fixed top bar and a separate desktop sidebar. On mobile, opening the hamburger currently expands the navigation to the full screen, hiding the page underneath. This makes it hard to keep your place while choosing another page.

The mobile page links were brought into line with desktop navigation in spec 0009, and spec 0012 later set the canonical personal URLs. This feature is scoped separately as web scope feature 48. It changes the mobile navigation presentation only; route definitions and shared link destinations follow those specs. The link order, desktop sidebar, settings link, and music player are outside this change.

## Requirements

**User stories**:

- As a mobile user, I want to see part of my current page while navigation is open so I can keep my place.
- As a user, I want the same pages in the same order on mobile and desktop so navigation stays familiar.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

- **AC-1**: On mobile, the hamburger opens a fixed side drawer that slides in from the left over part of the page. The drawer is out of the document flow, the page does not shift, the drawer does not cover the full screen, and no dark overlay obscures the visible page area.
- **AC-2**: The top bar remains `5rem` tall while the drawer is open. The drawer begins below the top bar, extends to the bottom of the viewport, and uses a responsive width of `min(18rem, 68vw)`, leaving part of the page visible beside it.
- **AC-3**: The drawer shows the same page links, labels, destinations, and order as desktop navigation: Home (`/`), Journal (`/my/journal`), Brain dump (`/my/brain-dump`), Calendar (`/my/calendar`), Tasks (`/my/tasks`), and Profile (`/my/profile`). The active page is visibly identified. Selecting a link navigates to its route and closes the drawer.
- **AC-4**: The hamburger exposes its expanded state and the drawer it controls to assistive technology. Escape and a click outside close the drawer, with focus returned to the hamburger when Escape closes it. Keyboard users can reach and activate every link, focus is visible, and the drawer motion is reduced or removed when the user requests reduced motion.
- **AC-5**: The drawer uses the current theme and design system. This presentation change leaves route definitions, the desktop sidebar, settings link, and music player unchanged. It uses the canonical page destinations in AC-3 and is not shown at the existing desktop breakpoint.

## Options considered

### Option 1: Keep the full screen expansion

Keep the current mobile menu and its expanded full screen layout.

**Pros**:

- Keeps the current implementation and needs little change.
- Gives the links ample room.

**Cons**:

- Hides the page while navigation is open, which is the problem this feature addresses.

### Option 2: Partial side drawer

Show the links in a fixed width panel that slides in from the left, above the page and below the top bar. The panel does not change the page layout.

**Pros**:

- Keeps the current page position and leaves part of the page visible.
- Reuses the existing page links and open state.

**Cons**:

- The drawer covers some page content and reduces the visible page width while open.
- The drawer width needs to balance readable links with visible page area.

### Option 3: In flow menu

Expand the navigation below the top bar and move the page content down while it is open.

**Pros**:

- Does not cover page content.
- Keeps all links in a familiar vertical list.

**Cons**:

- Changes the page position when opened, contrary to the requested interaction.

## Decision

**Chosen option**: Option 2: Partial side drawer

Use a left side drawer positioned outside normal page flow, with `position: fixed`, `top: var(--navbar-height)`, and `bottom: 0`. Its width is `min(18rem, 68vw)`, with vertical scrolling if the links do not fit. Do not add a dimming overlay or move the page. Use the existing navigation links, state, and theme system.

**Implementation skills**: `web-design-guidelines` (`vercel-labs/agent-skills`, `.agents/skills/web-design-guidelines/`) · `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.agents/skills/vercel-react-best-practices/`)

## Rationale

The user wants the page to remain visible and in the same position while the menu opens, and confirmed a partial side drawer. An in flow menu would move the page, while the current full screen expansion hides it. A partial width drawer is the smallest change that keeps the selected interaction, existing route links, and desktop behavior intact. The width is an implementation recommendation that leaves visible page area while keeping room for link labels.

## Feature design

**Data model sketch**:

There is no new data model. The open state remains the existing transient `navbarIsOpen` boolean in the Zustand store. No saved state, route, or persisted data changes are needed.

**State transitions**:

| Current state | Event | Result |
| --- | --- | --- |
| Closed | Activate hamburger | Drawer slides in; page position and top bar height stay unchanged. |
| Open | Activate hamburger, press Escape, or click outside | Drawer closes; page position stays unchanged. |
| Open | Activate a page link | The route changes and the drawer closes. |

**API surface**:

There are no HTTP endpoints. The navigation uses the existing local state and React Router links.

| Local surface | Inputs | Result | Auth | Errors |
| --- | --- | --- | --- | --- |
| Toggle navigation | Hamburger activation | Updates `navbarIsOpen` | None | None |
| Close navigation | Escape or click outside | Sets `navbarIsOpen` to false | None | None |
| Open page | Existing link destination | Navigates to the selected route and closes the drawer | Existing app access rules | Existing route handling |

**Value sourcing**:

| Action | Value produced or displayed | Source |
| --- | --- | --- |
| Render page links | Link labels, routes, icons, and order | `defaultLinks`, shared by desktop and mobile navigation |
| Render open or closed state | Whether the drawer is shown | Existing `navbarIsOpen` Zustand state |
| Keep header height | Top bar height of `5rem` | Existing `--navbar-height` CSS custom property |
| Highlight current page | Active route | React Router `NavLink` state |
| Show the mobile drawer | Mobile breakpoint | Existing Tailwind `md` breakpoint |
| Reduce drawer motion | Motion preference | Browser `prefers-reduced-motion` setting |
| Style the drawer | Theme colors, surface, border, and active link treatment | `docs/design.md` and existing navigation styles |

**Key invariants**:

- Opening or closing the drawer never changes the page position or document flow.
- The top bar stays `5rem` tall and the drawer stays below it.
- Mobile and desktop use the same six page links in the same order.
- The drawer does not dim or cover the full page. It is a nonmodal navigation panel, so it does not trap focus or block the visible page area.
- The hamburger uses `aria-expanded` and `aria-controls`; the drawer is a labelled navigation landmark with semantic links.
- Route definitions and desktop navigation behavior are outside this presentation change. The drawer uses the canonical destinations in AC-3 from the shared `defaultLinks` definition.
- The drawer motion uses transform or opacity, not a transition of all properties, and honors reduced motion.

**Security model**:

This is a presentation change only. It adds no data access, permissions, requests, or authentication behavior.

**Critical test scenarios** (each maps to an acceptance criterion in Requirements):

- Open the drawer at mobile width and confirm it overlays only part of the page, the page position is unchanged, and the top bar remains `5rem` tall; verifies **AC-1** and **AC-2**.
- Confirm mobile link labels, routes, and order match `defaultLinks`, active route styling is visible, and selecting a link navigates and closes the drawer; verifies **AC-3**.
- Open and close the drawer using the hamburger, Escape, and an outside click. Confirm the button reports its expanded state and keyboard focus remains visible; verifies **AC-4**.
- Enable reduced motion and confirm the drawer does not slide. Confirm the drawer is hidden at desktop width and the desktop sidebar and other header controls are unchanged; verifies **AC-4** and **AC-5**.

## Build plan

Follow the Skateboard approach by first shipping the smallest usable whole: the mobile drawer with unchanged routes and no page shift, then its accessible interaction and responsive behavior.

- [x] Replace the full screen mobile expansion with the partial width drawer below the fixed top bar. Reuse `defaultLinks` and `navbarIsOpen`; preserve the desktop sidebar. Satisfies **AC-1**, **AC-2**, and **AC-3**.
- [x] Add drawer close behavior, active route styling, visible keyboard focus, and reduced motion support. Update focused navigation tests for mobile and desktop behavior. Satisfies **AC-3**, **AC-4**, and **AC-5**.

## Consequences

**Positive**:

- You can keep part of the current page in view while selecting a destination.
- The page does not jump when the drawer opens or closes.
- Mobile and desktop continue to share the same page links and order.
- No new library, route, or persisted state is added.

**Negative / tradeoffs**:

- The drawer still covers part of the page, and the visible page area is narrower while it is open.
- A fixed width that works for link labels may leave less page area visible on a narrow phone.

**Neutral**:

- The desktop sidebar remains unchanged; only the mobile navigation presentation is redesigned.