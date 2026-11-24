# 0004. Profile page

**Date**: 2026-11-24
**Status**: Accepted

## Summary

The profile page shows the user identity and productivity stats in a social media style layout. It displays an avatar, name, and bio at the top, followed by a stats row, character stat bars, a recent activity feed, achievement badges, and the theme selected in Settings. The user can edit their name and bio, while Settings remains the only place to change the app theme. This lays the foundation for the app's eventual social features, starting with a single user view.

Decision history is preserved in [rationale.md](rationale.md).

## Requirements

**User stories**:

- As a user, I want to see my profile with my name, avatar, and bio so that the page feels personal.
- As a user, I want to see my productivity stats at a glance so that I can track my progress.
- As a user, I want to see achievement badges so that I feel motivated to keep using the app.
- As a user, I want to edit my display name and bio so that I can personalize my profile.
- As a user, I want my selected app theme displayed on my profile so that others can see which theme I use.

**Acceptance criteria** (the contract, each criterion is independently checkable):

- **AC-1**: The profile page renders a header section with a default avatar icon, display name, and bio text.
- **AC-2**: The profile page renders a stats row showing total focus hours, total tasks completed, and current streak. The streak counts consecutive calendar days with focus sessions in the browser's local timezone at calculation time, starting from the most recent local day with a focus session, and is zero when no focus sessions exist.
- **AC-3**: The profile page renders a character stats section with placeholder stat bars (Focus, Discipline, Creativity).
- **AC-4**: The profile page renders a recent activity feed combining completed sessions and completed tasks, ordered newest first by completion time and limited to the five most recent entries.
- **AC-5**: The profile page renders a badges grid with at least two starter badges (First Session, First Task) that unlock based on activity.
- **AC-6**: The user can edit their display name and bio via an edit form on the profile page. The form does not change the app theme.
- **AC-7**: Profile data persists across page reloads via a dedicated Zustand store with persist middleware.
- **AC-8**: The stats row pulls real data from the session history store and task store, not hardcoded values.
- **AC-9**: The profile page displays the current app theme from Settings as read only profile information. Changing the theme remains an action in Settings, and a theme change there updates the profile display.

## Decision

**Chosen option**: Option 1: Social profile layout, single page

Build a single page vertical scroll profile with all sections visible, matching the social media inspiration.

**Activity feed**: Option 1, mixed activity. Set `completedAt` when a task is completed and clear it when reopened.

**Streak day**: Option 1, browser local time at calculation time.

**Profile theme**: Option 1, display the current theme from Settings as read only information. Do not change the active theme from the profile.

**Character bars**: Keep Focus, Discipline, and Creativity as fixed visual placeholders. They do not measure user data until gamification defines their formulas.

## Feature design

**Data model sketch**:

A `Profile` entity stored in a dedicated Zustand store:

- `displayName`: string, required, default "Focus User"
- `bio`: string, required, default ""

The profile store contains identity data only. It has no relationships to other entities. The current theme is read from the existing theme store and its display label from the theme registry. Stats are computed at read time from the session history store and task store, not stored in the profile.

The existing `Task` entity gains an optional `completedAt` timestamp. It is set when a task becomes completed and cleared when the task is reopened. The task store migration retains its existing `updatedAt` backfill for version 1 data, then initializes `completedAt` from `updatedAt` for previously persisted completed tasks, which is the best available approximation of their completion time.

**State transitions**:

Not applicable. The profile has no state machine; it is a simple data object with create and update actions.

**API surface**:

Not applicable at this stage. All data is local via Zustand stores. When auth and the backend API land, the profile store will be replaced or extended with API calls.

**Value sourcing**:

| Action | Value produced or displayed | Source |
|---|---|---|
| Render header | Display name | Profile store displayName |
| Render header | Bio text | Profile store bio |
| Render header | Avatar | Default icon (no upload yet) |
| Render stats row | Total focus hours | Derived from session history store, sum of focus session durations |
| Render stats row | Total tasks completed | Derived from task store, count of completed tasks |
| Render stats row | Current streak | Derived from session history store, consecutive days with focus sessions using the browser's local timezone at calculation time, starting from the most recent local day with a focus session; zero if none exist |
| Render character stats | Focus bar value | Fixed visual placeholder defined by the component, independent of user data |
| Render character stats | Discipline bar value | Fixed visual placeholder defined by the component, independent of user data |
| Render character stats | Creativity bar value | Fixed visual placeholder defined by the component, independent of user data |
| Render activity feed | Recent sessions | Session history store, each entry's `completedAt` |
| Render activity feed | Recent completed tasks | Task store, tasks with `isCompleted` true, using `completedAt`; the task store migration initializes legacy completed tasks from `updatedAt` |
| Render activity feed | Feed order and entry count | Merge sessions and completed tasks by completion time in descending order and take the first five |
| Render badges | First Session badge | Computed: true if session history has one or more sessions |
| Render badges | First Task badge | Computed: true if task store has one or more completed tasks |
| Render profile theme | Current theme label | Existing theme store `currentTheme`, matched to the label in the theme registry |
| Edit form | Name and bio | Profile store, editable fields |

**Key invariants**:

- Display name is never empty; falls back to "Focus User" if cleared.
- The profile page never changes the active theme. The theme shown there comes from the existing theme store.
- A newly completed task has a completion timestamp; reopening it clears that timestamp. Later edits do not change it.
- Character stat bars are fixed placeholders and do not change with activity data.
- Stats are computed at read time, never cached in the profile store.

**Security model**:

Local only. No auth, no multi user access. The profile is readable and writable by the browser session that created it. When auth lands, this becomes owner only with server side authorization.

**Configuration required**:

None. No new environment variables or third party credentials.

**Critical test scenarios**:

- Happy path: User visits profile page, sees header with default name and bio, stats row with zeros, and empty activity feed, verifies AC-1, AC-2, AC-4, AC-5
- Edit flow: User edits display name and bio, saves, and sees the updated values persist after page reload, verifies AC-6, AC-7
- Stats computation: User completes a focus session, then visits profile and sees the stats row reflect the new session data, verifies AC-2, AC-8
- Character stats: User sees fixed Focus, Discipline, and Creativity placeholder bars that do not change with activity data, verifies AC-3
- Activity feed: User completes sessions and tasks, sees the five newest entries ordered by completion time, and sees a task leave the feed when reopened, verifies AC-4
- Streak day boundary: Sessions around midnight are grouped by the browser's local calendar day, verifies AC-2
- Task data migration: Existing completed tasks receive `completedAt` from `updatedAt` during migration and remain in the activity feed, verifies AC-4
- Theme display: Profile shows the current theme label; changing it in Settings updates the profile display, while editing profile details does not change the theme, verifies AC-6, AC-9
- Badge unlock: User completes their first session, then sees the First Session badge appear in the badges grid, verifies AC-5

## Build plan

1. [x] Create the profile Zustand store with persist middleware, containing displayName and bio with defaults, satisfies AC-1, AC-6, AC-7
2. [x] Build the profile header component with default avatar icon, display name, and bio text, satisfies AC-1
3. [x] Build the stats row component that computes total focus hours, tasks completed, and current streak from existing stores using local calendar days, satisfies AC-2, AC-8
4. [x] Build the character stats section with fixed visual placeholder bars for Focus, Discipline, and Creativity, independent of user activity, satisfies AC-3
5. [x] Add optional `completedAt` tracking to tasks, setting it on completion and clearing it on reopen. Migrate existing completed tasks by initializing `completedAt` from `updatedAt`, then build the feed that merges completed tasks and sessions by completion time and shows the five newest entries, satisfies AC-4
6. [x] Build the badges grid component with First Session and First Task badges that unlock based on activity, satisfies AC-5
7. [x] Build the read only theme display from the existing theme store and registry, satisfies AC-9
8. [x] Build the edit profile form with name and bio fields using existing Input and Button primitives, satisfies AC-6
9. [x] Wire all sections into Profile.tsx as a single page layout, satisfies AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-9

## Migration plan

**Strategy**: In place local store migration
**Phases**:

1. Increment the task store version, retain the existing `updatedAt` backfill for version 1 data, and initialize `completedAt` from `updatedAt` for completed tasks that do not yet have a completion time in version 1 or version 2 data. Leave incomplete tasks without `completedAt`.
2. Record an exact `completedAt` timestamp for new task completions and clear it when a task is reopened.

**Rollback**: Revert the task completion timestamp behavior. The added optional field can remain in persisted task objects and be ignored by the previous code.

**Risks**: A legacy task's `updatedAt` may reflect an edit after completion, so its migrated activity time is approximate.

## Consequences

**Positive**:

- Establishes the social profile visual language from day one, making future social features a natural extension.
- Gives users a place to see their productivity progress at a glance.
- The separate profile store keeps identity data isolated from app settings, preparing for backend sync.

**Negative or tradeoffs**:

- Character stats are placeholders with no real gamification logic behind them. They will need a proper system when gamification lands.
- The page will grow long as more sections are added. A tab or carousel pattern may be needed later.
- Default avatar icon is generic until avatar upload is implemented.
- Local timezone streak grouping can change for past days if the user travels.
- Existing completed tasks use `updatedAt` as an approximate completion time during migration.

**Neutral**:

- The profile store adds another persisted localStorage key. Store persist versioning is already in place.
- Stats are computed at read time, which is fine for local data but will need caching when the backend provides larger datasets.

## Follow-up

- [ ] Character stats gamification system needs its own spec when ready. The current placeholder bars will be replaced by a proper stat calculation engine.
- [ ] Avatar upload is deferred. Plan image upload approach (base64 in localStorage vs backend storage) when auth lands.
- [ ] Profile page will need to support viewing other users profiles when social features arrive. The current layout assumes a single user context.
- [ ] Public profile theme previews and trying another user's theme are deferred until social profiles are designed. The current profile displays the active theme selected in Settings.
- [ ] Consider adding more achievement badges as gamification features land (7 day streak, 10 hours focused, etc).
