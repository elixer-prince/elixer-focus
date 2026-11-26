# 0009. Brain dump inbox · Rationale

**Date**: 2026-11-26

## Context

> ⚠️ Premise note: A thought has no per item length limit, but browser localStorage has a total size limit. This version preserves the draft and reports a failed save; consider IndexedDB only if real use or quota errors justify the added storage work.

Scope item 13 is a blank `Bin.tsx` route whose current goal is quick capture and listing. The existing Journal stores notes under a dated `DailyEntry`, while Tasks represent categorized work that can be planned in Calendar. Neither gives an overwhelmed user a clearly separate place to capture thoughts without deciding what they mean.

The web app already has a React and Zustand local storage pattern, but account and sync decisions are still in progress. The user wants a working base in the current design system, then plans a broader visual redesign and URL restructuring after the planned features land. The desktop sidebar includes Journal and Calendar, while the mobile menu currently omits them.

## Options considered

### Option 1: Dedicated local Brain dump inbox

Create an independent thought record and store, then coordinate its writes across tabs using the browser APIs already used by the app.

**Pros**:

- Keeps unprocessed thoughts distinct from dated Journal notes and actionable Tasks.
- Works before account and backend decisions are complete.
- Reuses the app's local state, error, and tab coordination patterns.

**Cons**:

- Adds another store, command boundary, and set of cross tab tests.
- Local storage remains subject to browser capacity and is not encrypted.

### Option 2: Extend Journal notes

Allow a `JournalNote` without a `DailyEntry`, using the existing Journal store and page.

**Pros**:

- Reuses the existing note record, timestamp fields, and local persistence.
- Avoids creating another store.

**Cons**:

- Weakens the Journal rule that each note belongs to a day and makes the writing surfaces harder to distinguish.
- Does not provide the requested dedicated capture page.

### Option 3: Reuse Tasks

Represent each thought as an uncategorized Task and show it through the existing task and Calendar flows.

**Pros**:

- Reuses task IDs, persistence, search potential, and Calendar integration.
- A thought that later becomes actionable already has a task record.

**Cons**:

- Mixes freeform thoughts with work to do, repeating the distinction the user wants to keep clear.
- Encourages task categorization when the user needs to capture first and decide later.

### Option 4: Add account backed notes now

Store thoughts on the backend and associate them with authenticated accounts from the first release.

**Pros**:

- Enables cross device access and account ownership immediately.
- Avoids making local storage the long term source of truth.

**Cons**:

- Depends on authentication and sync decisions that are still in progress.
- Adds API, authorization, migration, and failure handling work before the core capture flow can ship.

## Rationale

The Journal and Tasks already have different jobs. A separate thought record avoids forcing a date or task category onto an unprocessed idea, and a dedicated page makes that distinction visible. The account features are not ready to own or sync these records, so the existing browser store is the smallest usable first release. Omitting a success indicator matches the Journal's autosave behavior; failed writes still report an error and keep the draft available.

Cross tab synchronization is extra work, but the user explicitly wants thoughts to stay consistent across tabs. A feature owned coordinator keeps the Calendar coordinator focused on task planning while using the app's established lock, persist, broadcast, and single tab fallback pattern. Built in substring search is enough for the agreed search behavior, so a search package or server query would add cost without solving a current need.