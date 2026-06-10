# Codex Migration Task Plan

Project: **react-native-firebase**

This plan turns the audit into small Codex-ready migration prompts. Paste one task at a time into Codex and complete validation before moving to the next task.

## Task 1 — Baseline Verification

### Goal

- Establish a clean baseline before making any migration changes.

### Context from audit

- Project: react-native-firebase.
- Workflow: expo-managed.
- React Native: 0.74.5; React: 18.2.0; TypeScript: not detected.
- Baseline readiness: WARNING.
- Baseline has warnings. Do not start migration until warnings are documented and the operator accepts the risk.
- No baseline readiness blockers detected by the audit.
- Readiness warning: Add or document a typecheck command so migration type regressions are visible.
- Readiness warning: Add or document a lint command if lint tooling exists.
- Readiness warning: Add or document available test commands before migration work starts.
- Required readiness action: Add or document a typecheck command so migration type regressions are visible.
- Required readiness action: Add or document a lint command if lint tooling exists.
- Required readiness action: Add or document available test commands before migration work starts.

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

- npm install
- npm run android — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.
- npm run ios — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.

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

- Detected package manager: npm.
- 3 risky dependency package(s) were detected.

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

### Implementation instructions

- Inspect dependencies and lockfiles before editing.
- Identify packages that must be checked against the target React Native version.
- Do not run bulk upgrade commands in this task.
- Do not continue to the next task until validation is complete or blockers are documented.

### Validation commands

- npm install

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

- Current React Native: 0.74.5.
- Recommended strategy: modern-upgrade.
- Suggested path: current stable.
- This project is already on a relatively modern React Native version. Upgrade risk depends mostly on native modules, Expo compatibility, and build tooling.

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

- Android Gradle Plugin: not detected.
- Gradle: not detected.

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

- npm run android — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.

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

- iOS folder detected: no.
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
- npm run ios — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.

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

- react-native-reanimated ~3.10.1: Verify Babel config and upgrade Reanimated according to target RN version.
- react-native-gesture-handler ~2.16.1: Check compatibility with current React Navigation and target React Native version.
- react-native-screens 3.31.1: Verify navigation behavior after upgrade on both iOS and Android.

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

- npm run android — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.
- npm run ios — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.

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

## Task 8 — Navigation Verification

### Goal

- Verify migration-sensitive Navigation behavior after upgrade changes.

### Context from audit

- Navigation was detected as a MEDIUM risk migration area.
- Detected packages: @react-navigation/native, @react-navigation/stack, react-native-gesture-handler.

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

- npm run android — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.
- npm run ios — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.

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

## Task 9 — Storage Verification

### Goal

- Verify migration-sensitive Storage behavior after upgrade changes.

### Context from audit

- Storage was detected as a LOW risk migration area.
- Detected packages: @react-native-async-storage/async-storage.

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

- npm run android — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.
- npm run ios — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.

### Success criteria

- Storage usage points are identified and documented.
- Any required compatibility changes are small and isolated.
- Validation commands pass or blockers are documented with exact errors.

### Rollback note

- Revert only the isolated migration changes for this area if validation fails.

### Commit checkpoint

After this task passes validation, commit the isolated changes with a clear message, for example:

```bash
git add .
git commit -m "Storage Verification for RN migration"
```

## Task 10 — Manually Verify Potential Legacy API References

### Goal

- Separate real deprecated API usage from modern package usage or text references.

### Context from audit

- AsyncStorage: 2 file group(s).

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

- src/firebase/config.js
- src/screens/LoginScreen/LoginScreen.js

### Implementation instructions

- Inspect each potential reference before editing.
- Treat AST deprecated imports as the source of truth for confirmed deprecated import risk.
- Document false positives instead of changing code unnecessarily.
- Do not continue to the next task until validation is complete or blockers are documented.

### Validation commands

- npm run android — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.
- npm run ios — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.

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

## Task 11 — Add Or Document Missing Verification Scripts

### Goal

- Ensure migration validation commands are available or explicitly documented.

### Context from audit

- Typecheck script: missing.
- Lint script: missing.
- Test script: missing.

### Allowed changes

- Add minimal package.json scripts only if the underlying tooling already exists.

### Forbidden changes

- Do not add new tooling packages unless explicitly required and justified.
- Do not make broad rewrites.
- Do not change business logic unless required for the migration.
- Do not remove files unless clearly obsolete and justified.
- Do not silence TypeScript errors without explaining why.
- Do not edit generated files manually unless required.
- Keep changes small and commit-ready.
- If unsure, document the blocker instead of guessing.

### Files to inspect

- package.json
- tsconfig.json
- .eslintrc*
- eslint.config.*
- jest.config.*

### Implementation instructions

- Inspect existing tooling before editing package.json.
- Prefer documenting commands when tooling is absent.
- If adding a script, run it and document the result.
- Do not continue to the next task until validation is complete or blockers are documented.

### Validation commands

- npm run android — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.
- npm run ios — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.

### Success criteria

- Verification commands are available or missing prerequisites are documented.

### Rollback note

- Revert package.json script changes if commands are invalid or unsupported.

### Commit checkpoint

After this task passes validation, commit the isolated changes with a clear message, for example:

```bash
git add .
git commit -m "Add Or Document Missing Verification Scripts for RN migration"
```

## Task 12 — Final Verification

### Goal

- Run final verification after all staged migration changes are complete.

### Context from audit

- Recommended engagement: modern-upgrade.
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

- npm run android — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.
- npm run ios — Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.

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