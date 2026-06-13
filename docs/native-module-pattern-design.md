# Native Module Pattern Design

Date: 2026-06-13

Milestone: D1.1 — Native Module Migration Intelligence

Status: design and research only. No detection logic, report rendering, migration patterns, or task generation were changed in this milestone.

## Executive Recommendation

Implement one new additive migration intelligence pattern first:

`PATTERN-023 Custom Native Module Migration Review Required`

This should be a reporting/intelligence pattern, not an auto-fix or task-generation mechanism. It should use native-module evidence already collected by `scanNativeModules()` and `groupNativeModuleFindings()` and should surface those findings in the Known Migration Patterns / Action Register model used by `PATTERN-001` through `PATTERN-022`.

Do not implement separate TurboModule/Fabric or native SDK wrapper patterns yet. The current scanner does not collect enough explicit TurboModule/Fabric/codegen/native-SDK-wrapper evidence to support separate high-quality patterns without adding new scanning capability and calibration work.

## Current Evidence Inventory

### Native Module Evidence Already Collected

Source: `src/scanners/nativeModuleScanner.ts`

The native module scanner reads:

- `android/**/*.{java,kt}`
- `ios/**/*.{h,m,mm,swift}`

It excludes:

- `node_modules`
- `ios/Pods`
- build directories
- `.gradle`
- `DerivedData`

Raw finding shape:

- `platform`: `android` or `ios`
- `type`: one of `react-package`, `native-module`, `native-method`, `bridge-module`, `swift-objc-bridge`
- `file`: relative file path
- `matches`: matched source tokens
- `severity`: `critical`, `high`, `medium`, or `low`

Grouped finding shape:

- `name`: inferred from native file basename with `Package`, `Module`, `Bridge`, or `Manager` suffix removed
- `platforms`: detected platforms
- `files`: grouped source files
- `findingTypes`: grouped finding types
- `severity`: highest severity in the group

Current Android indicators:

- `implements ReactPackage` as `react-package`, high severity
- `extends ReactContextBaseJavaModule` as `native-module`, high severity
- `NativeModule` token as `native-module`, medium severity

Current iOS indicators:

- `RCT_EXPORT_MODULE` as `bridge-module`, high severity
- `RCT_EXPORT_METHOD` as `native-method`, high severity
- `@objc(...)` as `swift-objc-bridge`, medium severity

### Native Build Evidence Already Collected Elsewhere

Source: `src/index.ts` and native tooling parsing helpers

Android project facts:

- `hasAndroid`
- `hasGradleBuild`
- `hasAppGradleBuild`
- `nativeVersions.androidGradlePlugin`
- `nativeVersions.gradle`
- `androidUsesLegacyReactGradleApply`
- `androidUsesLegacyReactNativeDependency`
- `androidUsesProjectExtReact`
- `androidUsesReactAndroidDependency`
- `androidUsesFacebookReactPlugin`
- `androidMainApplicationContent`
- `androidUsesLegacySoLoaderInit`
- `androidUsesOpenSourceMergedSoMapping`

iOS project facts:

- `hasIOS`
- `hasPodfile`
- `nativeVersions.hasUseFrameworks`
- `podfileUsesLegacyReactNativePathConfig`
- permission-handler setup facts used by `PATTERN-008`

Cross-cutting facts:

- `workflow`
- `migrationAreas`
- `migrationAreaEvidence`
- `riskyDependencies`
- `deprecatedApiFindings`
- `astScan.packageUsages`
- `knownMigrationPatterns`
- `baselineReadiness`
- `complexityScore`

### Current Uses Of Native Module Evidence

Native module evidence is already used, but not as a known migration pattern.

Current use sites:

- `AuditResult.nativeModuleFindings`
- `AuditResult.nativeModuleGroups`
- Native module section in `report.md`
- Baseline readiness blocker: “Custom native modules”
- Complexity score driver: `custom native module group(s)`
- Risk summary item: “Custom Native Module Patterns Detected”
- Migration area evidence when a native module group name matches an area rule
- Proposal scope: “Technical review of custom native module or bridge findings.”
- Migration plan native phase summary
- Generated migration tasks currently create native module review tasks when groups exist

D1.1 should avoid creating additional migration tasks. A future `PATTERN-023` should only add intelligence/reporting through `knownMigrationPatterns` and existing report sections.

### TurboModule / Fabric Evidence

TurboModule/Fabric indicators are not currently collected in a general-purpose way.

Existing related but insufficient evidence:

- `PATTERN-010` detects a specific old `react-native-screens` Fabric Pod compatibility issue.
- Dependency facts include `@react-native/codegen`, `@react-native/babel-plugin-codegen`, and related packages when present.
- Native scanner does not scan for `TurboModule`, `TurboReactPackage`, `getTurboModule`, `Spec`, `codegenConfig`, Fabric component descriptors, `RCT_NEW_ARCH_ENABLED`, `ViewManager`, `requireNativeComponent`, or generated codegen artifacts.

Conclusion: separate TurboModule/Fabric readiness patterns would be premature without scanner expansion.

## Detection Approach Options

### Option A: One Pattern

`PATTERN-023 Custom Native Module Migration Review Required`

Detection source:

- `nativeModuleGroups.length > 0`

Possible confidence signals:

- Number of native module groups
- Highest group severity
- Platform coverage
- Presence of both Android and iOS custom bridge evidence
- Presence of high-risk bridge finding types
- Current or target RN version in modern range

Advantages:

- Uses evidence already collected.
- Minimizes false precision.
- Fits current pattern architecture.
- Avoids adding new scanner logic.
- Improves C1 reports for major production apps immediately.
- Maintains backward compatibility by adding optional fields only to matched patterns.

Disadvantages:

- Broad finding; it does not distinguish old bridge API migration, SDK wrappers, TurboModule readiness, or native UI components.
- Could duplicate baseline readiness wording unless the report wording is carefully scoped as migration intelligence.

### Option B: Multiple Patterns

Candidate split:

- `PATTERN-023 Native Module Migration Review`
- `PATTERN-024 TurboModule/Fabric Readiness Gap`
- `PATTERN-025 Native SDK Wrapper Risk`

Advantages:

- More targeted future guidance.
- Can separate bridge mechanics from architecture-readiness and native SDK-wrapper risk.
- Better long-term fit for mature migration intelligence.

Disadvantages:

- Current evidence does not reliably identify TurboModule/Fabric readiness gaps.
- Current evidence does not distinguish app-authored native SDK wrappers from generic bridge modules.
- Would likely create false positives by inferring intent from file names or generic bridge tokens.
- Would expand pattern count before calibration.

Recommendation: choose Option A for D1.1. Defer Option B until a later milestone adds explicit evidence collection.

## Recommended Pattern Design

### Pattern ID

`PATTERN-023`

### Pattern Title

`Custom Native Module Migration Review Required`

### Pattern Group

Recommended new group:

- ID: `native-modules`
- Title: `Custom Native Modules`
- Description: `Application-authored Android/iOS bridge modules, native packages, and native method exports that require manual migration review.`

Related groups may be added only if already evident from existing group metadata:

- Android Gradle / Native Build when any native module group includes Android files
- iOS Podfile when any native module group includes iOS files

### Evidence Types

- `source`
- `heuristic`

Use `config` only if the future implementation incorporates Android/iOS build configuration signals into confidence.

### Detection Criteria

Proposed criteria:

- One or more custom native module groups were detected in app-owned Android or iOS source files.
- Detected source files contain React Native bridge/package/module/export indicators.
- Native module groups are outside generated/build/vendor directories excluded by the scanner.

Do not require a specific RN version. Custom native modules are migration-sensitive across minor and major upgrades.

### Confidence Model Proposal

Suggested confidence calculation:

- High confidence:
  - At least 3 native module groups, or
  - Any group has high severity and both Android and iOS platforms are represented across all groups, or
  - Any group includes high-risk bridge types such as `react-package`, `bridge-module`, or `native-method` and the project targets or runs modern RN (`>=0.71`).
- Medium confidence:
  - 1 to 2 native module groups with high severity, or
  - iOS-only `swift-objc-bridge` findings, or
  - Android-only generic `NativeModule` findings without explicit `ReactContextBaseJavaModule` or `ReactPackage` evidence.
- Low confidence:
  - Raw native findings exist but grouping is weak or only medium-severity tokens were found.

Initial implementation should likely avoid low confidence because `groupNativeModuleFindings()` only returns concrete source matches. Low confidence is useful if future scanner expansion includes weaker indicators.

### Action Priority Proposal

Recommended action priority:

- `MUST_FIX` for high confidence.
- `VALIDATE_DURING_MIGRATION` for medium confidence.
- `INFORMATIONAL` for low confidence if low-confidence support is implemented later.

Rationale:

Custom native modules are not necessarily broken, but they are migration gates. For large or high-severity bridge surfaces, the migration should not proceed without manual review. For small one-platform surfaces, validation during migration is sufficient.

### Evidence Signals

Recommended detected signals:

- Number of custom native module groups detected.
- Number of raw native module findings detected.
- Platforms represented: Android, iOS, or both.
- Highest severity.
- Group names with platform and severity.
- Finding types observed, for example `react-package`, `native-module`, `bridge-module`, `native-method`, `swift-objc-bridge`.
- Files to inspect, truncated to avoid overly large table cells.
- If Android groups exist: “Android bridge/package source files are present.”
- If iOS groups exist: “iOS bridge/export source files are present.”

Example signals:

- `10 custom native module group(s) detected across android, ios.`
- `High-severity bridge indicators: react-package, native-module, bridge-module, native-method.`
- `Groups: Share (android, high), ShareExtension (ios, high), Ssl (android, high).`
- `Review files: android/app/src/main/java/.../SharePackage.java, ios/.../ShareExtension.m.`

### Recommendation Wording Proposal

Proposed recommendation:

`Review custom native module groups before React Native version changes. For each group, identify JS call sites, platform ownership, bridge/export APIs, package registration, build dependencies, and validation commands. Do not rewrite native modules during audit; document migration blockers and validate Android/iOS builds after each React Native milestone.`

Shorter table-friendly recommendation:

`Review custom native module groups before RN version changes; document JS call sites, bridge APIs, registration, native dependencies, and platform validation for each group.`

### Report Wording Boundaries

Implementation should add only the new pattern output through existing Known Migration Patterns and Action Register rendering.

Do not change wording in:

- Existing native module findings section
- Baseline readiness
- Complexity score
- Migration plan
- Migration tasks
- Existing patterns

This preserves the milestone constraint: reporting/intelligence only and no report wording changes outside the new feature.

### audit-result.json Compatibility

Backward compatibility can be maintained by adding `PATTERN-023` as another item in `knownMigrationPatterns` only when matched.

No schema version change is required if the implementation reuses existing optional fields:

- `confidence`
- `detectedSignals`
- `actionPriority`
- `patternGroup`
- `evidenceTypes`

No existing fields should be removed or renamed.

## False-Positive Risks

- Some matches may be application-native support code that is stable across RN upgrades.
- File-name grouping can split one logical native module into multiple groups or merge unrelated files with similar basenames.
- Generic `NativeModule` token matches can occur in package list code without a custom module implementation.
- `@objc(...)` can appear in Swift code that is not a React Native bridge module.
- The pattern may duplicate baseline readiness and native module section content if recommendation wording is too generic.

Mitigations:

- Use confidence tiers rather than always high.
- Include exact finding types and files in signals.
- Keep recommendation focused on review/validation, not assumed breakage.
- Do not claim TurboModule/Fabric risk unless future evidence supports it.

## False-Negative Risks

- Custom native modules implemented outside scanned paths are missed.
- C++/JNI-only modules without Java/Kotlin bridge indicators are missed.
- Native UI managers, view managers, event emitters, and Fabric components may be missed by current patterns.
- Swift bridge code without `@objc(...)` or Objective-C export macros may be missed.
- Autolinked local packages outside `android/` and `ios/` may be missed.
- Third-party native SDK wrappers in dependencies are not classified as app-authored custom native modules.
- TurboModule/codegen readiness gaps are not detected today.

Mitigations for future milestones:

- Scan for `ViewManager`, `SimpleViewManager`, `RCTViewManager`, `requireNativeComponent`, event emitters, C++/JNI indicators, `codegenConfig`, `TurboModule`, `TurboReactPackage`, and `RCT_NEW_ARCH_ENABLED`.
- Identify workspace/local packages with native folders.
- Separate app-authored native modules from third-party native dependency wrappers.

## C1 Validation Projection

Expected trigger model for proposed `PATTERN-023`:

- Trigger when `nativeModuleGroups.length > 0`.
- Do not trigger for native dependencies only.
- Do not trigger for migration areas without app-authored bridge evidence.

### Expected Trigger Frequency

Based on C1 validation data, expected trigger count is 7 of 12 repositories.

Expected triggered repositories:

- Artsy Eigen: 10 native module groups
- Expensify App: 10 native module groups
- Joplin Mobile: 4 native module groups
- MetaMask Mobile: 6 native module groups
- Rainbow: 13 native module groups
- Rocket.Chat.ReactNative: 15 native module groups
- Zulip Mobile: 9 native module groups

Expected non-triggered repositories:

- Firebase Instagram sample: 0 native module groups
- Mattermost Mobile: 0 native module groups in C1 scanner output
- React Native Firebase sample: 0 native module groups
- Bluesky Social App: 0 native module groups
- Status Mobile: 0 native module groups

### Expected False Positives

Expected false-positive risk is moderate but acceptable for a review-required pattern.

Likely false-positive cases:

- Small stable native modules that rarely require migration changes.
- Generated or template bridge files that are app-owned but not migration-sensitive.
- Swift `@objc(...)` uses unrelated to React Native bridge exposure.

For the named C1 repositories, the false-positive risk is lower for Eigen, Expensify, Joplin, MetaMask, Rainbow, Rocket.Chat, and Zulip because each has multiple grouped findings or high-severity bridge indicators. Mattermost would not trigger under the proposed app-authored custom module rule, avoiding a false positive from native dependency volume alone.

### Expected False Negatives

Expected false-negative risk is meaningful.

Known likely misses:

- Mattermost had substantial native dependency and Expo/native module usage but no `nativeModuleGroups` in C1. A custom-module-only `PATTERN-023` would not improve its known-pattern output.
- Status Mobile had no native module groups in C1 despite native package complexity. This indicates dependency/native SDK wrapper risks remain outside the custom-module pattern.
- Bluesky Social App had many Expo/native package usages but no app-owned native groups.
- Native UI components and TurboModule/Fabric readiness gaps remain unmodeled.

This is why native SDK wrapper and TurboModule/Fabric patterns should be future work, not part of D1.1.

### Would This Have Improved C1 Audits?

| Repository | Expected `PATTERN-023` Trigger | Improvement Assessment |
|---|---:|---|
| Rocket.Chat.ReactNative | Yes | Strong improvement. Native module groups were a major blocker but not represented in known patterns. |
| MetaMask Mobile | Yes | Strong improvement. Would promote custom native bridge review into Action Register / known pattern output. |
| Joplin Mobile | Yes | Strong improvement. Known patterns underrepresented actual native bridge complexity. |
| Rainbow | Yes | Strong improvement. Would connect 13 native module groups to migration intelligence. |
| Mattermost Mobile | No | Limited improvement. C1 scanner found no app-authored native module groups; future native SDK wrapper pattern may help. |
| Expensify App | Yes | Strong improvement. Would make extensive custom native surface explicit in pattern output. |
| Zulip Mobile | Yes | Strong improvement. Would surface 9 native module groups as known migration intelligence. |
| Artsy Eigen | Yes | Strong improvement. Would connect 10 native module groups to known pattern reporting. |

Overall, `PATTERN-023` would have improved 7 of the 8 named C1 example audits and 7 of 12 total validation audits. Mattermost remains a useful reminder that custom native module intelligence and native dependency intelligence are related but not identical.

## Recommended Implementation Plan For Later Milestone

Do not implement in D1.1. If approved later, implementation should be minimal and additive:

1. Extend `MigrationPatternAuditFacts` with optional `nativeModuleFindings` and `nativeModuleGroups` fields.
2. Add `GROUP_NATIVE_MODULES` to `src/knowledge/migrationPatterns.ts`.
3. Add `PATTERN-023` to `migrationPatterns` with `actionPriority`, `patternGroup`, and `evidenceTypes`.
4. Add helper functions for detection, confidence, and signal generation.
5. Keep existing native module section, readiness, migration plan, and migration tasks unchanged.
6. Add tests for no groups, one medium group, one high group, and multiple cross-platform groups.
7. Validate against C1 repositories and compare expected 7-of-12 trigger frequency.

## Final Recommendation

Choose Option A now:

`PATTERN-023 Custom Native Module Migration Review Required`

Justification:

- It directly addresses the strongest C1 gap using existing evidence.
- It fits the current pattern architecture.
- It avoids unsupported TurboModule/Fabric claims.
- It preserves backward compatibility.
- It can be implemented later as a reporting-only additive pattern.

Defer Option B until scanner evidence supports it:

- `PATTERN-024 TurboModule/Fabric Readiness Gap` should wait for explicit New Architecture/codegen/Fabric scanner support.
- `PATTERN-025 Native SDK Wrapper Risk` should wait for local-package/native dependency classification and examples beyond app-authored bridge modules.
