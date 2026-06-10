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
  hasSetupPermissions?: boolean;
  setupPermissionsHandlers?: string[];
  setupPermissionsHandlersIdentified?: boolean;
  setupPermissionsIsEmpty?: boolean;
  typescript?: string | null;
  scripts?: Record<string, string>;
  dependencyVersions?: Record<string, string>;
  riskyDependencies?: RiskyDependencyLike[];
  deprecatedApiFindings?: DeprecatedApiFindingLike[];
  astScan?: {
    packageUsages?: AstPackageUsageLike[];
  };
  migrationAreas?: MigrationAreaLike[];
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
];

function normalizeVersion(value: string | null | undefined) {
  const match = value?.match(/\d+\.\d+(?:\.\d+)?/);
  return match?.[0] ?? null;
}

function getMinor(version: string | null) {
  const minor = version?.match(/^0\.(\d+)/)?.[1];
  return minor ? Number(minor) : null;
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

function hasDependency(result: MigrationPatternAuditFacts, packageName: string) {
  return Boolean(result.dependencyVersions?.[packageName]);
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

    return false;
  }).map((pattern) => {
    if (pattern.id !== "PATTERN-008") return pattern;

    return {
      ...pattern,
      confidence: getPermissionsPatternConfidence(result),
      detectedSignals: buildPermissionsPatternSignals(result),
    };
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
