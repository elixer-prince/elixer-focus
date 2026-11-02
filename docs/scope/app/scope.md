# Scope: Elixer Focus System (mobile app)

Expo (React Native) mobile companion. Currently the default Expo starter template; no product features yet.

**Build approach:** Skateboard (MVP first; ship the thinnest usable whole, then grow).
**Workflow:** Alpha (run /check verify after /develop). Project default level of rigor.

_These are recommendations to keep your build orderly, not requirements._

## At a glance

| #   | Feature                          | Phase       | Status  |
| --- | -------------------------------- | ----------- | ------- |
| 1   | Expo app foundation              | Foundation  | planned |
| 2   | Mobile focus timer               | Slice 1     | planned |
| 3   | Mobile task matrix               | Slice 1     | planned |
| 4   | Mobile music player              | Slice 2     | planned |

## Foundations

### 1. Expo app foundation · planned · needs a decision

Scaffold the Expo router app, theming, and navigation beyond the starter template.

**Done when:** the app boots on device and mirrors web navigation.

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
