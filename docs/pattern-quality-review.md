# Pattern Quality Review

Date: 2026-06-13

Scope: Stabilization Milestone B2. This is an analysis-only review of existing migration patterns in `src/knowledge/migrationPatterns.ts`. No detection behavior changes are included in this milestone.

## Files Reviewed

- `src/knowledge/migrationPatterns.ts`
- `src/models/MigrationPattern.ts`
- `src/models/ActionPriority.ts`
- `src/__tests__/migrationPatterns.test.ts`
- `docs/PROJECT_CONTEXT.md`

## Executive Summary

The current pattern system is useful, but several high-noise patterns still mix advisory risk, probable build blockers, and confirmed evidence-backed findings in the same output layer. The highest false-positive risks are concentrated in broad dependency/package heuristics and runtime-risk proxies.

Highest-priority calibration targets:

- `PATTERN-002` should stop implying a version mismatch when only normal React Navigation companion packages are present.
- `PATTERN-007` should distinguish runtime-impacting Metro/Babel/codegen skew from lint-only tooling skew.
- `PATTERN-011` should treat lockfile-only `lru-cache` evidence as weaker than direct dependency evidence.
- `PATTERN-019` should not call large barrels a circular runtime crash without import-graph evidence.
- `PATTERN-022` is useful as modernization guidance, but should be de-duplicated or downweighted when more specific video build patterns fire.

## Current Pattern Inventory

| ID | Title | Current Action Priority | Current Confidence Logic |
|---|---|---|---|
| `PATTERN-001` | Metro OpenSSL Compatibility | `MUST_FIX` | No custom confidence; renders as default `medium`. |
| `PATTERN-002` | React Navigation Version Mismatch | `VALIDATE_DURING_MIGRATION` | No custom confidence; renders as default `medium`. |
| `PATTERN-003` | React Native DOM Type Conflict | `VALIDATE_DURING_MIGRATION` | No custom confidence; renders as default `medium`. |
| `PATTERN-004` | Clipboard Android Manifest Issue | `MUST_FIX` | No custom confidence; renders as default `medium`. |
| `PATTERN-005` | RN 0.68 Boost Podspec Failure | `MUST_FIX` | No custom confidence; renders as default `medium`. |
| `PATTERN-006` | RCT-Folly / Xcode 26 Compatibility | `MUST_FIX` | No custom confidence; renders as default `medium`. |
| `PATTERN-007` | React Native Tooling Version Skew | `VALIDATE_DURING_MIGRATION` | No custom confidence; renders as default `medium`. |
| `PATTERN-008` | react-native-permissions iOS Handler Configuration Missing | `MUST_FIX` | `high` for missing/empty/unidentified handler setup; `medium` for Permissions migration area only; otherwise `low`. |
| `PATTERN-009` | RN 0.71 Podfile Configuration Shape Change | `MUST_FIX` | `high` when legacy `config["reactNativePath"]` access detected; otherwise `medium`. |
| `PATTERN-010` | react-native-screens Fabric Pod Compatibility Issue | `MUST_FIX` | `high` when screens version is known; otherwise `medium`. |
| `PATTERN-011` | Metro/Babel LRU Cache Version Skew | `VALIDATE_DURING_MIGRATION` | `high` for direct `lru-cache` dependency; `medium` for lockfile-only evidence. |
| `PATTERN-012` | React Native 0.71 Android Gradle Migration | `MUST_FIX` | `high` for explicit legacy Gradle constructs; `medium` for old AGP; otherwise `low`. |
| `PATTERN-013` | React Native Video ExoPlayer Resource Resolution Issue | `MUST_FIX` | `high` when `react-native-video` dependency version is known; otherwise `medium`. |
| `PATTERN-014` | Legacy Android Annotation Processor / Typedef Extraction Issue | `MUST_FIX` | `medium` if AGP version exists; otherwise `low`. |
| `PATTERN-015` | Unused MLKit Flavor Dependency Issue | `MUST_FIX` | `high` when `react-native-camera` dependency version is known; otherwise `medium`. |
| `PATTERN-016` | Legacy SVG Transformer Metro Compatibility Issue | `VALIDATE_DURING_MIGRATION` | `high` when Metro config exists; otherwise `medium`. |
| `PATTERN-017` | react-native-screens AppCompat Theme Attribute Issue | `MUST_FIX` | `high` when screens version is known; otherwise `medium`. |
| `PATTERN-018` | Native UI Component Missing From UIManager | `MUST_FIX` | Always `high` when matched. |
| `PATTERN-019` | Circular Barrel Import Runtime Crash | `PLAN_LATER` | `high` for large barrels plus at least 3 migration areas; `medium` for large barrels; otherwise `low`. |
| `PATTERN-020` | RN 0.76+ Android SoLoader Merged Native Library Mapping | `MUST_FIX` | `high` for legacy SoLoader init, missing mapping, and readable MainApplication; `medium` for legacy init; otherwise `low`. |
| `PATTERN-022` | react-native-video Pre-Release or Legacy Branch Modernization Recommended | `VALIDATE_DURING_MIGRATION` | `high` for alpha/beta/rc or major < 5; `medium` for stable v5 with RN >= 0.74; `low` for stable v5 with RN < 0.74. |

## Focus Pattern Review

### PATTERN-002: React Navigation Version Mismatch

Current confidence logic: default `medium`.

Current actionPriority: `VALIDATE_DURING_MIGRATION`.

Potential false positives:

- Any normal React Navigation app with `react-native-gesture-handler` or `react-native-screens` can match, even when package major versions are aligned.
- Modern React Navigation v6/v7 apps may be flagged because companion native packages are expected dependencies.
- Source usage plus one companion package is treated as mismatch evidence, but no actual version comparison is performed.

Potential false negatives:

- Mixed `react-navigation` v4 and `@react-navigation/*` v5+ packages may be missed if companion packages are absent or undetected.
- Version mismatches among `@react-navigation/native`, stack, tabs, drawer, native-stack, and material packages are not explicitly detected.
- Monorepo/workspace dependency inheritance may hide versions from the target app package.

Overlap with other patterns:

- Overlaps with `PATTERN-010` and `PATTERN-017` when `react-native-screens` is old.
- Overlaps with migration-area Navigation reporting and risky dependency reporting for gesture-handler/screens.

Confidence recommendation:

- Keep current matched output as `low` or `medium-low` advisory until actual package major mismatch evidence is added.
- Future `high` should require direct evidence of mixed navigation major versions or known incompatible companion package ranges.

Recommendation:

- Rename or reword future behavior to “React Navigation Compatibility Review” unless actual mismatches are detected.
- Add version-family comparison across all `@react-navigation/*`, `react-navigation`, `react-native-screens`, and `react-native-gesture-handler`.

### PATTERN-007: React Native Tooling Version Skew

Current confidence logic: default `medium`.

Current actionPriority: `VALIDATE_DURING_MIGRATION`.

Potential false positives:

- `@react-native/eslint-config` can be newer than RN without causing Metro runtime failures.
- Package minor comparison assumes all `@react-native/*` tooling versions track RN minor versions consistently.
- Apps may intentionally pin newer lint/tooling packages without runtime impact.

Potential false negatives:

- Does not inspect `metro`, `metro-config`, `metro-react-native-babel-preset`, `@react-native/codegen`, `react-native-codegen`, or CLI packages.
- Does not detect older tooling packages with newer RN, only newer tooling ahead of RN by 3+ minors.
- Does not detect custom Babel/Metro config incompatibilities.

Overlap with other patterns:

- Symptom overlap with `PATTERN-011` LRU cache skew.
- Symptom overlap with `PATTERN-016` SVG transformer Metro failures.
- Broad Metro/runtime wording overlaps with `PATTERN-001` when Metro cannot start.

Confidence recommendation:

- Keep `medium` only when runtime-impacting packages (`@react-native/babel-preset`, codegen, Metro config) are skewed.
- Downgrade eslint-only skew to `informational` or do not emit the pattern unless accompanied by runtime tooling evidence.

Recommendation:

- Split runtime tooling skew from lint/tooling maintenance skew.
- Add detected signals for RN version, package name, package version, and delta.

### PATTERN-011: Metro/Babel LRU Cache Version Skew

Current confidence logic: `high` for direct `lru-cache` dependency; `medium` for lockfile-only `lru-cache` evidence.

Current actionPriority: `VALIDATE_DURING_MIGRATION`.

Potential false positives:

- Lockfile can contain `lru-cache@10+` for unrelated dependency paths that Metro/Babel never resolves.
- Direct compatible pin does not guarantee Metro/Babel resolution under all package managers and hoisting layouts.
- Newer Metro/Babel stacks may legitimately depend on newer `lru-cache` versions.

Potential false negatives:

- Actual resolver path conflicts may occur without direct `lru-cache` dependency evidence.
- PNPM/Yarn PnP/workspace dependency resolution may hide the version relationship.
- The rule does not inspect exact Metro/Babel versions for compatibility.

Overlap with other patterns:

- Overlaps with `PATTERN-007` for Metro/Babel/tooling runtime failures.
- Overlaps with `PATTERN-016` when output symptoms mention `transformFile` or bundling errors.

Confidence recommendation:

- Keep direct `lru-cache` dependency as `high` only if Metro/Babel versions are known to be incompatible.
- Keep lockfile-only evidence as `medium` or downgrade to `low` when no Metro/Babel package versions are available.

Recommendation:

- Add signals for Metro package versions and Babel package versions.
- Future improvement should distinguish direct dependency, lockfile-only, and proven resolver-path evidence.

### PATTERN-019: Circular Barrel Import Runtime Crash

Current confidence logic: `high` for large barrels plus 3+ migration areas; `medium` for large barrels; otherwise `low`.

Current actionPriority: `PLAN_LATER`.

Potential false positives:

- Large `index.ts` barrel files are common and do not prove circular imports.
- Migration area count does not prove screens import from barrels.
- The current scanner does not build an import graph or detect cycles.
- The title says “Runtime Crash,” but evidence is currently a structural risk indicator.

Potential false negatives:

- Small barrel files can still introduce circular dependencies.
- Cycles can exist outside `index.ts`/`index.tsx` files.
- Cycles involving path aliases or non-standard source roots may be missed.
- Runtime undefined imports can come from ordinary circular imports without barrels.

Overlap with other patterns:

- Overlaps with runtime-risk indicators in the main report.
- Can overlap with native UI/navigation/media areas because those increase migration-area count and confidence, but they are not causal evidence for cycles.

Confidence recommendation:

- Large barrels only: `low`.
- Large barrels plus screen imports from those barrels: `medium`.
- Confirmed import cycle involving screen/runtime-sensitive components: `high`.
- Current behavior likely overstates `high` confidence.

Recommendation:

- Rename future wording to “Large Barrel Runtime Risk Indicator” unless import cycles are actually detected.
- Add import graph/cycle evidence before using runtime-crash wording at high confidence.

### PATTERN-022: react-native-video Pre-Release or Legacy Branch Modernization Recommended

Current confidence logic: `high` for alpha/beta/rc or major < 5; `medium` for stable v5 with RN >= 0.74; `low` for stable v5 with RN < 0.74.

Current actionPriority: `VALIDATE_DURING_MIGRATION`.

Potential false positives:

- Stable v5 may work for projects not currently upgrading beyond compatible RN versions.
- Version alone does not prove source API incompatibility.
- Low-confidence v5 cases may clutter reports when no video usage is present beyond dependency declaration.

Potential false negatives:

- `react-native-video` source usage with dependency version inherited from workspace root may be missed.
- Native video patches are only reported if patch file facts are supplied; no first-class patch scanner exists yet.
- v6 stable can still have app-specific playback/runtime risks, but the pattern intentionally does not match stable v6.

Overlap with other patterns:

- Overlaps with `PATTERN-013` for Android + RN >= 0.71 + `react-native-video <6`.
- Overlaps with `PATTERN-014` because `react-native-video <6` is part of legacy Android annotation-risk package list.
- Overlaps with Media migration area and media package AST usage.

Confidence recommendation:

- Keep current confidence tiers for modernization classification.
- When `PATTERN-013` fires, consider rendering `PATTERN-022` as a lower-priority modernization companion rather than an equal action item.

Recommendation:

- Add de-duplication/grouping so users see one “video modernization/build risk” cluster rather than separate unconnected findings.
- Add patch-file scanner support before relying on patch evidence signals.

## Full Pattern Review

### PATTERN-001: Metro OpenSSL Compatibility

Current confidence logic: default `medium`.

Current actionPriority: `MUST_FIX`.

Potential false positives: Node version is not detected, so projects pinned to Node 14/16 may be warned unnecessarily. OpenSSL handling may exist outside `scripts.start`.

Potential false negatives: Alternative start scripts such as `npx react-native start`, wrapper scripts, or Expo Metro commands may be missed.

Overlap: Overlaps symptomatically with `PATTERN-007`, `PATTERN-011`, and `PATTERN-016` around Metro startup/runtime failures.

Confidence recommendation: Keep `medium` only if Node >=17 is unknown but likely; downgrade to `low` without Node/runtime evidence. Upgrade to `high` only with Node >=17 or known failing environment.

Recommendation: Add Node version/pinning detection before treating this as `MUST_FIX`.

### PATTERN-002: React Navigation Version Mismatch

See focus review above.

### PATTERN-003: React Native DOM Type Conflict

Current confidence logic: default `medium`.

Current actionPriority: `VALIDATE_DURING_MIGRATION`.

Potential false positives: TypeScript plus older RN does not guarantee duplicate DOM globals. No `tsconfig` evidence is inspected.

Potential false negatives: Newer RN projects can still hit DOM conflicts through custom typings or dependency typings.

Overlap: Overlaps with TypeScript readiness warnings and general source/API findings.

Confidence recommendation: Downgrade to `low` unless `tsconfig` includes DOM libs or known conflicting type packages.

Recommendation: Add tsconfig scanner evidence before keeping this in main Known Migration Patterns.

### PATTERN-004: Clipboard Android Manifest Issue

Current confidence logic: default `medium`.

Current actionPriority: `MUST_FIX`.

Potential false positives: Core `Clipboard` API usage can trigger the pattern even before community clipboard is installed. Version-specific manifest risk is not checked.

Potential false negatives: Manifest issue can occur if package is installed but not imported in source and dependency metadata is absent.

Overlap: Overlaps with deprecated API findings for core `Clipboard` and UI/native visual migration areas.

Confidence recommendation: Use `high` only with `@react-native-clipboard/clipboard` version known affected and Android project present. Use `low` for core Clipboard-only evidence.

Recommendation: Split “core Clipboard migration needed” from “clipboard package manifest issue.”

### PATTERN-005: RN 0.68 Boost Podspec Failure

Current confidence logic: default `medium`.

Current actionPriority: `MUST_FIX`.

Potential false positives: RN 0.68 + Podfile does not guarantee stale Boost URL failure.

Potential false negatives: Similar Boost podspec failures may occur outside RN 0.68 depending on mirrors/cache/toolchain state.

Overlap: Always overlaps with `PATTERN-006` because both use RN 0.68 + Podfile trigger.

Confidence recommendation: Keep `medium` as advisory; make `high` only with known bad RN patch version, podspec URL, or pod install log evidence.

Recommendation: Consider grouping with `PATTERN-006` as RN 0.68 iOS dependency/toolchain risk.

### PATTERN-006: RCT-Folly / Xcode 26 Compatibility

Current confidence logic: default `medium`.

Current actionPriority: `MUST_FIX`.

Potential false positives: Xcode version is not detected, so projects not using newer Xcode/libc++ may be warned.

Potential false negatives: Similar C++/Folly failures can occur in other RN versions with newer toolchains.

Overlap: Always overlaps with `PATTERN-005` for RN 0.68 + Podfile.

Confidence recommendation: Downgrade to `low` without Xcode/toolchain evidence; `medium` with RN 0.68 + iOS; `high` with Xcode/new libc++ evidence or build logs.

Recommendation: Add Xcode/toolchain facts or combine with `PATTERN-005`.

### PATTERN-007: React Native Tooling Version Skew

See focus review above.

### PATTERN-008: react-native-permissions iOS Handler Configuration Missing

Current confidence logic: `high` for handler configuration issue; `medium` for Permissions migration area; otherwise `low`.

Current actionPriority: `MUST_FIX`.

Potential false positives: Parser may fail to identify handlers even when setup is valid. Non-standard Podfile setups can look missing.

Potential false negatives: Handlers can be present but incomplete relative to actual permission usage.

Overlap: Overlaps with Permissions migration area and package usage findings.

Confidence recommendation: Keep `high` for missing/empty setup. Treat parser ambiguity as `medium` rather than `high` in a future change.

Recommendation: Compare permission API usage against configured handler list.

### PATTERN-009: RN 0.71 Podfile Configuration Shape Change

Current confidence logic: `high` for explicit legacy config access; `medium` for generic pre-0.71 upgrade context.

Current actionPriority: `MUST_FIX`.

Potential false positives: Generic pre-0.71 upgrades can match even if Podfile is already updated.

Potential false negatives: Other RN 0.71 Podfile shape changes may not involve `config["reactNativePath"]`.

Overlap: Overlaps with iOS baseline/pod readiness warnings and RN 0.71 upgrade planning.

Confidence recommendation: Keep current split, but report medium case as template-review advisory.

Recommendation: Add more Podfile template-drift checks.

### PATTERN-010: react-native-screens Fabric Pod Compatibility Issue

Current confidence logic: `high` when version exists; otherwise `medium`.

Current actionPriority: `MUST_FIX`.

Potential false positives: Detection does not require iOS/Podfile despite pod/Fabric wording.

Potential false negatives: Source-only usage without version does not trigger.

Overlap: Overlaps with `PATTERN-017` for old screens on RN >=0.74 and with navigation migration area.

Confidence recommendation: Require iOS/Podfile for `high`; use `medium` for package-version-only evidence.

Recommendation: Suppress or group with `PATTERN-017` when both screens patterns fire.

### PATTERN-011: Metro/Babel LRU Cache Version Skew

See focus review above.

### PATTERN-012: React Native 0.71 Android Gradle Migration

Current confidence logic: `high` for explicit legacy Gradle constructs; `medium` for old AGP; otherwise `low`.

Current actionPriority: `MUST_FIX`.

Potential false positives: Absence of detected modern Gradle constructs may be scanner limitation in convention-plugin setups.

Potential false negatives: Version catalogs or plugin management can hide old AGP versions.

Overlap: Overlaps with Android library-specific patterns such as `PATTERN-013`, `PATTERN-014`, `PATTERN-015`, and `PATTERN-017`.

Confidence recommendation: Keep high for explicit legacy constructs. Keep absence-only checks low.

Recommendation: Separate explicit legacy evidence from “modern construct not detected” wording.

### PATTERN-013: React Native Video ExoPlayer Resource Resolution Issue

Current confidence logic: `high` when video version exists; otherwise `medium`.

Current actionPriority: `MUST_FIX`.

Potential false positives: `react-native-video <6` does not always mean ExoPlayer resource failure.

Potential false negatives: Android video failures can occur in newer versions due to app-specific configuration.

Overlap: Strong overlap with `PATTERN-014` and `PATTERN-022` for legacy video.

Confidence recommendation: Downgrade to `medium` unless Android/ExoPlayer-specific native evidence or build logs exist.

Recommendation: Group with `PATTERN-022` as a video risk cluster.

### PATTERN-014: Legacy Android Annotation Processor / Typedef Extraction Issue

Current confidence logic: `medium` if AGP version exists; otherwise `low`.

Current actionPriority: `MUST_FIX`.

Potential false positives: Old package version does not prove annotation/typedef task usage. Modern tooling context treats unknown AGP as modern because `!isAndroidGradlePluginOlderThan(...)` is true when comparison is null.

Potential false negatives: Other legacy packages with annotation processors are not in the known list.

Overlap: Overlaps with `PATTERN-013` for video, `PATTERN-015` for camera, and Android Gradle migration pattern `PATTERN-012`.

Confidence recommendation: Keep `low` without explicit AGP >=7.3/RN >=0.71 evidence. Use `medium` for old package plus modern tooling. Use `high` only with actual build.gradle task/config evidence.

Recommendation: Fix unknown AGP handling in a future behavior change.

### PATTERN-015: Unused MLKit Flavor Dependency Issue

Current confidence logic: `high` when camera version exists; otherwise `medium`.

Current actionPriority: `MUST_FIX`.

Potential false positives: Legacy camera package does not prove MLKit flavor is enabled or failing.

Potential false negatives: MLKit dependency issues can appear from other camera/ML packages.

Overlap: Overlaps with `PATTERN-014` for `react-native-camera <4`.

Confidence recommendation: Use `medium` by default; high only with flavor/build.gradle/dependency resolution evidence.

Recommendation: Prefer this more specific pattern over `PATTERN-014` when camera is the only legacy package.

### PATTERN-016: Legacy SVG Transformer Metro Compatibility Issue

Current confidence logic: `high` when Metro config exists; otherwise `medium`.

Current actionPriority: `VALIDATE_DURING_MIGRATION`.

Potential false positives: Metro config presence does not prove it uses the old transformer incorrectly.

Potential false negatives: SVG imports can fail without direct package usage evidence in AST.

Overlap: Overlaps with `PATTERN-007` and `PATTERN-011` around Metro/bundling symptoms.

Confidence recommendation: Use `high` only if Metro config references `react-native-svg-transformer`; otherwise `medium`.

Recommendation: Add Metro config content parsing for SVG transformer setup.

### PATTERN-017: react-native-screens AppCompat Theme Attribute Issue

Current confidence logic: `high` when screens version exists; otherwise `medium`.

Current actionPriority: `MUST_FIX`.

Potential false positives: Threshold `<3.25.0` is conservative; not every version below it fails.

Potential false negatives: AppCompat/resource failures may occur from app theme/config even with newer screens.

Overlap: Overlaps with `PATTERN-010` and Navigation migration area.

Confidence recommendation: Tier confidence: `<3.20` high, `3.20-3.24` medium.

Recommendation: Suppress `PATTERN-010` or group screens findings when both fire.

### PATTERN-018: Native UI Component Missing From UIManager

Current confidence logic: always `high` when matched.

Current actionPriority: `MUST_FIX`.

Potential false positives: Title is generic, but detection is only `react-native-radial-gradient` iOS version range. Package/version evidence does not prove missing UIManager registration.

Potential false negatives: Other native UI components with weak autolinking are not detected.

Overlap: Overlaps with UI/native visual migration area.

Confidence recommendation: Use `medium` unless missing podspec/autolinking or `requireNativeComponent` runtime evidence is detected.

Recommendation: Rename to package-specific pattern or expand detection to generic native UI registration evidence.

### PATTERN-019: Circular Barrel Import Runtime Crash

See focus review above.

### PATTERN-020: RN 0.76+ Android SoLoader Merged Native Library Mapping

Current confidence logic: `high` with legacy init, no mapping, and MainApplication content; `medium` for legacy init; otherwise `low`.

Current actionPriority: `MUST_FIX`.

Potential false positives: Low; this is source evidence-backed. Edge cases may exist for custom SoLoader mapping wrappers.

Potential false negatives: Custom Application classes or unusual Kotlin syntax may be missed.

Overlap: Overlaps with Android runtime risk indicators, but root cause is specific.

Confidence recommendation: Keep current confidence logic.

Recommendation: Add Kotlin/custom Application variants over time.

### PATTERN-022: react-native-video Pre-Release or Legacy Branch Modernization Recommended

See focus review above.

## Overlap Analysis

### Multiple Patterns Triggered By The Same Root Cause

| Root Cause | Patterns | Impact |
|---|---|---|
| RN 0.68 iOS dependency/toolchain risk | `PATTERN-005`, `PATTERN-006` | Both always trigger from RN 0.68 + Podfile, creating duplicate must-fix actions. |
| Old `react-native-screens` | `PATTERN-010`, `PATTERN-017`, `PATTERN-002` | Users may see screens Fabric pod risk, AppCompat theme risk, and generic navigation mismatch together. |
| Legacy `react-native-video` | `PATTERN-013`, `PATTERN-014`, `PATTERN-022` | Android build risk, legacy annotation risk, and modernization advisory can all report one package. |
| Legacy `react-native-camera` | `PATTERN-014`, `PATTERN-015` | Broad annotation risk and specific MLKit flavor risk can duplicate. |
| Metro/runtime bundling problems | `PATTERN-001`, `PATTERN-007`, `PATTERN-011`, `PATTERN-016` | Recommendations can repeat cache/tooling/Metro validation without prioritizing root cause. |
| Large barrels/runtime risk | `PATTERN-019`, Runtime Risk Indicators | Same evidence can appear as a known pattern and runtime indicator. |

### Duplicate Detected Signals

- Android platform/project signals repeat across `PATTERN-012`, `PATTERN-013`, `PATTERN-014`, `PATTERN-015`, `PATTERN-017`, and `PATTERN-020`.
- RN version/upgrade path signals repeat across many RN milestone patterns.
- Package version threshold signals repeat across versioned dependency patterns.

### Confidence Inflation Risks

- `PATTERN-019` can become `high` from large barrels plus migration area count without cycle evidence.
- `PATTERN-018` is always `high` despite package-specific indirect evidence.
- `PATTERN-013`, `PATTERN-015`, and `PATTERN-017` are `high` when dependency version exists, even though version is not proof of failure.
- `PATTERN-002` default `medium` can imply mismatch without version comparison.

### Recommendation Duplication

- Multiple Android patterns recommend Android build/Gradle validation.
- Multiple Metro patterns recommend Metro/Babel/cache validation.
- Video-related patterns recommend package compatibility validation in overlapping ways.
- Navigation findings appear in Known Migration Patterns, risky dependencies, migration areas, and upgrade tasks.

## False Positive Findings

Highest false-positive candidates:

1. `PATTERN-002`: normal navigation dependency sets look like version mismatch.
2. `PATTERN-019`: large barrels look like runtime crash risk.
3. `PATTERN-003`: TypeScript + old RN looks like DOM conflict without tsconfig evidence.
4. `PATTERN-004`: core Clipboard usage looks like package manifest issue.
5. `PATTERN-014`: unknown AGP can act like modern tooling context.
6. `PATTERN-018`: package-specific version range looks like confirmed generic UIManager risk.
7. `PATTERN-011`: lockfile-only `lru-cache` may be unrelated to Metro/Babel resolution.

## False Negative Findings

Highest false-negative candidates:

1. Monorepos/workspaces can hide dependency versions from target package facts.
2. Non-TS/JS source languages can hide source usage evidence.
3. React Navigation v2/v3/v4 mismatch can be missed without package-major comparison.
4. Runtime cycles outside barrels are not detected.
5. Patch-package files are not currently scanned as first-class facts.
6. Custom native modules outside standard folders may be missed.
7. Gradle version catalogs and convention plugins can hide true AGP/tooling versions.

## Confidence Calibration Proposal

| Pattern | Proposed Confidence Calibration |
|---|---|
| `PATTERN-001` | `low` without Node version evidence; `medium` with RN <=0.68 + Metro script; `high` with Node >=17 or known failure. |
| `PATTERN-002` | `low` for companion packages only; `medium` for mixed old/new navigation package families; `high` for explicit incompatible major versions. |
| `PATTERN-003` | `low` unless tsconfig/type package evidence exists. |
| `PATTERN-004` | `low` for core Clipboard-only; `medium` for package installed; `high` for affected manifest/version evidence. |
| `PATTERN-005` | Keep `medium`; `high` only with known bad podspec/log evidence. |
| `PATTERN-006` | `low` without Xcode evidence; `medium` with RN 0.68 + iOS; `high` with Xcode/new libc++ evidence. |
| `PATTERN-007` | `medium` for runtime tooling skew; `low`/informational for eslint-only skew. |
| `PATTERN-008` | Keep `high` for missing/empty setup; `medium` for parser ambiguity. |
| `PATTERN-009` | Keep current `high`/`medium` split. |
| `PATTERN-010` | `high` only with iOS/Podfile and affected version; otherwise `medium`. |
| `PATTERN-011` | `high` for direct incompatible dependency plus old Metro/Babel; `medium` for direct version only; `low` for lockfile-only. |
| `PATTERN-012` | Keep `high` for explicit legacy constructs; absence-only signals should remain `low`. |
| `PATTERN-013` | `medium` by default; `high` only with ExoPlayer/resource/native evidence. |
| `PATTERN-014` | `low` for version-only; `medium` with modern AGP/RN context; `high` with actual legacy task/config evidence. |
| `PATTERN-015` | `medium` by default; `high` with flavor/build.gradle/dependency resolution evidence. |
| `PATTERN-016` | `high` only when Metro config references old SVG transformer; otherwise `medium`. |
| `PATTERN-017` | `high` for very old screens (`<3.20`); `medium` for `3.20-3.24`. |
| `PATTERN-018` | `medium` unless native UI registration/autolinking evidence is directly detected. |
| `PATTERN-019` | `low` for large barrels; `medium` for screen imports from barrels; `high` for confirmed cycles. |
| `PATTERN-020` | Keep current logic. |
| `PATTERN-022` | Keep current tiers, but display as companion/advisory when `PATTERN-013` fires. |

## Proposed Future Changes

Do not implement these in B2; they are proposed follow-ups.

1. Add a pattern grouping layer for shared root causes: Navigation, Screens, Metro, Video, Camera, RN 0.68 iOS, Android Gradle.
2. Add confidence source categories: exact source evidence, config evidence, dependency version evidence, lockfile-only evidence, advisory heuristic.
3. Add version-family comparison for React Navigation packages.
4. Add tsconfig scanning for DOM/type conflict detection.
5. Add patch-package scanner and feed `patchFiles` into pattern facts.
6. Add import graph/cycle detection before high-confidence barrel crash reporting.
7. Fix modern Android tooling context so unknown AGP is not treated as modern AGP.
8. Split lint-only tooling skew from Metro/Babel/codegen runtime tooling skew.
9. De-duplicate `PATTERN-005`/`PATTERN-006` or group them under RN 0.68 iOS validation.
10. Group or suppress overlapping screens/video/camera findings when a more specific pattern already explains the root risk.

## Final Recommendation

For the next behavior-changing milestone, prioritize calibration over new pattern creation. The highest-trust improvement is not more findings; it is fewer duplicate findings with clearer confidence and root-cause grouping.
