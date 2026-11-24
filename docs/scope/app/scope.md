# Scope: Elixer Focus System (mobile app)

Expo (React Native) mobile companion. Currently the default Expo starter template; no product features yet.

**Build approach:** Skateboard (MVP first; ship the thinnest usable whole, then grow).
**Workflow:** Prototype (just /develop, no separate verify or test steps). Fastest path for infrastructure work. Project default level of rigor.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use /develop and skip /architect. You decide when a feature is done._

## At a glance

| #   | Feature                          | Phase       | Status  |
| --- | -------------------------------- | ----------- | ------- |
| 1   | Expo app foundation              | Foundation  | planned |
| 2   | Mobile focus timer               | Slice 1     | planned |
| 3   | Mobile task matrix               | Slice 1     | planned |
| 4   | Mobile music player              | Slice 2     | planned |

## Foundations

### 1. Expo app foundation · planned · needs a decision

Scaffold the Expo router app, theming, and navigation beyond the starter template. Before building mobile features, spec the navigation structure, theming approach, and how the mobile app will share code with the web app. Decide whether the mobile app uses the same DaisyUI themes (via Tailwind for React Native web) or a native theming approach. Set up the shared package dependency so the mobile app can import types immediately from packages/shared/.

**Done when:** the app boots on device with custom navigation, theming that mirrors the web app, and access to shared types from the shared package.

- [ ] Design it (spec): `/architect expo app foundation`

code in `app/`

## Slice 1: core loop on mobile

### 2. Mobile focus timer · planned · needs a decision

Port the adaptive pomodoro timer to React Native.

**Done when:** timer runs and alerts on device.

- [ ] Design it (spec): `/architect mobile focus timer`

### 3. Mobile task matrix · planned · needs a decision

Port the Eisenhower task matrix to mobile with drag and drop.

**Done when:** tasks persist locally and sync with web (later).

- [ ] Design it (spec): `/architect mobile task matrix`

## Slice 2: music on mobile

### 4. Mobile music player · planned · needs a decision

Port the music player to mobile.

**Done when:** playback works on device.

- [ ] Design it (spec): `/architect mobile music player`

