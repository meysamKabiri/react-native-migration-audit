# React Native Migration Strategy

Project: walletTourist

## Strategy Summary

Start with baseline stabilization. Do not perform React Native version changes until blockers are resolved or explicitly accepted.

- Workflow: bare-react-native
- Current React Native: ^0.82.0
- Overall risk level: HIGH
- Package manager: npm
- Native platform phase required: Yes

## Baseline Readiness

- Status: NOT-READY
- Summary: Baseline is not ready for immediate migration. Resolve or explicitly plan the blockers before asking Codex to change dependencies or native files.
- Guidance: Do not begin the React Native upgrade yet. Resolve or explicitly accept baseline blockers first, document baseline command failures, and create a clean migration branch.

### Baseline Blockers

- Do not start broad migration changes until custom native modules are reviewed and assigned explicit bridge tasks.

### Baseline Warnings

- Add or document a typecheck command so migration type regressions are visible.

## Recommended Upgrade Path

- Strategy: modern-upgrade
- Target/path: current stable
- Note: This project is already on a relatively modern React Native version. Upgrade risk depends mostly on native modules, Expo compatibility, and build tooling.

Do not hardcode a newer target than the audit recommendation. Follow the staged path and validate after each milestone.

## Migration Phases

### Phase 0 — Baseline Stabilization

Goal: reproduce the current baseline before changing dependencies or native files.

Do not begin the React Native upgrade yet. Resolve or accept baseline blockers first, document baseline command failures, and create a clean migration branch.

Focus:

- Confirm current dependency install status and lockfile behavior.
- Run or document typecheck, test, and lint baseline commands.
- Run Android and iOS build baselines when local environments are available.
- Inspect git status and create a clean migration branch.
- Document any baseline command failures before proceeding.

Available validation script signals:

- Typecheck script: missing
- Lint script: present
- Test script: present
- Android script: present
- iOS script: present

### Phase 1 — Dependency & Tooling Preparation

Goal: prepare dependencies and native build tooling before React Native version changes.

Focus:

- Use package manager: npm.
- Review lockfile consistency and avoid switching package managers.
- 5 risky dependency package(s) require staged review.
- Android Gradle Plugin: not detected; Gradle: 9.0.0.
- Podfile present: yes; use_frameworks!: yes.
- Add or document missing validation scripts before relying on Codex changes.

Risky dependency review list:

- react-native-reanimated ^4.1.3 - Verify Babel config and upgrade Reanimated according to target RN version.
- react-native-gesture-handler ^2.29.1 - Check compatibility with current React Navigation and target React Native version.
- react-native-screens ^4.17.1 - Verify navigation behavior after upgrade on both iOS and Android.
- react-native-vector-icons ^10.3.0 - Verify font linking and icon rendering after upgrade.
- react-native-webview ^13.16.0 - Check WebView compatibility and manually test screens using WebView.

### Phase 2 — React Native Version Upgrade

Goal: apply the recommended React Native upgrade path in controlled stages.

Focus:

- Follow the audit upgrade recommendation instead of jumping directly to latest React Native.
- For old RN baselines, validate after each milestone before moving to the next one.
- Keep React Native, React, Metro, Babel, and native template changes grouped and reviewable.
- Do not upgrade unrelated application dependencies in the same change set.
- Stop if validation failures cannot be explained.

### Phase 3 — Native Platform Migration

Focus areas:

- Android native diffs, Gradle files, Android app build.gradle, and Android validation.
- iOS native diffs, Podfile, CocoaPods install behavior, and iOS validation.
- Custom native modules and bridge compatibility must be reviewed before broad upgrade changes.

Custom native module summary:

- T2PDeepGuard: android, ios (medium); files: android/app/src/main/java/com/bitazza/touristwallet/T2PDeepGuardPackage.kt, ios/T2PDeepGuardModule.swift
- T2PKYC: android, ios (medium); files: android/app/src/main/java/com/bitazza/touristwallet/T2PKYCPackage.kt, ios/T2PKYCModule.swift

### Phase 4 — Migration-Sensitive Area Verification

Goal: verify app areas most likely to break after React Native and native dependency changes.

Migration-sensitive areas from the audit:

- Camera (high): @react-native-camera-roll/camera-roll, react-native-vision-camera. Review camera package maintenance status, native setup, permissions, and runtime behavior on both platforms.
- Navigation (medium): @react-navigation/bottom-tabs, @react-navigation/elements, @react-navigation/native, @react-navigation/native-stack, react-native-gesture-handler. Verify navigation flows, modals, gestures, tabs, and stack transitions after each upgrade stage.
- UI / Native Visual Components (medium): @react-native-vector-icons/fontawesome, @react-native-vector-icons/fontawesome6, react-native-image-picker, react-native-vector-icons, react-native-view-shot, react-native-webview. Run visual smoke tests on screens using native UI components after each upgrade stage.
- Storage (low): @react-native-async-storage/async-storage. Verify stored data migration, persistence behavior, and native package compatibility.

### Phase 5 — Final Verification & Release Readiness

Goal: confirm the upgraded app is ready for human review and release planning.

Focus:

- Run all available validation scripts and document any missing checks.
- Build Android when the local Android environment is available.
- Build iOS and run CocoaPods validation when the local iOS environment is available.
- Complete manual smoke tests for migration-sensitive areas.
- Prepare a release risk summary with unresolved issues and rollback notes.
- Do not promise migration success until validation is complete and reviewed.

## Key Risks To Manage

- Bare React Native Project (high, react-native): Bare React Native projects have higher upgrade risk because iOS and Android native projects must be migrated too.
- Risky Native Dependencies (high, dependency): 5 risky native/dependency packages detected. Review compatibility before upgrading.
- Custom Native Module Patterns Detected (high, react-native): 2 custom native module group(s) detected in iOS/Android source files. These should be manually reviewed before migration.
- High-Risk Migration Areas Detected (high, dependency): 1 high-risk migration area(s) detected: Camera.
- Missing Typecheck Script (medium, typescript): No typecheck script found. TypeScript migration issues may be harder to catch automatically.
- Podfile Uses use_frameworks! (medium, ios): Podfile uses use_frameworks!. This can increase iOS dependency compatibility risk during upgrades.
- Baseline readiness blocker: Do not start broad migration changes until custom native modules are reviewed and assigned explicit bridge tasks.
- Custom native module group: T2PDeepGuard (android, ios)
- Custom native module group: T2PKYC (android, ios)
- Migration-sensitive area: Camera (high)
- Migration-sensitive area: Navigation (medium)
- Migration-sensitive area: UI / Native Visual Components (medium)
- Migration-sensitive area: Storage (low)
- Risky dependency: react-native-reanimated ^4.1.3 - Verify Babel config and upgrade Reanimated according to target RN version.
- Risky dependency: react-native-gesture-handler ^2.29.1 - Check compatibility with current React Navigation and target React Native version.
- Risky dependency: react-native-screens ^4.17.1 - Verify navigation behavior after upgrade on both iOS and Android.
- Risky dependency: react-native-vector-icons ^10.3.0 - Verify font linking and icon rendering after upgrade.
- Risky dependency: react-native-webview ^13.16.0 - Check WebView compatibility and manually test screens using WebView.

## Stop Conditions

- Baseline cannot be reproduced.
- Package install is unstable or lockfile changes are not understood.
- Android or iOS native build errors are unclear.
- Custom native module behavior is unclear.
- Validation commands fail without an understood cause.
- Codex suggests broad rewrites or unrelated refactors.

## Suggested Commit Strategy

- Use one commit per phase when changes are small and coherent.
- Use one commit per dependency group when dependency changes are isolated.
- Use one commit per native platform fix for Android or iOS changes.
- Use one commit per migration-sensitive area when behavior fixes are needed.
- Use a final verification commit for documentation and release readiness notes.