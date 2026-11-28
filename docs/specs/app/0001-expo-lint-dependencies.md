# 0001. Keep Expo SDK 54 lint dependencies compatible

**Date**: 2026-11-27
**Status**: Accepted

## Summary

Keep the app's Expo SDK 54 lint setup on ESLint 9 with Expo's flat config, the modern configuration format. The official SDK 54 plugins do not reliably support ESLint 10, so removing the ESLint 9 warning now would require unsupported compatibility work. Keep clean installs and app lint working, and accept the warning until Expo's plugin stack officially supports a newer ESLint major.

## Context

> ⚠️ Premise note: Removing the warning by moving to ESLint 10 would break the current Expo preset or require unsupported plugin replacements and peer range workarounds. The safer framing is to preserve the SDK 54 lint path and revisit the warning when Expo's plugin stack supports a newer ESLint major.

The app is on Expo SDK 54 and runs `expo lint` through its `lint` script. Its dependency declarations use ESLint `^9.25.0` and `eslint-config-expo` `~10.0.0`, and its config loads Expo's flat preset. The current lock resolves `eslint-plugin-import` 2.32.0, `eslint-plugin-react` 7.37.5, and `eslint-plugin-react-hooks` 5.2.0. Their declared ESLint peer ranges stop at major 9, while the ESLint 9 package currently emits an unsupported version warning.

The app was prepared as a starter workspace earlier, but the decision is explicitly limited to SDK 54. The root install must resolve the monorepo lockfile normally, and the app lint command must remain usable.

## Requirements

**User stories**:

- As the app maintainer, I want a lint setup compatible with Expo SDK 54 so that app linting and clean installs remain reliable.

**Acceptance criteria**:

- **AC-1**: `npm clean-install` from the repository root completes without peer dependency errors and without `--force` or `--legacy-peer-deps`.
- **AC-2**: `npm run lint:app` completes successfully using the app's Expo lint command and flat config.
- **AC-3**: The app remains on Expo SDK 54 and uses ESLint major 9 with `eslint-config-expo` major 10, without compatibility forks, peer overrides, or forced peer resolution.
- **AC-4**: The ESLint 9 unsupported version warning is recorded as an accepted limitation until the official Expo plugin stack supports a newer ESLint major. The dependency choice is not described as warning free.

## Options considered

### Option 1: Keep the official SDK 54 lint stack

Keep ESLint on major 9 and use Expo's SDK 54 flat config and plugin set. Do not force ESLint 10 into the stack while its plugins declare peer support only through major 9. (basis: `app/package.json`, `app/eslint.config.js`, and `package-lock.json`; [Expo ESLint guidance](https://docs.expo.dev/guides/using-eslint))

**Pros**:

- Preserves the Expo lint rules and config intended for this SDK.
- Keeps dependency resolution within the declared peer ranges.
- Avoids custom adapters, forks, and ongoing compatibility maintenance.

**Cons**:

- The ESLint 9 unsupported version warning remains.
- A later ESLint major upgrade still depends on compatible Expo plugins.

### Option 2: Move to ESLint 10 with a custom compatibility layer

Replace or adapt parts of the Expo preset and its plugins to use ESLint 10 now. This can target warning removal, but the current official Expo config has a reported runtime crash and several plugins reject ESLint 10 through their peer ranges. (basis: [Expo ESLint 10 issue](https://github.com/expo/expo/issues/46717); [eslint-plugin-import compatibility issue](https://github.com/import-js/eslint-plugin-import/issues/3267))

**Pros**:

- Removes the ESLint 9 unsupported version warning.
- Moves the app to the current ESLint major.

**Cons**:

- The official Expo preset can fail at runtime with ESLint 10.
- A strict install can reject the current plugins, so a custom setup would need maintained replacements or other compatibility work.
- The app team would own that compatibility work instead of relying on Expo's SDK aligned configuration.

## Decision

**Chosen option**: Option 1: Keep the official SDK 54 lint stack

Keep Expo SDK 54, ESLint major 9, `eslint-config-expo` major 10, and Expo's flat config. Do not add compatibility packages, forks, peer overrides, or install bypasses. Accept the unsupported version warning until Expo's plugin stack officially supports a newer ESLint major. (basis: the app's existing SDK aligned dependencies; Expo's reported ESLint 10 runtime failure; ESLint's version support policy at [eslint.org/version-support](https://eslint.org/version-support))

## Rationale

The current app already follows the SDK 54 dependency pairing, and its plugin peer ranges align with ESLint 9. Expo documents the flat config for SDK 53 and later, while its ESLint 10 issue reports a crash in the React plugin and advises staying on ESLint 9. The ESLint 10 path would meet the warning removal goal only by taking ownership of plugin compatibility and strict install problems, which is a larger and less reliable change than the app needs. (basis: `app/package.json`, `app/eslint.config.js`, and `package-lock.json`; [Expo ESLint guidance](https://docs.expo.dev/guides/using-eslint); [Expo ESLint 10 issue](https://github.com/expo/expo/issues/46717))

## Feature design

**Data model sketch**:

None. This decision changes development tooling only.

**API surface**:

None. No runtime API or user visible behavior changes.

**Value sourcing**:

| Action | Value produced or displayed | Source |
|---|---|---|
| Root clean install | Dependency resolution result | Workspace `package.json` files and `package-lock.json` |
| App lint command | Lint result | `app/package.json` script and `app/eslint.config.js` |

**Key invariants**:

- The app remains on Expo SDK 54.
- App lint uses Expo's flat config and ESLint major 9.
- Dependency installation does not bypass declared peer ranges.
- The ESLint 9 warning is an accepted limitation, not evidence that the install or lint command failed.

**Security model**:

No user data, authentication, or authorization is involved. Changes are limited to development dependencies and lint configuration.

**Configuration required**:

None.

**Critical test scenarios**:

- Run `npm clean-install` from the repository root with normal peer resolution, verifies **AC-1** and **AC-3**.
- Run `npm run lint:app`, verifies **AC-2** and **AC-3**.
- Confirm any ESLint 9 unsupported version warning is recorded as an accepted limitation, verifies **AC-4**.

## Build plan

The Skateboard approach favors preserving the smallest working lint path before changing package resolution. The current app declarations already match the selected SDK 54 strategy, so do not make an unrelated lint migration.

1. Keep the app dependency declarations on ESLint major 9 and `eslint-config-expo` major 10, with Expo's existing flat config. Do not add peer bypasses or compatibility forks, satisfies **AC-3**.
2. Verify root dependency resolution using the normal lockfile workflow, then verify the app lint command and record the accepted warning, satisfies **AC-1**, **AC-2**, **AC-4**.

## Consequences

**Positive**:

- The app keeps the Expo SDK 54 lint configuration and avoids unsupported plugin combinations.
- Normal package installation and the app lint command remain the success conditions.

**Negative / tradeoffs**:

- The ESLint 9 unsupported version warning remains until compatible Expo plugins are available.
- The app does not receive ESLint 10 behavior or fixes while it stays on ESLint 9.

**Neutral**:

- An Expo SDK upgrade remains outside this decision and does not by itself establish ESLint 10 compatibility.

## Follow-up

- [ ] Revisit the ESLint major when Expo and the plugins used by the SDK 54 preset officially support ESLint 10 and pass strict installation and lint checks.

## References

**Project sources** (verifiable, in this repo):

- `app/package.json`, `app/eslint.config.js`, `package-lock.json`, and `app/AGENTS.md`.

**Practices & standards**:

- Use declared peer compatibility rather than forcing package managers to accept an unsupported plugin combination.

**Links** (web verified only):

- Expo, Using ESLint: https://docs.expo.dev/guides/using-eslint
- Expo, ESLint 10 runtime compatibility report: https://github.com/expo/expo/issues/46717
- `eslint-plugin-import`, ESLint 10 compatibility issue: https://github.com/import-js/eslint-plugin-import/issues/3267
- ESLint, Version Support: https://eslint.org/version-support