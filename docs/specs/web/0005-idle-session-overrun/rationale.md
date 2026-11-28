# Rationale: Idle and session overrun tracking

## Context

> ⚠️ Premise note: A browser cannot run work or show a reflection while the browser or device is off. Saved timestamps let the app reconstruct elapsed time when it opens again, but a notification or visible prompt cannot happen while no app process is running.

The web countdown timer stores session settings and completed sessions in persisted Zustand stores. Each tab currently runs its own timer interval. If multiple tabs are open, each may process a timer completion and create a reflection prompt. If every tab is closed when a timer expires, startup recovery resets it without recording a completed session or opening its reflection.

The Journal derives daily focus totals from completed sessions and shows a weekly focus chart. Its week uses the shared configurable `weekStartsOn` preference, which defaults to Sunday. Daily stats are currently hidden when there are no completed sessions. The Journal has no persisted source for idle time or session overrun, so it cannot report intervals that cross midnight or continue while the app is closed.

This is a web enhancement using local browser storage, with no backend endpoint or cross device sync in scope. The user wants idle time to include pauses and the time before the first session, and wants the raw timeline retained for a future sleep schedule. The project approach is Skateboard, so the first release must provide a complete and usable tracking flow rather than ship disconnected infrastructure.

## Options considered

### Option 1: Extend local stores with one tab coordinator

Keep the existing local persistence and add timestamped intervals plus a single cross tab owner using Web Locks (a browser managed exclusive lock) and BroadcastChannel (same origin tab messaging).

**Pros**:

* Reuses the current timer, session history, and Journal stores without adding a server or service.
* One owner can serialize controls and timer completion while all tabs stay interactive.
* Persisted timestamps recover the timeline after all tabs close.

**Cons**:

* Requires explicit command, state, handoff, and idempotency behavior across tabs.
* Browsers without the coordination APIs must use the single tab fallback.

### Option 2: Synchronize with local storage events only

Use localStorage writes and storage events to notify other tabs, with a stored lease to choose a timer owner.

**Pros**:

* Builds on the existing local storage approach and avoids a worker.
* Can update followers without changing the app into a server backed service.

**Cons**:

* localStorage does not provide an atomic compare and set operation, so simultaneous tabs can both believe they own timer completion.
* A race could create duplicate sessions or overlapping intervals, which violates the feature contract.

### Option 3: Move timer ownership to a SharedWorker

Run the timer and coordination in one shared worker, with tabs acting as clients and local storage retained for recovery.

**Pros**:

* A central worker naturally owns the timer and can publish one result to all connected tabs.
* Tab UI components need less responsibility for ownership.

**Cons**:

* Adds worker lifecycle and browser support concerns to a local feature.
* The app still needs persisted timestamps and recovery when all tabs and the worker are gone.

### Option 4: Move timer coordination to the backend

Make the server the source of truth for timer state and completion, with the browser as a client.

**Pros**:

* Central state can coordinate across devices as well as tabs.
* A server can process timer deadlines while the browser is closed.

**Cons**:

* Requires authentication, API work, network availability, and a server side scheduler.
* Changes the current local first timer model without a cross device requirement.

## Rationale

The current timer runs independently in every tab, and its closed app recovery drops a timer that expired while away. A single Web Lock owner prevents duplicate completion side effects, while BroadcastChannel lets any tab control the shared timer. A stable timer run ID is allocated at start and reused as the completed session ID, making retry after owner handoff idempotent (safe to repeat without making a duplicate).

Timestamped intervals are necessary because the user wants time counted across browser closure, split correctly across local days, and available for a future sleep schedule. Local storage preserves that timeline without adding backend availability requirements. A SharedWorker would centralize the timer but adds a second runtime to operate, while a storage event lease cannot guarantee exclusive ownership. The browser can only reconstruct elapsed time after it is reopened, and local data remains limited to the same browser profile.