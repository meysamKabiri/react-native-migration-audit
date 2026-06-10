# Real-World Validation Matrix

Updated for the migration-area source confidence milestone. Rocket.Chat.ReactNative, eigen, and status-mobile were rerun from local `validation-repos/` source checkouts.

## Summary Matrix

| Repository | Workflow | RN Version | Risk | Baseline | Proposal | Native Modules | Complexity | Migration Areas | Notes |
|---|---|---:|---|---|---|---:|---|---|---|
| Rocket.Chat.ReactNative | expo-bare-or-prebuild | 0.81.5 | high | not-ready | Manual Review Required | 15 groups / 21 raw | 88 extreme | Camera, Navigation, Authentication SDKs, UI / Native Visual Components, Storage | Migration-area evidence now shows mostly AST sources, with mixed sources where dependencies add evidence. |
| eigen | expo-bare-or-prebuild | 0.83.6 | high | not-ready | Manual Review Required | 10 groups / 19 raw | 77 high | Navigation, Authentication SDKs, Permissions, UI / Native Visual Components, Storage | Migration-area evidence shows AST/mixed sources; Bluetooth remains absent. |
| status-mobile | bare-react-native | 0.73.5 | high | warning | Upgrade Sprint | 0 groups / 0 raw | 62 significant | Camera, Navigation, Authentication SDKs, Media, Permissions, UI / Native Visual Components, Storage | Migration areas recovered from dependency fallback because `.cljs` imports are not parsed. |
| react-native-firebase | expo-managed | 0.74.5 | high | warning | Upgrade Audit | 0 groups / 0 raw | 18 low | Navigation, Storage | Unchanged. Managed Expo classification still looks correct. Risk/proposal explanation remains a future improvement. |
| firebase-instagram | expo-managed | Expo SDK 35 (legacy React Native baseline) | high | not-ready | Upgrade Sprint | 0 groups / 0 raw | 25 moderate | Permissions, UI / Native Visual Components | Mixed `yarn.lock` and `package-lock.json` are now reported as package-manager risk. |

## Before vs After

| Repository | Before | After | Result |
|---|---|---|---|
| status-mobile | Migration areas were listed without showing they came from dependency fallback. | All recovered areas show `Dependency` confidence source with package evidence such as `react-native-mmkv dependency`. | Users can see that areas were recovered from dependencies because `.cljs` imports are not parsed. |
| Rocket.Chat.ReactNative | Migration areas were listed without source confidence. | Report shows confidence sources such as `Camera: AST`, `Navigation: AST`, and mixed areas where dependency evidence contributes. | Users can see source imports versus dependency-only evidence. |
| eigen | Migration areas were listed without source confidence; Bluetooth had previously been a concern. | Report shows AST/mixed evidence sources and no Bluetooth area. | Source transparency added without reintroducing the Bluetooth false positive. |
| Rocket.Chat.ReactNative | `androidGradlePlugin: null` despite `com.android.tools.build:gradle` and `com.android.application` usage. | `androidGradlePlugin: "present-unknown"`; report shows `Present (version could not be determined)`. | Resolved false absence; version remains unresolved because no version is declared in scanned Gradle files. |
| eigen | `androidGradlePlugin: null` despite `com.android.tools.build:gradle` and `com.android.application` usage. | `androidGradlePlugin: "present-unknown"`; report shows `Present (version could not be determined)`. | Resolved false absence; version remains unresolved because no version is declared in scanned Gradle files. |
| status-mobile | `androidGradlePlugin: null` even though `gradlePluginVersion=7.4.2` exists in `android/gradle.properties`. | `androidGradlePlugin: "7.4.2"`; report shows `Android Gradle Plugin: 7.4.2`. | Resolved AGP version extraction through Gradle properties. |
| Rocket.Chat.ReactNative | `hasTypecheckScript: false` even though `lint` runs `tsc`. | `hasTypecheckScript: true`, `typecheckScriptName: "lint"`, `typecheckScriptCommand: "eslint . && tsc"`. | Resolved false missing-typecheck warning for embedded `tsc` commands. |
| eigen | `hasTypecheckScript: false` even though `type-check` and `ci:type-check` scripts exist. | `hasTypecheckScript: true`; the named typecheck script is recorded. | Resolved false missing-typecheck warning for hyphenated and CI aliases. |
| firebase-instagram | Mixed `yarn.lock` and `package-lock.json` were not surfaced. | `lockfiles: ["yarn.lock", "package-lock.json"]`, `hasMixedLockfiles: true`, medium package-manager risk added. | Mixed package-manager state is now visible in JSON, report, readiness, and migration tasks. |
| eigen | RN displayed as `patch:react-native@npm%3A0.83.6...`; Bluetooth area present from `react-native-collapsible-tab-view`; complexity 93 extreme. | RN displays as `0.83.6`; `reactNativeRaw` keeps the patch spec; Bluetooth area removed; complexity 80 high. | Resolved false positive and confusing RN display. Complexity changed only because the false high-risk Bluetooth area was removed. |
| status-mobile | Migration areas were empty despite dependencies for camera, navigation, Firebase, permissions, UI/media, and storage; complexity 39 moderate. | Migration areas: Camera, Navigation, Authentication SDKs, Media, Permissions, UI / Native Visual Components, Storage; complexity 62 significant. | Resolved dependency-area false negative. Complexity changed because existing scoring now sees the newly detected areas; scoring formula was not changed. |
| firebase-instagram | RN displayed as raw Expo tarball URL; upgrade recommendation said modern-upgrade/current stable. | RN displays as `Expo SDK 35 (legacy React Native baseline)`; `reactNativeRaw` keeps the URL; recommendation is staged Expo/RN upgrade. | Resolved non-semver RN recommendation issue. |
| Rocket.Chat.ReactNative | Camera, Navigation, Authentication SDKs, UI, Storage; 91 extreme. | Same. | No regression observed. |
| react-native-firebase | Navigation, Storage; 18 low. | Same. | No regression observed. |

## Per-Repository Accuracy Review

### Rocket.Chat.ReactNative

Expected findings:
- Expo dependency with `ios/` and `android/` folders should be treated as bare/prebuild workflow.
- Native bridge modules should block immediate migration and require manual review.
- Risky native dependencies should include Reanimated, Gesture Handler, Screens, Firebase, MMKV, and WebView.

Actual findings after fixes:
- Workflow: `expo-bare-or-prebuild`.
- Baseline: `not-ready` due to 15 native module groups.
- Proposal: `Manual Review Required`.
- Native groups include `A11yFlow`, `ExternalInput`, `InvertedScroll`, `SecureStorage`, `Voip`, and related Turbo/Swift bridge modules.
- Migration areas: Camera, Navigation, Authentication SDKs, UI / Native Visual Components, Storage.
- Migration area evidence: Camera and Navigation are AST-sourced; Authentication SDKs and UI / Native Visual Components are mixed; Storage is AST-sourced.

Resolved issues:
- Migration-area confidence sources and evidence details are now visible in the report.
- Android Gradle Plugin usage now reports `present-unknown` instead of `null` when the plugin is present but the version is not declared in scanned files.
- Typecheck script detection now recognizes embedded `tsc` commands such as Rocket.Chat's `lint` script.

Remaining issues:
- AGP version remains unknown because Rocket.Chat declares `classpath("com.android.tools.build:gradle")` without a local version declaration.

New issues introduced:
- None observed.

### eigen

Expected findings:
- Expo plus native folders should be bare/prebuild.
- iOS native bridge modules should force manual review.
- Yarn patch protocol RN dependency should display as clean semver while preserving raw dependency evidence.
- `react-native-collapsible-tab-view` should not create a Bluetooth migration area.

Actual findings after fixes:
- Workflow: `expo-bare-or-prebuild`.
- React Native display: `0.83.6`.
- Raw React Native value: `patch:react-native@npm%3A0.83.6#~/.yarn/patches/react-native-npm-0.83.6-hermes-checksum.patch`.
- Baseline: `not-ready` due to 10 native module groups.
- Proposal: `Manual Review Required`.
- Migration areas: Navigation, Authentication SDKs, Permissions, UI / Native Visual Components, Storage.
- Migration area evidence: Navigation, Authentication SDKs, and UI / Native Visual Components are mixed; Permissions and Storage are AST-sourced.

Resolved issues:
- Migration-area confidence sources and evidence details are now visible in the report.
- Android Gradle Plugin usage now reports `present-unknown` instead of `null` when the plugin is present but the version is not declared in scanned files.
- Typecheck script aliases `type-check` and `ci:type-check` are now recognized.
- Bluetooth false positive removed.
- RN version display normalized from Yarn patch protocol to `0.83.6`.
- Upgrade recommendation and readiness now use the normalized RN version.

Remaining issues:
- AGP version remains unknown because eigen declares `classpath("com.android.tools.build:gradle")` without a local version declaration.

New issues introduced:
- Complexity moved from 93 extreme to 80 high because a false high-risk Bluetooth area was removed. This is expected, not a regression.

### status-mobile

Expected findings:
- Bare React Native workflow should be high risk.
- Dependencies should reveal Camera, Navigation, Permissions, Storage, Firebase/Auth, Media, and UI/native visual areas even when AST cannot parse the dominant source language.

Actual findings after fixes:
- Workflow: `bare-react-native`.
- Baseline: `warning` due to missing package scripts.
- Proposal: `Upgrade Sprint`.
- Risky dependencies include Reanimated, Gesture Handler, Firebase App, React Native Navigation, MMKV, and WebView.
- Migration areas: Camera, Navigation, Authentication SDKs, Media, Permissions, UI / Native Visual Components, Storage.
- Migration area evidence: all recovered areas are dependency-sourced because `.cljs` imports are not parsed by the AST scanner.

Resolved issues:
- Migration areas now explicitly show `Dependency` confidence source and package evidence.
- Android Gradle Plugin now resolves to `7.4.2` from `android/gradle.properties`.
- Empty migration-area false negative resolved by dependency-derived fallback.
- `react-native-navigation`, `react-native-mmkv`, `react-native-camera-kit`, `react-native-permissions`, camera roll, and Firebase dependencies now contribute to migration areas.

Remaining issues:
- `astScan.packageUsages` still only sees JavaScript worklet imports; ClojureScript source imports are not parsed. The fallback mitigates this but does not replace true source support.
- Risky dependency task categories for `react-native-navigation` and `react-native-mmkv` still come from `packageRules` as `unknown`; package-rule metadata expansion remains future work.

New issues introduced:
- Complexity moved from 39 moderate to 62 significant because migration areas are no longer empty. This is expected from improved detection; scoring formula was not changed.

### react-native-firebase

Expected findings:
- Managed Expo project without native folders.
- Navigation and storage packages should be detected.
- Missing test/lint/typecheck scripts should warn.

Actual findings after fixes:
- Workflow: `expo-managed`.
- Baseline: `warning`.
- Proposal: `Upgrade Audit`.
- Native modules: 0.
- Migration areas: Navigation, Storage.

Resolved issues:
- None specific to this repo from the three targeted fixes.

Remaining issues:
- Risk level is `high` from risky dependencies while complexity remains `low`; explanatory copy for this divergence remains future work.

New issues introduced:
- None observed.

### firebase-instagram

Expected findings:
- Old Expo SDK 35 / React 16 baseline should be high risk and not ready.
- Expo permissions and image picker should be detected.
- RN URL dependency should display as an old Expo/RN baseline, not as a raw URL.

Actual findings after fixes:
- Workflow: `expo-managed`.
- React Native display: `Expo SDK 35 (legacy React Native baseline)`.
- Raw React Native value: `https://github.com/expo/react-native/archive/sdk-35.0.0.tar.gz`.
- React Native semver baseline for rules: `0.59.0`.
- Baseline: `not-ready` due to old RN migration floor.
- Upgrade recommendation: staged-upgrade, `Expo SDK 35 baseline → modern Expo SDK → current stable`.
- Migration areas: Permissions, UI / Native Visual Components.

Resolved issues:
- Mixed `yarn.lock` and `package-lock.json` are now detected and reported.
- Raw Expo tarball no longer appears as the main RN display value.
- Upgrade recommendation no longer says modern-upgrade/current stable.
- Baseline readiness uses the normalized old baseline semantics.

Remaining issues:
- Legacy `react-navigation` 2.x is still not added because fallback only activates when detected areas are empty or sparse; the existing two detected areas are not sparse enough under the current fallback threshold.

New issues introduced:
- None observed.

## Top Accuracy Issues After This Milestone

| # | Issue | Evidence | Impact |
|---:|---|---|---|
| 1 | AGP version can remain unresolved when the project omits a local version declaration | Rocket.Chat/eigen use `classpath("com.android.tools.build:gradle")` without a version in scanned files | The audit can confirm plugin presence but not the exact AGP version. |
| 2 | Package-rule metadata remains incomplete | status-mobile risky deps `react-native-navigation`, `react-native-mmkv` still have category `unknown` | Upgrade tasks are less specific than migration areas. |
| 3 | ClojureScript imports still not parsed | status-mobile `.cljs` imports require fallback | Source usage counts remain incomplete. |
| 4 | Legacy `react-navigation` 2.x still underdetected in sparse-but-not-empty projects | firebase-instagram has `react-navigation` 2.6.0 | Navigation area can still be missed when other areas already exist. |
| 5 | Firebase/Auth label is broad | Firebase analytics/messaging/app can map to Authentication SDKs | Area label may overstate auth-specific work. |
| 6 | Risk/proposal mismatch needs explanation | react-native-firebase has `riskLevel: high`, complexity `low`, proposal `Upgrade Audit` | Users may question why high risk maps to a small proposal. |
| 7 | Expo SDK-to-RN baseline map is intentionally minimal | SDK 35 is mapped; other old SDK tarballs may need mappings | Future non-semver Expo baselines may still need manual review. |
| 8 | Dependency fallback cannot show exact source files | status-mobile areas are package-derived | Report now labels these as dependency-sourced, but exact `.cljs` source locations remain unavailable. |

## Improvement Opportunities

| # | Opportunity | Priority |
|---:|---|---|
| 1 | Resolve AGP versions supplied only by external Gradle convention plugins or remote React Native plugin metadata | high |
| 2 | Expand `packageRules` metadata for React Native Navigation, MMKV, camera roll, and related packages | medium |
| 3 | Add ClojureScript import support in a future scanner milestone | medium |
| 4 | Revisit fallback threshold or merge dependency-derived areas more broadly without overreporting | medium |
| 5 | Split Firebase/Auth migration labels into Firebase Services vs Authentication SDKs | medium |
| 6 | Add explanatory copy when risk level and complexity/proposal diverge | medium |
| 7 | Expand Expo SDK tarball normalization map beyond SDK 35 | medium |
| 8 | Add source parsing support for `.cljs` or other non-TypeScript app source layouts | medium |

## This Milestone Verification

| Case | Command | Result |
|---|---|---|
| status-mobile migration-area evidence | `yarn run audit validation-repos/status-mobile --out validation-results/status-mobile` | All migration areas show `Dependency` source; evidence lists dependency packages such as `react-native-navigation dependency` and `react-native-mmkv dependency`. |
| Rocket.Chat.ReactNative migration-area evidence | `yarn run audit validation-repos/Rocket.Chat.ReactNative --out validation-results/Rocket.Chat.ReactNative` | Most areas show `AST`; mixed areas include both source usage and dependency evidence. |
| eigen migration-area evidence | `yarn run audit validation-repos/eigen --out validation-results/eigen` | Areas show `AST` or `Mixed`; Bluetooth area remains absent. |

## Previous Milestone Verification

| Case | Command | Result |
|---|---|---|
| Rocket.Chat.ReactNative AGP | `yarn run audit validation-repos/Rocket.Chat.ReactNative --out validation-results/Rocket.Chat.ReactNative` | `androidGradlePlugin: "present-unknown"`; report shows `Present (version could not be determined)`. |
| eigen AGP | `yarn run audit validation-repos/eigen --out validation-results/eigen` | `androidGradlePlugin: "present-unknown"`; report shows `Present (version could not be determined)`. |
| status-mobile AGP | `yarn run audit validation-repos/status-mobile --out validation-results/status-mobile` | `androidGradlePlugin: "7.4.2"`; report shows `Android Gradle Plugin: 7.4.2`. |

## Earlier Milestone Verification

| Case | Command | Result |
|---|---|---|
| Rocket.Chat-like typecheck | `yarn run audit <rocket-like-fixture>` | `typecheckScriptName: "lint"`, command `eslint . && tsc`; report shows `Typecheck script: Yes (\`lint\`)`. |
| eigen-like typecheck | `yarn run audit <eigen-like-fixture>` | `typecheckScriptName: "type-check"`, command `tsc --noEmit`; report shows `Typecheck script: Yes (\`type-check\`)`. |
| firebase-instagram-like lockfiles | `yarn run audit <mixed-lockfiles-fixture>` | `lockfiles: ["yarn.lock", "package-lock.json"]`, `hasMixedLockfiles: true`; report/readiness/risk/task note all include the mixed-lockfile warning. |
| FastPong regression | `yarn run audit <fastpong-source>` | Audit completed successfully with no mixed lockfiles and no typecheck script, matching the available fixture state. |
| In1Bank and Tourist Wallet | Not run | Source checkouts were not present in this workspace. |

## Deliverables Verified

Each audited repository under `validation-results/` contains:
- `audit-result.json`
- `report.md`
- `migration-plan.md`
- `migration-tasks.md`

Failure logs:
- `validation-results/clone-failures.json`: `[]`
- `validation-results/audit-failures.json`: `[]`
