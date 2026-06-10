# React Native 0.65 Stage Status

Project: FastPong

Target path: `/Users/meysamkabiri/F_P/fastpong-main`

Stage: Stage 2A only, React Native `0.63.4` to `0.65.3`

## Package Changes Made

- `react-native`: `0.63.4` to `0.65.3`
- `react`: `16.13.1` to `17.0.2`
- `@types/react-native`: `^0.63.50` to `^0.65.0`
- `@types/react`: `^18.2.6` to `^17.0.2`
- `rnx-kit.alignDeps.requirements`: `react-native@0.68` to `react-native@0.65`

No React Native upgrade beyond `0.65.3` was performed.

## Type Resolutions Added

The following Yarn resolutions were added to align transitive type packages with React 17 and RN 0.65:

- `@types/react`: `17.0.93`
- `@types/react-native`: `0.65.36`
- `react-native`: `0.65.3`

Reason: `@types/react-native-vector-icons` was pulling `@types/react-native@^0.70`, while `@types/react-native-calendars`, `@types/react-redux`, and related type packages were pulling `@types/react@*`, which resolved to React 18 types.

## Install Status

- `yarn install` passed.
- `yarn.lock` was updated.
- Yarn reports an expected warning that `@types/react-native@0.65.36` is incompatible with `@types/react-native-vector-icons` requesting `@types/react-native@^0.70`. This is intentional for Stage 2A because the app is pinned to RN `0.65.3`.

## TypeScript Conflict Status

The original multi-version React/React Native type conflict is resolved:

- `@types/react` is unified at `17.0.93`.
- `@types/react-native` is unified at `0.65.36`.
- The previous nested `@types/react-native@0.70.x` path from `@types/react-native-vector-icons` is no longer active.

`yarn tsc` still fails, but the remaining failures are now grouped below.

## Remaining TypeScript Errors

### TypeScript Environment / Declaration Conflicts

Examples:

- `@types/react-native/globals.d.ts` conflicts with `typescript/lib/lib.dom.d.ts` for globals such as `Blob`, `FormData`, `Request`, `Response`, `URL`, `AbortController`, and `XMLHttpRequest`.
- `react-native-calendars` declarations reference RN types such as `PointerEvent`, `Role`, and `PointProp` that are not available in `@types/react-native@0.65.36`.

Assessment: migration-blocking for TypeScript validation.

This is related to the RN 0.65 type environment and dependency declaration compatibility. It should be resolved or explicitly accepted before using `yarn tsc` as a Stage 2A pass gate.

### Navigation Type/API Mismatches

Examples:

- `@react-navigation/stack` reports `AnimatedInterpolation` generic mismatches.
- `Navigation.tsx` passes `headerMode`, which is not accepted by the installed stack navigator types.
- Screen component prop types do not match `ScreenComponentType` expectations.

Assessment: likely migration-sensitive dependency/type alignment issue.

This may be existing typing debt made visible by the RN/type alignment, but navigation is a migration-sensitive area and should be reviewed before native validation is treated as release-significant.

### Third-Party Package Declaration Mismatches

Examples:

- `@react-native-picker/picker` declaration error: static members referencing class type parameters.
- `react-native-chart-kit` expects `react-native-svg` type exports such as `Color`.
- `react-native-permissions` references internal RN permission module declarations that are missing in the RN 0.65 type package.
- `react-native-fbsdk-next` has declaration files with implicit `any` return types under the current strict TypeScript config.

Assessment: mixed.

Some are migration-sensitive dependency/type compatibility issues; others may be existing strict TypeScript debt surfaced by declaration checking.

### App Source Strictness Errors

Examples:

- `globalThis` index access errors.
- `never` inference errors in navigation and state updates.
- `possibly undefined` errors.
- implicit `any` errors.
- event handler type mismatches between Formik handlers and React Native gesture events.
- source files failing `--isolatedModules` because they are treated as global scripts.

Assessment: mostly existing typing debt.

These errors are not direct evidence that the RN 0.65 package upgrade is broken, but they prevent `yarn tsc` from passing.

### App Dependency Type Usage Errors

Examples:

- `react-native-calendars` has no exported member `DateObject` for the installed declaration surface.
- `react-native-vector-icons` icon `name` values are stricter than app usage.
- `@react-native-seoul/kakao-login` is missing module/type declarations.
- app model/type mismatches such as missing `uri`, incorrect training data shapes, and missing object properties.

Assessment: mostly existing typing debt with some migration-sensitive package typing impact.

These should be triaged separately from the RN 0.65 framework bump.

## Recommendation

Stop before Android/iOS validation if TypeScript pass is required as a hard Stage 2A gate.

Do not proceed to Android/iOS validation as a clean Stage 2A pass yet, because `yarn tsc` still fails.

If the project owner explicitly accepts the remaining TypeScript errors as existing typing debt and agrees that native validation can proceed despite a failing `yarn tsc`, the next step would be Android/iOS validation for RN `0.65.3`. That acceptance should be documented before running native builds.
