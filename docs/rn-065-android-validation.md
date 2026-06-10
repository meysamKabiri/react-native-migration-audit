# Android Build Validation — RN 0.63.4 → 0.65.3 (Stage 2A)

**Project:** FastPong  
**Target path:** `/Users/meysamkabiri/F_P/fastpong-main`  
**Date:** 2026-06-10  
**Build command:** `cd android && ./gradlew assembleDebug`  
**Result:** `BUILD SUCCESSFUL in 1m 25s` (803 tasks, 354 executed, 449 up-to-date)  
**APK output:** `android/app/build/outputs/apk/debug/app-debug.apk` (57 MB)

---

## Environment

| Setting | Value |
|---------|-------|
| OS | macOS (Darwin) |
| JDK | Java 17 |
| Gradle | 7.2 (wrapper) |
| Android Gradle Plugin | 4.2.2 |
| compileSdk | 33 |
| buildToolsVersion | 30.0.2 (forced — 33.0.0 lacks `dx`) |
| Kotlin | 1.5.31 |

---

## Files Changed (Target Project)

### `android/build.gradle`

- `kotlinVersion`: `1.3.41` → `1.5.31` (RN 0.65 default)
- Added `google()` + `mavenCentral()` to subprojects buildscript repositories (needed for AGP 4.2.2 resolution)
- Added subprojects resolution strategy block forcing:
  - `com.google.android.exoplayer:exoplayer:2.13.3`
  - `com.google.android.exoplayer:extension-okhttp:2.13.3`

### `android/app/build.gradle`

- `react-native:0.20.1` → `react-native:+` (was hardcoded to wrong version; autolink resolves correctly)
- `constraintlayout:2.2.0` → `2.1.4` (2.2.0 requires compileSdk 34)
- `appcompat:1.7.0` → `1.6.1` (1.7.0 requires compileSdk 34)
- Force resolution strategy:
  - `com.google.android.exoplayer:exoplayer:2.13.3`
  - `com.google.android.exoplayer:extension-okhttp:2.13.3`

### `android/gradle.properties`

- `FLIPPER_VERSION`: `0.54.0` → `0.93.0` (RN 0.65.3 default)
- `org.gradle.jvmargs`: appended `--add-opens=java.base/java.io=ALL-UNNAMED` (Java 17 reflection access with AGP 4.2.2)

### `android/app/src/main/java/com/fastpong/MainApplication.java`

- Removed unused `import com.reactnativecommunity.cameraroll.CameraRollPackage` (package not in dependencies)

### `package.json`

- `react-native-gesture-handler`: `^2.3.2` → `1.10.3` (2.21.2 resolved — uses RN 0.66+ native APIs not present in 0.65)
- `react-native-screens`: `^3.13.1` → `3.13.1` (3.35.0 resolved — uses `UIManager.resolveView` added in RN 0.66+)

---

## Node Module Patches Required (Postinstall)

These changes are in `node_modules/` and must be re-applied after each `yarn install`:

### `@react-native-clipboard/clipboard` manifest

**File:** `node_modules/@react-native-clipboard/clipboard/android/src/main/AndroidManifest.xml`  
**Fix:** Add `package="com.reactnativecommunity.clipboard"` to `<manifest>` tag  
**Reason:** AGP 4.2.2 requires `package` in manifest when `namespace` is not set in `build.gradle`

Recommend using `patch-package` or a `postinstall` script to persist this change.

---

## Blockers Encountered & Resolutions

| # | Blocker | Root Cause | Resolution |
|---|---------|-----------|------------|
| 1 | `react-native@0.20.1` hardcoded in `app/build.gradle` | Typo/leftover version string | Changed to `+` (autolink resolves from `package.json`) |
| 2 | Flipper version mismatch | RN 0.63 default Flipper 0.54.0 incompatible with RN 0.65 | Updated to `0.93.0` |
| 3 | Kotlin version too old (1.3.41) | Kotlin version mismatch for AGP 4.2.2 | Updated to `1.5.31` |
| 4 | AGP 4.2.2 missing from subprojects repo list | `react-native-fs` failed to resolve AGP | Added `google()` + `mavenCentral()` to subprojects buildscript |
| 5 | `dx` tool missing in Build Tools 33.0.0 | macOS SDK install lacks `dx` in 33+ | Forced `buildToolsVersion 30.0.2` |
| 6 | ExoPlayer 2.13.2 404 from Google Maven | Package removed from maven | Forced ExoPlayer `2.13.3` (available) via resolutionStrategy |
| 7 | ExoPlayer 2.18.7 API breaking changes | ExoPlayer 2.16+ removed `ExoPlayerFactory`, changed listener interfaces | Downgraded force to `2.13.3` |
| 8 | `constraintlayout:2.2.0` requires compileSdk 34 | Version mismatch | Downgraded to `2.1.4` |
| 9 | `appcompat:1.7.0` requires compileSdk 34 | Version mismatch | Downgraded to `1.6.1` |
| 10 | `@react-native-clipboard/clipboard` manifest missing `package` | AGP 4.2.2 requires explicit `package` in manifest | Added `package="com.reactnativecommunity.clipboard"` to manifest |
| 11 | `react-native-gesture-handler` Kotlin compilation errors (v2.21.2) | Uses RN 0.66+ native APIs (`onChildStartedNativeGesture`, `overflow`, `resolveView`) | Downgraded to `1.10.3` (Java-based, fully compatible) |
| 12 | `react-native-screens` Kotlin `resolveView` error (v3.35.0) | Uses `UIManager.resolveView` added in RN 0.66 | Pinned to `3.13.1` |
| 13 | `react-native-video` Java compilation errors | ExoPlayer 2.18.x removed APIs used by `react-native-video 5.2.0-alpha1` | Forced ExoPlayer `2.13.3` instead of `2.18.7` |
| 14 | `CameraRollPackage` import not found | Dead import in `MainApplication.java` for removed dependency | Removed unused import |

---

## Remaining Considerations

- **JS bundle** was skipped (`bundleDebugJsAndAssets SKIPPED`) — this is normal for debug builds; the app loads from Metro dev server.
- **Kotlin stdlib version mismatch warnings** from `react-native-webview` and `react-native-screens` (mixing Kotlin 1.4, 1.5, 1.6 stdlibs). These are warnings, not errors.
- **JNA native library architecture warning** (`arm64` vs `x86_64`) — benign warning from lint/inspection tooling on Apple Silicon.
- **Firebase Core dependency warning** — the app uses `react-native-fbsdk-next` which expects Firebase, but the app's `build.gradle` doesn't include `firebase-core`. Pre-existing, not introduced by migration.
- **Facebook SDK ApplicationId metadata duplicate** — pre-existing in `AndroidManifest.xml`, not introduced by migration.

---

## Stage 2A Android Assessment

**Android native build passes** for RN `0.65.3`.

The 14 blockers above were all resolved. The build produces a valid debug APK.

**Note:** The following workarounds should be formalized in production:
1. Use `patch-package` for the `@react-native-clipboard/clipboard` AndroidManifest.xml fix
2. Pin `react-native-gesture-handler` to `1.10.3` and `react-native-screens` to `3.13.1` in `package.json` (already done)
3. The ExoPlayer version forcing via resolutionStrategy needs to be retained while on `react-native-video 5.2.0-alpha1`

**Recommendation:** Stage 2A Android validation is complete. Next step is iOS validation if needed.
