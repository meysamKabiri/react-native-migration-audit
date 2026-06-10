import semver from "semver";

type UpgradeStrategy =
  | "unknown"
  | "direct-upgrade"
  | "staged-upgrade"
  | "modern-upgrade"
  | "manual-review";

export type UpgradeRecommendation = {
  strategy: UpgradeStrategy;
  target: string;
  note: string;
};

export type ReactNativeUpgradePath = {
  strategy: UpgradeStrategy;
  path: string[];
  label: string;
  note: string;
};

export type NormalizedReactNativeVersion = {
  rawVersion: string | null;
  displayVersion: string | null;
  semverVersion: string | null;
  isLegacyExpoBaseline: boolean;
};

const expoSdkLegacyBaselines: Record<string, string> = {
  "35": "0.59.0",
};

export function normalizeReactNativeVersionSpec(
  version?: string | null,
): NormalizedReactNativeVersion {
  if (!version) {
    return {
      rawVersion: null,
      displayVersion: null,
      semverVersion: null,
      isLegacyExpoBaseline: false,
    };
  }

  const expoSdkMatch = version.match(/sdk-(\d+)\.0\.0/i);
  if (expoSdkMatch) {
    const sdk = expoSdkMatch[1];
    return {
      rawVersion: version,
      displayVersion: `Expo SDK ${sdk} (legacy React Native baseline)`,
      semverVersion: expoSdkLegacyBaselines[sdk] ?? null,
      isLegacyExpoBaseline: true,
    };
  }

  const decodedVersion = decodeURIComponent(version);
  const patchVersionMatch = decodedVersion.match(/react-native@npm:([\d.]+)/);
  const normalizedVersion = semver.coerce(patchVersionMatch?.[1] ?? version)?.version ?? null;

  return {
    rawVersion: version,
    displayVersion: normalizedVersion ?? version,
    semverVersion: normalizedVersion,
    isLegacyExpoBaseline: false,
  };
}

export function cleanVersion(version?: string | null) {
  return normalizeReactNativeVersionSpec(version).semverVersion;
}

function normalizeReactNativeVersion(version: string) {
  return normalizeReactNativeVersionSpec(version).semverVersion;
}

function createUpgradePath(
  strategy: UpgradeStrategy,
  path: string[],
  note: string,
): ReactNativeUpgradePath {
  return {
    strategy,
    path,
    label: path.length > 0 ? path.join(" → ") : "Unknown",
    note,
  };
}

export function generateReactNativeUpgradePath(
  currentVersion: string | null,
): ReactNativeUpgradePath {
  if (!currentVersion) {
    return createUpgradePath(
      "unknown",
      [],
      "React Native version was not detected.",
    );
  }

  const normalized = normalizeReactNativeVersionSpec(currentVersion);
  const version = normalized.semverVersion;

  if (normalized.isLegacyExpoBaseline) {
    return createUpgradePath(
      "staged-upgrade",
      ["Expo SDK 35 baseline", "modern Expo SDK", "current stable"],
      "This project uses an old Expo SDK React Native tarball. Treat it as a legacy React Native baseline and plan staged Expo/RN upgrades before implementation.",
    );
  }

  if (!version) {
    return createUpgradePath(
      "manual-review",
      [],
      "React Native version could not be parsed reliably. Review the upgrade path manually before planning implementation.",
    );
  }

  if (semver.lt(version, "0.65.0")) {
    return createUpgradePath(
      "staged-upgrade",
      ["0.65", "0.68", "0.71", "0.74+", "current stable"],
      "This is an older React Native project. A direct jump is not recommended; use staged upgrades and verify iOS and Android builds at each milestone.",
    );
  }

  if (semver.gte(version, "0.65.0") && semver.lt(version, "0.71.0")) {
    return createUpgradePath(
      "staged-upgrade",
      ["0.71", "0.74+", "current stable"],
      "This project is behind several React Native releases. A staged upgrade is safer than a direct jump.",
    );
  }

  if (semver.gte(version, "0.71.0") && semver.lt(version, "0.74.0")) {
    return createUpgradePath(
      "staged-upgrade",
      ["0.74+", "current stable"],
      "This project is close to the modern React Native range, but a short staged upgrade is still safer than jumping directly to the current stable release.",
    );
  }

  if (semver.gte(version, "0.74.0")) {
    return createUpgradePath(
      "modern-upgrade",
      ["current stable"],
      "This project is already on a relatively modern React Native version. Upgrade risk depends mostly on native modules, Expo compatibility, and build tooling.",
    );
  }

  return createUpgradePath(
    "manual-review",
    [],
    "Upgrade path should be reviewed manually based on the detected React Native version, project structure, and dependencies.",
  );
}

export function getUpgradeRecommendation(
  reactNativeVersion?: string | null,
): UpgradeRecommendation {
  const upgradePath = generateReactNativeUpgradePath(reactNativeVersion ?? null);

  return {
    strategy: upgradePath.strategy,
    target: upgradePath.label,
    note: upgradePath.note,
  };
}
