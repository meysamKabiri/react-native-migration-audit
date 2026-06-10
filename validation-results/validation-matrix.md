# Real-World Validation Matrix

Updated for the validation-command and package-manager accuracy milestone. The source checkouts for Rocket.Chat.ReactNative, eigen, firebase-instagram, In1Bank, and Tourist Wallet were not present in this workspace, so full reruns were not possible here; targeted local fixtures verified the new detection paths, and the available FastPong checkout was rerun successfully.

## Summary Matrix

| Repository | Workflow | RN Version | Risk | Baseline | Proposal | Native Modules | Complexity | Migration Areas | Notes |
|---|---|---:|---|---|---|---:|---|---|---|
| Rocket.Chat.ReactNative | expo-bare-or-prebuild | 0.81.5 | high | not-ready | Manual Review Required | 15 groups / 21 raw | 91 extreme | Camera, Navigation, Authentication SDKs, UI / Native Visual Components, Storage | Typecheck detection now recognizes embedded `tsc` commands such as `lint: eslint . && tsc`. |
| eigen | expo-bare-or-prebuild | 0.83.6 | high | not-ready | Manual Review Required | 10 groups / 19 raw | 80 high | Navigation, Authentication SDKs, Permissions, UI / Native Visual Components, Storage | Typecheck detection now recognizes `type-check` and `ci:type-check` script names. |
| status-mobile | bare-react-native | 0.73.5 | high | warning | Upgrade Sprint | 0 groups / 0 raw | 62 significant | Camera, Navigation, Authentication SDKs, Media, Permissions, UI / Native Visual Components, Storage | Dependency-derived fallback resolved the empty migration-area false negative. Areas now reflect camera, navigation, Firebase, permissions, UI/media, and storage dependencies. |
| react-native-firebase | expo-managed | 0.74.5 | high | warning | Upgrade Audit | 0 groups / 0 raw | 18 low | Navigation, Storage | Unchanged. Managed Expo classification still looks correct. Risk/proposal explanation remains a future improvement. |
| firebase-instagram | expo-managed | Expo SDK 35 (legacy React Native baseline) | high | not-ready | Upgrade Sprint | 0 groups / 0 raw | 25 moderate | Permissions, UI / Native Visual Components | Mixed `yarn.lock` and `package-lock.json` are now reported as package-manager risk. |

## Before vs After

| Repository | Before | After | Result |
|---|---|---|---|
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

Resolved issues:
- Typecheck script detection now recognizes embedded `tsc` commands such as Rocket.Chat's `lint` script.

Remaining issues:
- Android Gradle Plugin is still `null`; Gradle plugin extraction remains a future improvement.

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

Resolved issues:
- Typecheck script aliases `type-check` and `ci:type-check` are now recognized.
- Bluetooth false positive removed.
- RN version display normalized from Yarn patch protocol to `0.83.6`.
- Upgrade recommendation and readiness now use the normalized RN version.

Remaining issues:
- Android Gradle Plugin remains `null`.

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

Resolved issues:
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
| 1 | Android Gradle Plugin extraction misses modern layouts | Rocket.Chat/eigen/status show `androidGradlePlugin: null` | Build tooling age checks may underreport risk. |
| 2 | Package-rule metadata remains incomplete | status-mobile risky deps `react-native-navigation`, `react-native-mmkv` still have category `unknown` | Upgrade tasks are less specific than migration areas. |
| 3 | ClojureScript imports still not parsed | status-mobile `.cljs` imports require fallback | Source usage counts remain incomplete. |
| 4 | Legacy `react-navigation` 2.x still underdetected in sparse-but-not-empty projects | firebase-instagram has `react-navigation` 2.6.0 | Navigation area can still be missed when other areas already exist. |
| 5 | Firebase/Auth label is broad | Firebase analytics/messaging/app can map to Authentication SDKs | Area label may overstate auth-specific work. |
| 6 | Risk/proposal mismatch needs explanation | react-native-firebase has `riskLevel: high`, complexity `low`, proposal `Upgrade Audit` | Users may question why high risk maps to a small proposal. |
| 7 | Expo SDK-to-RN baseline map is intentionally minimal | SDK 35 is mapped; other old SDK tarballs may need mappings | Future non-semver Expo baselines may still need manual review. |
| 8 | Dependency fallback cannot show exact source files | status-mobile areas are package-derived | Report identifies areas but not source usage points. |

## Improvement Opportunities

| # | Opportunity | Priority |
|---:|---|---|
| 1 | Improve Gradle/AGP version extraction for plugin DSL and convention plugins | high |
| 2 | Expand `packageRules` metadata for React Native Navigation, MMKV, camera roll, and related packages | medium |
| 3 | Add ClojureScript import support in a future scanner milestone | medium |
| 4 | Revisit fallback threshold or merge dependency-derived areas more broadly without overreporting | medium |
| 5 | Split Firebase/Auth migration labels into Firebase Services vs Authentication SDKs | medium |
| 6 | Add explanatory copy when risk level and complexity/proposal diverge | medium |
| 7 | Expand Expo SDK tarball normalization map beyond SDK 35 | medium |
| 8 | Add confidence/source labels to migration areas: AST-derived vs dependency-derived | medium |

## This Milestone Verification

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
