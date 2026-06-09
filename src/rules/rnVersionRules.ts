export type UpgradeRecommendation = {
  strategy: "unknown" | "staged-upgrade" | "modern-upgrade" | "manual-review";
  target: string;
  note: string;
};

export function cleanVersion(version?: string | null) {
  if (!version) return null;
  return version.replace(/[^\d.]/g, "");
}

export function getUpgradeRecommendation(
  reactNativeVersion?: string | null,
): UpgradeRecommendation {
  const version = cleanVersion(reactNativeVersion);

  if (!version) {
    return {
      strategy: "unknown",
      target: "unknown",
      note: "React Native version not detected.",
    };
  }

  const [major, minor] = version.split(".").map(Number);

  if (major === 0 && minor <= 64) {
    return {
      strategy: "staged-upgrade",
      target: "0.65 → 0.68 → 0.71 → current stable",
      note: "This is an older React Native project. Avoid jumping directly to the latest version. Use staged upgrades and verify iOS/Android builds at each step.",
    };
  }

  if (major === 0 && minor <= 70) {
    return {
      strategy: "staged-upgrade",
      target: "0.71 → 0.74 → current stable",
      note: "This project is behind several React Native releases. A staged upgrade is safer than a direct jump.",
    };
  }

  if (major === 0 && minor >= 71) {
    return {
      strategy: "modern-upgrade",
      target: "current stable React Native",
      note: "This project is on a relatively modern React Native version. Upgrade risk depends mostly on native modules and build tooling.",
    };
  }

  return {
    strategy: "manual-review",
    target: "next stable React Native version",
    note: "Upgrade path should be reviewed manually based on project structure and dependencies.",
  };
}
