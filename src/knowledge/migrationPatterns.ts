import type {
  MigrationPattern,
  MigrationPatternAuditFacts,
} from "../models/MigrationPattern";
import {
  INFORMATIONAL,
  MUST_FIX,
  PLAN_LATER,
  VALIDATE_DURING_MIGRATION,
  type ActionPriority,
} from "../models/ActionPriority";
export type { MigrationPattern } from "../models/MigrationPattern";

const GROUP_METRO = {
  id: "metro-runtime",
  title: "Metro / Runtime Tooling",
  description: "Metro, Babel, bundling, and runtime module-resolution risks.",
};

const GROUP_NAVIGATION = {
  id: "navigation",
  title: "Navigation",
  description: "React Navigation and native navigation-adjacent compatibility risks.",
};

const GROUP_TYPESCRIPT = {
  id: "typescript",
  title: "TypeScript",
  description: "TypeScript and type compatibility risks.",
};

const GROUP_CLIPBOARD = {
  id: "clipboard",
  title: "Clipboard",
  description: "Clipboard migration and native package integration risks.",
};

const GROUP_RN068_IOS = {
  id: "rn-068-ios",
  title: "RN 0.68 iOS",
  description: "RN 0.68 iOS pod install and native toolchain risks.",
};

const GROUP_PERMISSIONS = {
  id: "permissions",
  title: "Permissions",
  description: "Runtime permission handler and platform configuration risks.",
};

const GROUP_PODFILE = {
  id: "podfile",
  title: "iOS Podfile",
  description: "Podfile template and CocoaPods migration risks.",
};

const GROUP_ANDROID_GRADLE = {
  id: "android-gradle",
  title: "Android Gradle / Native Build",
  description: "Android Gradle template, native library, and build compatibility risks.",
};

const GROUP_VIDEO = {
  id: "video",
  title: "Video Playback",
  description: "react-native-video modernization, Android build, and playback validation risks.",
};

const GROUP_CAMERA = {
  id: "camera",
  title: "Camera",
  description: "Camera package and native dependency migration risks.",
};

const GROUP_NATIVE_UI = {
  id: "native-ui",
  title: "Native UI Components",
  description: "Native UI component registration and autolinking risks.",
};

const GROUP_BARRELS = {
  id: "barrels",
  title: "Barrel Imports",
  description: "Barrel export and runtime circular dependency risk indicators.",
};

export const migrationPatterns: MigrationPattern[] = [
  {
    id: "PATTERN-001",
    title: "Metro OpenSSL Compatibility",
    description:
      "Metro can fail with ERR_OSSL_EVP_UNSUPPORTED when an older Metro/RN stack runs on modern Node/OpenSSL defaults.",
    affectedVersions: ["React Native <=0.68", "Node >=17"],
    detectionCriteria: [
      "React Native version is older than 0.69.",
      "Metro start script is present.",
      "Start script does not already include explicit OpenSSL compatibility handling.",
    ],
    recommendation:
      "Use a supported Node version for the RN milestone or add explicit Metro compatibility handling such as NODE_OPTIONS=--openssl-legacy-provider where appropriate.",
    actionPriority: MUST_FIX,
    patternGroup: GROUP_METRO,
    evidenceTypes: ["config", "heuristic"],
  },
  {
    id: "PATTERN-002",
    title: "React Navigation Version Mismatch",
    description:
      "React Navigation upgrades can fail when packages from different major versions are mixed, commonly surfacing as headerMode errors or navigation typing mismatches.",
    detectionCriteria: [
      "Multiple React Navigation packages are detected.",
      "Detected @react-navigation/* packages use different major version families, or legacy react-navigation is mixed with scoped @react-navigation/* packages.",
      "Known symptoms include headerMode errors and navigation typing mismatch.",
    ],
    recommendation:
      "Audit all @react-navigation/* packages together and keep their major versions aligned with compatible gesture-handler and screens versions for the target RN milestone.",
    actionPriority: VALIDATE_DURING_MIGRATION,
    patternGroup: GROUP_NAVIGATION,
    evidenceTypes: ["dependency", "source"],
  },
  {
    id: "PATTERN-003",
    title: "React Native DOM Type Conflict",
    description:
      "React Native TypeScript projects can hit duplicate global type definitions such as Blob, FormData, Request, and Response when DOM libs are mixed with RN globals.",
    affectedVersions: ["React Native <=0.68", "TypeScript projects"],
    detectionCriteria: [
      "TypeScript is detected.",
      "React Native version is older than 0.69 or the project is following a legacy staged migration path.",
      "Known symptoms include duplicate Blob, FormData, Request, and Response definitions.",
    ],
    recommendation:
      "Review tsconfig lib/types configuration before broad TypeScript fixes; keep RN globals and DOM types intentionally scoped for the migration milestone.",
    actionPriority: VALIDATE_DURING_MIGRATION,
    patternGroup: GROUP_TYPESCRIPT,
    evidenceTypes: ["dependency", "heuristic"],
  },
  {
    id: "PATTERN-004",
    title: "Clipboard Android Manifest Issue",
    description:
      "Clipboard migration can expose Android manifest merge failures when a clipboard package manifest is missing the package attribute.",
    detectionCriteria: [
      "Clipboard usage or @react-native-clipboard/clipboard is detected.",
      "Android project is present.",
      "Known symptoms include manifest merge failure and clipboard package manifest missing package attribute.",
    ],
    recommendation:
      "Validate Android manifest merge after clipboard migration; if the package version is affected, use a narrow documented patch-package fix rather than broad dependency upgrades.",
    actionPriority: MUST_FIX,
    patternGroup: GROUP_CLIPBOARD,
    evidenceTypes: ["dependency", "source", "heuristic"],
  },
  {
    id: "PATTERN-005",
    title: "RN 0.68 Boost Podspec Failure",
    description:
      "RN 0.68 iOS installs can fail when the bundled Boost podspec points at an unavailable or changed Boost archive URL.",
    affectedVersions: ["React Native 0.68.x"],
    detectionCriteria: [
      "Upgrade path includes RN 0.68.x or current RN version is 0.68.x.",
      "iOS Podfile is present.",
      "Known symptoms include pod install failure and boost download issue.",
    ],
    recommendation:
      "During RN 0.68 iOS validation, watch for Boost pod install failures; prefer a narrow documented podspec URL/checksum patch if the upstream archive URL is stale.",
    actionPriority: MUST_FIX,
    patternGroup: GROUP_RN068_IOS,
    evidenceTypes: ["config", "heuristic"],
  },
  {
    id: "PATTERN-006",
    title: "RCT-Folly / Xcode 26 Compatibility",
    description:
      "RN 0.68-era RCT-Folly can fail under newer Xcode/libc++ combinations with C++ build or folly compilation errors.",
    affectedVersions: ["React Native 0.68.x", "Xcode 26"],
    detectionCriteria: [
      "Upgrade path includes RN 0.68.x or current RN version is 0.68.x.",
      "iOS Podfile is present.",
      "Known symptoms include C++ build failure and folly compilation failure.",
    ],
    recommendation:
      "Treat RCT-Folly failures as a scoped iOS toolchain compatibility risk; prefer target-specific Podfile build-setting fixes over broad iOS dependency upgrades.",
    actionPriority: MUST_FIX,
    patternGroup: GROUP_RN068_IOS,
    evidenceTypes: ["config", "heuristic"],
  },
  {
    id: "PATTERN-008",
    title: "react-native-permissions iOS Handler Configuration Missing",
    description:
      "Application may build successfully but fail at runtime because react-native-permissions permission handlers are not installed, configured, or regenerated correctly.",
    detectionCriteria: [
      "react-native-permissions dependency or source usage is detected.",
      "iOS project is present.",
      "Podfile is missing, setup_permissions(...) is missing, setup_permissions(...) appears empty, or permission handlers cannot be identified.",
      "Permissions migration area evidence is present, increasing runtime validation confidence.",
      "Known symptoms include 'No permission handler detected' and RNPermissionsModule constantsToExport crash.",
    ],
    recommendation:
      "Verify Podfile contains setup_permissions(...) with all handlers required by the application. Run pod install after changes, clear DerivedData when permission-handler configuration changes, and reinstall the app after permission-handler changes.",
    actionPriority: MUST_FIX,
    patternGroup: GROUP_PERMISSIONS,
    evidenceTypes: ["dependency", "source", "config"],
  },
  {
    id: "PATTERN-007",
    title: "React Native Tooling Version Skew",
    description:
      "Metro runtime failures caused by React Native tooling packages from newer RN major versions.",
    detectionCriteria: [
      "React Native version is known.",
      "dependencyVersions are available.",
      "One or more @react-native/* tooling packages (babel-preset, babel-plugin-codegen, eslint-config) have versions significantly newer than the project's React Native version.",
      "Known symptoms include Cannot read properties of undefined (reading 'transformFile'), Failed to construct transformer, Metro transformer initialization failure, and Bundler.js transformFile crash.",
    ],
    recommendation:
      "Align React Native tooling packages with the current RN milestone. Remove unnecessary newer tooling packages. Clear Metro and watchman cache after dependency alignment.",
    actionPriority: VALIDATE_DURING_MIGRATION,
    patternGroup: GROUP_METRO,
    evidenceTypes: ["dependency", "heuristic"],
  },
  {
    id: "PATTERN-009",
    title: "RN 0.71 Podfile Configuration Shape Change",
    description:
      "RN 0.71 changes Podfile configuration expectations and older Podfile implementations may fail during pod install.",
    affectedVersions: [
      "React Native 0.71.x",
      "iOS projects upgraded from <0.71",
    ],
    detectionCriteria: [
      "RN upgrade target includes 0.71 or newer.",
      "iOS project and Podfile are present.",
      'Legacy Podfile config access patterns such as config["reactNativePath"] are detected, or an older RN Podfile is being carried into the 0.71 milestone.',
      'Known symptoms include config["reactNativePath"] is nil, pod install failure, and use_react_native! configuration failure.',
    ],
    recommendation:
      "Compare Podfile against the RN 0.71 template. Verify use_react_native! arguments and config access patterns.",
    actionPriority: MUST_FIX,
    patternGroup: GROUP_PODFILE,
    evidenceTypes: ["config", "heuristic"],
  },
  {
    id: "PATTERN-010",
    title: "react-native-screens Fabric Pod Compatibility Issue",
    description:
      "Older react-native-screens versions may incorrectly pull Fabric-related dependencies during RN 0.71 migration.",
    affectedVersions: ["React Native >=0.71", "react-native-screens <3.20.0"],
    detectionCriteria: [
      "RN version or upgrade target is 0.71 or newer.",
      "react-native-screens is present.",
      "Detected react-native-screens version is below the known compatible threshold.",
      "Known symptoms include pod install failure, RNScreens Fabric dependency issues, and RCT_NEW_ARCH_ENABLED related failures.",
    ],
    recommendation:
      "Verify react-native-screens version against the target RN milestone. Use a compatible screens version before enabling new architecture features.",
    actionPriority: MUST_FIX,
    patternGroup: GROUP_NAVIGATION,
    evidenceTypes: ["dependency"],
  },
  {
    id: "PATTERN-011",
    title: "Metro/Babel LRU Cache Version Skew",
    description:
      "Metro starts but runtime bundling fails because Babel resolves an incompatible lru-cache implementation.",
    detectionCriteria: [
      "Metro configuration or Metro packages are present.",
      "Babel tooling is present.",
      "lru-cache is detected at a version significantly newer than Metro/Babel expectations without a compatible direct pin.",
      "Known symptoms include _lruCache is not a constructor, Metro startup/runtime failure, and bundle generation failure.",
    ],
    recommendation:
      "Verify Metro/Babel dependency alignment. Check hoisted lru-cache versions. Pin a compatible version only when necessary and validated.",
    actionPriority: VALIDATE_DURING_MIGRATION,
    patternGroup: GROUP_METRO,
    evidenceTypes: ["dependency", "lockfile", "config"],
  },
  {
    id: "PATTERN-012",
    title: "React Native 0.71 Android Gradle Migration",
    description:
      "RN 0.71 introduces Android Gradle structure changes that can break existing projects.",
    affectedVersions: [
      "React Native >=0.71",
      "Android projects upgraded from <0.71",
    ],
    detectionCriteria: [
      "RN upgrade target includes 0.71 or newer.",
      "Android project is present.",
      "Legacy Android Gradle patterns or pre-0.71 Android Gradle Plugin versions are detected.",
      "Known symptoms include react-android resolution failures, Gradle plugin migration issues, enableHermes configuration errors, and Android build failures after RN 0.71 upgrade.",
    ],
    recommendation:
      "Compare Android configuration against the RN 0.71 template. Verify com.facebook.react plugin, react-android dependency usage, Hermes configuration, and Gradle/AGP compatibility.",
    actionPriority: MUST_FIX,
    patternGroup: GROUP_ANDROID_GRADLE,
    evidenceTypes: ["config", "heuristic"],
  },
  {
    id: "PATTERN-013",
    title: "React Native Video ExoPlayer Resource Resolution Issue",
    description:
      "Android builds may fail after React Native upgrades because react-native-video ExoPlayer resources are no longer resolved correctly.",
    affectedVersions: ["React Native >=0.71", "react-native-video <6.0.0"],
    detectionCriteria: [
      "react-native-video dependency or source usage is detected.",
      "Android project is present.",
      "RN version or upgrade target is 0.71 or newer.",
      "Detected react-native-video version is a legacy pre-6 version.",
      "Known symptoms include cannot find symbol R, resource linking failed, ExoPlayer resource compilation failures, and Android build failure in react-native-video.",
    ],
    recommendation:
      "Verify react-native-video compatibility with the target RN milestone. Check ExoPlayer integration and Android Gradle compatibility.",
    actionPriority: MUST_FIX,
    patternGroup: GROUP_VIDEO,
    evidenceTypes: ["dependency", "source", "heuristic"],
  },
  {
    id: "PATTERN-014",
    title: "Legacy Android Annotation Processor / Typedef Extraction Issue",
    description:
      "Android compilation can fail because older libraries rely on deprecated annotation extraction or typedef generation mechanisms removed in newer Android Gradle tooling.",
    affectedVersions: [
      "React Native >=0.71",
      "Modern Android Gradle Plugin",
      "legacy Android native libraries",
    ],
    detectionCriteria: [
      "Android project is present.",
      "RN version or upgrade target is 0.71 or newer.",
      "Modern Android Gradle Plugin or RN Android template migration is expected.",
      "Known older native Android libraries are present.",
      "Known symptoms include extractAnnotations, generateTypedefs, annotation processor failures, and Android build breaks after Gradle upgrade.",
    ],
    recommendation:
      "Inspect Android library build.gradle files for legacy annotation extraction tasks. Compare against modern Android Gradle templates.",
    actionPriority: MUST_FIX,
    patternGroup: GROUP_ANDROID_GRADLE,
    relatedPatternGroups: [GROUP_VIDEO],
    evidenceTypes: ["dependency", "config", "heuristic"],
  },
  {
    id: "PATTERN-015",
    title: "Unused MLKit Flavor Dependency Issue",
    description:
      "react-native-camera may pull legacy MLKit flavor dependencies that fail compilation or dependency resolution after RN/Gradle upgrades.",
    affectedVersions: ["react-native-camera <4.0.0", "Android projects"],
    detectionCriteria: [
      "react-native-camera dependency or source usage is detected.",
      "Android project is present.",
      "Detected react-native-camera version is the legacy package line with Android flavors.",
      "Known symptoms include MLKit dependency resolution failure, Android compile failure, and missing MLKit artifacts.",
    ],
    recommendation:
      "Review react-native-camera flavors. Disable unused MLKit integrations only after verifying required camera features.",
    actionPriority: MUST_FIX,
    patternGroup: GROUP_CAMERA,
    evidenceTypes: ["dependency", "source", "heuristic"],
  },
  {
    id: "PATTERN-016",
    title: "Legacy SVG Transformer Metro Compatibility Issue",
    description:
      "Metro can start but bundling or runtime can fail because an older react-native-svg-transformer implementation is incompatible with the upgraded Metro pipeline.",
    affectedVersions: [
      "React Native >=0.71",
      "react-native-svg-transformer <1.0.0",
    ],
    detectionCriteria: [
      "react-native-svg-transformer is present.",
      "SVG runtime dependencies or SVG-related package usage are detected.",
      "RN version or upgrade target is 0.71 or newer.",
      "Detected transformer version is significantly older than RN milestone expectations.",
      "Known symptoms include transformFile failures, SVG import failures, Metro bundling errors, and runtime crashes when loading SVG assets.",
    ],
    recommendation:
      "Verify react-native-svg-transformer compatibility with the target RN milestone. Review Metro SVG transformer configuration.",
    actionPriority: VALIDATE_DURING_MIGRATION,
    patternGroup: GROUP_METRO,
    evidenceTypes: ["dependency", "source", "config"],
  },
  {
    id: "PATTERN-017",
    title: "react-native-screens AppCompat Theme Attribute Issue",
    description:
      "Android builds can fail because older react-native-screens versions reference AppCompat theme attributes that are no longer resolved correctly.",
    affectedVersions: ["React Native >=0.74", "react-native-screens <3.25.0"],
    detectionCriteria: [
      "react-native-screens dependency or source usage is detected.",
      "Android project is present.",
      "RN version or upgrade target is 0.74 or newer.",
      "Detected react-native-screens version is below the conservative compatibility threshold.",
      "Known symptoms include colorPrimary not found, AppCompat theme attribute failure, resource linking errors, and react-native-screens Android build failure.",
    ],
    recommendation:
      "Verify react-native-screens compatibility with the target RN version. Review Android theme and AppCompat dependencies.",
    actionPriority: MUST_FIX,
    patternGroup: GROUP_NAVIGATION,
    evidenceTypes: ["dependency", "source", "heuristic"],
  },
  {
    id: "PATTERN-018",
    title: "Native UI Component Missing From UIManager",
    description:
      "An application can build successfully but crash at runtime because a native UI component is not registered in UIManager after a React Native upgrade.",
    affectedVersions: [
      "React Native upgraded apps",
      "native UI component packages with weak autolinking support",
    ],
    detectionCriteria: [
      "Native UI dependency evidence is detected.",
      "iOS or Android native project is present.",
      "Package is known to expose requireNativeComponent or native visual components.",
      "High confidence requires known missing or weak podspec/autolinking support.",
      "Known symptoms include requireNativeComponent(...) was not found in the UIManager, Invariant Violation, and native component not registered.",
    ],
    recommendation:
      "Verify native module installation. Inspect Podfile and Android native registration. Confirm the native component exists in the upgraded dependency version and review autolinking compatibility.",
    actionPriority: MUST_FIX,
    patternGroup: GROUP_NATIVE_UI,
    evidenceTypes: ["dependency", "source", "heuristic"],
  },
  {
    id: "PATTERN-019",
    title: "Circular Barrel Import Runtime Crash",
    description:
      "Application builds successfully, Metro bundles successfully, and the app launches, but runtime navigation to certain screens can crash because circular dependencies exist through barrel exports (index.ts / index.tsx).",
    detectionCriteria: [
      "Large barrel export files detected in the project.",
      "Multiple screen areas import from shared barrels.",
      "Barrel re-exports many components, creating runtime circular dependency risk after Metro/module resolution changes.",
      "Known symptoms include Cannot read property 'ActionBar' of undefined, Cannot read property 'style' of undefined, TypeError on screen navigation, and imported component unexpectedly undefined.",
    ],
    recommendation:
      "Avoid importing runtime-sensitive components from large barrel exports. Prefer direct imports for ActionBar, Table, modal components, BLE components, native UI wrappers, and runtime-sensitive screen dependencies. Investigate circular dependency chains involving index.ts/index.tsx barrels.",
    actionPriority: PLAN_LATER,
    patternGroup: GROUP_BARRELS,
    evidenceTypes: ["source", "heuristic"],
  },
  {
    id: "PATTERN-020",
    title: "RN 0.76+ Android SoLoader Merged Native Library Mapping",
    description:
      "RN 0.76+ ReactAndroid merges multiple JNI native libraries (react_devsupportjni, reactnativejni, fabricjni, etc.) into a single libreactnative.so. SoLoader requires OpenSourceMergedSoMapping to resolve merged library names. Using SoLoader.init(this, false) without the mapping causes UnsatisfiedLinkError at startup.",
    affectedVersions: [
      "React Native >=0.76",
      "Android projects upgraded from <0.76",
    ],
    detectionCriteria: [
      "React Native version is 0.76 or newer.",
      "Android project exists.",
      "MainApplication.java or MainApplication.kt contains legacy SoLoader.init(this, false) or equivalent initialization without OpenSourceMergedSoMapping.",
      "OpenSourceMergedSoMapping is not referenced in the project.",
      "Known symptoms include UnsatisfiedLinkError: libreact_devsupportjni.so not found, app closes immediately after launch, and Android startup crash despite successful build.",
    ],
    recommendation:
      "Update MainApplication.onCreate() to pass OpenSourceMergedSoMapping.INSTANCE to SoLoader.init(): replace SoLoader.init(this, false) with SoLoader.init(this, OpenSourceMergedSoMapping.INSTANCE). This registers the merged SO mapping so SoLoader can resolve names like react_devsupportjni, reactnativejni, fabricjni, turbomodulejsijni, uimanagerjni, mapbufferjni, reactnativeblob, rninstance, react_newarchdefaults, and yoga to libreactnative.so.",
    actionPriority: MUST_FIX,
    patternGroup: GROUP_ANDROID_GRADLE,
    evidenceTypes: ["source", "config"],
  },
  {
    id: "PATTERN-022",
    title:
      "react-native-video Pre-Release or Legacy Branch Modernization Recommended",

    description:
      "Project depends on an alpha, pre-release, or significantly outdated react-native-video version. While builds may still succeed, long-term compatibility, native integration stability, and future React Native upgrades may become increasingly difficult.",
    affectedVersions: [
      "react-native-video alpha releases",
      "react-native-video beta releases",
      "react-native-video versions significantly behind current stable releases",
    ],
    detectionCriteria: [
      "High: version contains alpha, beta, or rc, or major version < 5.",
      "Medium: major version = 5 stable and React Native >= 0.74.",
      "Low: major version = 5 stable and React Native < 0.74.",
      "Do NOT trigger when: react-native-video >= 6.x stable or package absent.",
    ],
    recommendation:
      "Inventory current video usage. Review callback and playback API compatibility. Build and validate Android media playback. Build and validate iOS media playback. Validate playback controls, progress events, load events, and error handling. Remove obsolete react-native-video patches. Consider migration to a current stable react-native-video release.",
    actionPriority: VALIDATE_DURING_MIGRATION,
    patternGroup: GROUP_VIDEO,
    evidenceTypes: ["dependency", "source", "heuristic"],
  },
];

function normalizeVersion(value: string | null | undefined) {
  const match = value?.match(/\d+\.\d+(?:\.\d+)?/);
  return match?.[0] ?? null;
}

function getMinor(version: string | null) {
  const minor = version?.match(/^0\.(\d+)/)?.[1];
  return minor ? Number(minor) : null;
}

function getMajor(version: string | null) {
  const major = version?.match(/^(\d+)/)?.[1];
  return major ? Number(major) : null;
}

function parseVersionTuple(value: string | null | undefined) {
  const version = normalizeVersion(value);
  if (!version) return null;

  const [major = 0, minor = 0, patch = 0] = version
    .split(".")
    .map((part) => Number(part));

  return { major, minor, patch };
}

function compareVersions(a: string | null | undefined, b: string) {
  const left = parseVersionTuple(a);
  const right = parseVersionTuple(b);
  if (!left || !right) return null;

  if (left.major !== right.major) return left.major - right.major;
  if (left.minor !== right.minor) return left.minor - right.minor;
  return left.patch - right.patch;
}

function isReactNativeOlderThan(
  result: MigrationPatternAuditFacts,
  minor: number,
) {
  const detectedMinor = getMinor(
    normalizeVersion(result.reactNativeSemver ?? result.reactNative),
  );

  return detectedMinor !== null && detectedMinor < minor;
}

function isReactNativeMinor(result: MigrationPatternAuditFacts, minor: number) {
  return (
    getMinor(
      normalizeVersion(result.reactNativeSemver ?? result.reactNative),
    ) === minor
  );
}

function upgradePathMentions(
  result: MigrationPatternAuditFacts,
  minor: number,
) {
  return new RegExp(`0\\.${minor}(?:\\D|$)`).test(
    result.upgradeRecommendation?.target ?? "",
  );
}

function upgradePathMentionsAtLeast(
  result: MigrationPatternAuditFacts,
  minor: number,
) {
  const target = result.upgradeRecommendation?.target ?? "";
  const matches = target.matchAll(/0\.(\d+)(?:\.\d+)?/g);

  for (const match of matches) {
    if (Number(match[1]) >= minor) return true;
  }

  return false;
}

function targetsReactNativeAtLeast(
  result: MigrationPatternAuditFacts,
  minor: number,
) {
  const currentMinor = getMinor(
    normalizeVersion(result.reactNativeSemver ?? result.reactNative),
  );

  return (
    (currentMinor !== null && currentMinor >= minor) ||
    upgradePathMentionsAtLeast(result, minor)
  );
}

function hasDependency(
  result: MigrationPatternAuditFacts,
  packageName: string,
) {
  return Boolean(result.dependencyVersions?.[packageName]);
}

function getDependencyVersion(
  result: MigrationPatternAuditFacts,
  packageName: string,
) {
  return (
    result.dependencyVersions?.[packageName] ??
    result.riskyDependencies?.find(
      (dependency) => dependency.name === packageName,
    )?.version ??
    null
  );
}

function hasDependencyEvidence(
  result: MigrationPatternAuditFacts,
  packageName: string,
) {
  return Boolean(
    getDependencyVersion(result, packageName) ||
    hasPackageUsage(result, packageName),
  );
}

function hasPackageUsage(
  result: MigrationPatternAuditFacts,
  packageName: string,
) {
  return (
    result.astScan?.packageUsages?.some(
      (usage) => usage.packageName === packageName,
    ) ?? false
  );
}

function hasMigrationArea(
  result: MigrationPatternAuditFacts,
  areaName: string,
) {
  return (
    result.migrationAreas?.some(
      (area) => area.area.toLowerCase() === areaName.toLowerCase(),
    ) ?? false
  );
}

function hasReactNativePermissionsEvidence(result: MigrationPatternAuditFacts) {
  return (
    hasDependency(result, "react-native-permissions") ||
    hasPackageUsage(result, "react-native-permissions") ||
    result.migrationAreas?.some((area) =>
      area.packages?.includes("react-native-permissions"),
    ) ||
    false
  );
}

function hasPermissionsHandlerConfigurationIssue(
  result: MigrationPatternAuditFacts,
) {
  return Boolean(
    !result.hasPodfile ||
    !result.hasSetupPermissions ||
    result.setupPermissionsIsEmpty ||
    result.setupPermissionsHandlersIdentified === false,
  );
}

function buildPermissionsPatternSignals(result: MigrationPatternAuditFacts) {
  const signals: string[] = [];

  if (hasDependency(result, "react-native-permissions")) {
    signals.push("react-native-permissions dependency is installed.");
  } else if (hasPackageUsage(result, "react-native-permissions")) {
    signals.push("react-native-permissions source usage is detected.");
  }

  if (!result.hasPodfile) {
    signals.push(
      "iOS project does not have a Podfile available for permission handler setup.",
    );
  } else if (!result.hasSetupPermissions) {
    signals.push("Podfile lacks setup_permissions(...).");
  } else if (result.setupPermissionsIsEmpty) {
    signals.push("setup_permissions(...) appears empty.");
  } else if (result.setupPermissionsHandlersIdentified === false) {
    signals.push(
      "Permission handlers cannot be identified from setup_permissions(...).",
    );
  } else if (result.setupPermissionsHandlers?.length) {
    signals.push(
      `setup_permissions(...) handlers detected: ${result.setupPermissionsHandlers.join(", ")}.`,
    );
  }

  if (hasMigrationArea(result, "Permissions")) {
    signals.push("Permissions migration area is detected.");
  }

  return signals;
}

function getPermissionsPatternConfidence(result: MigrationPatternAuditFacts) {
  if (hasPermissionsHandlerConfigurationIssue(result)) return "high";
  if (hasMigrationArea(result, "Permissions")) return "medium";
  return "low";
}

function hasRn071PodfileConfigRisk(result: MigrationPatternAuditFacts) {
  return Boolean(
    targetsReactNativeAtLeast(result, 71) &&
    result.hasIOS &&
    result.hasPodfile &&
    (result.podfileUsesLegacyReactNativePathConfig ||
      isReactNativeOlderThan(result, 71)),
  );
}

function buildRn071PodfileSignals(result: MigrationPatternAuditFacts) {
  const signals: string[] = [];

  if (targetsReactNativeAtLeast(result, 71)) {
    signals.push("Upgrade path includes RN 0.71 or newer.");
  }

  if (result.hasIOS) signals.push("iOS project is present.");
  if (result.hasPodfile) signals.push("Podfile is present.");

  if (result.podfileUsesLegacyReactNativePathConfig) {
    signals.push('Podfile uses legacy config["reactNativePath"] access.');
  } else if (isReactNativeOlderThan(result, 71)) {
    signals.push(
      "Project is upgrading from a pre-0.71 RN baseline; verify Podfile config access against the RN 0.71 template.",
    );
  }

  return signals;
}

function getRn071PodfileConfidence(result: MigrationPatternAuditFacts) {
  return result.podfileUsesLegacyReactNativePathConfig ? "high" : "medium";
}

const knownCompatibleScreensVersion = "3.20.0";

function hasScreensFabricCompatibilityRisk(result: MigrationPatternAuditFacts) {
  const screensVersion = getDependencyVersion(result, "react-native-screens");
  const comparison = compareVersions(
    screensVersion,
    knownCompatibleScreensVersion,
  );

  return Boolean(
    targetsReactNativeAtLeast(result, 71) &&
    hasDependencyEvidence(result, "react-native-screens") &&
    comparison !== null &&
    comparison < 0,
  );
}

function buildScreensFabricSignals(result: MigrationPatternAuditFacts) {
  const screensVersion = getDependencyVersion(result, "react-native-screens");
  const signals: string[] = [];

  if (targetsReactNativeAtLeast(result, 71)) {
    signals.push("RN version or upgrade path includes 0.71 or newer.");
  }

  if (screensVersion) {
    signals.push(`react-native-screens version detected: ${screensVersion}.`);
  }

  signals.push(
    `Known compatible threshold used by this heuristic: ${knownCompatibleScreensVersion}.`,
  );

  return signals;
}

function getScreensFabricConfidence(result: MigrationPatternAuditFacts) {
  return getDependencyVersion(result, "react-native-screens")
    ? "high"
    : "medium";
}

function getLockfileVersions(
  result: MigrationPatternAuditFacts,
  packageName: string,
) {
  return result.lockfilePackageVersions?.[packageName] ?? [];
}

function hasCompatibleDirectLruCachePin(result: MigrationPatternAuditFacts) {
  const directVersion = getDependencyVersion(result, "lru-cache");
  const major = getMajor(normalizeVersion(directVersion));

  return major !== null && major <= 5;
}

function hasNewLruCacheVersion(result: MigrationPatternAuditFacts) {
  const directVersion = getDependencyVersion(result, "lru-cache");
  const directMajor = getMajor(normalizeVersion(directVersion));
  if (directMajor !== null && directMajor >= 10) return true;

  return getLockfileVersions(result, "lru-cache").some((version) => {
    const major = getMajor(normalizeVersion(version));
    return major !== null && major >= 10;
  });
}

function hasMetroBabelLruCacheRisk(result: MigrationPatternAuditFacts) {
  const hasMetroEvidence = Boolean(
    result.hasMetroConfig ||
    hasDependency(result, "metro-react-native-babel-preset") ||
    hasDependency(result, "metro") ||
    hasDependency(result, "metro-config"),
  );
  const hasBabelEvidence = Boolean(
    result.hasBabelConfig ||
    hasDependency(result, "@babel/core") ||
    hasDependency(result, "@babel/runtime"),
  );

  return Boolean(
    hasMetroEvidence &&
    hasBabelEvidence &&
    hasNewLruCacheVersion(result) &&
    !hasCompatibleDirectLruCachePin(result),
  );
}

function buildMetroBabelLruSignals(result: MigrationPatternAuditFacts) {
  const directVersion = getDependencyVersion(result, "lru-cache");
  const lockfileVersions = getLockfileVersions(result, "lru-cache");
  const signals: string[] = [];

  if (result.hasMetroConfig) signals.push("Metro config is present.");
  if (result.hasBabelConfig) signals.push("Babel config is present.");
  if (directVersion)
    signals.push(`Direct lru-cache version: ${directVersion}.`);
  if (lockfileVersions.length) {
    signals.push(
      `Lockfile lru-cache versions: ${lockfileVersions.join(", ")}.`,
    );
  }

  signals.push("Metro/Babel symptom to watch: _lruCache is not a constructor.");

  return signals;
}

function getMetroBabelLruConfidence(result: MigrationPatternAuditFacts) {
  return getDependencyVersion(result, "lru-cache") ? "high" : "medium";
}

function isAndroidGradlePluginOlderThan(
  result: MigrationPatternAuditFacts,
  version: string,
) {
  const comparison = compareVersions(
    result.nativeVersions?.androidGradlePlugin,
    version,
  );
  return comparison !== null && comparison < 0;
}

function hasRn071AndroidGradleRisk(result: MigrationPatternAuditFacts) {
  return Boolean(
    targetsReactNativeAtLeast(result, 71) &&
    result.hasAndroid &&
    (result.androidUsesLegacyReactGradleApply ||
      result.androidUsesLegacyReactNativeDependency ||
      result.androidUsesProjectExtReact ||
      result.androidUsesFacebookReactPlugin === false ||
      result.androidUsesReactAndroidDependency === false ||
      isAndroidGradlePluginOlderThan(result, "7.3.0")),
  );
}

function buildRn071AndroidGradleSignals(result: MigrationPatternAuditFacts) {
  const signals: string[] = [];

  if (targetsReactNativeAtLeast(result, 71)) {
    signals.push("Upgrade path includes RN 0.71 or newer.");
  }

  if (result.hasAndroid) signals.push("Android project is present.");

  if (result.nativeVersions?.androidGradlePlugin) {
    signals.push(
      `Android Gradle Plugin detected: ${result.nativeVersions.androidGradlePlugin}.`,
    );
  }

  if (result.nativeVersions?.gradle) {
    signals.push(`Gradle wrapper detected: ${result.nativeVersions.gradle}.`);
  }

  if (result.androidUsesLegacyReactGradleApply) {
    signals.push("android/app/build.gradle applies legacy react.gradle.");
  }

  if (result.androidUsesLegacyReactNativeDependency) {
    signals.push(
      "Android app uses legacy com.facebook.react:react-native dependency.",
    );
  }

  if (result.androidUsesProjectExtReact) {
    signals.push("Android app uses legacy project.ext.react configuration.");
  }

  if (result.androidUsesFacebookReactPlugin === false) {
    signals.push(
      "Android app does not use the com.facebook.react Gradle plugin.",
    );
  }

  if (result.androidUsesReactAndroidDependency === false) {
    signals.push("Android app does not use the react-android dependency.");
  }

  return signals;
}

function getRn071AndroidGradleConfidence(result: MigrationPatternAuditFacts) {
  if (
    result.androidUsesLegacyReactGradleApply ||
    result.androidUsesLegacyReactNativeDependency ||
    result.androidUsesProjectExtReact
  ) {
    return "high" as const;
  }

  return isAndroidGradlePluginOlderThan(result, "7.3.0") ? "medium" : "low";
}

const knownReactNavigationPackages = [
  "@react-navigation/native",
  "@react-navigation/stack",
  "@react-navigation/bottom-tabs",
  "@react-navigation/drawer",
  "@react-navigation/material-bottom-tabs",
  "@react-navigation/material-top-tabs",
  "@react-navigation/native-stack",
  "react-navigation",
];

function hasNavigationEvidence(result: MigrationPatternAuditFacts) {
  return knownReactNavigationPackages.some(
    (packageName) =>
      hasDependency(result, packageName) ||
      hasPackageUsage(result, packageName),
  );
}

function getReactNavigationVersionEntries(result: MigrationPatternAuditFacts) {
  return knownReactNavigationPackages
    .map((packageName) => ({
      packageName,
      version: getDependencyVersion(result, packageName),
    }))
    .filter((entry): entry is { packageName: string; version: string } =>
      Boolean(entry.version),
    );
}

function hasReactNavigationVersionFamilyMismatch(
  result: MigrationPatternAuditFacts,
) {
  const entries = getReactNavigationVersionEntries(result);
  const hasLegacyPackage = entries.some(
    (entry) => entry.packageName === "react-navigation",
  );
  const scopedEntries = entries.filter((entry) =>
    entry.packageName.startsWith("@react-navigation/"),
  );

  if (hasLegacyPackage && scopedEntries.length > 0) return true;

  const scopedMajors = new Set(
    scopedEntries
      .map((entry) => getMajor(normalizeVersion(entry.version)))
      .filter((major): major is number => major !== null),
  );

  return scopedMajors.size > 1;
}

function buildReactNavigationMismatchSignals(
  result: MigrationPatternAuditFacts,
) {
  const entries = getReactNavigationVersionEntries(result);
  const signals: string[] = [];

  if (entries.length) {
    signals.push(
      `React Navigation package versions: ${entries
        .map((entry) => `${entry.packageName}@${entry.version}`)
        .join(", ")}.`,
    );
  }

  const scopedEntries = entries.filter((entry) =>
    entry.packageName.startsWith("@react-navigation/"),
  );
  const scopedMajorGroups = new Map<number, string[]>();

  for (const entry of scopedEntries) {
    const major = getMajor(normalizeVersion(entry.version));
    if (major === null) continue;
    scopedMajorGroups.set(major, [
      ...(scopedMajorGroups.get(major) ?? []),
      entry.packageName,
    ]);
  }

  if (scopedMajorGroups.size > 1) {
    signals.push(
      `Mixed @react-navigation major families: ${Array.from(scopedMajorGroups.entries())
        .map(([major, packages]) => `v${major} (${packages.join(", ")})`)
        .join("; ")}.`,
    );
  }

  if (
    entries.some((entry) => entry.packageName === "react-navigation") &&
    scopedEntries.length > 0
  ) {
    signals.push(
      "Legacy react-navigation package is installed alongside scoped @react-navigation packages.",
    );
  }

  if (hasDependency(result, "react-native-gesture-handler")) {
    signals.push(
      `react-native-gesture-handler version detected: ${getDependencyVersion(result, "react-native-gesture-handler")}.`,
    );
  }

  if (hasDependency(result, "react-native-screens")) {
    signals.push(
      `react-native-screens version detected: ${getDependencyVersion(result, "react-native-screens")}.`,
    );
  }

  return signals;
}

function getReactNavigationMismatchConfidence(
  result: MigrationPatternAuditFacts,
) {
  const entries = getReactNavigationVersionEntries(result);
  const hasLegacyPackage = entries.some(
    (entry) => entry.packageName === "react-navigation",
  );
  const scopedEntries = entries.filter((entry) =>
    entry.packageName.startsWith("@react-navigation/"),
  );
  const scopedMajors = new Set(
    scopedEntries
      .map((entry) => getMajor(normalizeVersion(entry.version)))
      .filter((major): major is number => major !== null),
  );

  if (scopedMajors.size > 1) return "high" as const;
  if (hasLegacyPackage && scopedEntries.length > 0) return "medium" as const;
  return "low" as const;
}

const toolingVersionSkewPackages = [
  "@react-native/babel-preset",
  "@react-native/babel-plugin-codegen",
  "@react-native/eslint-config",
  "@react-native/metro-config",
];

const knownLegacyAnnotationRiskPackages = [
  { name: "react-native-camera", threshold: "4.0.0" },
  { name: "react-native-video", threshold: "6.0.0" },
  { name: "react-native-gesture-handler", threshold: "2.0.0" },
  { name: "@react-native-community/netinfo", threshold: "8.0.0" },
  { name: "react-native-device-info", threshold: "9.0.0" },
  { name: "react-native-fs", threshold: "2.20.0" },
  { name: "react-native-sound", threshold: "0.12.0" },
];

function getToolingVersionMinor(
  result: MigrationPatternAuditFacts,
  packageName: string,
) {
  const version = result.dependencyVersions?.[packageName];
  if (!version) return null;
  return getMinor(normalizeVersion(version));
}

function hasClipboardEvidence(result: MigrationPatternAuditFacts) {
  return (
    hasDependency(result, "@react-native-clipboard/clipboard") ||
    hasPackageUsage(result, "@react-native-clipboard/clipboard") ||
    (result.deprecatedApiFindings?.some(
      (finding) => finding.api === "Clipboard",
    ) ??
      false)
  );
}

function dependencyVersionIsBelow(
  result: MigrationPatternAuditFacts,
  packageName: string,
  version: string,
) {
  const comparison = compareVersions(
    getDependencyVersion(result, packageName),
    version,
  );
  return comparison !== null && comparison < 0;
}

function buildVersionedDependencySignals(
  result: MigrationPatternAuditFacts,
  packageName: string,
  threshold?: string,
) {
  const signals: string[] = [];
  const version = getDependencyVersion(result, packageName);

  if (version) {
    signals.push(`${packageName} version detected: ${version}.`);
  } else if (hasPackageUsage(result, packageName)) {
    signals.push(`${packageName} source usage is detected.`);
  }

  if (threshold) {
    signals.push(
      `Conservative version threshold used by this heuristic: ${threshold}.`,
    );
  }

  return signals;
}

function hasReactNativeVideoExoplayerRisk(result: MigrationPatternAuditFacts) {
  return Boolean(
    result.hasAndroid &&
    targetsReactNativeAtLeast(result, 71) &&
    hasDependencyEvidence(result, "react-native-video") &&
    dependencyVersionIsBelow(result, "react-native-video", "6.0.0"),
  );
}

function buildReactNativeVideoExoplayerSignals(
  result: MigrationPatternAuditFacts,
) {
  return [
    ...(result.hasAndroid ? ["Android project is present."] : []),
    ...(targetsReactNativeAtLeast(result, 71)
      ? ["RN version or upgrade path includes 0.71 or newer."]
      : []),
    ...buildVersionedDependencySignals(result, "react-native-video", "6.0.0"),
    "Symptom to watch: ExoPlayer resources or R references fail during Android compilation.",
  ];
}

function getLegacyAnnotationRiskPackages(result: MigrationPatternAuditFacts) {
  return knownLegacyAnnotationRiskPackages.filter(({ name, threshold }) =>
    dependencyVersionIsBelow(result, name, threshold),
  );
}

function hasModernAndroidToolingRiskContext(
  result: MigrationPatternAuditFacts,
) {
  return Boolean(
    targetsReactNativeAtLeast(result, 71) ||
    result.androidUsesFacebookReactPlugin ||
    result.androidUsesReactAndroidDependency ||
    !isAndroidGradlePluginOlderThan(result, "7.3.0"),
  );
}

function hasLegacyAndroidAnnotationRisk(result: MigrationPatternAuditFacts) {
  return Boolean(
    result.hasAndroid &&
    hasModernAndroidToolingRiskContext(result) &&
    getLegacyAnnotationRiskPackages(result).length > 0,
  );
}

function buildLegacyAndroidAnnotationSignals(
  result: MigrationPatternAuditFacts,
) {
  const packages = getLegacyAnnotationRiskPackages(result);
  const signals: string[] = [];

  if (result.hasAndroid) signals.push("Android project is present.");
  if (targetsReactNativeAtLeast(result, 71)) {
    signals.push("RN version or upgrade path includes 0.71 or newer.");
  }
  if (result.nativeVersions?.androidGradlePlugin) {
    signals.push(
      `Android Gradle Plugin detected: ${result.nativeVersions.androidGradlePlugin}.`,
    );
  }
  if (packages.length) {
    signals.push(
      `Older native Android libraries detected: ${packages
        .map(({ name, threshold }) => `${name} <${threshold}`)
        .join(", ")}.`,
    );
  }
  signals.push(
    "Symptoms to watch: extractAnnotations, generateTypedefs, and typedefs.txt failures.",
  );

  return signals;
}

function hasUnusedMlkitFlavorRisk(result: MigrationPatternAuditFacts) {
  return Boolean(
    result.hasAndroid &&
    hasDependencyEvidence(result, "react-native-camera") &&
    dependencyVersionIsBelow(result, "react-native-camera", "4.0.0"),
  );
}

function buildUnusedMlkitFlavorSignals(result: MigrationPatternAuditFacts) {
  return [
    ...(result.hasAndroid ? ["Android project is present."] : []),
    ...buildVersionedDependencySignals(result, "react-native-camera", "4.0.0"),
    "Legacy react-native-camera package line commonly defines Android MLKit/general flavors.",
    "Symptom to watch: unused MLKit flavor resolves obsolete MLKit/Firebase artifacts.",
  ];
}

function hasLegacySvgTransformerRisk(result: MigrationPatternAuditFacts) {
  const hasSvgEvidence = Boolean(
    hasDependency(result, "react-native-svg") ||
    hasPackageUsage(result, "react-native-svg"),
  );

  return Boolean(
    targetsReactNativeAtLeast(result, 71) &&
    hasSvgEvidence &&
    hasDependency(result, "react-native-svg-transformer") &&
    dependencyVersionIsBelow(result, "react-native-svg-transformer", "1.0.0"),
  );
}

function buildLegacySvgTransformerSignals(result: MigrationPatternAuditFacts) {
  return [
    ...(targetsReactNativeAtLeast(result, 71)
      ? ["RN version or upgrade path includes 0.71 or newer."]
      : []),
    ...buildVersionedDependencySignals(
      result,
      "react-native-svg-transformer",
      "1.0.0",
    ),
    ...(hasDependency(result, "react-native-svg")
      ? [
          `react-native-svg version detected: ${getDependencyVersion(result, "react-native-svg")}.`,
        ]
      : []),
    ...(result.hasMetroConfig ? ["Metro config is present."] : []),
    "Symptoms to watch: transformFile failures and SVG import/runtime crashes.",
  ];
}

const knownScreensAppCompatThreshold = "3.25.0";

function hasScreensAppCompatRisk(result: MigrationPatternAuditFacts) {
  return Boolean(
    result.hasAndroid &&
    targetsReactNativeAtLeast(result, 74) &&
    hasDependencyEvidence(result, "react-native-screens") &&
    dependencyVersionIsBelow(
      result,
      "react-native-screens",
      knownScreensAppCompatThreshold,
    ),
  );
}

function buildScreensAppCompatSignals(result: MigrationPatternAuditFacts) {
  return [
    ...(result.hasAndroid ? ["Android project is present."] : []),
    ...(targetsReactNativeAtLeast(result, 74)
      ? ["RN version or upgrade path includes 0.74 or newer."]
      : []),
    ...buildVersionedDependencySignals(
      result,
      "react-native-screens",
      knownScreensAppCompatThreshold,
    ),
    "Symptom to watch: unresolved AppCompat colorPrimary theme attribute in react-native-screens Android sources.",
  ];
}

function hasNativeUiComponentRegistrationRisk(
  result: MigrationPatternAuditFacts,
) {
  return Boolean(
    result.hasIOS &&
    targetsReactNativeAtLeast(result, 71) &&
    hasDependencyEvidence(result, "react-native-radial-gradient") &&
    !dependencyVersionIsBelow(
      result,
      "react-native-radial-gradient",
      "1.0.0",
    ) &&
    dependencyVersionIsBelow(result, "react-native-radial-gradient", "1.2.0"),
  );
}

function buildNativeUiComponentRegistrationSignals(
  result: MigrationPatternAuditFacts,
) {
  return [
    ...(result.hasIOS ? ["iOS project is present."] : []),
    ...(targetsReactNativeAtLeast(result, 71)
      ? ["RN version or upgrade path includes 0.71 or newer."]
      : []),
    ...buildVersionedDependencySignals(
      result,
      "react-native-radial-gradient",
      "1.2.0",
    ),
    "react-native-radial-gradient exposes native UI component SRSRadialGradient via requireNativeComponent.",
    "Known package line has weak/missing iOS podspec autolinking support in published artifacts.",
  ];
}

function hasCircularBarrelImportRisk(result: MigrationPatternAuditFacts) {
  return Boolean(
    result.barrelAnalysis?.hasLargeBarrels &&
    result.barrelAnalysis.barrelCount > 0,
  );
}

function buildCircularBarrelImportSignals(result: MigrationPatternAuditFacts) {
  const signals: string[] = [];

  if (result.barrelAnalysis?.barrelCount) {
    signals.push(
      `${result.barrelAnalysis.barrelCount} barrel file(s) with re-exports detected.`,
    );
  }

  if (result.barrelAnalysis?.largestBarrelExportCount) {
    signals.push(
      `Largest barrel exports ${result.barrelAnalysis.largestBarrelExportCount} modules.`,
    );
  }

  if (result.barrelAnalysis?.hasLargeBarrels) {
    signals.push(
      "Large barrel files found; this is a heuristic risk until screen imports or cycle evidence confirm the runtime path.",
    );
  }

  if (result.barrelAnalysis?.screenImportsFromBarrels) {
    signals.push(
      "Screen imports from large barrels are detected, increasing circular dependency risk confidence.",
    );
  }

  if (result.barrelAnalysis?.confirmedCycles) {
    signals.push(
      "Confirmed circular dependency evidence is present for one or more barrel import paths.",
    );
  } else {
    signals.push(
      "Confirmed circular dependency chains are not currently produced by this scanner; validate suspicious screen imports manually.",
    );
  }

  if (result.barrelAnalysis?.barrelDetails.length) {
    const largeBarrels = result.barrelAnalysis.barrelDetails.filter(
      (b) => b.reexportCount >= 10,
    );
    if (largeBarrels.length) {
      signals.push(
        `Large export barrels: ${largeBarrels.map((b) => `${b.path} (${b.reexportCount} exports)`).join(", ")}.`,
      );
    }
  }

  const areaCount = result.migrationAreas?.length ?? 0;
  if (areaCount >= 3) {
    signals.push(
      `${areaCount} migration-sensitive areas detected — screens likely import from shared barrels.`,
    );
  }

  if (result.hasMetroConfig) {
    signals.push(
      "Metro config present — module resolution changes may affect barrel export behavior after RN upgrade.",
    );
  }

  signals.push(
    "Symptom to watch: Cannot read property 'X' of undefined when navigating to screens that import from large barrels.",
  );

  return signals;
}

function getCircularBarrelConfidence(result: MigrationPatternAuditFacts) {
  const areaCount = result.migrationAreas?.length ?? 0;
  if (result.barrelAnalysis?.confirmedCycles) {
    return "high" as const;
  }
  if (
    result.barrelAnalysis?.hasLargeBarrels &&
    (result.barrelAnalysis.screenImportsFromBarrels || areaCount >= 3)
  ) {
    return "medium" as const;
  }
  if (result.barrelAnalysis?.hasLargeBarrels) return "low" as const;
  return "low" as const;
}

function hasSoLoaderMergedLibRisk(result: MigrationPatternAuditFacts) {
  if (!result.hasAndroid || !result.androidMainApplicationContent) return false;

  const rnMinor = getMinor(
    normalizeVersion(result.reactNativeSemver ?? result.reactNative),
  );
  const targetsRn76 = rnMinor !== null && rnMinor >= 76;
  const upgradeTargets76 = upgradePathMentionsAtLeast(result, 76);
  if (!targetsRn76 && !upgradeTargets76) return false;

  const hasLegacyInit = result.androidUsesLegacySoLoaderInit === true;
  const hasMergedMapping = result.androidUsesOpenSourceMergedSoMapping === true;

  return hasLegacyInit && !hasMergedMapping;
}

function buildSoLoaderMergedLibSignals(result: MigrationPatternAuditFacts) {
  const signals: string[] = [];

  const rnMinorRaw = result.reactNativeSemver ?? result.reactNative;
  signals.push(`React Native version: ${rnMinorRaw}.`);

  if (result.hasAndroid) signals.push("Android platform detected.");

  if (result.androidMainApplicationContent) {
    signals.push("MainApplication.java/kt content was read successfully.");
  }

  if (result.androidUsesLegacySoLoaderInit) {
    signals.push(
      "Legacy SoLoader.init(this, false) or equivalent found without OpenSourceMergedSoMapping.",
    );
  }

  if (result.androidUsesOpenSourceMergedSoMapping === false) {
    signals.push("OpenSourceMergedSoMapping is not referenced in the project.");
  }

  const mergedLibraries = [
    "react_devsupportjni",
    "reactnativejni",
    "fabricjni",
    "turbomodulejsijni",
    "uimanagerjni",
    "mapbufferjni",
    "reactnativeblob",
    "rninstance",
    "react_newarchdefaults",
    "yoga",
  ];
  signals.push(
    `Merged libraries that must be mapped: ${mergedLibraries.join(", ")}.`,
  );

  signals.push(
    "Symptom to watch: UnsatisfiedLinkError at startup for libreact_devsupportjni.so.",
  );

  return signals;
}

function getSoLoaderMergedLibConfidence(result: MigrationPatternAuditFacts) {
  if (
    result.androidUsesLegacySoLoaderInit === true &&
    result.androidUsesOpenSourceMergedSoMapping === false &&
    result.androidMainApplicationContent
  ) {
    return "high" as const;
  }
  if (result.androidUsesLegacySoLoaderInit === true) {
    return "medium" as const;
  }
  return "low" as const;
}

function getReactNativeVideoRawVersion(result: MigrationPatternAuditFacts) {
  return getDependencyVersion(result, "react-native-video");
}

function reactNativeVideoVersionContainsAlphaBetaRc(rawVersion: string) {
  return /(?:^|[\s.-])(alpha|beta|rc)(?:\d|[\s.-]|$)/i.test(rawVersion);
}

function hasReactNativeVideoAlphaLegacyVersionRisk(
  result: MigrationPatternAuditFacts,
) {
  const rawVersion = getReactNativeVideoRawVersion(result);
  if (!rawVersion) return false;

  const normalized = normalizeVersion(rawVersion);
  const major = getMajor(normalized);

  if (reactNativeVideoVersionContainsAlphaBetaRc(rawVersion)) return true;

  if (major !== null && major >= 6) return false;

  if (major !== null && major < 6) return true;

  return false;
}

function buildReactNativeVideoAlphaLegacyVersionSignals(
  result: MigrationPatternAuditFacts,
) {
  const rawVersion = getReactNativeVideoRawVersion(result);
  const rnVersion = normalizeVersion(
    result.reactNativeSemver ?? result.reactNative,
  );
  const signals: string[] = [];

  if (rawVersion) {
    signals.push(`react-native-video version: ${rawVersion}.`);
  }

  if (rawVersion && reactNativeVideoVersionContainsAlphaBetaRc(rawVersion)) {
    const prerelease =
      rawVersion.match(/(alpha|beta|rc)/i)?.[1]?.toLowerCase() ?? "";
    signals.push(`${prerelease} release detected.`);
  }

  if (rnVersion) {
    signals.push(`React Native version: ${rnVersion}.`);
  }

  signals.push("video playback dependency present.");

  if (result.hasAndroid) {
    signals.push("Android project detected.");
  }

  if (result.hasIOS) {
    signals.push("iOS project detected.");
  }

  if (
    rawVersion &&
    result.patchFiles?.some((patch) =>
      patch.toLowerCase().includes("react-native-video"),
    )
  ) {
    signals.push("Legacy react-native-video patch detected.");
  }

  return signals;
}

function getReactNativeVideoAlphaLegacyVersionConfidence(
  result: MigrationPatternAuditFacts,
): "low" | "medium" | "high" {
  const rawVersion = getReactNativeVideoRawVersion(result);
  if (!rawVersion) return "low";

  if (reactNativeVideoVersionContainsAlphaBetaRc(rawVersion)) return "high";

  const normalized = normalizeVersion(rawVersion);
  const major = getMajor(normalized);

  if (major !== null && major < 5) return "high";

  if (major === 5) {
    const rnMinor = getMinor(
      normalizeVersion(result.reactNativeSemver ?? result.reactNative),
    );
    if (rnMinor !== null && rnMinor >= 74) return "medium";
    return "low";
  }

  return "low";
}

export function detectMigrationPatterns(
  result: MigrationPatternAuditFacts,
): MigrationPattern[] {
  return migrationPatterns
    .filter((pattern) => {
      if (pattern.id === "PATTERN-001") {
        const startScript = result.scripts?.start ?? "";
        return (
          isReactNativeOlderThan(result, 69) &&
          startScript.includes("react-native start") &&
          !startScript.includes("openssl-legacy-provider")
        );
      }

      if (pattern.id === "PATTERN-002") {
        return (
          hasNavigationEvidence(result) &&
          hasReactNavigationVersionFamilyMismatch(result)
        );
      }

      if (pattern.id === "PATTERN-003") {
        return Boolean(
          result.typescript &&
          (isReactNativeOlderThan(result, 69) ||
            upgradePathMentions(result, 68)),
        );
      }

      if (pattern.id === "PATTERN-004") {
        return Boolean(result.hasAndroid && hasClipboardEvidence(result));
      }

      if (pattern.id === "PATTERN-005") {
        return Boolean(
          result.hasPodfile &&
          (isReactNativeMinor(result, 68) || upgradePathMentions(result, 68)),
        );
      }

      if (pattern.id === "PATTERN-006") {
        return Boolean(
          result.hasPodfile &&
          (isReactNativeMinor(result, 68) || upgradePathMentions(result, 68)),
        );
      }

      if (pattern.id === "PATTERN-008") {
        return Boolean(
          hasReactNativePermissionsEvidence(result) &&
          result.hasIOS &&
          (hasPermissionsHandlerConfigurationIssue(result) ||
            hasMigrationArea(result, "Permissions")),
        );
      }

      if (pattern.id === "PATTERN-007") {
        const rnMinor = getMinor(
          normalizeVersion(result.reactNativeSemver ?? result.reactNative),
        );
        if (rnMinor === null) return false;

        return toolingVersionSkewPackages.some((pkg) => {
          const pkgMinor = getToolingVersionMinor(result, pkg);
          return pkgMinor !== null && pkgMinor - rnMinor >= 3;
        });
      }

      if (pattern.id === "PATTERN-009") {
        return hasRn071PodfileConfigRisk(result);
      }

      if (pattern.id === "PATTERN-010") {
        return hasScreensFabricCompatibilityRisk(result);
      }

      if (pattern.id === "PATTERN-011") {
        return hasMetroBabelLruCacheRisk(result);
      }

      if (pattern.id === "PATTERN-012") {
        return hasRn071AndroidGradleRisk(result);
      }

      if (pattern.id === "PATTERN-013") {
        return hasReactNativeVideoExoplayerRisk(result);
      }

      if (pattern.id === "PATTERN-014") {
        return hasLegacyAndroidAnnotationRisk(result);
      }

      if (pattern.id === "PATTERN-015") {
        return hasUnusedMlkitFlavorRisk(result);
      }

      if (pattern.id === "PATTERN-016") {
        return hasLegacySvgTransformerRisk(result);
      }

      if (pattern.id === "PATTERN-017") {
        return hasScreensAppCompatRisk(result);
      }

      if (pattern.id === "PATTERN-018") {
        return hasNativeUiComponentRegistrationRisk(result);
      }

      if (pattern.id === "PATTERN-019") {
        return hasCircularBarrelImportRisk(result);
      }

      if (pattern.id === "PATTERN-020") {
        return hasSoLoaderMergedLibRisk(result);
      }

      if (pattern.id === "PATTERN-022") {
        return hasReactNativeVideoAlphaLegacyVersionRisk(result);
      }

      return false;
    })
    .map((pattern) => {
      if (pattern.id === "PATTERN-002") {
        return {
          ...pattern,
          confidence: getReactNavigationMismatchConfidence(result),
          detectedSignals: buildReactNavigationMismatchSignals(result),
        };
      }

      if (pattern.id === "PATTERN-008") {
        return {
          ...pattern,
          confidence: getPermissionsPatternConfidence(result),
          detectedSignals: buildPermissionsPatternSignals(result),
        };
      }

      if (pattern.id === "PATTERN-009") {
        return {
          ...pattern,
          confidence: getRn071PodfileConfidence(result),
          detectedSignals: buildRn071PodfileSignals(result),
        };
      }

      if (pattern.id === "PATTERN-010") {
        return {
          ...pattern,
          confidence: getScreensFabricConfidence(result),
          detectedSignals: buildScreensFabricSignals(result),
        };
      }

      if (pattern.id === "PATTERN-011") {
        return {
          ...pattern,
          confidence: getMetroBabelLruConfidence(result),
          detectedSignals: buildMetroBabelLruSignals(result),
        };
      }

      if (pattern.id === "PATTERN-012") {
        return {
          ...pattern,
          confidence: getRn071AndroidGradleConfidence(result),
          detectedSignals: buildRn071AndroidGradleSignals(result),
        };
      }

      if (pattern.id === "PATTERN-013") {
        return {
          ...pattern,
          confidence: getDependencyVersion(result, "react-native-video")
            ? "high"
            : "medium",
          detectedSignals: buildReactNativeVideoExoplayerSignals(result),
        };
      }

      if (pattern.id === "PATTERN-014") {
        return {
          ...pattern,
          confidence: result.nativeVersions?.androidGradlePlugin
            ? "medium"
            : "low",
          detectedSignals: buildLegacyAndroidAnnotationSignals(result),
        };
      }

      if (pattern.id === "PATTERN-015") {
        return {
          ...pattern,
          confidence: getDependencyVersion(result, "react-native-camera")
            ? "high"
            : "medium",
          detectedSignals: buildUnusedMlkitFlavorSignals(result),
        };
      }

      if (pattern.id === "PATTERN-016") {
        return {
          ...pattern,
          confidence: result.hasMetroConfig ? "high" : "medium",
          detectedSignals: buildLegacySvgTransformerSignals(result),
        };
      }

      if (pattern.id === "PATTERN-017") {
        return {
          ...pattern,
          confidence: getDependencyVersion(result, "react-native-screens")
            ? "high"
            : "medium",
          detectedSignals: buildScreensAppCompatSignals(result),
        };
      }

      if (pattern.id === "PATTERN-018") {
        return {
          ...pattern,
          confidence: "high",
          detectedSignals: buildNativeUiComponentRegistrationSignals(result),
        };
      }

      if (pattern.id === "PATTERN-019") {
        return {
          ...pattern,
          confidence: getCircularBarrelConfidence(result),
          detectedSignals: buildCircularBarrelImportSignals(result),
        };
      }

      if (pattern.id === "PATTERN-020") {
        return {
          ...pattern,
          confidence: getSoLoaderMergedLibConfidence(result),
          detectedSignals: buildSoLoaderMergedLibSignals(result),
        };
      }

      if (pattern.id === "PATTERN-022") {
        return {
          ...pattern,
          confidence: getReactNativeVideoAlphaLegacyVersionConfidence(result),
          detectedSignals:
            buildReactNativeVideoAlphaLegacyVersionSignals(result),
        };
      }

      return pattern;
    });
}

export function renderMigrationPatternsMarkdown(patterns: MigrationPattern[]) {
  if (!patterns.length) return "";

  return `## Known Migration Patterns

${renderPatternGroupSummaryMarkdown(patterns)}

Detected Patterns

| Pattern | Group | Evidence | Confidence | Action Priority | Description | Detected Signals | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- |
${patterns
  .map(
    (pattern) =>
      `| ${pattern.id}: ${pattern.title} | ${formatPatternGroups(pattern)} | ${formatEvidenceTypes(pattern)} | ${pattern.confidence ?? "medium"} | ${formatActionPriority(pattern.actionPriority)} | ${pattern.description} | ${pattern.detectedSignals?.join("<br>") ?? "Detected by static audit signals."} | ${pattern.recommendation} |`,
  )
  .join("\n")}`;
}

function formatPatternGroups(pattern: MigrationPattern) {
  const groups = [
    pattern.patternGroup?.title,
    ...(pattern.relatedPatternGroups?.map((group) => `${group.title} (related)`) ?? []),
  ].filter((group): group is string => Boolean(group));

  return groups.length ? groups.join("<br>") : "Uncategorized";
}

function formatEvidenceTypes(pattern: MigrationPattern) {
  return pattern.evidenceTypes?.length
    ? pattern.evidenceTypes.join(", ")
    : "heuristic";
}

function getPatternGroupEntries(patterns: MigrationPattern[]) {
  const grouped = new Map<
    string,
    {
      title: string;
      description: string;
      patterns: { pattern: MigrationPattern; related: boolean }[];
    }
  >();

  for (const pattern of patterns) {
    const groups = [
      ...(pattern.patternGroup
        ? [{ group: pattern.patternGroup, related: false }]
        : [
            {
              group: {
                id: "uncategorized",
                title: "Uncategorized",
                description: "Patterns without explicit grouping metadata.",
              },
              related: false,
            },
          ]),
      ...(pattern.relatedPatternGroups?.map((group) => ({
        group,
        related: true,
      })) ?? []),
    ];

    for (const { group, related } of groups) {
      const entry = grouped.get(group.id) ?? {
        title: group.title,
        description: group.description,
        patterns: [],
      };

      entry.patterns.push({ pattern, related });
      grouped.set(group.id, entry);
    }
  }

  return Array.from(grouped.values()).sort((a, b) =>
    a.title.localeCompare(b.title),
  );
}

export function renderPatternGroupSummaryMarkdown(
  patterns: MigrationPattern[],
  headingLevel = 3,
) {
  if (!patterns.length) return "";
  const heading = "#".repeat(headingLevel);
  const childHeading = "#".repeat(headingLevel + 1);

  return `${heading} Pattern Groups

${getPatternGroupEntries(patterns)
  .map(
    (group) => `${childHeading} ${group.title}

${group.description}

${group.patterns
  .map(
    ({ pattern, related }) =>
      `- ${pattern.id}: ${pattern.title}${related ? " (related signal)" : ""} (${pattern.confidence ?? "medium"} confidence, ${formatActionPriority(pattern.actionPriority)})`,
  )
  .join("\n")}`,
  )
  .join("\n\n")}`;
}

function getActionPriority(pattern: MigrationPattern): ActionPriority {
  return pattern.actionPriority ?? INFORMATIONAL;
}

export function formatActionPriority(priority: ActionPriority | undefined) {
  if (priority === MUST_FIX) return "Must Fix Before Migration";
  if (priority === VALIDATE_DURING_MIGRATION) return "Validate During Migration";
  if (priority === PLAN_LATER) return "Plan Later";
  return "Informational";
}

function renderActionRegisterGroup(
  patterns: MigrationPattern[],
  priority: ActionPriority,
) {
  const matches = patterns.filter((pattern) => getActionPriority(pattern) === priority);
  if (!matches.length) return "- None detected.";

  return matches
    .map(
      (pattern) =>
        `- ${pattern.id}: ${pattern.title} (${pattern.confidence ?? "medium"} confidence) - ${pattern.recommendation}`,
    )
    .join("\n");
}

export function renderActionRegisterMarkdown(patterns: MigrationPattern[]) {
  if (!patterns.length) return "";

  return `## Action Register

### Must Fix Before Migration

${renderActionRegisterGroup(patterns, MUST_FIX)}

### Validate During Migration

${renderActionRegisterGroup(patterns, VALIDATE_DURING_MIGRATION)}

### Plan Later

${renderActionRegisterGroup(patterns, PLAN_LATER)}

### Informational

${renderActionRegisterGroup(patterns, INFORMATIONAL)}`;
}

export function renderActionRegisterSummaryMarkdown(patterns: MigrationPattern[]) {
  if (!patterns.length) return "";

  return `## Action Register

### Must Fix Before Migration

${renderActionRegisterGroup(patterns, MUST_FIX)}

### Validate During Migration

${renderActionRegisterGroup(patterns, VALIDATE_DURING_MIGRATION)}

### Plan Later

${renderActionRegisterGroup(patterns, PLAN_LATER)}

### Informational

${renderActionRegisterGroup(patterns, INFORMATIONAL)}`;
}
