export type BaselineReadinessStatus = "ready" | "warning" | "not-ready";

export type BaselineReadinessCheck = {
  name: string;
  status: "pass" | "warning" | "blocker";
  details: string;
  recommendation: string;
};

export type BaselineReadiness = {
  status: BaselineReadinessStatus;
  summary: string;
  checks: BaselineReadinessCheck[];
  blockers: string[];
  warnings: string[];
  requiredActions: string[];
};

type AuditResultForBaselineReadiness = {
  reactNative: string | null;
  reactNativeSemver?: string | null;
  packageManager: string;
  lockfiles: string[];
  hasMixedLockfiles: boolean;
  workflow: string;
  riskLevel: "critical" | "high" | "medium" | "low";
  hasIOS: boolean;
  hasAndroid: boolean;
  hasPodfile: boolean;
  hasGradleBuild: boolean;
  hasAppGradleBuild: boolean;
  hasIOSScript: boolean;
  hasAndroidScript: boolean;
  hasTestScript: boolean;
  hasLintScript: boolean;
  hasTypecheckScript: boolean;
  nativeVersions: {
    androidGradlePlugin: string | null;
    gradle: string | null;
  };
  nativeModuleGroups: unknown[];
  nativeModuleFindings: unknown[];
};

function createCheck(
  name: string,
  status: BaselineReadinessCheck["status"],
  details: string,
  recommendation: string,
): BaselineReadinessCheck {
  return { name, status, details, recommendation };
}

function getMinorVersion(version: string | null) {
  const match = version?.match(/(\d+)\.(\d+)/);
  if (!match) return null;
  return Number(match[2]);
}

function isVersionOlderThan(version: string | null, minimumMajor: number, minimumMinor: number) {
  const match = version?.match(/(\d+)\.(\d+)/);
  if (!match) return false;

  const major = Number(match[1]);
  const minor = Number(match[2]);

  return major < minimumMajor || (major === minimumMajor && minor < minimumMinor);
}

function getSummary(status: BaselineReadinessStatus) {
  if (status === "ready") {
    return "Baseline is ready for migration work. Start with a clean branch and run validation before making changes.";
  }

  if (status === "warning") {
    return "Baseline has warnings. Do not start migration until warnings are documented and the operator accepts the risk.";
  }

  return "Baseline is not ready for immediate migration. Resolve or explicitly plan the blockers before asking Codex to change dependencies or native files.";
}

export function generateBaselineReadiness(
  result: AuditResultForBaselineReadiness,
): BaselineReadiness {
  const checks: BaselineReadinessCheck[] = [];
  const rnMinor = getMinorVersion(result.reactNativeSemver ?? result.reactNative);

  checks.push(
    createCheck(
      "React Native migration floor",
      rnMinor !== null && rnMinor < 65 ? "blocker" : result.reactNative ? "pass" : "blocker",
      `React Native version: ${result.reactNative ?? "not detected"}.`,
      rnMinor !== null && rnMinor < 65
        ? "Do not start migration immediately. Create a staged upgrade plan for this old React Native baseline first."
        : result.reactNative
          ? "React Native version does not trigger the old-version readiness blocker."
          : "Confirm this is a React Native or Expo project before migration planning.",
    ),
  );

  checks.push(
    createCheck(
      "Overall audit risk",
      result.riskLevel === "critical" ? "blocker" : "pass",
      `Overall risk level: ${result.riskLevel.toUpperCase()}.`,
      result.riskLevel === "critical"
        ? "Do not start migration immediately. Review critical blockers and prepare a staged rescue plan first."
        : "Overall risk is not critical, so this does not block baseline readiness.",
    ),
  );

  checks.push(
    createCheck(
      "Custom native modules",
      result.nativeModuleGroups.length || result.nativeModuleFindings.length
        ? "blocker"
        : "pass",
      `${result.nativeModuleGroups.length} custom native module group(s), ${result.nativeModuleFindings.length} raw native finding(s).`,
      result.nativeModuleGroups.length || result.nativeModuleFindings.length
        ? "Do not start broad migration changes until custom native modules are reviewed and assigned explicit bridge tasks."
        : "No custom native modules were detected by the audit.",
    ),
  );

  if (result.hasAndroid) {
    const oldAgp = isVersionOlderThan(result.nativeVersions.androidGradlePlugin, 7, 0);
    const oldGradle = isVersionOlderThan(result.nativeVersions.gradle, 7, 0);

    checks.push(
      createCheck(
        "Android build tooling age",
        oldAgp || oldGradle ? "blocker" : "pass",
        `Android Gradle Plugin: ${result.nativeVersions.androidGradlePlugin ?? "not detected"}; Gradle: ${result.nativeVersions.gradle ?? "not detected"}.`,
        oldAgp || oldGradle
          ? "Do not start migration immediately. Plan Android Gradle Plugin and Gradle upgrades as controlled native tooling tasks."
          : "Android build tooling does not trigger the old-tooling readiness blocker.",
      ),
    );

    checks.push(
      createCheck(
        "Android baseline command",
        result.hasAndroidScript ? "pass" : "warning",
        `Android script: ${result.hasAndroidScript ? "present" : "missing"}.`,
        result.hasAndroidScript
          ? "Run Android validation when the local emulator/device environment is available."
          : "Add or document the Android validation command before native migration work.",
      ),
    );
  }

  if (result.hasIOS) {
    checks.push(
      createCheck(
        "iOS CocoaPods baseline",
        result.hasPodfile ? "pass" : "blocker",
        `Podfile: ${result.hasPodfile ? "yes" : "no"}.`,
        result.hasPodfile
          ? "Run CocoaPods validation before iOS dependency changes."
          : "Do not start iOS migration work until the missing Podfile is restored or explained.",
      ),
    );

    checks.push(
      createCheck(
        "iOS baseline command",
        result.hasIOSScript ? "pass" : "warning",
        `iOS script: ${result.hasIOSScript ? "present" : "missing"}.`,
        result.hasIOSScript
          ? "Run iOS validation when the local Xcode/simulator environment is available."
          : "Add or document the iOS validation command before native migration work.",
      ),
    );
  }

  checks.push(
    createCheck(
      "Package manager",
      result.packageManager === "unknown" || result.hasMixedLockfiles
        ? "warning"
        : "pass",
      `Detected package manager: ${result.packageManager}. Lockfiles: ${result.lockfiles.length ? result.lockfiles.join(", ") : "none detected"}.`,
      result.hasMixedLockfiles
        ? "Multiple lockfiles were found. Confirm the intended package manager before running installs or changing dependencies."
        : result.packageManager === "unknown"
        ? "Add or restore a supported lockfile so install commands are deterministic."
        : "Use the detected package manager for all install and script commands.",
    ),
  );

  checks.push(
    createCheck(
      "Project workflow",
      result.workflow === "unknown" ? "warning" : "pass",
      `Detected workflow: ${result.workflow}.`,
      result.workflow === "unknown"
        ? "Document the expected workflow before changing dependencies or native files."
        : "Use this workflow to decide whether native iOS/Android changes are required.",
    ),
  );

  checks.push(
    createCheck(
      "Typecheck script",
      result.hasTypecheckScript ? "pass" : "warning",
      `Typecheck script: ${result.hasTypecheckScript ? "present" : "missing"}.`,
      result.hasTypecheckScript
        ? "Run typechecking before migration and after each code change task."
        : "Add or document a typecheck command so migration type regressions are visible.",
    ),
  );

  checks.push(
    createCheck(
      "Lint script",
      result.hasLintScript ? "pass" : "warning",
      `Lint script: ${result.hasLintScript ? "present" : "missing"}.`,
      result.hasLintScript
        ? "Run lint before migration and after code changes."
        : "Add or document a lint command if lint tooling exists.",
    ),
  );

  checks.push(
    createCheck(
      "Test script",
      result.hasTestScript ? "pass" : "warning",
      `Test script: ${result.hasTestScript ? "present" : "missing"}.`,
      result.hasTestScript
        ? "Run tests before migration and after code changes."
        : "Add or document available test commands before migration work starts.",
    ),
  );

  const blockers = checks
    .filter((check) => check.status === "blocker")
    .map((check) => check.recommendation);
  const warnings = checks
    .filter((check) => check.status === "warning")
    .map((check) => check.recommendation);
  const status: BaselineReadinessStatus = blockers.length
    ? "not-ready"
    : warnings.length
      ? "warning"
      : "ready";

  return {
    status,
    summary: getSummary(status),
    checks,
    blockers,
    warnings,
    requiredActions: [...blockers, ...warnings],
  };
}
