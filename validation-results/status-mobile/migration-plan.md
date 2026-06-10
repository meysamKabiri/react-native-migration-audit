# React Native Migration Strategy

Project: StatusIm-Mobile

## Strategy Summary

Review warnings before starting version changes, then proceed in controlled phases.

- Workflow: bare-react-native
- Current React Native: 0.73.5
- Overall risk level: HIGH
- Package manager: yarn
- Native platform phase required: Yes

## Baseline Readiness

- Status: WARNING
- Summary: Baseline has warnings. Do not start migration until warnings are documented and the operator accepts the risk.
- Guidance: Migration can proceed only after warnings are reviewed and documented by the operator.

### Baseline Blockers

- None detected.

### Baseline Warnings

- Add or document the Android validation command before native migration work.
- Add or document the iOS validation command before native migration work.
- Add or document a typecheck command so migration type regressions are visible.
- Add or document a lint command if lint tooling exists.
- Add or document available test commands before migration work starts.

## Recommended Upgrade Path

- Strategy: staged-upgrade
- Target/path: 0.74+ → current stable
- Note: This project is close to the modern React Native range, but a short staged upgrade is still safer than jumping directly to the current stable release.

Do not hardcode a newer target than the audit recommendation. Follow the staged path and validate after each milestone.

## Migration Phases

### Phase 0 — Baseline Stabilization

Goal: reproduce the current baseline before changing dependencies or native files.

Review and document baseline warnings before starting the React Native upgrade.

Focus:

- Confirm current dependency install status and lockfile behavior.
- Run or document typecheck, test, and lint baseline commands.
- Run Android and iOS build baselines when local environments are available.
- Inspect git status and create a clean migration branch.
- Document any baseline command failures before proceeding.

Available validation script signals:

- Typecheck script: missing
- Lint script: missing
- Test script: missing
- Android script: missing
- iOS script: missing

### Phase 1 — Dependency & Tooling Preparation

Goal: prepare dependencies and native build tooling before React Native version changes.

Focus:

- Use package manager: yarn.
- Review lockfile consistency and avoid switching package managers.
- 6 risky dependency package(s) require staged review.
- Android Gradle Plugin: not detected; Gradle: not detected.
- Podfile present: yes; use_frameworks!: yes.
- Add or document missing validation scripts before relying on Codex changes.

Risky dependency review list:

- react-native-reanimated 3.6.1 - Verify Babel config and upgrade Reanimated according to target RN version.
- react-native-gesture-handler 2.14.1 - Check compatibility with current React Navigation and target React Native version.
- @react-native-firebase/app ^21.7.2 - Check Firebase package versions, Pods, Gradle setup, and platform config files.
- react-native-navigation 7.43.0 - Review package compatibility with the target React Native version.
- react-native-mmkv 2.12.2 - Review package compatibility with the target React Native version.
- react-native-webview 13.6.3 - Check WebView compatibility and manually test screens using WebView.

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

- Camera (high): @react-native-camera-roll/camera-roll, react-native-camera-kit. Review camera package maintenance status, native setup, permissions, and runtime behavior on both platforms.
- Navigation (medium): react-native-gesture-handler, react-native-navigation. Verify navigation flows, modals, gestures, tabs, and stack transitions after each upgrade stage.
- Authentication SDKs (medium): @react-native-firebase/app, @react-native-firebase/messaging. Verify native SDK setup, URL schemes, app credentials, Android/iOS configuration, and login callbacks.
- Media (medium): @react-native-community/audio-toolkit. Test video/audio playback, permissions, background behavior, and native configuration after upgrade.
- Permissions (medium): react-native-permissions. Verify AndroidManifest, Info.plist, permission prompts, and runtime behavior after upgrade.
- UI / Native Visual Components (medium): react-native-image-crop-picker, react-native-linear-gradient, react-native-webview. Run visual smoke tests on screens using native UI components after each upgrade stage.
- Storage (low): @react-native-async-storage/async-storage, react-native-mmkv. Verify stored data migration, persistence behavior, and native package compatibility.

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
- Risky Native Dependencies (high, dependency): 6 risky native/dependency packages detected. Review compatibility before upgrading.
- High-Risk Migration Areas Detected (high, dependency): 1 high-risk migration area(s) detected: Camera.
- Missing iOS Script (medium, scripts): No iOS script found in package.json. Build verification may require manual commands.
- Missing Android Script (medium, scripts): No Android script found in package.json. Build verification may require manual commands.
- Missing Typecheck Script (medium, typescript): No typecheck script found. TypeScript migration issues may be harder to catch automatically.
- Migration-sensitive area: Camera (high)
- Migration-sensitive area: Navigation (medium)
- Migration-sensitive area: Authentication SDKs (medium)
- Migration-sensitive area: Media (medium)
- Migration-sensitive area: Permissions (medium)
- Migration-sensitive area: UI / Native Visual Components (medium)
- Migration-sensitive area: Storage (low)
- Risky dependency: react-native-reanimated 3.6.1 - Verify Babel config and upgrade Reanimated according to target RN version.
- Risky dependency: react-native-gesture-handler 2.14.1 - Check compatibility with current React Navigation and target React Native version.
- Risky dependency: @react-native-firebase/app ^21.7.2 - Check Firebase package versions, Pods, Gradle setup, and platform config files.
- Risky dependency: react-native-navigation 7.43.0 - Review package compatibility with the target React Native version.
- Risky dependency: react-native-mmkv 2.12.2 - Review package compatibility with the target React Native version.
- Risky dependency: react-native-webview 13.6.3 - Check WebView compatibility and manually test screens using WebView.

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