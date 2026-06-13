# Codex Migration Task Plan

Project: **in1bank**

This plan turns the audit into small Codex-ready migration prompts. Paste one task at a time into Codex and complete validation before moving to the next task.

## Task 1 — Baseline Verification

### Goal

- Establish a clean baseline before making any migration changes.

### Context from audit

- Project: in1bank.
- Workflow: bare-react-native.
- React Native: 0.63.3; React: 16.13.1; TypeScript: 3.9.7.
- Baseline readiness: NOT-READY.
- Baseline is not ready for immediate migration. Resolve or explicitly plan the blockers before asking Codex to change dependencies or native files.
- Readiness blocker: Do not start migration immediately. Create a staged upgrade plan for this old React Native baseline first.
- Readiness blocker: Do not start migration immediately. Review critical blockers and prepare a staged rescue plan first.
- Readiness blocker: Do not start broad migration changes until custom native modules are reviewed and assigned explicit bridge tasks.
- Readiness blocker: Do not start migration immediately. Plan Android Gradle Plugin and Gradle upgrades as controlled native tooling tasks.
- No baseline readiness warnings detected by the audit.
- Required readiness action: Do not start migration immediately. Create a staged upgrade plan for this old React Native baseline first.
- Required readiness action: Do not start migration immediately. Review critical blockers and prepare a staged rescue plan first.
- Required readiness action: Do not start broad migration changes until custom native modules are reviewed and assigned explicit bridge tasks.
- Required readiness action: Do not start migration immediately. Plan Android Gradle Plugin and Gradle upgrades as controlled native tooling tasks.

### Allowed changes

- Documentation-only notes about baseline status.

### Forbidden changes

- Do not edit app, native, or dependency files in this task.
- Do not make broad rewrites.
- Do not change business logic unless required for the migration.
- Do not remove files unless clearly obsolete and justified.
- Do not silence TypeScript errors without explaining why.
- Do not edit generated files manually unless required.
- Keep changes small and commit-ready.
- If unsure, document the blocker instead of guessing.

### Files to inspect

- package.json
- README*
- ios/
- android/

### Implementation instructions

- Inspect the repository before editing.
- Install dependencies with the current package manager if needed.
- Run available verification commands and record the baseline result.
- Stop if installation or baseline builds fail for unclear reasons.
- Do not continue to the next task until validation is complete or blockers are documented.

### Validation commands

- yarn install
- yarn tsc
- yarn lint
- yarn test
- yarn android — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.
- yarn ios — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.

### Success criteria

- Baseline commands and failures are documented.
- Baseline readiness blockers are resolved or explicitly documented.
- No migration changes have been made yet.

### Rollback note

- No code rollback should be needed because this task should not edit code.

### Commit checkpoint

After this task passes validation, commit the isolated changes with a clear message, for example:

```bash
git add .
git commit -m "Document baseline verification before migration"
```

## Task 2 — Create Migration Branch

### Goal

- Create a safe branch for migration work and confirm the working tree is understood.

### Context from audit

- Migration work should be isolated from feature development.

### Allowed changes

- Create or switch to a migration branch.

### Forbidden changes

- Do not commit unrelated local changes.
- Do not discard user work.
- Do not make broad rewrites.
- Do not change business logic unless required for the migration.
- Do not remove files unless clearly obsolete and justified.
- Do not silence TypeScript errors without explaining why.
- Do not edit generated files manually unless required.
- Keep changes small and commit-ready.
- If unsure, document the blocker instead of guessing.

### Files to inspect

- git status output

### Implementation instructions

- Inspect git status before making changes.
- Create a migration branch if one does not already exist.
- Document any pre-existing dirty files before continuing.
- Do not continue to the next task until validation is complete or blockers are documented.

### Validation commands

- git status --short
- git branch --show-current

### Success criteria

- Migration work is isolated on a clear branch.

### Rollback note

- Switch back to the original branch if migration work is paused.

### Commit checkpoint

After this task passes validation, commit the isolated changes with a clear message, for example:

```bash
git add .
git commit -m "Create migration branch for RN upgrade"
```

## Task 3 — Dependency And Package Manager Review

### Goal

- Review dependency state before upgrading anything.

### Context from audit

- Detected package manager: yarn.
- Detected lockfiles: yarn.lock.
- 6 risky dependency package(s) were detected.

### Allowed changes

- Document dependency risks and package manager commands.

### Forbidden changes

- Do not upgrade unrelated packages.
- Do not switch package managers.
- Do not make broad rewrites.
- Do not change business logic unless required for the migration.
- Do not remove files unless clearly obsolete and justified.
- Do not silence TypeScript errors without explaining why.
- Do not edit generated files manually unless required.
- Keep changes small and commit-ready.
- If unsure, document the blocker instead of guessing.

### Files to inspect

- package.json
- yarn.lock
- package-lock.json
- pnpm-lock.yaml
- bun.lockb
- bun.lock

### Implementation instructions

- Inspect dependencies and lockfiles before editing.
- Identify packages that must be checked against the target React Native version.
- Do not run bulk upgrade commands in this task.
- Do not continue to the next task until validation is complete or blockers are documented.

### Validation commands

- yarn install

### Success criteria

- Dependency risks and package manager constraints are documented.

### Rollback note

- Revert lockfile changes if dependency installation changes more than expected.

### Commit checkpoint

After this task passes validation, commit the isolated changes with a clear message, for example:

```bash
git add .
git commit -m "Review dependencies and package manager for RN migration"
```

## Task 4 — React Native Upgrade Path Planning

### Goal

- Plan the React Native upgrade path without changing versions yet.

### Context from audit

- Current React Native: 0.63.3.
- Recommended strategy: staged-upgrade.
- Suggested path: 0.65 → 0.68 → 0.71 → 0.74+ → current stable.
- This is an older React Native project. A direct jump is not recommended; use staged upgrades and verify iOS and Android builds at each milestone.

### Allowed changes

- Create or update migration notes only.

### Forbidden changes

- Do not jump directly to latest React Native.
- Do not edit package versions in this task.
- Do not make broad rewrites.
- Do not change business logic unless required for the migration.
- Do not remove files unless clearly obsolete and justified.
- Do not silence TypeScript errors without explaining why.
- Do not edit generated files manually unless required.
- Keep changes small and commit-ready.
- If unsure, document the blocker instead of guessing.

### Files to inspect

- package.json
- android/
- ios/
- metro.config.js
- babel.config.js

### Implementation instructions

- Inspect current RN, React, Metro, Babel, Android, and iOS setup.
- Break the upgrade into the suggested stages.
- For each stage, list the expected validation commands.
- Do not continue to the next task until validation is complete or blockers are documented.

### Validation commands

- Document planned commands for each upgrade stage.

### Success criteria

- A staged, verifiable upgrade plan exists before version edits begin.

### Rollback note

- Keep this as a planning-only task; no code rollback should be needed.

### Commit checkpoint

After this task passes validation, commit the isolated changes with a clear message, for example:

```bash
git add .
git commit -m "Plan staged React Native upgrade path"
```

## Task 5 — Android Build Tooling Review

### Goal

- Review Android tooling before React Native version changes.

### Context from audit

- Android Gradle Plugin: 4.0.1.
- Gradle: 6.2.

### Allowed changes

- Document required Android tooling upgrade steps.
- Make only minimal compatibility fixes if needed.

### Forbidden changes

- Do not rewrite Gradle files broadly.
- Do not change signing config unless required and documented.
- Do not make broad rewrites.
- Do not change business logic unless required for the migration.
- Do not remove files unless clearly obsolete and justified.
- Do not silence TypeScript errors without explaining why.
- Do not edit generated files manually unless required.
- Keep changes small and commit-ready.
- If unsure, document the blocker instead of guessing.

### Files to inspect

- android/build.gradle
- android/app/build.gradle
- android/gradle/wrapper/gradle-wrapper.properties

### Implementation instructions

- Inspect Android configuration before editing.
- Identify AGP, Gradle, Kotlin, compileSdk, minSdk, and targetSdk compatibility constraints.
- Stop if native build errors are unclear.
- Do not continue to the next task until validation is complete or blockers are documented.

### Validation commands

- yarn android — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.

### Success criteria

- Android upgrade constraints are known and validation path is documented.

### Rollback note

- Revert Android build file changes as a unit if Gradle sync or build fails unexpectedly.

### Commit checkpoint

After this task passes validation, commit the isolated changes with a clear message, for example:

```bash
git add .
git commit -m "Review Android build tooling for RN migration"
```

## Task 6 — iOS And CocoaPods Review

### Goal

- Review iOS/CocoaPods setup before React Native version changes.

### Context from audit

- iOS folder detected: yes.
- Podfile use_frameworks!: no.

### Allowed changes

- Document required Podfile and CocoaPods upgrade steps.
- Make only minimal compatibility fixes if needed.

### Forbidden changes

- Do not rewrite the Podfile broadly.
- Do not remove pods without a clear migration reason.
- Do not make broad rewrites.
- Do not change business logic unless required for the migration.
- Do not remove files unless clearly obsolete and justified.
- Do not silence TypeScript errors without explaining why.
- Do not edit generated files manually unless required.
- Keep changes small and commit-ready.
- If unsure, document the blocker instead of guessing.

### Files to inspect

- ios/Podfile
- ios/Podfile.lock
- ios/*.xcodeproj
- ios/*.xcworkspace

### Implementation instructions

- Inspect Podfile and native iOS project settings before editing.
- Check whether use_frameworks!, modular headers, or custom pods affect the migration.
- Stop if CocoaPods or Xcode errors are unclear.
- Do not continue to the next task until validation is complete or blockers are documented.

### Validation commands

- cd ios && pod install
- yarn ios — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.

### Success criteria

- iOS upgrade constraints are known and validation path is documented.

### Rollback note

- Revert Podfile, Podfile.lock, and Xcode project changes together if validation fails.

### Commit checkpoint

After this task passes validation, commit the isolated changes with a clear message, for example:

```bash
git add .
git commit -m "Review iOS CocoaPods setup for RN migration"
```

## Task 7 — Risky Dependency Review

### Goal

- Review risky dependencies before upgrading React Native.

### Context from audit

- react-native-reanimated 1.13.0: Verify Babel config and upgrade Reanimated according to target RN version.
- react-native-gesture-handler 1.7.0: Check compatibility with current React Navigation and target React Native version.
- react-native-screens 2.10.1: Verify navigation behavior after upgrade on both iOS and Android.
- @react-native-firebase/app 14.9.0: Check Firebase package versions, Pods, Gradle setup, and platform config files.
- react-native-vector-icons 7.0.0: Verify font linking and icon rendering after upgrade.
- react-native-webview 10.3.3: Check WebView compatibility and manually test screens using WebView.

### Allowed changes

- Document compatibility requirements for risky dependencies.

### Forbidden changes

- Do not upgrade all dependencies at once.
- Do not replace libraries without a confirmed migration reason.
- Do not make broad rewrites.
- Do not change business logic unless required for the migration.
- Do not remove files unless clearly obsolete and justified.
- Do not silence TypeScript errors without explaining why.
- Do not edit generated files manually unless required.
- Keep changes small and commit-ready.
- If unsure, document the blocker instead of guessing.

### Files to inspect

- package.json
- babel.config.js
- metro.config.js
- android/
- ios/

### Implementation instructions

- Inspect each risky dependency before editing versions.
- Plan dependency upgrades one at a time and tie each to a validation command.
- Report any dependency that requires manual native setup.
- Do not continue to the next task until validation is complete or blockers are documented.

### Validation commands

- yarn tsc
- yarn lint
- yarn test
- yarn android — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.
- yarn ios — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.

### Success criteria

- Risky dependencies have a staged compatibility plan.

### Rollback note

- Revert each dependency version change independently if validation fails.

### Commit checkpoint

After this task passes validation, commit the isolated changes with a clear message, for example:

```bash
git add .
git commit -m "Review risky dependencies for RN migration"
```

## Task 8 — Native Module Review

### Goal

- Review custom native module groups before changing React Native versions.

### Context from audit

- CloseApp: android, ios (high)
- QRCodeDecoder: android, ios (high)

### Allowed changes

- Document module purpose, platform coverage, and migration risks.

### Forbidden changes

- Do not rewrite native modules before understanding JS callers.
- Do not make broad rewrites.
- Do not change business logic unless required for the migration.
- Do not remove files unless clearly obsolete and justified.
- Do not silence TypeScript errors without explaining why.
- Do not edit generated files manually unless required.
- Keep changes small and commit-ready.
- If unsure, document the blocker instead of guessing.

### Files to inspect

- android/app/src/main/java/au/com/in1bank/mobile/CloseApp.java
- android/app/src/main/java/au/com/in1bank/mobile/CloseAppPackage.java
- ios/in1bank/CloseApp.m
- android/app/src/main/java/au/com/in1bank/mobile/QRCodeDecoder.java
- android/app/src/main/java/au/com/in1bank/mobile/QRCodeDecoderPackage.java
- ios/in1bank/QRCodeDecoder.m

### Implementation instructions

- Inspect all grouped native module files and their JavaScript call sites.
- Identify whether each module uses old bridge APIs that may need changes.
- Stop if native behavior is unclear and document the blocker.
- Do not continue to the next task until validation is complete or blockers are documented.

### Validation commands

- yarn tsc
- yarn lint
- yarn test
- yarn android — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.
- yarn ios — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.

### Success criteria

- Each custom native module has an owner, purpose, and migration risk note.

### Rollback note

- Do not change native modules in this review task unless the fix is trivial and validated.

### Commit checkpoint

After this task passes validation, commit the isolated changes with a clear message, for example:

```bash
git add .
git commit -m "Review custom native modules for RN migration"
```

## Task 9 — Android Native Bridge Review

### Goal

- Verify Android custom bridge compatibility during the migration.

### Context from audit

- CloseApp: android, ios (high)
- QRCodeDecoder: android, ios (high)

### Allowed changes

- Make minimal Android bridge compatibility fixes.

### Forbidden changes

- Do not rewrite Android modules or package registration broadly.
- Do not make broad rewrites.
- Do not change business logic unless required for the migration.
- Do not remove files unless clearly obsolete and justified.
- Do not silence TypeScript errors without explaining why.
- Do not edit generated files manually unless required.
- Keep changes small and commit-ready.
- If unsure, document the blocker instead of guessing.

### Files to inspect

- android/app/src/main/java/au/com/in1bank/mobile/CloseApp.java
- android/app/src/main/java/au/com/in1bank/mobile/CloseAppPackage.java
- android/app/src/main/java/au/com/in1bank/mobile/QRCodeDecoder.java
- android/app/src/main/java/au/com/in1bank/mobile/QRCodeDecoderPackage.java

### Implementation instructions

- Inspect Android module and package files before editing.
- Confirm package registration and JS call sites still work after each upgrade stage.
- Stop if Gradle or bridge errors are unclear.
- Do not continue to the next task until validation is complete or blockers are documented.

### Validation commands

- yarn android — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.

### Success criteria

- Android custom bridge code compiles or blockers are documented.

### Rollback note

- Revert Android native bridge changes as one isolated set if validation fails.

### Commit checkpoint

After this task passes validation, commit the isolated changes with a clear message, for example:

```bash
git add .
git commit -m "Review Android native bridges for RN migration"
```

## Task 10 — iOS Native Bridge Review

### Goal

- Verify iOS custom bridge compatibility during the migration.

### Context from audit

- CloseApp: android, ios (high)
- QRCodeDecoder: android, ios (high)

### Allowed changes

- Make minimal Objective-C or Swift bridge compatibility fixes.

### Forbidden changes

- Do not rewrite iOS modules broadly.
- Do not change app entitlements or signing unless required.
- Do not make broad rewrites.
- Do not change business logic unless required for the migration.
- Do not remove files unless clearly obsolete and justified.
- Do not silence TypeScript errors without explaining why.
- Do not edit generated files manually unless required.
- Keep changes small and commit-ready.
- If unsure, document the blocker instead of guessing.

### Files to inspect

- ios/in1bank/CloseApp.m
- ios/in1bank/QRCodeDecoder.m

### Implementation instructions

- Inspect iOS bridge files before editing.
- Confirm exported methods/events and JS call sites still match.
- Stop if CocoaPods, Xcode, or Swift/Obj-C bridge errors are unclear.
- Do not continue to the next task until validation is complete or blockers are documented.

### Validation commands

- cd ios && pod install
- yarn ios — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.

### Success criteria

- iOS custom bridge code builds or blockers are documented.

### Rollback note

- Revert iOS native bridge changes as one isolated set if validation fails.

### Commit checkpoint

After this task passes validation, commit the isolated changes with a clear message, for example:

```bash
git add .
git commit -m "Review iOS native bridges for RN migration"
```

## Task 11 — Camera Verification

### Goal

- Verify migration-sensitive Camera behavior after upgrade changes.

### Context from audit

- Camera was detected as a HIGH risk migration area.
- Detected packages: react-native-camera.

### Allowed changes

- Inspect affected screens, integration code, and native setup.
- Make minimal compatibility fixes required by the migration.
- Add a short manual smoke-test checklist if automated coverage is unavailable.

### Forbidden changes

- Do not redesign flows or UI.
- Do not replace packages unless the current package is confirmed incompatible.
- Do not mix feature work with migration fixes.
- Do not make broad rewrites.
- Do not change business logic unless required for the migration.
- Do not remove files unless clearly obsolete and justified.
- Do not silence TypeScript errors without explaining why.
- Do not edit generated files manually unless required.
- Keep changes small and commit-ready.
- If unsure, document the blocker instead of guessing.

### Files to inspect

- package.json
- src/
- app/
- screens/
- components/
- ios/
- android/

### Implementation instructions

- Inspect before editing and identify the exact usage points for the detected packages.
- Make the smallest migration-related fix possible.
- If native configuration is required, inspect both iOS and Android setup before editing.
- Report what changed and what still needs manual device verification.
- Do not continue to the next task until validation is complete or blockers are documented.

### Validation commands

- yarn tsc
- yarn lint
- yarn test
- yarn android — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.
- yarn ios — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.

### Success criteria

- Camera usage points are identified and documented.
- Any required compatibility changes are small and isolated.
- Validation commands pass or blockers are documented with exact errors.

### Rollback note

- Revert only the isolated migration changes for this area if validation fails.

### Commit checkpoint

After this task passes validation, commit the isolated changes with a clear message, for example:

```bash
git add .
git commit -m "Camera Verification for RN migration"
```

## Task 12 — Navigation Verification

### Goal

- Verify migration-sensitive Navigation behavior after upgrade changes.

### Context from audit

- Navigation was detected as a MEDIUM risk migration area.
- Detected packages: @react-navigation/core, @react-navigation/native, @react-navigation/stack, react-native-gesture-handler.

### Allowed changes

- Inspect affected screens, integration code, and native setup.
- Make minimal compatibility fixes required by the migration.
- Add a short manual smoke-test checklist if automated coverage is unavailable.

### Forbidden changes

- Do not redesign flows or UI.
- Do not replace packages unless the current package is confirmed incompatible.
- Do not mix feature work with migration fixes.
- Do not make broad rewrites.
- Do not change business logic unless required for the migration.
- Do not remove files unless clearly obsolete and justified.
- Do not silence TypeScript errors without explaining why.
- Do not edit generated files manually unless required.
- Keep changes small and commit-ready.
- If unsure, document the blocker instead of guessing.

### Files to inspect

- package.json
- src/
- app/
- screens/
- components/
- ios/
- android/

### Implementation instructions

- Inspect before editing and identify the exact usage points for the detected packages.
- Make the smallest migration-related fix possible.
- If native configuration is required, inspect both iOS and Android setup before editing.
- Report what changed and what still needs manual device verification.
- Do not continue to the next task until validation is complete or blockers are documented.

### Validation commands

- yarn tsc
- yarn lint
- yarn test
- yarn android — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.
- yarn ios — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.

### Success criteria

- Navigation usage points are identified and documented.
- Any required compatibility changes are small and isolated.
- Validation commands pass or blockers are documented with exact errors.

### Rollback note

- Revert only the isolated migration changes for this area if validation fails.

### Commit checkpoint

After this task passes validation, commit the isolated changes with a clear message, for example:

```bash
git add .
git commit -m "Navigation Verification for RN migration"
```

## Task 13 — Authentication SDK Verification

### Goal

- Verify migration-sensitive Authentication SDKs behavior after upgrade changes.

### Context from audit

- Authentication SDKs was detected as a MEDIUM risk migration area.
- Detected packages: @react-native-firebase/crashlytics, @react-native-firebase/messaging.

### Allowed changes

- Inspect affected screens, integration code, and native setup.
- Make minimal compatibility fixes required by the migration.
- Add a short manual smoke-test checklist if automated coverage is unavailable.

### Forbidden changes

- Do not redesign flows or UI.
- Do not replace packages unless the current package is confirmed incompatible.
- Do not mix feature work with migration fixes.
- Do not make broad rewrites.
- Do not change business logic unless required for the migration.
- Do not remove files unless clearly obsolete and justified.
- Do not silence TypeScript errors without explaining why.
- Do not edit generated files manually unless required.
- Keep changes small and commit-ready.
- If unsure, document the blocker instead of guessing.

### Files to inspect

- package.json
- src/
- app/
- screens/
- components/
- ios/
- android/

### Implementation instructions

- Inspect before editing and identify the exact usage points for the detected packages.
- Make the smallest migration-related fix possible.
- If native configuration is required, inspect both iOS and Android setup before editing.
- Report what changed and what still needs manual device verification.
- Do not continue to the next task until validation is complete or blockers are documented.

### Validation commands

- yarn tsc
- yarn lint
- yarn test
- yarn android — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.
- yarn ios — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.

### Success criteria

- Authentication SDKs usage points are identified and documented.
- Any required compatibility changes are small and isolated.
- Validation commands pass or blockers are documented with exact errors.

### Rollback note

- Revert only the isolated migration changes for this area if validation fails.

### Commit checkpoint

After this task passes validation, commit the isolated changes with a clear message, for example:

```bash
git add .
git commit -m "Authentication SDK Verification for RN migration"
```

## Task 14 — Permissions Verification

### Goal

- Verify migration-sensitive Permissions behavior after upgrade changes.

### Context from audit

- Permissions was detected as a MEDIUM risk migration area.
- Detected packages: react-native-permissions.

### Allowed changes

- Inspect affected screens, integration code, and native setup.
- Make minimal compatibility fixes required by the migration.
- Add a short manual smoke-test checklist if automated coverage is unavailable.

### Forbidden changes

- Do not redesign flows or UI.
- Do not replace packages unless the current package is confirmed incompatible.
- Do not mix feature work with migration fixes.
- Do not make broad rewrites.
- Do not change business logic unless required for the migration.
- Do not remove files unless clearly obsolete and justified.
- Do not silence TypeScript errors without explaining why.
- Do not edit generated files manually unless required.
- Keep changes small and commit-ready.
- If unsure, document the blocker instead of guessing.

### Files to inspect

- package.json
- src/
- app/
- screens/
- components/
- ios/
- android/

### Implementation instructions

- Inspect before editing and identify the exact usage points for the detected packages.
- Make the smallest migration-related fix possible.
- If native configuration is required, inspect both iOS and Android setup before editing.
- Report what changed and what still needs manual device verification.
- Do not continue to the next task until validation is complete or blockers are documented.

### Validation commands

- yarn tsc
- yarn lint
- yarn test
- yarn android — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.
- yarn ios — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.

### Success criteria

- Permissions usage points are identified and documented.
- Any required compatibility changes are small and isolated.
- Validation commands pass or blockers are documented with exact errors.

### Rollback note

- Revert only the isolated migration changes for this area if validation fails.

### Commit checkpoint

After this task passes validation, commit the isolated changes with a clear message, for example:

```bash
git add .
git commit -m "Permissions Verification for RN migration"
```

## Task 15 — UI And Native Component Smoke Testing

### Goal

- Verify migration-sensitive UI / Native Visual Components behavior after upgrade changes.

### Context from audit

- UI / Native Visual Components was detected as a MEDIUM risk migration area.
- Detected packages: @react-native-picker/picker, react-native-document-picker, react-native-image-crop-picker, react-native-vector-icons.

### Allowed changes

- Inspect affected screens, integration code, and native setup.
- Make minimal compatibility fixes required by the migration.
- Add a short manual smoke-test checklist if automated coverage is unavailable.

### Forbidden changes

- Do not redesign flows or UI.
- Do not replace packages unless the current package is confirmed incompatible.
- Do not mix feature work with migration fixes.
- Do not make broad rewrites.
- Do not change business logic unless required for the migration.
- Do not remove files unless clearly obsolete and justified.
- Do not silence TypeScript errors without explaining why.
- Do not edit generated files manually unless required.
- Keep changes small and commit-ready.
- If unsure, document the blocker instead of guessing.

### Files to inspect

- package.json
- src/
- app/
- screens/
- components/
- ios/
- android/

### Implementation instructions

- Inspect before editing and identify the exact usage points for the detected packages.
- Make the smallest migration-related fix possible.
- If native configuration is required, inspect both iOS and Android setup before editing.
- Report what changed and what still needs manual device verification.
- Do not continue to the next task until validation is complete or blockers are documented.

### Validation commands

- yarn tsc
- yarn lint
- yarn test
- yarn android — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.
- yarn ios — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.

### Success criteria

- UI / Native Visual Components usage points are identified and documented.
- Any required compatibility changes are small and isolated.
- Validation commands pass or blockers are documented with exact errors.

### Rollback note

- Revert only the isolated migration changes for this area if validation fails.

### Commit checkpoint

After this task passes validation, commit the isolated changes with a clear message, for example:

```bash
git add .
git commit -m "UI And Native Component Smoke Testing for RN migration"
```

## Task 16 — Manually Verify Potential Legacy API References

### Goal

- Separate real deprecated API usage from modern package usage or text references.

### Context from audit

- NetInfo: 1 file group(s).
- Clipboard: 3 file group(s).
- Picker: 2 file group(s).

### Allowed changes

- Update only references confirmed to be deprecated core React Native APIs.

### Forbidden changes

- Do not change modern package imports just because names match.
- Do not edit copy text unless required.
- Do not make broad rewrites.
- Do not change business logic unless required for the migration.
- Do not remove files unless clearly obsolete and justified.
- Do not silence TypeScript errors without explaining why.
- Do not edit generated files manually unless required.
- Keep changes small and commit-ready.
- If unsure, document the blocker instead of guessing.

### Files to inspect

- src/App.tsx
- src/pages/UploadProof.tsx
- src/constants/lang/ENGLISH.ts
- src/pages/BizAccounts/Loan/AdditionalPayment/PayFromAnotherBank.tsx
- src/App.tsx
- src/custom/Pickers.tsx

### Implementation instructions

- Inspect each potential reference before editing.
- Treat AST deprecated imports as the source of truth for confirmed deprecated import risk.
- Document false positives instead of changing code unnecessarily.
- Do not continue to the next task until validation is complete or blockers are documented.

### Validation commands

- yarn tsc
- yarn lint
- yarn test
- yarn android — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.
- yarn ios — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.

### Success criteria

- Potential references are classified as confirmed usage or false positives.

### Rollback note

- Revert any change made to a reference that turns out to be modern usage or plain text.

### Commit checkpoint

After this task passes validation, commit the isolated changes with a clear message, for example:

```bash
git add .
git commit -m "Manually Verify Potential Legacy API References for RN migration"
```

## Task 17 — Final Verification

### Goal

- Run final verification after all staged migration changes are complete.

### Context from audit

- Recommended engagement: staged-upgrade.
- Final verification should happen after each upgrade stage and after the final target is reached.

### Allowed changes

- Fix only small issues discovered by final validation.

### Forbidden changes

- Do not start new feature work.
- Do not hide failing checks.
- Do not make broad rewrites.
- Do not change business logic unless required for the migration.
- Do not remove files unless clearly obsolete and justified.
- Do not silence TypeScript errors without explaining why.
- Do not edit generated files manually unless required.
- Keep changes small and commit-ready.
- If unsure, document the blocker instead of guessing.

### Files to inspect

- package.json
- report.md
- audit-result.json
- migration-tasks.md

### Implementation instructions

- Run all available validation commands.
- Verify Android and iOS builds if native folders exist.
- Prepare a short verification report listing passed checks, failed checks, and residual risks.
- Do not continue to the next task until validation is complete or blockers are documented.

### Validation commands

- yarn tsc
- yarn lint
- yarn test
- yarn android — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.
- yarn ios — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.

### Success criteria

- All available checks pass or blockers are documented with exact errors.
- No unrelated changes are included.
- A verification summary is ready for review.

### Rollback note

- If final verification fails, revert the smallest failing change set and rerun checks.

### Commit checkpoint

After this task passes validation, commit the isolated changes with a clear message, for example:

```bash
git add .
git commit -m "Document final migration verification"
```