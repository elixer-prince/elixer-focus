# 0012. Personal URL structure

**Date**: 2026-11-26
**Status**: Accepted

## Summary

Give your personal productivity pages a stable `/my/` route group while keeping the timer dashboard at `/`. The new paths make room for future social pages without changing how the existing pages work. Old page paths redirect to their new destinations, while public pages for other users remain future work.

## Context

The web app uses React Router, its existing browser navigation library, under a shared default layout. Profile, Journal, Calendar, and Tasks currently use top level paths. Brain dump already lives at `/my/brain-dump`. Desktop and mobile navigation share one ordered list of page links.

The web scope calls for a consistent personal route group and requires existing URL behavior to be defined. The app is in alpha, and the timer is still the main home page. Future social sections such as Feed, Reels, and Discover are planned, but user identity and public page access are not part of this route change.

## Requirements

**User stories**:

- As a user, I want my productivity pages under a predictable `/my/` route group so I can distinguish them from future social sections.
- As a user, I want old page paths to continue taking me to the right page while the new paths become canonical.
- As a user, I want the timer dashboard to remain the home page until social features are available.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

- **AC-1**: The default app layout renders the existing Profile, Journal, Brain dump, Calendar, and Tasks pages at `/my/profile`, `/my/journal`, `/my/brain-dump`, `/my/calendar`, and `/my/tasks`, respectively. Page content and existing data behavior do not change.
- **AC-2**: Visiting `/profile`, `/journal`, `/calendar`, or `/tasks` triggers a client side React Router redirect to the matching canonical `/my/` path and replaces the current history entry. `/my/brain-dump` remains unchanged.
- **AC-3**: Visiting `/my` triggers a client side React Router redirect to `/my/profile` and replaces the current history entry. No new overview page is added.
- **AC-4**: Desktop and mobile navigation keep their existing labels and order, Home, Journal, Brain dump, Calendar, Tasks, Profile, and link to `/`, `/my/journal`, `/my/brain-dump`, `/my/calendar`, `/my/tasks`, and `/my/profile`, respectively.
- **AC-5**: The timer dashboard remains at `/`.
- **AC-6**: Existing authentication and settings routes remain unchanged.
- **AC-7**: An unknown child path under `/my/` uses the existing not found behavior.
- **AC-8**: Directly opening or refreshing any canonical `/my/` page path renders the matching existing page.
- **AC-9**: This change does not add `/:username/...` routes or expose any page to other users.

## Options considered

### Option 1: Keep the current mixed paths

Leave Profile, Journal, Calendar, and Tasks at their current top level paths, with Brain dump as the only personal route.

**Pros**:

- No route or navigation changes are needed.
- Existing links keep their current destinations.

**Cons**:

- Personal pages remain split between unrelated path shapes.
- The route structure does not match the planned personal workspace or leave a clear boundary for future social sections.

### Option 2: Keep both path forms as aliases

Add the `/my/` paths but keep old paths rendering the same pages indefinitely.

**Pros**:

- Both path forms work without redirect behavior.
- The change can be introduced alongside current links.

**Cons**:

- Each page has multiple working URLs, making it less clear which path is canonical.
- Future links, tests, and route changes must account for both forms.

### Option 3: Use `/my/` as canonical and redirect old paths

Move the personal pages to `/my/` paths and redirect the former paths to their new destinations.

**Pros**:

- Each page has one canonical path while people who enter an old path still reach the page.
- The app can make the change in one release without a data migration or new service.

**Cons**:

- Redirects add a small amount of route configuration and need coverage in route tests.
- This establishes a personal route convention before the future user identity and public page rules are built.

## Decision

**Chosen option**: Option 3: Use `/my/` as canonical and redirect old paths

Use `/my/` for the current user's productivity workspace, including pages that will not have public user equivalents. Keep the existing page slugs beneath the prefix, use client side React Router redirects for old paths with history replacement, and leave `/` as the timer dashboard. Future user pages may use the same page slug after a username, such as `/:username/profile` and `/:username/calendar`; only Profile and Calendar are planned as possible other user views, and Calendar would be available only when its owner makes it public. Do not add those username routes or public access behavior in this feature.

Keep future social sections such as Feed, Reels, and Discover as their own top level routes. The `/my/` prefix describes the current user's productivity workspace, not a permission rule.

## Rationale

This is a small route change in an existing React Router app, and the scope calls for a consistent personal URL structure. Redirects give old manually entered paths a useful outcome without maintaining duplicate page aliases. Since the app is in alpha and the routes do not change stored data, a direct route migration is simpler than a staged migration.

Keeping `/` as the timer dashboard preserves the current entry point while social sections are not yet available. Deferring username routes also avoids implying that local Profile or Calendar data is already safe or available for other users to view.

## Feature design

**Data model sketch**:

None. This change only changes client side routes and navigation links. It adds no user record, persistence, or data migration.

**API surface**:

There are no HTTP endpoints. The existing React Router configuration resolves these client side paths within the default app layout.

| Path | Result |
|---|---|
| `/my` | Client side React Router redirect to `/my/profile` with history replacement |
| `/my/profile` | Render the existing Profile page |
| `/my/journal` | Render the existing Journal page |
| `/my/brain-dump` | Render the existing Brain dump page |
| `/my/calendar` | Render the existing Calendar page |
| `/my/tasks` | Render the existing Tasks page |
| `/profile` | Client side React Router redirect to `/my/profile` with history replacement |
| `/journal` | Client side React Router redirect to `/my/journal` with history replacement |
| `/calendar` | Client side React Router redirect to `/my/calendar` with history replacement |
| `/tasks` | Client side React Router redirect to `/my/tasks` with history replacement |
| Unknown `/my/` child | Render the existing not found page |

**Value sourcing**:

| Action | Value produced or displayed | Source |
|---|---|---|
| Render a personal page | Page component | Existing route component mapped to the canonical path in `web/src/app/router.tsx` |
| Redirect an old path | Destination path | Fixed path mapping in the router, as listed above |
| Resolve `/my` | Default destination `/my/profile` | This decision |
| Render desktop and mobile links | Labels, order, and canonical destinations | Shared `defaultLinks` in `web/src/features/ui/navigation/Sidebar/Default/constants/links.tsx` |
| Render an unknown personal path | Not found page | Existing router error handling and `web/src/app/routes/404.tsx` |

**Key invariants**:

- `/my/` identifies the current user's productivity workspace. It does not make its pages public or enforce access control.
- The five named personal pages use the canonical paths in the route table. Brain dump keeps its existing path.
- Old paths redirect rather than remain as page aliases. Redirects replace the current history entry.
- `/my` redirects to `/my/profile`; it is not a new overview page.
- `/` remains the timer dashboard. Authentication and settings routes are outside this change.
- Username routes are a future convention only. Profile and Calendar are the selected candidates for other user views; a Calendar view is public only when its owner has made it public. No username route or public data access is implemented here.
- Navigation keeps the same labels and order on desktop and mobile, using the shared link list.

**Security model**:

No authentication or authorization behavior changes. The route prefix is organizational and does not protect data. The current pages keep their existing access behavior. Public Profile or Calendar routes require a separate identity and privacy design before they are implemented; this feature does not expose local data to other users.

**Critical test scenarios** (each maps to an acceptance criterion in Requirements):

- Open each canonical `/my/` path and confirm it renders the existing page under the default layout; verify **AC-1** and **AC-8**.
- Open each old path and confirm it redirects to the corresponding canonical path, replacing the current history entry; verify **AC-2**.
- Open `/my` and confirm it redirects to `/my/profile` without rendering an overview page; verify **AC-3**.
- Compare desktop and mobile navigation labels, order, and destinations; verify **AC-4**.
- Confirm `/` still renders the timer dashboard; verify **AC-5**.
- Confirm authentication and settings routes still resolve; verify **AC-6**.
- Visit an unknown `/my/` child and confirm the existing not found page appears; verify **AC-7**.
- Directly open and refresh each canonical path and confirm its page renders; verify **AC-8**.
- Confirm no username route or public data access was added; verify **AC-9**.

## Build plan

Follow the Skateboard approach by first making the complete personal route set usable with compatibility redirects, then point the shared navigation at the canonical paths.

1. [x] Add the `/my/` route group, map the existing page components to the canonical paths, add the `/my` and old path redirects, and cover route resolution, history replacement, root behavior, existing route groups, direct access, and not found behavior. Satisfies **AC-1**, **AC-2**, **AC-3**, **AC-5**, **AC-6**, **AC-7**, **AC-8**, and **AC-9**.
2. [x] Update the shared desktop and mobile navigation destinations while preserving labels and order, then update the focused navigation tests. Satisfies **AC-4**.

## Consequences

**Positive**:

- Personal productivity pages have a consistent URL group.
- Old manually entered paths continue to reach the right page.
- The URL structure leaves room for future social routes without adding public access prematurely.

**Negative / tradeoffs**:

- The `/my/` prefix applies to private pages as well as pages that may later have public counterparts, so the prefix alone cannot communicate visibility.
- Future username routes need separate identity, privacy, and authorization decisions.

**Neutral**:

- No stored data, API, third party service, or environment configuration changes.
- The existing route tests and shared navigation tests need updated expectations.

## Follow-up

- [ ] Design identity, access rules, and public visibility before adding `/:username/profile` or `/:username/calendar` routes.
- [ ] Revisit the `/` home route after Feed, Discover, or other social sections are available.