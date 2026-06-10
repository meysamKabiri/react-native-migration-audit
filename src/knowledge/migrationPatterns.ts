export type MigrationPattern = {
  id: string;
  title: string;
  description: string;
  affectedVersions?: string[];
  detectionCriteria: string[];
  recommendation: string;
  confidence?: "low" | "medium" | "high";
  detectedSignals?: string[];
};

type RiskyDependencyLike = {
  name: string;
  version?: string;
};

type DeprecatedApiFindingLike = {
  api: string;
};

type AstPackageUsageLike = {
  packageName: string;
};

type MigrationAreaLike = {
  area: string;
  packages?: string[];
};

type MigrationPatternAuditFacts = {
  reactNative?: string | null;
  reactNativeSemver?: string | null;
  upgradeRecommendation?: {
    target?: string;
  };
  hasIOS?: boolean;
  hasAndroid?: boolean;
  hasPodfile?: boolean;
  hasGradleBuild?: boolean;
  hasAppGradleBuild?: boolean;
  hasMetroConfig?: boolean;
  hasBabelConfig?: boolean;
  hasSetupPermissions?: boolean;
  setupPermissionsHandlers?: string[];
  setupPermissionsHandlersIdentified?: boolean;
  setupPermissionsIsEmpty?: boolean;
  podfileUsesLegacyReactNativePathConfig?: boolean;
  androidUsesLegacyReactGradleApply?: boolean;
  androidUsesLegacyReactNativeDependency?: boolean;
  androidUsesProjectExtReact?: boolean;
  androidUsesReactAndroidDependency?: boolean;
  androidUsesFacebookReactPlugin?: boolean;
  lockfilePackageVersions?: Record<string, string[]>;
  typescript?: string | null;
  scripts?: Record<string, string>;
  dependencyVersions?: Record<string, string>;
  riskyDependencies?: RiskyDependencyLike[];
  deprecatedApiFindings?: DeprecatedApiFindingLike[];
  astScan?: {
    packageUsages?: AstPackageUsageLike[];
  };
  migrationAreas?: MigrationAreaLike[];
  nativeVersions?: {
    androidGradlePlugin?: string | null;
    gradle?: string | null;
  };
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
  },
  {
    id: "PATTERN-002",
    title: "React Navigation Version Mismatch",
    description:
      "React Navigation upgrades can fail when packages from different major versions are mixed, commonly surfacing as headerMode errors or navigation typing mismatches.",
    detectionCriteria: [
      "React Navigation package usage is detected.",
      "Navigation-adjacent native packages such as gesture-handler or screens are present.",
      "Known symptoms include headerMode errors and navigation typing mismatch.",
    ],
    recommendation:
      "Audit all @react-navigation/* packages together and keep their major versions aligned with compatible gesture-handler and screens versions for the target RN milestone.",
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
      "Known symptoms include 'No permission handler detected' and RNPermissionsModule constantsToExport crash.",
    ],
    recommendation:
      "Verify Podfile contains setup_permissions(...) with all handlers required by the application. Run pod install after changes, clear DerivedData when permission-handler configuration changes, and reinstall the app after permission-handler changes.",
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
  },
  {
    id: "PATTERN-009",
    title: "RN 0.71 Podfile Configuration Shape Change",
    description:
      "RN 0.71 changes Podfile configuration expectations and older Podfile implementations may fail during pod install.",
    affectedVersions: ["React Native 0.71.x", "iOS projects upgraded from <0.71"],
    detectionCriteria: [
      "RN upgrade target includes 0.71 or newer.",
      "iOS project and Podfile are present.",
      "Legacy Podfile config access patterns such as config[\"reactNativePath\"] are detected, or an older RN Podfile is being carried into the 0.71 milestone.",
      "Known symptoms include config[\"reactNativePath\"] is nil, pod install failure, and use_react_native! configuration failure.",
    ],
    recommendation:
      "Compare Podfile against the RN 0.71 template. Verify use_react_native! arguments and config access patterns.",
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
  },
  {
    id: "PATTERN-012",
    title: "React Native 0.71 Android Gradle Migration",
    description:
      "RN 0.71 introduces Android Gradle structure changes that can break existing projects.",
    affectedVersions: ["React Native >=0.71", "Android projects upgraded from <0.71"],
    detectionCriteria: [
      "RN upgrade target includes 0.71 or newer.",
      "Android project is present.",
      "Legacy Android Gradle patterns or pre-0.71 Android Gradle Plugin versions are detected.",
      "Known symptoms include react-android resolution failures, Gradle plugin migration issues, enableHermes configuration errors, and Android build failures after RN 0.71 upgrade.",
    ],
    recommendation:
      "Compare Android configuration against the RN 0.71 template. Verify com.facebook.react plugin, react-android dependency usage, Hermes configuration, and Gradle/AGP compatibility.",
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

function isReactNativeOlderThan(result: MigrationPatternAuditFacts, minor: number) {
  const detectedMinor = getMinor(
    normalizeVersion(result.reactNativeSemver ?? result.reactNative),
  );

  return detectedMinor !== null && detectedMinor < minor;
}

function isReactNativeMinor(result: MigrationPatternAuditFacts, minor: number) {
  return (
    getMinor(normalizeVersion(result.reactNativeSemver ?? result.reactNative)) === minor
  );
}

function upgradePathMentions(result: MigrationPatternAuditFacts, minor: number) {
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

function hasDependency(result: MigrationPatternAuditFacts, packageName: string) {
  return Boolean(result.dependencyVersions?.[packageName]);
}

function getDependencyVersion(
  result: MigrationPatternAuditFacts,
  packageName: string,
) {
  return (
    result.dependencyVersions?.[packageName] ??
    result.riskyDependencies?.find((dependency) => dependency.name === packageName)
      ?.version ??
    null
  );
}

function hasDependencyEvidence(
  result: MigrationPatternAuditFacts,
  packageName: string,
) {
  return Boolean(
    getDependencyVersion(result, packageName) || hasPackageUsage(result, packageName),
  );
}

function hasRiskyDependency(result: MigrationPatternAuditFacts, packageName: string) {
  return result.riskyDependencies?.some((dependency) => dependency.name === packageName) ?? false;
}

function hasPackageUsage(result: MigrationPatternAuditFacts, packageName: string) {
  return (
    result.astScan?.packageUsages?.some((usage) => usage.packageName === packageName) ?? false
  );
}

function hasMigrationArea(result: MigrationPatternAuditFacts, areaName: string) {
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

function hasPermissionsHandlerConfigurationIssue(result: MigrationPatternAuditFacts) {
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
  return hasPermissionsHandlerConfigurationIssue(result) ? "high" : "low";
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
    signals.push("Podfile uses legacy config[\"reactNativePath\"] access.");
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
  const comparison = compareVersions(screensVersion, knownCompatibleScreensVersion);

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
  return getDependencyVersion(result, "react-native-screens") ? "high" : "medium";
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
  if (directVersion) signals.push(`Direct lru-cache version: ${directVersion}.`);
  if (lockfileVersions.length) {
    signals.push(`Lockfile lru-cache versions: ${lockfileVersions.join(", ")}.`);
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
  const comparison = compareVersions(result.nativeVersions?.androidGradlePlugin, version);
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
    signals.push("Android app uses legacy com.facebook.react:react-native dependency.");
  }

  if (result.androidUsesProjectExtReact) {
    signals.push("Android app uses legacy project.ext.react configuration.");
  }

  if (result.androidUsesFacebookReactPlugin === false) {
    signals.push("Android app does not use the com.facebook.react Gradle plugin.");
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

function hasNavigationEvidence(result: MigrationPatternAuditFacts) {
  const knownNavigationPackages = [
    "@react-navigation/native",
    "@react-navigation/stack",
    "@react-navigation/bottom-tabs",
    "react-navigation",
  ];

  return knownNavigationPackages.some(
    (packageName) => hasDependency(result, packageName) || hasPackageUsage(result, packageName),
  );
}

const toolingVersionSkewPackages = [
  "@react-native/babel-preset",
  "@react-native/babel-plugin-codegen",
  "@react-native/eslint-config",
  "@react-native/metro-config",
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
    (result.deprecatedApiFindings?.some((finding) => finding.api === "Clipboard") ?? false)
  );
}

export function detectMigrationPatterns(
  result: MigrationPatternAuditFacts,
): MigrationPattern[] {
  return migrationPatterns.filter((pattern) => {
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
        (hasRiskyDependency(result, "react-native-gesture-handler") ||
          hasRiskyDependency(result, "react-native-screens") ||
          hasDependency(result, "react-native-gesture-handler") ||
          hasDependency(result, "react-native-screens"))
      );
    }

    if (pattern.id === "PATTERN-003") {
      return Boolean(
        result.typescript &&
          (isReactNativeOlderThan(result, 69) || upgradePathMentions(result, 68)),
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
          hasPermissionsHandlerConfigurationIssue(result),
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

    return false;
  }).map((pattern) => {
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

    return pattern;
  });
}

export function renderMigrationPatternsMarkdown(patterns: MigrationPattern[]) {
  if (!patterns.length) return "";

  return `## Known Migration Patterns

Detected Patterns

| Pattern | Confidence | Description | Detected Signals | Recommendation |
| --- | --- | --- | --- | --- |
${patterns
  .map(
    (pattern) =>
      `| ${pattern.id}: ${pattern.title} | ${pattern.confidence ?? "medium"} | ${pattern.description} | ${pattern.detectedSignals?.join("<br>") ?? "Detected by static audit signals."} | ${pattern.recommendation} |`,
  )
  .join("\n")}`;
}
