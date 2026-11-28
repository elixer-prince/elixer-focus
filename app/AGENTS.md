# Expo app

## Overview

This workspace is the Expo and React Native mobile application. It uses Expo Router for file based navigation, with route files under `app/`.

## Key files

| File               | Owns                                                           |
| ------------------ | -------------------------------------------------------------- |
| `package.json`     | Expo dependencies and workspace commands                       |
| `app.json`         | Expo app identity, platform settings, plugins, and experiments |
| `app/_layout.tsx`  | Root Expo Router stack                                         |
| `app/index.tsx`    | Root route screen                                              |
| `tsconfig.json`    | Strict TypeScript settings and `@/*` alias                     |
| `eslint.config.js` | Expo ESLint flat configuration                                 |

## Commands

Run these from `app/`:

```bash
npm run start
npm run android
npm run ios
npm run web
npm run lint
```

## Conventions

- Add screens and layouts as files under `app/`, following Expo Router file based routing.
- Build native interfaces with React Native components rather than browser DOM elements.
- Keep TypeScript strict and use the `@/*` alias for imports rooted at this workspace.
- Declare mobile specific dependencies in this workspace's `package.json`.
- Initialize the shared task, Subtask, and timer settings stores from `services/shared-stores.ts` in the root layout. Keep Expo stores memory only and supply UUIDs with `expo-crypto`.

## Related specs

- [Shared code package](../docs/specs/_root/0002-shared-code-package.md)

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
