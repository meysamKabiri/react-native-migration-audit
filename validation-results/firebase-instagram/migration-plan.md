# React Native Migration Strategy

Project: firebase-basic-instagram

## Strategy Summary

Start with baseline stabilization. Do not perform React Native version changes until blockers are resolved or explicitly accepted.

- Workflow: expo-managed
- Current React Native: Expo SDK 35 (legacy React Native baseline)
- Overall risk level: HIGH
- Package manager: yarn
- Native platform phase required: No

## Baseline Readiness

- Status: NOT-READY
- Summary: Baseline is not ready for immediate migration. Resolve or explicitly plan the blockers before asking Codex to change dependencies or native files.
- Guidance: Do not begin the React Native upgrade yet. Resolve or explicitly accept baseline blockers first, document baseline command failures, and create a clean migration branch.

### Baseline Blockers

- Do not start migration immediately. Create a staged upgrade plan for this old React Native baseline first.

### Baseline Warnings

- Add or document a typecheck command so migration type regressions are visible.
- Add or document a lint command if lint tooling exists.
- Add or document available test commands before migration work starts.

## Recommended Upgrade Path

- Strategy: staged-upgrade
- Target/path: Expo SDK 35 baseline → modern Expo SDK → current stable
- Note: This project uses an old Expo SDK React Native tarball. Treat it as a legacy React Native baseline and plan staged Expo/RN upgrades before implementation.

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
- Lint script: missing
- Test script: missing
- Android script: missing
- iOS script: missing

### Phase 1 — Dependency & Tooling Preparation

Goal: prepare dependencies and native build tooling before React Native version changes.

Focus:

- Use package manager: yarn.
- Review lockfile consistency and avoid switching package managers.
- 0 risky dependency package(s) require staged review.
- Android Gradle Plugin: not detected; Gradle: not detected.
- Podfile present: no; use_frameworks!: no.
- Add or document missing validation scripts before relying on Codex changes.

Risky dependency review list:

- None detected.

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

- Permissions (medium): expo-permissions. Verify AndroidManifest, Info.plist, permission prompts, and runtime behavior after upgrade.
- UI / Native Visual Components (medium): @expo/vector-icons, expo-image-picker. Run visual smoke tests on screens using native UI components after each upgrade stage.

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

- Old React Version (high, react-native): React 16 detected. Modern React Native versions require newer React versions, so React upgrade risk exists.
- Missing iOS Script (medium, scripts): No iOS script found in package.json. Build verification may require manual commands.
- Missing Android Script (medium, scripts): No Android script found in package.json. Build verification may require manual commands.
- Missing Typecheck Script (medium, typescript): No typecheck script found. TypeScript migration issues may be harder to catch automatically.
- Older React Patterns Detected (medium, react-native): 1 older React pattern group(s) detected through AST analysis.
- Baseline readiness blocker: Do not start migration immediately. Create a staged upgrade plan for this old React Native baseline first.
- Migration-sensitive area: Permissions (medium)
- Migration-sensitive area: UI / Native Visual Components (medium)

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