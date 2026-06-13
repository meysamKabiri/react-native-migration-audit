# Repository Validation Report

Date: 2026-06-13

Scope: Validation Milestone C1. This is an analysis-only validation pass against real-world React Native repositories. No migration patterns, detection logic, or architecture were changed during this milestone.

## Validation Set

The audit was run against 12 repositories covering legacy React Native, modern React Native, bare projects, Expo managed projects, Expo bare/prebuild projects, and production open-source applications.

| Repository | Source | Audit Path | App Type |
|---|---|---|---|
| Artsy Eigen | local validation repo | `validation-repos/eigen` | Expo bare/prebuild production app |
| Expensify App | public clone | `Expensify/App` | Expo bare/prebuild production app |
| Firebase Instagram sample | local validation repo | `validation-repos/firebase-instagram` | Legacy Expo managed sample |
| Joplin Mobile | public clone | `laurent22/joplin/packages/app-mobile` | Expo bare/prebuild production app |
| Mattermost Mobile | public clone | `mattermost/mattermost-mobile` | Expo bare/prebuild production app |
| MetaMask Mobile | public clone | `MetaMask/metamask-mobile` | Expo bare/prebuild production app |
| Rainbow | public clone | `rainbow-me/rainbow` | Expo bare/prebuild production app |
| React Native Firebase sample | local validation repo | `validation-repos/react-native-firebase` | Expo managed sample |
| Rocket.Chat.ReactNative | local validation repo | `validation-repos/Rocket.Chat.ReactNative` | Expo bare/prebuild production app |
| Bluesky Social App | public clone | `bluesky-social/social-app` | Expo managed production app |
| Status Mobile | local validation repo | `validation-repos/status-mobile` | Bare React Native production app |
| Zulip Mobile | public clone | `zulip/zulip-mobile` | Expo bare/prebuild production app |

Audit outputs were written to `/var/folders/_q/wn1dqcc942n39tvl0q1x9xrm0000gn/T/opencode/rnma-c1-audits`.

## Repository Results

### Artsy Eigen

- Repository: `artsy/eigen` via local validation repo
- RN version: `0.83.6`
- Workflow: Expo bare/prebuild
- Patterns detected: `PATTERN-004` Clipboard Android Manifest Issue, `PATTERN-008` react-native-permissions iOS Handler Configuration Missing
- Confidence distribution: low 0, medium 2, high 0
- Action priorities: Must Fix Before Migration 2
- Grouped findings: Clipboard 1, Permissions 1
- Potential false positives: `PATTERN-004` is broad for any Android project with clipboard evidence and does not verify the exact clipboard package manifest condition. `PATTERN-008` was medium confidence because permissions are configured but the pattern still emits due to permissions migration-area evidence.
- Potential false negatives: Custom native module groups and deprecated APIs are detected outside known migration patterns, but no native-module-specific pattern captures the operational migration risk.
- Recommendation quality assessment: Useful as an attention list, but the pattern recommendations are less specific than the native-module and deprecated API findings already available elsewhere in the report.

### Expensify App

- Repository: `Expensify/App`
- RN version: `0.83.1`
- Workflow: Expo bare/prebuild
- Patterns detected: `PATTERN-004`, `PATTERN-008`, `PATTERN-012`, `PATTERN-019`
- Confidence distribution: low 0, medium 3, high 1
- Action priorities: Must Fix Before Migration 3, Plan Later 1
- Grouped findings: Clipboard 1, Permissions 1, Android Gradle / Native Build 1, Barrel Imports 1
- Potential false positives: `PATTERN-004` and `PATTERN-008` are advisory for modern projects and may overstate urgency. `PATTERN-019` is medium because of large barrels and contextual evidence, but it still does not confirm an import cycle.
- Potential false negatives: The app has extensive custom native/module surface area and production-specific validation needs not represented by current known migration patterns.
- Recommendation quality assessment: Good grouping and prioritization; Android Gradle and barrel findings are understandable. Clipboard and permissions need clearer “validate only if package/version/config matches” wording.

### Firebase Instagram Sample

- Repository: local `firebase-instagram`
- RN version: `0.59.0` inferred from Expo SDK 35 React Native tarball
- Workflow: Expo managed
- Patterns detected: none
- Confidence distribution: low 0, medium 0, high 0
- Action priorities: none
- Grouped findings: none
- Potential false positives: none from known patterns.
- Potential false negatives: Legacy Expo SDK upgrade risk is identified in baseline readiness and upgrade recommendation, but no known migration pattern captures Expo SDK legacy migration, `expo-permissions` deprecation, or old React Navigation v2 migration risk.
- Recommendation quality assessment: Baseline readiness is useful, but known migration patterns are too sparse for legacy Expo projects.

### Joplin Mobile

- Repository: `laurent22/joplin/packages/app-mobile`
- RN version: `0.81.6`
- Workflow: Expo bare/prebuild
- Patterns detected: `PATTERN-004`
- Confidence distribution: low 0, medium 1, high 0
- Action priorities: Must Fix Before Migration 1
- Grouped findings: Clipboard 1
- Potential false positives: `PATTERN-004` fires on clipboard evidence even though the project is modern and may not have the manifest issue.
- Potential false negatives: Detected custom native modules, legacy lifecycle APIs, and use of `rn-fetch-blob`/filesystem/storage-style packages do not map to known migration patterns.
- Recommendation quality assessment: The single known pattern underrepresents migration complexity. The broader report gives better guidance than known patterns for this repo.

### Mattermost Mobile

- Repository: `mattermost/mattermost-mobile`
- RN version: `0.83.9`
- Workflow: Expo bare/prebuild
- Patterns detected: `PATTERN-004`, `PATTERN-008`, `PATTERN-019`
- Confidence distribution: low 0, medium 3, high 0
- Action priorities: Must Fix Before Migration 2, Plan Later 1
- Grouped findings: Clipboard 1, Permissions 1, Barrel Imports 1
- Potential false positives: `PATTERN-004` and `PATTERN-008` may be generic modernization checks rather than blockers. `PATTERN-019` is appropriately medium because screen imports from barrels were detected, but confirmed cycles are unavailable.
- Potential false negatives: Media, calls, Expo modules, and native visual component risks are surfaced as migration areas but not as known migration patterns.
- Recommendation quality assessment: Grouping is helpful. Report would be stronger if permissions output distinguished “handlers configured, validate runtime behavior” from “handler setup missing.”

### MetaMask Mobile

- Repository: `MetaMask/metamask-mobile`
- RN version: `0.81.5`
- Workflow: Expo bare/prebuild
- Patterns detected: `PATTERN-004`, `PATTERN-008`, `PATTERN-012`, `PATTERN-019`
- Confidence distribution: low 0, medium 2, high 2
- Action priorities: Must Fix Before Migration 3, Plan Later 1
- Grouped findings: Clipboard 1, Permissions 1, Android Gradle / Native Build 1, Barrel Imports 1
- Potential false positives: `PATTERN-004` remains broad. `PATTERN-019` is medium, which is appropriate, but title wording still implies runtime crash while evidence is structural.
- Potential false negatives: Heavy crypto, keychain, secure storage, WebView, and custom native module concerns are not covered by known migration patterns.
- Recommendation quality assessment: Good high-level signal density. The report correctly flags custom native modules elsewhere, but known patterns do not yet cover the most domain-specific risks.

### Rainbow

- Repository: `rainbow-me/rainbow`
- RN version: `0.79.5`
- Workflow: Expo bare/prebuild
- Patterns detected: `PATTERN-004`, `PATTERN-008`, `PATTERN-014`, `PATTERN-019`
- Confidence distribution: low 0, medium 3, high 1
- Action priorities: Must Fix Before Migration 3, Plan Later 1
- Grouped findings: Clipboard 1, Permissions 1, Android Gradle / Native Build 1, Barrel Imports 1
- Potential false positives: `PATTERN-014` is plausible but still heuristic because it infers annotation/typedef risk from older native packages. `PATTERN-004` may be overly broad.
- Potential false negatives: Wallet/crypto/native security packages and Expo module edge cases are not modeled as known patterns.
- Recommendation quality assessment: Recommendations are actionable enough for initial triage, but package-specific Android/native validation tasks would improve usefulness.

### React Native Firebase Sample

- Repository: local `react-native-firebase`
- RN version: `0.74.5`
- Workflow: Expo managed
- Patterns detected: none
- Confidence distribution: low 0, medium 0, high 0
- Action priorities: none
- Grouped findings: none
- Potential false positives: none from known patterns.
- Potential false negatives: Firebase/native SDK migration risk is captured as risky dependency and migration area, but there is no known migration pattern for Firebase package/version/platform configuration.
- Recommendation quality assessment: Good as a lightweight audit; known migration patterns add no value for this repo.

### Rocket.Chat.ReactNative

- Repository: `Rocket.Chat.ReactNative` via local validation repo
- RN version: `0.81.5`
- Workflow: Expo bare/prebuild
- Patterns detected: `PATTERN-004`, `PATTERN-012`, `PATTERN-019`
- Confidence distribution: low 0, medium 2, high 1
- Action priorities: Must Fix Before Migration 2, Plan Later 1
- Grouped findings: Clipboard 1, Android Gradle / Native Build 1, Barrel Imports 1
- Potential false positives: `PATTERN-004` is generic. `PATTERN-019` is medium but not cycle-confirmed.
- Potential false negatives: Custom native module groups are a major migration blocker but not represented as a known migration pattern. Notification/calls/media packages are only migration areas.
- Recommendation quality assessment: Grouped output is clear. Native-module review should be promoted more prominently in future known-pattern logic or action planning.

### Bluesky Social App

- Repository: `bluesky-social/social-app`
- RN version: `0.81.5`
- Workflow: Expo managed
- Patterns detected: none
- Confidence distribution: low 0, medium 0, high 0
- Action priorities: none
- Grouped findings: none
- Potential false positives: none from known patterns.
- Potential false negatives: Camera, navigation, media, storage, Expo modules, and native dependency usage are detected as migration areas but do not produce known patterns.
- Recommendation quality assessment: The audit provides migration-area guidance, but known migration patterns are silent for modern Expo managed apps.

### Status Mobile

- Repository: local `status-mobile`
- RN version: `0.73.5`
- Workflow: bare React Native
- Patterns detected: `PATTERN-004`, `PATTERN-008`, `PATTERN-011`, `PATTERN-012`, `PATTERN-014`
- Confidence distribution: low 0, medium 4, high 1
- Action priorities: Must Fix Before Migration 4, Validate During Migration 1
- Grouped findings: Clipboard 1, Permissions 1, Metro / Runtime Tooling 1, Android Gradle / Native Build 2
- Potential false positives: `PATTERN-011` uses lockfile-only `lru-cache` evidence and may not represent the actual Metro resolver path. `PATTERN-014` is heuristic package/version evidence.
- Potential false negatives: React Native Navigation, Firebase, WebView, MMKV, and keychain/security dependencies are important but not represented by known migration patterns.
- Recommendation quality assessment: Strongest known-pattern coverage in the set. Confidence should be more nuanced for lockfile-only Metro/Babel risks.

### Zulip Mobile

- Repository: `zulip/zulip-mobile`
- RN version: reported as `7.0.0`
- Workflow: Expo bare/prebuild
- Patterns detected: `PATTERN-004`, `PATTERN-011`
- Confidence distribution: low 0, medium 2, high 0
- Action priorities: Must Fix Before Migration 1, Validate During Migration 1
- Grouped findings: Clipboard 1, Metro / Runtime Tooling 1
- Potential false positives: The reported RN version appears incorrect because the package uses a GitHub React Native fork spec. This can distort baseline readiness and upgrade path logic. `PATTERN-011` is lockfile-based and may be noisy.
- Potential false negatives: Legacy Android Gradle, legacy SoLoader, custom native modules, old Expo SDK, and React Navigation stack risk should be represented more directly. `PATTERN-020` did not trigger because the scanner requires RN 0.76+ targeting, but the upgrade path may eventually reach that condition.
- Recommendation quality assessment: The report exposes important facts, but RN version normalization for fork specs is a blocker for reliable guidance.

## Metrics

### Pattern Frequency

| Pattern | Count | Notes |
|---|---:|---|
| `PATTERN-004` Clipboard Android Manifest Issue | 9 | Most frequent; likely too broad for modern apps. |
| `PATTERN-008` react-native-permissions iOS Handler Configuration Missing | 6 | Often medium confidence even when handlers are configured. |
| `PATTERN-019` Circular Barrel Import Runtime Crash | 5 | Improved by medium confidence, but title may still overstate evidence. |
| `PATTERN-012` React Native 0.71 Android Gradle Migration | 4 | Useful when legacy Gradle constructs are present. |
| `PATTERN-011` Metro/Babel LRU Cache Version Skew | 2 | Lockfile-only evidence needs careful calibration. |
| `PATTERN-014` Legacy Android Annotation Processor / Typedef Extraction Issue | 2 | Plausible but heuristic. |
| `PATTERN-001` Metro OpenSSL Compatibility | 0 | Did not trigger. |
| `PATTERN-002` React Navigation Version Mismatch | 0 | Did not trigger after version-family calibration. |
| `PATTERN-003` React Native DOM Type Conflict | 0 | Did not trigger. |
| `PATTERN-005` RN 0.68 Boost Podspec Failure | 0 | Did not trigger. |
| `PATTERN-006` RCT-Folly / Xcode 26 Compatibility | 0 | Did not trigger. |
| `PATTERN-007` React Native Tooling Version Skew | 0 | Did not trigger. |
| `PATTERN-009` RN 0.71 Podfile Configuration Shape Change | 0 | Did not trigger. |
| `PATTERN-010` react-native-screens Fabric Pod Compatibility Issue | 0 | Did not trigger. |
| `PATTERN-013` React Native Video ExoPlayer Resource Resolution Issue | 0 | Did not trigger. |
| `PATTERN-015` Unused MLKit Flavor Dependency Issue | 0 | Did not trigger. |
| `PATTERN-016` Legacy SVG Transformer Metro Compatibility Issue | 0 | Did not trigger. |
| `PATTERN-017` react-native-screens AppCompat Theme Attribute Issue | 0 | Did not trigger. |
| `PATTERN-018` Native UI Component Missing From UIManager | 0 | Did not trigger. |
| `PATTERN-020` RN 0.76+ Android SoLoader Merged Native Library Mapping | 0 | Did not trigger. |
| `PATTERN-022` react-native-video Pre-Release or Legacy Branch Modernization Recommended | 0 | Did not trigger. |

### Confidence Distribution

| Confidence | Count | Share |
|---|---:|---:|
| High | 6 | 21.4% |
| Medium | 22 | 78.6% |
| Low | 0 | 0.0% |

Observation: the current pattern set rarely emits low confidence in real repositories. This suggests either low-confidence matches are filtered out by strict criteria or several medium-confidence advisory patterns should be downgraded.

### Action Priority Distribution

| Action Priority | Count | Share |
|---|---:|---:|
| Must Fix Before Migration | 21 | 75.0% |
| Validate During Migration | 2 | 7.1% |
| Plan Later | 5 | 17.9% |
| Informational | 0 | 0.0% |

Observation: the report is heavily weighted toward Must Fix. Some broad heuristics, especially clipboard and configured permissions, may be better presented as Validate During Migration unless exact failure evidence exists.

### Group Frequency

| Group | Count |
|---|---:|
| Clipboard | 9 |
| Permissions | 6 |
| Android Gradle / Native Build | 6 |
| Barrel Imports | 5 |
| Metro / Runtime Tooling | 2 |

### Most Common Findings

- Clipboard Android Manifest Issue appeared in 9 of 12 repositories.
- Permissions handler configuration appeared in 6 of 12 repositories.
- Barrel import runtime risk appeared in 5 of 12 repositories.
- Android Gradle migration appeared in 4 of 12 repositories.
- Metro/Babel LRU cache skew appeared in 2 of 12 repositories.

## Cross-Repository Analysis

### Patterns That Trigger Excessively

- `PATTERN-004` appears over-broad. It triggers from clipboard evidence plus Android presence, but does not verify affected clipboard versions or manifest content.
- `PATTERN-008` appears useful, but medium-confidence matches often indicate “permissions package and area exist” rather than “handler setup is missing.” This can read like a blocker even when handlers are configured.
- `PATTERN-019` triggers on large-barrel structure and screen import context. The medium confidence is appropriate, but the title still sounds like a confirmed runtime crash.

### Patterns That Never Triggered

- Legacy milestone patterns did not trigger in this set: `PATTERN-001`, `PATTERN-003`, `PATTERN-005`, `PATTERN-006`, `PATTERN-009`, `PATTERN-010`, `PATTERN-013`, `PATTERN-015`, `PATTERN-016`, `PATTERN-017`, `PATTERN-018`, `PATTERN-020`, `PATTERN-022`.
- `PATTERN-002` did not trigger after calibration because none of the repositories had confirmed React Navigation major-family skew.
- Several never-triggered patterns may still be valuable as targeted incident knowledge, but they need fixture validation because real current repos did not exercise them.

### Missing Migration Scenarios

- Expo SDK migration patterns are missing, especially legacy Expo SDK projects and modern Expo SDK + native folders.
- Firebase native package migration is not represented as a known pattern despite recurring Firebase dependency and migration-area evidence.
- Custom native module / bridge migration deserves known-pattern treatment because it dominates complexity in Joplin, Rocket.Chat, MetaMask, Rainbow, Zulip, Expensify, and Eigen.
- React Native fork or GitHub dependency spec handling needs explicit version-normalization validation; Zulip showed an incorrect RN version result.
- Security-sensitive native packages such as keychain, biometrics, secure random, crypto, wallet SDKs, MMKV, and WebView are only generic migration areas today.
- Expo modules such as notifications, camera, media library, updates, file system, and permissions need Expo-specific recommendation language.
- React Native Navigation is not covered as a distinct high-risk navigation/native integration scenario.
- Legacy core API migration appears in deprecated API findings but is not grouped into known migration patterns or Action Register.

### Duplicate Recommendations

- Clipboard appears both as deprecated API evidence and `PATTERN-004`, but `PATTERN-004` focuses on Android manifest risk rather than core Clipboard migration. The report should clarify whether it is API migration, manifest validation, or both.
- Permissions appear in migration areas and `PATTERN-008`; when handlers are present, the recommendation duplicates generic permissions validation.
- Barrel import findings overlap with Runtime Risk Indicators. This is acceptable, but wording should avoid implying two independent findings.
- Android Gradle/native build findings overlap with baseline readiness and upgrade execution plan. Grouping helps, but the action text could be consolidated.

### Confidence Inconsistencies

- Several broad advisory patterns default to medium while more specific facts elsewhere are not represented as patterns.
- `PATTERN-004` has no dynamic confidence, so affected-version and manifest-content certainty cannot be communicated.
- `PATTERN-008` can be high for missing setup and medium for configured setup plus migration-area evidence; this is useful but should change action language accordingly.
- `PATTERN-011` medium confidence from lockfile-only `lru-cache` evidence may still overstate risk when Metro/Babel resolver paths are unknown.
- `PATTERN-019` now avoids high confidence without cycle evidence, but the title still implies a confirmed crash.

## Recommendations

### Candidate Patterns For Calibration

- `PATTERN-004`: add version and manifest-content evidence before Must Fix severity; downgrade generic clipboard evidence to Validate During Migration.
- `PATTERN-008`: split missing handler setup from configured-permissions runtime validation, or adjust action priority by confidence.
- `PATTERN-011`: distinguish direct dependency, lockfile-only, and proven Metro resolver-path evidence.
- `PATTERN-012`: keep high confidence for explicit legacy Gradle constructs; ensure modern RN projects with harmless template differences do not over-trigger.
- `PATTERN-014`: require clearer package/version/tooling combinations or keep as lower-confidence Android native build advisory.
- `PATTERN-019`: rename or reword to “Large Barrel Runtime Risk Indicator” unless confirmed cycles are available.

### Candidate New Patterns

- Expo SDK legacy migration and Expo SDK version drift.
- Expo bare/prebuild native folder drift against SDK/RN template expectations.
- Custom native module / bridge migration review.
- Firebase native package migration readiness.
- React Native version declared as GitHub fork/tarball/workspace spec.
- React Native Navigation native integration compatibility.
- WebView migration and native runtime validation.
- Secure storage / keychain / biometric / crypto native package validation.
- MMKV/storage engine migration validation.
- Legacy core API migration cluster for AsyncStorage, NetInfo, Clipboard, Picker, and legacy lifecycles.

### Candidate Pattern Mergers

- Merge or cluster `PATTERN-004` with core Clipboard deprecated API findings under a Clipboard group, while preserving separate Android manifest evidence when present.
- Merge `PATTERN-011`, `PATTERN-007`, and Metro-related parts of `PATTERN-016` into a Metro/runtime tooling group with evidence-specific subfindings.
- Cluster `PATTERN-012`, `PATTERN-014`, and `PATTERN-020` under Android Native Build with clearer sub-actions.
- Cluster `PATTERN-013`, `PATTERN-014`, and `PATTERN-022` under Video Playback when video evidence is present.

### Candidate Pattern Retirements

- No pattern should be retired solely from this validation pass.
- `PATTERN-005` and `PATTERN-006` are narrow historical incident patterns; keep them only if fixture validation proves they still add value for RN 0.68 migrations.
- `PATTERN-018` should remain only if package-specific fixtures can demonstrate weak/native UI registration evidence.

## Proposed Roadmap After C1

1. Fix RN version normalization for GitHub/tarball/workspace specs before adding more logic.
2. Calibrate high-frequency broad patterns: `PATTERN-004`, `PATTERN-008`, `PATTERN-011`, and `PATTERN-019`.
3. Add fixture coverage for never-triggered legacy patterns so they are intentionally retained or scoped down.
4. Add custom native module / bridge known-pattern reporting, because it is the most consistent real-world blocker across production apps.
5. Add Expo-specific known patterns for legacy SDK, prebuild/native folder drift, and Expo module migration checks.
6. Add Firebase/WebView/security-storage/native-auth package clusters only after validating against additional real repositories.
7. Improve report de-duplication so migration areas, deprecated APIs, known patterns, and Action Register reinforce each other without repeating the same recommendation.
