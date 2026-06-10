# Upgrade Execution Plan

Project: fastpong

## Execution Rule

This plan is for controlled upgrade execution only. Do not execute upgrades automatically, do not modify audited app repositories from the audit tool, and do not combine feature work with migration work.

- Upgrade mode: staged-upgrade
- First milestone: 0.65
- Milestones: 0.65 -> 0.68 -> 0.71 -> 0.74+ -> current stable
- Guidance: validate and commit after each milestone before continuing.

## Baseline Gate

- Status: NOT-READY
- Summary: Baseline is not ready for immediate migration. Resolve or explicitly plan the blockers before asking Codex to change dependencies or native files.
- Instruction: Do not start dependency or React Native version changes until blockers are resolved or explicitly accepted in writing.

### Blockers

- Do not start migration immediately. Create a staged upgrade plan for this old React Native baseline first.
- Do not start migration immediately. Review critical blockers and prepare a staged rescue plan first.
- Do not start migration immediately. Plan Android Gradle Plugin and Gradle upgrades as controlled native tooling tasks.

### Warnings

- None detected.

### Required Actions

- Do not start migration immediately. Create a staged upgrade plan for this old React Native baseline first.
- Do not start migration immediately. Review critical blockers and prepare a staged rescue plan first.
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
- react-native-gesture-handler ^2.3.2 - Check compatibility with current React Navigation and target React Native version.
- react-native-screens ^3.13.1 - Verify navigation behavior after upgrade on both iOS and Android.
- react-native-vector-icons ^10.2.0 - Verify font linking and icon rendering after upgrade.
- react-native-webview ^11.22.6 - Check WebView compatibility and manually test screens using WebView.

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

### Stage 3 - Android Native Tooling

Goal: validate Android native compatibility when Android is present.

- Android folder detected; review Gradle, Android Gradle Plugin, app build.gradle, Kotlin, and RN template diffs.
- Android Gradle Plugin: 4.2.2.
- Gradle: 7.2.
- Android script detected; run it when the local Android environment is available.

### Stage 4 - iOS Native Tooling

Goal: validate iOS native compatibility when iOS is present.

- iOS folder detected; review Podfile, CocoaPods behavior, native template diffs, and Xcode build settings.
- Podfile use_frameworks!: no.
- iOS script detected; run it when the local iOS environment is available.

### Stage 5 - Native Modules And Migration-Sensitive Areas

Goal: verify native bridge compatibility and app areas most likely to break.

No custom native module groups were detected. Still review native template diffs and build output after each upgrade milestone.

Migration-sensitive areas:

- Camera (high): react-native-camera. Review camera package maintenance status, native setup, permissions, and runtime behavior on both platforms.
- Bluetooth (high): react-native-ble-plx, react-native-bluetooth-state-manager. Verify Bluetooth permissions, pairing/scanning behavior, background behavior, and native package compatibility.
- Navigation (medium): @react-navigation/bottom-tabs, @react-navigation/native, @react-navigation/stack, react-native-gesture-handler. Verify navigation flows, modals, gestures, tabs, and stack transitions after each upgrade stage.
- Authentication SDKs (medium): @react-native-google-signin/google-signin, @react-native-seoul/kakao-login, react-native-fbsdk-next. Verify native SDK setup, URL schemes, app credentials, Android/iOS configuration, and login callbacks.
- Media (medium): react-native-media-controls, react-native-sound, react-native-video. Test video/audio playback, permissions, background behavior, and native configuration after upgrade.
- Permissions (medium): react-native-permissions. Verify AndroidManifest, Info.plist, permission prompts, and runtime behavior after upgrade.
- UI / Native Visual Components (medium): @react-native-picker/picker, react-native-chart-kit, react-native-icomoon, react-native-linear-gradient, react-native-radial-gradient, react-native-vector-icons, react-native-view-shot, react-native-wheel-picker-android. Run visual smoke tests on screens using native UI components after each upgrade stage.
- Storage (low): @react-native-async-storage/async-storage. Verify stored data migration, persistence behavior, and native package compatibility.

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