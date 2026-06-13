# React Native Migration Strategy

Project: in1bank

## Strategy Summary

Start with baseline stabilization. Do not perform React Native version changes until blockers are resolved or explicitly accepted.

- Workflow: bare-react-native
- Current React Native: 0.63.3
- Overall risk level: CRITICAL
- Package manager: yarn
- Lockfiles: yarn.lock
- Mixed lockfiles: No
- Native platform phase required: Yes

## Baseline Readiness

- Status: NOT-READY
- Summary: Baseline is not ready for immediate migration. Resolve or explicitly plan the blockers before asking Codex to change dependencies or native files.
- Guidance: Do not begin the React Native upgrade yet. Resolve or explicitly accept baseline blockers first, document baseline command failures, and create a clean migration branch.

### Baseline Blockers

- Do not start migration immediately. Create a staged upgrade plan for this old React Native baseline first.
- Do not start migration immediately. Review critical blockers and prepare a staged rescue plan first.
- Do not start broad migration changes until custom native modules are reviewed and assigned explicit bridge tasks.
- Do not start migration immediately. Plan Android Gradle Plugin and Gradle upgrades as controlled native tooling tasks.

### Baseline Warnings

- None detected.

## Recommended Upgrade Path

- Strategy: staged-upgrade
- Target/path: 0.65 → 0.68 → 0.71 → 0.74+ → current stable
- Note: This is an older React Native project. A direct jump is not recommended; use staged upgrades and verify iOS and Android builds at each milestone.

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

- Typecheck script: present (tsc)
- Lint script: present
- Test script: present
- Android script: present
- iOS script: present

### Phase 1 — Dependency & Tooling Preparation

Goal: prepare dependencies and native build tooling before React Native version changes.

Focus:

- Use package manager: yarn.
- Review lockfile consistency and avoid switching package managers.
- 6 risky dependency package(s) require staged review.
- Android Gradle Plugin: 4.0.1; Gradle: 6.2.
- Podfile present: yes; use_frameworks!: no.
- Add or document missing validation scripts before relying on Codex changes.

Risky dependency review list:

- react-native-reanimated 1.13.0 - Verify Babel config and upgrade Reanimated according to target RN version.
- react-native-gesture-handler 1.7.0 - Check compatibility with current React Navigation and target React Native version.
- react-native-screens 2.10.1 - Verify navigation behavior after upgrade on both iOS and Android.
- @react-native-firebase/app 14.9.0 - Check Firebase package versions, Pods, Gradle setup, and platform config files.
- react-native-vector-icons 7.0.0 - Verify font linking and icon rendering after upgrade.
- react-native-webview 10.3.3 - Check WebView compatibility and manually test screens using WebView.

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

- CloseApp: android, ios (high); files: android/app/src/main/java/au/com/in1bank/mobile/CloseApp.java, android/app/src/main/java/au/com/in1bank/mobile/CloseAppPackage.java, ios/in1bank/CloseApp.m
- QRCodeDecoder: android, ios (high); files: android/app/src/main/java/au/com/in1bank/mobile/QRCodeDecoder.java, android/app/src/main/java/au/com/in1bank/mobile/QRCodeDecoderPackage.java, ios/in1bank/QRCodeDecoder.m

### Phase 4 — Migration-Sensitive Area Verification

Goal: verify app areas most likely to break after React Native and native dependency changes.

Migration-sensitive areas from the audit:

- Camera (high): react-native-camera. Review camera package maintenance status, native setup, permissions, and runtime behavior on both platforms.
- Navigation (medium): @react-navigation/core, @react-navigation/native, @react-navigation/stack, react-native-gesture-handler. Verify navigation flows, modals, gestures, tabs, and stack transitions after each upgrade stage.
- Authentication SDKs (medium): @react-native-firebase/crashlytics, @react-native-firebase/messaging. Verify native SDK setup, URL schemes, app credentials, Android/iOS configuration, and login callbacks.
- Permissions (medium): react-native-permissions. Verify AndroidManifest, Info.plist, permission prompts, and runtime behavior after upgrade.
- UI / Native Visual Components (medium): @react-native-picker/picker, react-native-document-picker, react-native-image-crop-picker, react-native-vector-icons. Run visual smoke tests on screens using native UI components after each upgrade stage.

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

- Old React Native Version (critical, react-native): React Native 0.63.x is significantly behind modern releases and will likely require staged upgrades, dependency updates, and native iOS/Android changes.
- Bare React Native Project (high, react-native): Bare React Native projects have higher upgrade risk because iOS and Android native projects must be migrated too.
- Old React Version (high, react-native): React 16 detected. Modern React Native versions require newer React versions, so React upgrade risk exists.
- Risky Native Dependencies (high, dependency): 6 risky native/dependency packages detected. Review compatibility before upgrading.
- Old Android Gradle Plugin (high, android): Android Gradle Plugin 4.0.1 detected. Modern React Native upgrades may require Android Gradle Plugin 7+ or 8+.
- Old Gradle Version (high, android): Gradle 6.2 detected. Android build tooling is old and may need staged upgrades.
- Baseline readiness blocker: Do not start migration immediately. Create a staged upgrade plan for this old React Native baseline first.
- Baseline readiness blocker: Do not start migration immediately. Review critical blockers and prepare a staged rescue plan first.
- Baseline readiness blocker: Do not start broad migration changes until custom native modules are reviewed and assigned explicit bridge tasks.
- Baseline readiness blocker: Do not start migration immediately. Plan Android Gradle Plugin and Gradle upgrades as controlled native tooling tasks.
- Custom native module group: CloseApp (android, ios)
- Custom native module group: QRCodeDecoder (android, ios)
- Migration-sensitive area: Camera (high)
- Migration-sensitive area: Navigation (medium)
- Migration-sensitive area: Authentication SDKs (medium)
- Migration-sensitive area: Permissions (medium)
- Migration-sensitive area: UI / Native Visual Components (medium)
- Risky dependency: react-native-reanimated 1.13.0 - Verify Babel config and upgrade Reanimated according to target RN version.
- Risky dependency: react-native-gesture-handler 1.7.0 - Check compatibility with current React Navigation and target React Native version.
- Risky dependency: react-native-screens 2.10.1 - Verify navigation behavior after upgrade on both iOS and Android.
- Risky dependency: @react-native-firebase/app 14.9.0 - Check Firebase package versions, Pods, Gradle setup, and platform config files.
- Risky dependency: react-native-vector-icons 7.0.0 - Verify font linking and icon rendering after upgrade.
- Risky dependency: react-native-webview 10.3.3 - Check WebView compatibility and manually test screens using WebView.

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