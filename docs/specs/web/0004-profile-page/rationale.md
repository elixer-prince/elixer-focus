# Rationale: Profile page · spec 0004

## Context

The app is a personal productivity tool with a long term vision of becoming a social media platform for productivity, inspired by TikTok and Instagram profiles with gamified elements. The profile route currently exists as an empty placeholder. The scope calls for a profile page showing user info and basic preferences, with the understanding that this will grow into a public facing social profile with character stats and achievements.

For this MVP, the profile is local only. The user views their own profile, not others. Auth is not yet implemented, so profile identity data lives in localStorage via a dedicated Zustand store. The app theme is selected in Settings and stored separately from profile identity.

The session history store tracks completed focus sessions with type, duration, and timestamp. The task store tracks completed tasks, but currently has no dedicated completion timestamp. These stores provide the data source for the stats row and activity feed. Character stats and the full gamification system are deferred to a later iteration.

## Options considered

### Option 1: Social profile layout, single page

A vertical scroll layout inspired by Instagram profiles: header with avatar and bio, stats row below, then sections for character stats, activity feed, and badges. Everything on one page, no tabs or carousels.

**Pros**:

- Simple to build, one component tree
- Familiar pattern for the target audience
- Easy to extend with more sections later

**Cons**:

- Long page on small screens may feel cluttered
- No clear separation between identity and stats sections

### Option 2: Tabbed profile layout

Header with avatar and bio at the top, then tabs for Stats, Activity, and Badges below. Each tab shows one section at a time.

**Pros**:

- Clean separation of concerns
- Less vertical scroll on mobile

**Cons**:

- Adds tab navigation complexity for an MVP
- Hides content behind clicks, reducing the at a glance feel

### Option 3: Settings style profile

A form based layout focused on editing profile fields, with stats shown as read only cards below. Prioritizes the edit flow over the display flow.

**Pros**:

- Straightforward implementation using existing Input and Button primitives

**Cons**:

- Does not match the social media vision
- Feels like a settings page, not a profile page
- Harder to pivot to a social layout later

### Activity feed

#### Option 1: Mixed activity

Combine completed sessions and completed tasks in one timeline. Tasks use a dedicated completion time, so later edits do not change their activity date.

**Pros**:

- Reflects both core activities of the app
- A single newest first timeline shows recent work in context

**Cons**:

- Requires adding a completion timestamp to tasks

#### Option 2: Sessions only

Show completed sessions from the session history store, without task entries.

**Pros**:

- Uses the session history data as it exists today
- Keeps the profile change smaller

**Cons**:

- Completed tasks do not appear in recent activity

### Streak day

#### Option 1: Browser local time

Use the browser's local calendar day when calculating the streak.

**Pros**:

- Matches the existing session history day queries
- Matches the calendar day users see on their device

**Cons**:

- Traveling to another timezone can change how past session timestamps group into days

#### Option 2: UTC

Use UTC day boundaries for every session.

**Pros**:

- Uses the same day boundary on every device and in every location

**Cons**:

- A session near local midnight can count toward a different day than the user expects

### Profile theme

#### Option 1: Settings display

Display the theme already selected in Settings, without making it editable on the profile.

**Pros**:

- Keeps one source of truth for the active theme
- Makes the user's selected theme visible on the profile

**Cons**:

- The user must open Settings to change the theme

#### Option 2: Editable profile preference

Let the user choose a profile theme independently from the app theme.

**Pros**:

- Lets the user personalize the profile and theme from one place

**Cons**:

- Creates a second theme control that must stay consistent with Settings

## Rationale

The app's long term vision is a social media platform for productivity. The single page layout establishes that visual language from day one, while avoiding tab complexity and a settings style profile. A mixed activity feed represents both sessions and tasks, and a task completion timestamp keeps the timeline accurate after later edits. Local calendar days match the existing session history queries and the user's day boundaries. Reading the active theme from Settings avoids two persisted theme values that could disagree, while showing the theme supports the future social profile direction. Fixed character bars preserve the requested profile layout without inventing a gamification formula. The single page approach is the thinnest usable whole that points in the right direction, aligned with the Skateboard build approach.