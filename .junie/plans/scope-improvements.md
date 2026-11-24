---
sessionId: session-261123-014612-znhl
---

# Scope Additions

## Overview

The existing scope already covers many improvement recommendations as features #20 through #31. This update adds the remaining improvements that were identified but not yet scoped. These are all straightforward enhancements to existing features that can be built directly without architecture specs.

## New Features to Add

| #   | Feature                               | Phase              | Status  |
| --- | ------------------------------------- | ------------------ | ------- |
| 32  | Timer keyboard shortcuts              | Slice 2 (settings) | planned |
| 33  | Session history and statistics        | Foundation         | planned |
| 34  | Adaptive duration logic               | Slice 3 (pages)    | planned |
| 35  | Music player custom playlist          | Slice 2 (settings) | planned |
| 36  | Music player progress display         | Slice 2 (settings) | planned |
| 37  | Task search and filtering             | Slice 3 (pages)    | planned |
| 38  | Task completion animation and archive | Slice 3 (pages)    | planned |
| 39  | Task due dates and priority           | Slice 3 (pages)    | planned |

## Feature Details

### 32. Timer keyboard shortcuts · planned

Add keyboard shortcuts to control the countdown timer without clicking. Space to start or pause, R to reset, and S to skip to the next session.

**Done when:** user can control the timer with keyboard shortcuts and the shortcuts are documented in the UI.

- [ ] Build it: `/develop timer keyboard shortcuts`

### 33. Session history and statistics · planned

Store completed sessions with timestamp, type, and duration in the session store. This enables the Journal feature to display daily focus stats and feeds into Gamification later.

**Done when:** completed sessions are recorded with metadata and can be queried by date range.

- [ ] Build it: `/develop session history and statistics`

### 34. Adaptive duration logic · planned

Make the timer truly adaptive by adjusting break or focus duration based on user patterns. If a user consistently skips breaks, suggest shorter breaks. If they complete many sessions in a row, suggest a longer break.

**Done when:** timer suggests adjusted durations based on skip frequency and consecutive session count.

- [ ] Build it: `/develop adaptive duration logic`

### 35. Music player custom playlist · planned

Let users add their own YouTube links as favorites. A text input in the MusicSwitcher dropdown accepts a YouTube URL, extracts the video ID, and appends it to the songs array in localStorage.

**Done when:** user can add, remove, and play custom YouTube songs alongside default songs.

- [ ] Build it: `/develop music player custom playlist`

### 36. Music player progress display · planned

Add a thin progress bar to the floating player that reads currentTime and duration from the YouTube player. Shows current position and time remaining.

**Done when:** floating player displays a progress bar with current time and duration.

- [ ] Build it: `/develop music player progress display`

### 37. Task search and filtering · planned

Add a search input in the TaskPageHeader that filters tasks by title or description across all quadrants. Helps users find specific tasks as the matrix grows.

**Done when:** user can type a search query and see only matching tasks across all columns.

- [ ] Build it: `/develop task search and filtering`

### 38. Task completion animation and archive · planned

Add a slide out animation when a task is completed. Move completed tasks to a collapsed archive section to keep the matrix clean.

**Done when:** completed tasks animate out and move to an archive section that can be expanded.

- [ ] Build it: `/develop task completion animation and archive`

### 39. Task due dates and priority · planned

Add an optional due date field to the Task type with visual indicators (e.g., red border for overdue). Makes the Eisenhower matrix more actionable.

**Done when:** tasks can have due dates, overdue tasks are visually highlighted, and tasks can be sorted by due date.

- [ ] Build it: `/develop task due dates and priority`

## Recommended Build Order

1. **Countdown volatile state cleanup** (#30) — quick fix, prevents inconsistent state on reload
2. **Store persist versioning** (#29) — applies to countdown and tasks stores, prevents future data corruption
3. **Task updatedAt tracking** (#31) — small change, enables sorting and audit
4. **Reusable Modal component** (#25) — unblocks other features that need confirmation dialogs
5. **Music player custom playlist** (#35) — high value UX improvement, no backend needed
6. **Task search and filtering** (#37) — improves usability as task count grows
7. **Timer keyboard shortcuts** (#32) — makes the timer feel like a real desktop tool
8. **Music player progress display** (#36) — small UX improvement
9. **Session history and statistics** (#33) — feeds Journal and Gamification
10. **Task completion animation and archive** (#38) — polish feature
11. **Task due dates and priority** (#39) — requires Task type change
12. **Adaptive duration logic** (#34) — requires session history data first

# Delivery Steps

### ✓ Step 1: Add new improvement features to the web scope

Add new features to the At a glance table and create detailed feature sections for each improvement.

- Add features #32 through #39 to the At a glance table with proper phase and status
- Create feature sections for Timer keyboard shortcuts (#32), Session history and statistics (#33), Adaptive duration logic (#34), Music player custom playlist (#35), Music player progress display (#36), Task search and filtering (#37), Task completion animation and archive (#38), and Task due dates and priority (#39)
- Each feature gets a short intent, Done when line, and Build it checkbox
- Place features in the appropriate phase section (Foundation for infrastructure, Slice 2 for settings-related, Slice 3 for page-level features)
