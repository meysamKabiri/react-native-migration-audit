# React Native Migration Strategy

Project: fastpong

## Strategy Summary

Start with baseline stabilization. Do not perform React Native version changes until blockers are resolved or explicitly accepted.

- Workflow: bare-react-native
- Current React Native: 0.63.4
- Overall risk level: CRITICAL
- Package manager: yarn
- Native platform phase required: Yes

## Baseline Readiness

- Status: NOT-READY
- Summary: Baseline is not ready for immediate migration. Resolve or explicitly plan the blockers before asking Codex to change dependencies or native files.
- Guidance: Do not begin the React Native upgrade yet. Resolve or explicitly accept baseline blockers first, document baseline command failures, and create a clean migration branch.

### Baseline Blockers

- Do not start migration immediately. Create a staged upgrade plan for this old React Native baseline first.
- Do not start migration immediately. Review critical blockers and prepare a staged rescue plan first.
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

- Typecheck script: present
- Lint script: present
- Test script: present
- Android script: present
- iOS script: present

### Phase 1 — Dependency & Tooling Preparation

Goal: prepare dependencies and native build tooling before React Native version changes.

Focus:

- Use package manager: yarn.
- Review lockfile consistency and avoid switching package managers.
- 4 risky dependency package(s) require staged review.
- Android Gradle Plugin: 4.2.2; Gradle: 7.2.
- Podfile present: yes; use_frameworks!: no.
- Add or document missing validation scripts before relying on Codex changes.

Risky dependency review list:

- react-native-gesture-handler ^2.3.2 - Check compatibility with current React Navigation and target React Native version.
- react-native-screens ^3.13.1 - Verify navigation behavior after upgrade on both iOS and Android.
- react-native-vector-icons ^10.2.0 - Verify font linking and icon rendering after upgrade.
- react-native-webview ^11.22.6 - Check WebView compatibility and manually test screens using WebView.

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
- No custom native module groups detected by the audit.

Custom native module summary:

No custom native module groups were detected. Native platform migration should still review standard RN template diffs.

### Phase 4 — Migration-Sensitive Area Verification

Goal: verify app areas most likely to break after React Native and native dependency changes.

Migration-sensitive areas from the audit:

- Camera (high): react-native-camera. Review camera package maintenance status, native setup, permissions, and runtime behavior on both platforms.
- Bluetooth (high): react-native-ble-plx, react-native-bluetooth-state-manager. Verify Bluetooth permissions, pairing/scanning behavior, background behavior, and native package compatibility.
- Navigation (medium): @react-navigation/bottom-tabs, @react-navigation/native, @react-navigation/stack, react-native-gesture-handler. Verify navigation flows, modals, gestures, tabs, and stack transitions after each upgrade stage.
- Authentication SDKs (medium): @react-native-google-signin/google-signin, @react-native-seoul/kakao-login, react-native-fbsdk-next. Verify native SDK setup, URL schemes, app credentials, Android/iOS configuration, and login callbacks.
- Media (medium): react-native-media-controls, react-native-sound, react-native-video. Test video/audio playback, permissions, background behavior, and native configuration after upgrade.
- Permissions (medium): react-native-permissions. Verify AndroidManifest, Info.plist, permission prompts, and runtime behavior after upgrade.
- UI / Native Visual Components (medium): @react-native-picker/picker, react-native-calendars, react-native-chart-kit, react-native-icomoon, react-native-linear-gradient, react-native-radial-gradient, react-native-vector-icons, react-native-view-shot, react-native-wheel-picker-android. Run visual smoke tests on screens using native UI components after each upgrade stage.
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

- Old React Native Version (critical, react-native): React Native 0.63.x is significantly behind modern releases and will likely require staged upgrades, dependency updates, and native iOS/Android changes.
- Bare React Native Project (high, react-native): Bare React Native projects have higher upgrade risk because iOS and Android native projects must be migrated too.
- Old React Version (high, react-native): React 16 detected. Modern React Native versions require newer React versions, so React upgrade risk exists.
- Risky Native Dependencies (high, dependency): 4 risky native/dependency packages detected. Review compatibility before upgrading.
- Old Android Gradle Plugin (high, android): Android Gradle Plugin 4.2.2 detected. Modern React Native upgrades may require Android Gradle Plugin 7+ or 8+.
- High-Risk Migration Areas Detected (high, dependency): 2 high-risk migration area(s) detected: Camera, Bluetooth.
- Baseline readiness blocker: Do not start migration immediately. Create a staged upgrade plan for this old React Native baseline first.
- Baseline readiness blocker: Do not start migration immediately. Review critical blockers and prepare a staged rescue plan first.
- Baseline readiness blocker: Do not start migration immediately. Plan Android Gradle Plugin and Gradle upgrades as controlled native tooling tasks.
- Migration-sensitive area: Camera (high)
- Migration-sensitive area: Bluetooth (high)
- Migration-sensitive area: Navigation (medium)
- Migration-sensitive area: Authentication SDKs (medium)
- Migration-sensitive area: Media (medium)
- Migration-sensitive area: Permissions (medium)
- Migration-sensitive area: UI / Native Visual Components (medium)
- Migration-sensitive area: Storage (low)
- Risky dependency: react-native-gesture-handler ^2.3.2 - Check compatibility with current React Navigation and target React Native version.
- Risky dependency: react-native-screens ^3.13.1 - Verify navigation behavior after upgrade on both iOS and Android.
- Risky dependency: react-native-vector-icons ^10.2.0 - Verify font linking and icon rendering after upgrade.
- Risky dependency: react-native-webview ^11.22.6 - Check WebView compatibility and manually test screens using WebView.

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