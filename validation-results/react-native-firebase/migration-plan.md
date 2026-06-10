# React Native Migration Strategy

Project: react-native-firebase

## Strategy Summary

Review warnings before starting version changes, then proceed in controlled phases.

- Workflow: expo-managed
- Current React Native: 0.74.5
- Overall risk level: HIGH
- Package manager: npm
- Native platform phase required: No

## Baseline Readiness

- Status: WARNING
- Summary: Baseline has warnings. Do not start migration until warnings are documented and the operator accepts the risk.
- Guidance: Migration can proceed only after warnings are reviewed and documented by the operator.

### Baseline Blockers

- None detected.

### Baseline Warnings

- Add or document a typecheck command so migration type regressions are visible.
- Add or document a lint command if lint tooling exists.
- Add or document available test commands before migration work starts.

## Recommended Upgrade Path

- Strategy: modern-upgrade
- Target/path: current stable
- Note: This project is already on a relatively modern React Native version. Upgrade risk depends mostly on native modules, Expo compatibility, and build tooling.

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
- Android script: present
- iOS script: present

### Phase 1 — Dependency & Tooling Preparation

Goal: prepare dependencies and native build tooling before React Native version changes.

Focus:

- Use package manager: npm.
- Review lockfile consistency and avoid switching package managers.
- 3 risky dependency package(s) require staged review.
- Android Gradle Plugin: not detected; Gradle: not detected.
- Podfile present: no; use_frameworks!: no.
- Add or document missing validation scripts before relying on Codex changes.

Risky dependency review list:

- react-native-reanimated ~3.10.1 - Verify Babel config and upgrade Reanimated according to target RN version.
- react-native-gesture-handler ~2.16.1 - Check compatibility with current React Navigation and target React Native version.
- react-native-screens 3.31.1 - Verify navigation behavior after upgrade on both iOS and Android.

### Phase 2 — React Native Version Upgrade

Goal: apply the recommended React Native upgrade path in controlled stages.

Focus:

- Follow the audit upgrade recommendation instead of jumping directly to latest React Native.
- For old RN baselines, validate after each milestone before moving to the next one.
- Keep React Native, React, Metro, Babel, and native template changes grouped and reviewable.
- Do not upgrade unrelated application dependencies in the same change set.
- Stop if validation failures cannot be explained.

### Phase 3 — Native Platform Migration

This project has no detected native folders or custom native module findings. Keep this phase as a lightweight review of generated native changes, if any.

### Phase 4 — Migration-Sensitive Area Verification

Goal: verify app areas most likely to break after React Native and native dependency changes.

Migration-sensitive areas from the audit:

- Navigation (medium): @react-navigation/native, @react-navigation/stack, react-native-gesture-handler. Verify navigation flows, modals, gestures, tabs, and stack transitions after each upgrade stage.
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

- Risky Native Dependencies (high, dependency): 3 risky native/dependency packages detected. Review compatibility before upgrading.
- Missing Typecheck Script (medium, typescript): No typecheck script found. TypeScript migration issues may be harder to catch automatically.
- Migration-sensitive area: Navigation (medium)
- Migration-sensitive area: Storage (low)
- Risky dependency: react-native-reanimated ~3.10.1 - Verify Babel config and upgrade Reanimated according to target RN version.
- Risky dependency: react-native-gesture-handler ~2.16.1 - Check compatibility with current React Navigation and target React Native version.
- Risky dependency: react-native-screens 3.31.1 - Verify navigation behavior after upgrade on both iOS and Android.

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