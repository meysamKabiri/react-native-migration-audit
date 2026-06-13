# Upgrade Execution Plan

Project: in1bank

## Execution Rule

This plan is for controlled upgrade execution only. Do not execute upgrades automatically, do not modify audited app repositories from the audit tool, and do not combine feature work with migration work.

- Upgrade mode: staged-upgrade
- First milestone: 0.65
- Milestones: 0.65 -> 0.68 -> 0.71 -> 0.74+ -> current stable
- Guidance: validate and commit after each milestone before continuing.

## Action Register

### Must Fix Before Migration

- PATTERN-001: Metro OpenSSL Compatibility (medium confidence) - Use a supported Node version for the RN milestone or add explicit Metro compatibility handling such as NODE_OPTIONS=--openssl-legacy-provider where appropriate.
- PATTERN-004: Clipboard Android Manifest Issue (medium confidence) - Validate Android manifest merge after clipboard migration; if the package version is affected, use a narrow documented patch-package fix rather than broad dependency upgrades.
- PATTERN-005: RN 0.68 Boost Podspec Failure (medium confidence) - During RN 0.68 iOS validation, watch for Boost pod install failures; prefer a narrow documented podspec URL/checksum patch if the upstream archive URL is stale.
- PATTERN-006: RCT-Folly / Xcode 26 Compatibility (medium confidence) - Treat RCT-Folly failures as a scoped iOS toolchain compatibility risk; prefer target-specific Podfile build-setting fixes over broad iOS dependency upgrades.
- PATTERN-008: react-native-permissions iOS Handler Configuration Missing (high confidence) - Verify Podfile contains setup_permissions(...) with all handlers required by the application. Run pod install after changes, clear DerivedData when permission-handler configuration changes, and reinstall the app after permission-handler changes.
- PATTERN-009: RN 0.71 Podfile Configuration Shape Change (high confidence) - Compare Podfile against the RN 0.71 template. Verify use_react_native! arguments and config access patterns.
- PATTERN-010: react-native-screens Fabric Pod Compatibility Issue (high confidence) - Verify react-native-screens version against the target RN milestone. Use a compatible screens version before enabling new architecture features.
- PATTERN-012: React Native 0.71 Android Gradle Migration (high confidence) - Compare Android configuration against the RN 0.71 template. Verify com.facebook.react plugin, react-android dependency usage, Hermes configuration, and Gradle/AGP compatibility.
- PATTERN-014: Legacy Android Annotation Processor / Typedef Extraction Issue (medium confidence) - Inspect Android library build.gradle files for legacy annotation extraction tasks. Compare against modern Android Gradle templates.
- PATTERN-015: Unused MLKit Flavor Dependency Issue (high confidence) - Review react-native-camera flavors. Disable unused MLKit integrations only after verifying required camera features.
- PATTERN-017: react-native-screens AppCompat Theme Attribute Issue (high confidence) - Verify react-native-screens compatibility with the target RN version. Review Android theme and AppCompat dependencies.

### Validate During Migration

- PATTERN-003: React Native DOM Type Conflict (medium confidence) - Review tsconfig lib/types configuration before broad TypeScript fixes; keep RN globals and DOM types intentionally scoped for the migration milestone.

### Plan Later

- PATTERN-019: Circular Barrel Import Runtime Crash (medium confidence) - Avoid importing runtime-sensitive components from large barrel exports. Prefer direct imports for ActionBar, Table, modal components, BLE components, native UI wrappers, and runtime-sensitive screen dependencies. Investigate circular dependency chains involving index.ts/index.tsx barrels.

### Informational

- None detected.

### Known Migration Risks

#### Pattern Groups

##### Android Gradle / Native Build

Android Gradle template, native library, and build compatibility risks.

- PATTERN-012: React Native 0.71 Android Gradle Migration (high confidence, Must Fix Before Migration)
- PATTERN-014: Legacy Android Annotation Processor / Typedef Extraction Issue (medium confidence, Must Fix Before Migration)

##### Barrel Imports

Barrel export and runtime circular dependency risk indicators.

- PATTERN-019: Circular Barrel Import Runtime Crash (medium confidence, Plan Later)

##### Camera

Camera package and native dependency migration risks.

- PATTERN-015: Unused MLKit Flavor Dependency Issue (high confidence, Must Fix Before Migration)

##### Clipboard

Clipboard migration and native package integration risks.

- PATTERN-004: Clipboard Android Manifest Issue (medium confidence, Must Fix Before Migration)

##### iOS Podfile

Podfile template and CocoaPods migration risks.

- PATTERN-009: RN 0.71 Podfile Configuration Shape Change (high confidence, Must Fix Before Migration)

##### Metro / Runtime Tooling

Metro, Babel, bundling, and runtime module-resolution risks.

- PATTERN-001: Metro OpenSSL Compatibility (medium confidence, Must Fix Before Migration)

##### Navigation

React Navigation and native navigation-adjacent compatibility risks.

- PATTERN-010: react-native-screens Fabric Pod Compatibility Issue (high confidence, Must Fix Before Migration)
- PATTERN-017: react-native-screens AppCompat Theme Attribute Issue (high confidence, Must Fix Before Migration)

##### Permissions

Runtime permission handler and platform configuration risks.

- PATTERN-008: react-native-permissions iOS Handler Configuration Missing (high confidence, Must Fix Before Migration)

##### RN 0.68 iOS

RN 0.68 iOS pod install and native toolchain risks.

- PATTERN-005: RN 0.68 Boost Podspec Failure (medium confidence, Must Fix Before Migration)
- PATTERN-006: RCT-Folly / Xcode 26 Compatibility (medium confidence, Must Fix Before Migration)

##### TypeScript

TypeScript and type compatibility risks.

- PATTERN-003: React Native DOM Type Conflict (medium confidence, Validate During Migration)

##### Video Playback

react-native-video modernization, Android build, and playback validation risks.

- PATTERN-014: Legacy Android Annotation Processor / Typedef Extraction Issue (related signal) (medium confidence, Must Fix Before Migration)

#### Detected Risk Actions

- PATTERN-001: Metro OpenSSL Compatibility (Metro / Runtime Tooling, medium confidence) - Use a supported Node version for the RN milestone or add explicit Metro compatibility handling such as NODE_OPTIONS=--openssl-legacy-provider where appropriate.
- PATTERN-003: React Native DOM Type Conflict (TypeScript, medium confidence) - Review tsconfig lib/types configuration before broad TypeScript fixes; keep RN globals and DOM types intentionally scoped for the migration milestone.
- PATTERN-004: Clipboard Android Manifest Issue (Clipboard, medium confidence) - Validate Android manifest merge after clipboard migration; if the package version is affected, use a narrow documented patch-package fix rather than broad dependency upgrades.
- PATTERN-005: RN 0.68 Boost Podspec Failure (RN 0.68 iOS, medium confidence) - During RN 0.68 iOS validation, watch for Boost pod install failures; prefer a narrow documented podspec URL/checksum patch if the upstream archive URL is stale.
- PATTERN-006: RCT-Folly / Xcode 26 Compatibility (RN 0.68 iOS, medium confidence) - Treat RCT-Folly failures as a scoped iOS toolchain compatibility risk; prefer target-specific Podfile build-setting fixes over broad iOS dependency upgrades.
- PATTERN-008: react-native-permissions iOS Handler Configuration Missing (Permissions, high confidence) - Verify Podfile contains setup_permissions(...) with all handlers required by the application. Run pod install after changes, clear DerivedData when permission-handler configuration changes, and reinstall the app after permission-handler changes.
- PATTERN-009: RN 0.71 Podfile Configuration Shape Change (iOS Podfile, high confidence) - Compare Podfile against the RN 0.71 template. Verify use_react_native! arguments and config access patterns.
- PATTERN-010: react-native-screens Fabric Pod Compatibility Issue (Navigation, high confidence) - Verify react-native-screens version against the target RN milestone. Use a compatible screens version before enabling new architecture features.
- PATTERN-012: React Native 0.71 Android Gradle Migration (Android Gradle / Native Build, high confidence) - Compare Android configuration against the RN 0.71 template. Verify com.facebook.react plugin, react-android dependency usage, Hermes configuration, and Gradle/AGP compatibility.
- PATTERN-014: Legacy Android Annotation Processor / Typedef Extraction Issue (Android Gradle / Native Build, medium confidence) - Inspect Android library build.gradle files for legacy annotation extraction tasks. Compare against modern Android Gradle templates.
- PATTERN-015: Unused MLKit Flavor Dependency Issue (Camera, high confidence) - Review react-native-camera flavors. Disable unused MLKit integrations only after verifying required camera features.
- PATTERN-017: react-native-screens AppCompat Theme Attribute Issue (Navigation, high confidence) - Verify react-native-screens compatibility with the target RN version. Review Android theme and AppCompat dependencies.
- PATTERN-019: Circular Barrel Import Runtime Crash (Barrel Imports, medium confidence) - Avoid importing runtime-sensitive components from large barrel exports. Prefer direct imports for ActionBar, Table, modal components, BLE components, native UI wrappers, and runtime-sensitive screen dependencies. Investigate circular dependency chains involving index.ts/index.tsx barrels.

## Baseline Gate

- Status: NOT-READY
- Summary: Baseline is not ready for immediate migration. Resolve or explicitly plan the blockers before asking Codex to change dependencies or native files.
- Instruction: Do not start dependency or React Native version changes until blockers are resolved or explicitly accepted in writing.

### Blockers

- Do not start migration immediately. Create a staged upgrade plan for this old React Native baseline first.
- Do not start migration immediately. Review critical blockers and prepare a staged rescue plan first.
- Do not start broad migration changes until custom native modules are reviewed and assigned explicit bridge tasks.
- Do not start migration immediately. Plan Android Gradle Plugin and Gradle upgrades as controlled native tooling tasks.

### Warnings

- None detected.

### Required Actions

- Do not start migration immediately. Create a staged upgrade plan for this old React Native baseline first.
- Do not start migration immediately. Review critical blockers and prepare a staged rescue plan first.
- Do not start broad migration changes until custom native modules are reviewed and assigned explicit bridge tasks.
- Do not start migration immediately. Plan Android Gradle Plugin and Gradle upgrades as controlled native tooling tasks.

## Upgrade Stages

### Stage 0 - Baseline Reproduction

Goal: prove the existing app state before dependency or native changes.

- Start from a clean migration branch.
- Run install and all available validation commands.
- Document missing local iOS or Android environments instead of skipping silently.
- Stop if baseline failures are unexplained.

### Stage 1 - Package Manager And Dependency Preparation

Goal: stabilize install behavior and identify packages that need isolated treatment.

- Use yarn consistently and avoid package-manager switching.
- Lockfiles: yarn.lock.
- react-native-reanimated 1.13.0 - Verify Babel config and upgrade Reanimated according to target RN version.
- react-native-gesture-handler 1.7.0 - Check compatibility with current React Navigation and target React Native version.
- react-native-screens 2.10.1 - Verify navigation behavior after upgrade on both iOS and Android.
- @react-native-firebase/app 14.9.0 - Check Firebase package versions, Pods, Gradle setup, and platform config files.
- react-native-vector-icons 7.0.0 - Verify font linking and icon rendering after upgrade.
- react-native-webview 10.3.3 - Check WebView compatibility and manually test screens using WebView.

### Stage 2 - React Native Upgrade Milestones

Goal: apply the React Native upgrade in controlled milestones.

- Upgrade mode: staged-upgrade
- First milestone: 0.65
- Milestones: 0.65 -> 0.68 -> 0.71 -> 0.74+ -> current stable
- Guidance: validate and commit after each milestone before continuing.

Rules:

- Change React Native, React, Metro, Babel, and template-linked files together only when required by the milestone.
- Do not upgrade unrelated application dependencies in the same change set.
- Run validation after each milestone and commit only after the milestone is understood.
- For modern projects, prefer current stable / minor update only language and avoid unnecessary legacy staged hops.

## Milestone Execution Templates

### Stage 2A — Upgrade React Native 0.63.3 → 0.65

#### Goal

Upgrade React Native from 0.63.3 to 0.65 with the smallest safe set of framework, tooling, native template, and directly required dependency changes.

#### Allowed changes

- React Native version changes required for 0.65.
- React version changes if required by the React Native milestone.
- Metro, Babel, and Jest package/config changes if required by the milestone.
- Android and iOS template-aligned changes if required by the official upgrade diff.
- Dependency compatibility fixes directly required for this milestone.

#### Forbidden changes

- Do not refactor unrelated app code.
- Do not redesign UI.
- Do not change business logic unless required by migration.
- Do not upgrade unrelated packages.
- Do not jump to a later milestone.
- Do not silence TypeScript errors without explanation.
- Do not continue if Android/iOS build failures are unclear.

#### Files to inspect

- package.json
- yarn.lock
- metro.config.js
- babel.config.js
- Jest configuration if present
- android/build.gradle
- android/app/build.gradle
- android/gradle/wrapper/gradle-wrapper.properties
- ios/Podfile
- ios/Podfile.lock
- index.js, index.ts, App.js, App.tsx

#### Implementation guidance

- Inspect the official React Native upgrade diff for 0.63.3 to 0.65 before editing.
- Compare native template changes before editing Android or iOS files.
- Update framework and package versions minimally for this milestone only.
- Run yarn install after package changes.
- Resolve Android and iOS build errors in isolated commits when native changes are required.
- Document blockers instead of guessing when the upgrade diff or native build failure is unclear.

#### Validation commands

- yarn install
- yarn tsc
- yarn lint
- yarn test
- yarn android - Run if the local native environment is available. Otherwise document the required environment.
- yarn ios - Run if the local native environment is available. Otherwise document the required environment.

#### Success criteria

- React Native is upgraded to 0.65 for this milestone only.
- Install completes and lockfile changes are understood.
- Available typecheck, lint, and test commands pass or have documented migration blockers.
- Available Android and iOS commands pass when local native environments are available, or environment blockers are documented.
- No broad unrelated app code, UI, or business-logic changes are included.

#### Commit checkpoint

```bash
git add .
git commit -m "Upgrade React Native from 0.63.3 to 0.65"
```

#### Stop conditions

- Install fails for unexplained reasons.
- Lockfile changes unexpectedly.
- Android build errors are unclear.
- iOS build errors are unclear.
- Broad unrelated files change.
- App behavior cannot be verified.

### Stage 2B — Upgrade React Native 0.65 → 0.68

#### Goal

Upgrade React Native from 0.65 to 0.68 with the smallest safe set of framework, tooling, native template, and directly required dependency changes.

#### Allowed changes

- React Native version changes required for 0.68.
- React version changes if required by the React Native milestone.
- Metro, Babel, and Jest package/config changes if required by the milestone.
- Android and iOS template-aligned changes if required by the official upgrade diff.
- Dependency compatibility fixes directly required for this milestone.

#### Forbidden changes

- Do not refactor unrelated app code.
- Do not redesign UI.
- Do not change business logic unless required by migration.
- Do not upgrade unrelated packages.
- Do not jump to a later milestone.
- Do not silence TypeScript errors without explanation.
- Do not continue if Android/iOS build failures are unclear.

#### Files to inspect

- package.json
- yarn.lock
- metro.config.js
- babel.config.js
- Jest configuration if present
- android/build.gradle
- android/app/build.gradle
- android/gradle/wrapper/gradle-wrapper.properties
- ios/Podfile
- ios/Podfile.lock
- index.js, index.ts, App.js, App.tsx

#### Implementation guidance

- Inspect the official React Native upgrade diff for 0.65 to 0.68 before editing.
- Compare native template changes before editing Android or iOS files.
- Update framework and package versions minimally for this milestone only.
- Run yarn install after package changes.
- Resolve Android and iOS build errors in isolated commits when native changes are required.
- Document blockers instead of guessing when the upgrade diff or native build failure is unclear.

#### Validation commands

- yarn install
- yarn tsc
- yarn lint
- yarn test
- yarn android - Run if the local native environment is available. Otherwise document the required environment.
- yarn ios - Run if the local native environment is available. Otherwise document the required environment.

#### Success criteria

- React Native is upgraded to 0.68 for this milestone only.
- Install completes and lockfile changes are understood.
- Available typecheck, lint, and test commands pass or have documented migration blockers.
- Available Android and iOS commands pass when local native environments are available, or environment blockers are documented.
- No broad unrelated app code, UI, or business-logic changes are included.

#### Commit checkpoint

```bash
git add .
git commit -m "Upgrade React Native from 0.65 to 0.68"
```

#### Stop conditions

- Install fails for unexplained reasons.
- Lockfile changes unexpectedly.
- Android build errors are unclear.
- iOS build errors are unclear.
- Broad unrelated files change.
- App behavior cannot be verified.

### Stage 2C — Upgrade React Native 0.68 → 0.71

#### Goal

Upgrade React Native from 0.68 to 0.71 with the smallest safe set of framework, tooling, native template, and directly required dependency changes.

#### Allowed changes

- React Native version changes required for 0.71.
- React version changes if required by the React Native milestone.
- Metro, Babel, and Jest package/config changes if required by the milestone.
- Android and iOS template-aligned changes if required by the official upgrade diff.
- Dependency compatibility fixes directly required for this milestone.

#### Forbidden changes

- Do not refactor unrelated app code.
- Do not redesign UI.
- Do not change business logic unless required by migration.
- Do not upgrade unrelated packages.
- Do not jump to a later milestone.
- Do not silence TypeScript errors without explanation.
- Do not continue if Android/iOS build failures are unclear.

#### Files to inspect

- package.json
- yarn.lock
- metro.config.js
- babel.config.js
- Jest configuration if present
- android/build.gradle
- android/app/build.gradle
- android/gradle/wrapper/gradle-wrapper.properties
- ios/Podfile
- ios/Podfile.lock
- index.js, index.ts, App.js, App.tsx

#### Implementation guidance

- Inspect the official React Native upgrade diff for 0.68 to 0.71 before editing.
- Compare native template changes before editing Android or iOS files.
- Update framework and package versions minimally for this milestone only.
- Run yarn install after package changes.
- Resolve Android and iOS build errors in isolated commits when native changes are required.
- Document blockers instead of guessing when the upgrade diff or native build failure is unclear.

#### Validation commands

- yarn install
- yarn tsc
- yarn lint
- yarn test
- yarn android - Run if the local native environment is available. Otherwise document the required environment.
- yarn ios - Run if the local native environment is available. Otherwise document the required environment.

#### Success criteria

- React Native is upgraded to 0.71 for this milestone only.
- Install completes and lockfile changes are understood.
- Available typecheck, lint, and test commands pass or have documented migration blockers.
- Available Android and iOS commands pass when local native environments are available, or environment blockers are documented.
- No broad unrelated app code, UI, or business-logic changes are included.

#### Commit checkpoint

```bash
git add .
git commit -m "Upgrade React Native from 0.68 to 0.71"
```

#### Stop conditions

- Install fails for unexplained reasons.
- Lockfile changes unexpectedly.
- Android build errors are unclear.
- iOS build errors are unclear.
- Broad unrelated files change.
- App behavior cannot be verified.

### Stage 2D — Upgrade React Native 0.71 → 0.74+

#### Goal

Upgrade React Native from 0.71 to 0.74+ with the smallest safe set of framework, tooling, native template, and directly required dependency changes.

#### Allowed changes

- React Native version changes required for 0.74+.
- React version changes if required by the React Native milestone.
- Metro, Babel, and Jest package/config changes if required by the milestone.
- Android and iOS template-aligned changes if required by the official upgrade diff.
- Dependency compatibility fixes directly required for this milestone.

#### Forbidden changes

- Do not refactor unrelated app code.
- Do not redesign UI.
- Do not change business logic unless required by migration.
- Do not upgrade unrelated packages.
- Do not jump to a later milestone.
- Do not silence TypeScript errors without explanation.
- Do not continue if Android/iOS build failures are unclear.

#### Files to inspect

- package.json
- yarn.lock
- metro.config.js
- babel.config.js
- Jest configuration if present
- android/build.gradle
- android/app/build.gradle
- android/gradle/wrapper/gradle-wrapper.properties
- ios/Podfile
- ios/Podfile.lock
- index.js, index.ts, App.js, App.tsx

#### Implementation guidance

- Inspect the official React Native upgrade diff for 0.71 to 0.74+ before editing.
- Compare native template changes before editing Android or iOS files.
- Update framework and package versions minimally for this milestone only.
- Run yarn install after package changes.
- Resolve Android and iOS build errors in isolated commits when native changes are required.
- Document blockers instead of guessing when the upgrade diff or native build failure is unclear.

#### Validation commands

- yarn install
- yarn tsc
- yarn lint
- yarn test
- yarn android - Run if the local native environment is available. Otherwise document the required environment.
- yarn ios - Run if the local native environment is available. Otherwise document the required environment.

#### Success criteria

- React Native is upgraded to 0.74+ for this milestone only.
- Install completes and lockfile changes are understood.
- Available typecheck, lint, and test commands pass or have documented migration blockers.
- Available Android and iOS commands pass when local native environments are available, or environment blockers are documented.
- No broad unrelated app code, UI, or business-logic changes are included.

#### Commit checkpoint

```bash
git add .
git commit -m "Apply React Native minor upgrade milestone"
```

#### Stop conditions

- Install fails for unexplained reasons.
- Lockfile changes unexpectedly.
- Android build errors are unclear.
- iOS build errors are unclear.
- Broad unrelated files change.
- App behavior cannot be verified.

### Stage 2E — Upgrade React Native 0.74+ → current stable

#### Goal

Upgrade React Native from 0.74+ to current stable with the smallest safe set of framework, tooling, native template, and directly required dependency changes.

#### Allowed changes

- React Native version changes required for current stable.
- React version changes if required by the React Native milestone.
- Metro, Babel, and Jest package/config changes if required by the milestone.
- Android and iOS template-aligned changes if required by the official upgrade diff.
- Dependency compatibility fixes directly required for this milestone.

#### Forbidden changes

- Do not refactor unrelated app code.
- Do not redesign UI.
- Do not change business logic unless required by migration.
- Do not upgrade unrelated packages.
- Do not jump to a later milestone.
- Do not silence TypeScript errors without explanation.
- Do not continue if Android/iOS build failures are unclear.

#### Files to inspect

- package.json
- yarn.lock
- metro.config.js
- babel.config.js
- Jest configuration if present
- android/build.gradle
- android/app/build.gradle
- android/gradle/wrapper/gradle-wrapper.properties
- ios/Podfile
- ios/Podfile.lock
- index.js, index.ts, App.js, App.tsx

#### Implementation guidance

- Inspect the official React Native upgrade diff for 0.74+ to current stable before editing.
- Compare native template changes before editing Android or iOS files.
- Update framework and package versions minimally for this milestone only.
- Run yarn install after package changes.
- Resolve Android and iOS build errors in isolated commits when native changes are required.
- Document blockers instead of guessing when the upgrade diff or native build failure is unclear.

#### Validation commands

- yarn install
- yarn tsc
- yarn lint
- yarn test
- yarn android - Run if the local native environment is available. Otherwise document the required environment.
- yarn ios - Run if the local native environment is available. Otherwise document the required environment.

#### Success criteria

- React Native is upgraded to current stable for this milestone only.
- Install completes and lockfile changes are understood.
- Available typecheck, lint, and test commands pass or have documented migration blockers.
- Available Android and iOS commands pass when local native environments are available, or environment blockers are documented.
- No broad unrelated app code, UI, or business-logic changes are included.

#### Commit checkpoint

```bash
git add .
git commit -m "Apply React Native minor upgrade milestone"
```

#### Stop conditions

- Install fails for unexplained reasons.
- Lockfile changes unexpectedly.
- Android build errors are unclear.
- iOS build errors are unclear.
- Broad unrelated files change.
- App behavior cannot be verified.

### Stage 3 - Android Native Tooling

Goal: validate Android native compatibility when Android is present.

- Android folder detected; review Gradle, Android Gradle Plugin, app build.gradle, Kotlin, and RN template diffs.
- Android Gradle Plugin: 4.0.1.
- Gradle: 6.2.
- Android script detected; run it when the local Android environment is available.

### Stage 4 - iOS Native Tooling

Goal: validate iOS native compatibility when iOS is present.

- iOS folder detected; review Podfile, CocoaPods behavior, native template diffs, and Xcode build settings.
- Podfile use_frameworks!: no.
- iOS script detected; run it when the local iOS environment is available.

### Stage 5 - Native Modules And Migration-Sensitive Areas

Goal: verify native bridge compatibility and app areas most likely to break.

Native module caution: custom native module groups were detected. Treat native bridge compatibility as a stop/go gate before moving between milestones.

- CloseApp: android, ios (high); files: android/app/src/main/java/au/com/in1bank/mobile/CloseApp.java, android/app/src/main/java/au/com/in1bank/mobile/CloseAppPackage.java, ios/in1bank/CloseApp.m
- QRCodeDecoder: android, ios (high); files: android/app/src/main/java/au/com/in1bank/mobile/QRCodeDecoder.java, android/app/src/main/java/au/com/in1bank/mobile/QRCodeDecoderPackage.java, ios/in1bank/QRCodeDecoder.m

Migration-sensitive areas:

- Camera (high): react-native-camera. Review camera package maintenance status, native setup, permissions, and runtime behavior on both platforms.
- Navigation (medium): @react-navigation/core, @react-navigation/native, @react-navigation/stack, react-native-gesture-handler. Verify navigation flows, modals, gestures, tabs, and stack transitions after each upgrade stage.
- Authentication SDKs (medium): @react-native-firebase/crashlytics, @react-native-firebase/messaging. Verify native SDK setup, URL schemes, app credentials, Android/iOS configuration, and login callbacks.
- Permissions (medium): react-native-permissions. Verify AndroidManifest, Info.plist, permission prompts, and runtime behavior after upgrade.
- UI / Native Visual Components (medium): @react-native-picker/picker, react-native-document-picker, react-native-image-crop-picker, react-native-vector-icons. Run visual smoke tests on screens using native UI components after each upgrade stage.

### Stage 6 - Final Verification And Release Readiness

Goal: produce a reviewable upgraded state with documented residual risk.

- Run all available validation commands.
- Complete manual smoke tests for migration-sensitive areas.
- Document unresolved failures, environment gaps, and rollback notes.
- Prepare a final release-readiness summary before handing off for human review.

## Codex Execution Rules

- Inspect files before editing.
- Make the smallest migration-related change possible.
- Do not refactor unrelated app code.
- Do not remove code only to make validation pass unless the removal is clearly part of the migration.
- Do not continue to the next stage after unexplained validation failures.
- If the native upgrade path is unclear, stop and document the blocker instead of guessing.

## Validation Commands

- yarn install
- yarn tsc
- yarn lint
- yarn test
- yarn android
- yarn ios

## Commit Strategy

- Commit Stage 0 baseline documentation separately.
- Commit each React Native milestone separately.
- Commit Android and iOS native fixes separately when possible.
- Commit risky dependency compatibility fixes separately from framework version changes.
- Commit final verification documentation separately.

## Stop Conditions

- Baseline cannot be reproduced or accepted.
- Package install changes lockfiles in an unexplained way.
- React Native milestone produces broad unrelated diffs.
- Android or iOS native build errors are not understood.
- Custom native module compatibility is unclear.
- Validation commands fail without an understood cause.