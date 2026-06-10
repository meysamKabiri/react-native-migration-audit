type Risk = {
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
};

type MigrationArea = {
  area: string;
  risk: "high" | "medium" | "low";
  packages: string[];
  reason: string;
  suggestedAction: string;
};

type NativeModuleGroup = {
  name: string;
  platforms: ("android" | "ios")[];
  files: string[];
  severity: "critical" | "high" | "medium" | "low";
};

type AuditResultLike = {
  projectName: string;
  reactNative: string | null;
  reactNativeRaw?: string | null;
  reactNativeSemver?: string | null;
  workflow: string;
  packageManager: string;
  lockfiles: string[];
  hasMixedLockfiles: boolean;
  riskLevel: "critical" | "high" | "medium" | "low";
  risks: Risk[];
  upgradeRecommendation: {
    strategy: string;
    target: string;
    note: string;
  };
  baselineReadiness: {
    status: "ready" | "warning" | "not-ready";
    summary: string;
    blockers: string[];
    warnings: string[];
    requiredActions: string[];
  };
  riskyDependencies: {
    name: string;
    version: string;
    risk?: string;
    suggestedAction?: string;
  }[];
  migrationAreas: MigrationArea[];
  nativeModuleGroups: NativeModuleGroup[];
  nativeModuleFindings: unknown[];
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
  typecheckScriptName?: string | null;
  nativeVersions: {
    androidGradlePlugin: string | null;
    gradle: string | null;
    hasUseFrameworks: boolean;
  };
};

function list(items: string[]) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None detected.";
}

function getTopRisks(risks: Risk[]) {
  const weight = { critical: 4, high: 3, medium: 2, low: 1 };
  return [...risks]
    .sort((a, b) => weight[b.severity] - weight[a.severity])
    .slice(0, 6);
}

function renderBaselineReadiness(result: AuditResultLike) {
  const readiness = result.baselineReadiness;
  const status = readiness.status.toUpperCase();
  const guidance =
    readiness.status === "not-ready"
      ? "Do not begin the React Native upgrade yet. Resolve or explicitly accept baseline blockers first, document baseline command failures, and create a clean migration branch."
      : readiness.status === "warning"
        ? "Migration can proceed only after warnings are reviewed and documented by the operator."
        : "Migration can proceed with the normal staged workflow after baseline validation is reproduced.";

  return `- Status: ${status}
- Summary: ${readiness.summary}
- Guidance: ${guidance}

### Baseline Blockers

${list(readiness.blockers)}

### Baseline Warnings

${list(readiness.warnings)}`;
}

function renderNativeModuleSummary(result: AuditResultLike) {
  if (!result.nativeModuleGroups.length) {
    return "No custom native module groups were detected. Native platform migration should still review standard RN template diffs.";
  }

  return result.nativeModuleGroups
    .map(
      (group) =>
        `- ${group.name}: ${group.platforms.join(", ")} (${group.severity}); files: ${group.files.join(", ")}`,
    )
    .join("\n");
}

function renderMigrationAreas(result: AuditResultLike) {
  if (!result.migrationAreas.length) {
    return "- No migration-sensitive areas were detected from package usage. Still run core app smoke tests after each phase.";
  }

  return result.migrationAreas
    .map(
      (area) =>
        `- ${area.area} (${area.risk}): ${area.packages.join(", ")}. ${area.suggestedAction}`,
    )
    .join("\n");
}

function renderRiskList(result: AuditResultLike) {
  const risks = [
    ...getTopRisks(result.risks).map(
      (risk) => `${risk.title} (${risk.severity}, ${risk.category}): ${risk.description}`,
    ),
    ...result.baselineReadiness.blockers.map(
      (blocker) => `Baseline readiness blocker: ${blocker}`,
    ),
    ...result.nativeModuleGroups.map(
      (group) => `Custom native module group: ${group.name} (${group.platforms.join(", ")})`,
    ),
    ...result.migrationAreas.map(
      (area) => `Migration-sensitive area: ${area.area} (${area.risk})`,
    ),
    ...result.riskyDependencies.map(
      (dep) => `Risky dependency: ${dep.name} ${dep.version}${dep.suggestedAction ? ` - ${dep.suggestedAction}` : ""}`,
    ),
  ];

  return list([...new Set(risks)]);
}

function getValidationScriptSummary(result: AuditResultLike) {
  return [
    `Typecheck script: ${result.hasTypecheckScript ? `present (${result.typecheckScriptName ?? "unknown"})` : "missing"}`,
    `Lint script: ${result.hasLintScript ? "present" : "missing"}`,
    `Test script: ${result.hasTestScript ? "present" : "missing"}`,
    `Android script: ${result.hasAndroidScript ? "present" : "missing"}`,
    `iOS script: ${result.hasIOSScript ? "present" : "missing"}`,
  ];
}

function renderNativePhase(result: AuditResultLike) {
  if (!result.hasAndroid && !result.hasIOS && !result.nativeModuleFindings.length) {
    return "This project has no detected native folders or custom native module findings. Keep this phase as a lightweight review of generated native changes, if any.";
  }

  return `Focus areas:

${list([
    result.hasAndroid
      ? `Android native diffs, Gradle files, Android app build.gradle, and Android validation.`
      : "Android folder not detected; document if Android is intentionally unsupported.",
    result.hasIOS
      ? `iOS native diffs, Podfile, CocoaPods install behavior, and iOS validation.`
      : "iOS folder not detected; document if iOS is intentionally unsupported.",
    result.nativeModuleGroups.length
      ? "Custom native modules and bridge compatibility must be reviewed before broad upgrade changes."
      : "No custom native module groups detected by the audit.",
  ])}

Custom native module summary:

${renderNativeModuleSummary(result)}`;
}

export function generateMigrationPlan(result: AuditResultLike): string {
  const nativePhaseRequired =
    result.hasAndroid || result.hasIOS || result.nativeModuleFindings.length > 0;
  const readinessInstruction =
    result.baselineReadiness.status === "not-ready"
      ? "Start with baseline stabilization. Do not perform React Native version changes until blockers are resolved or explicitly accepted."
      : result.baselineReadiness.status === "warning"
        ? "Review warnings before starting version changes, then proceed in controlled phases."
        : "Proceed with staged migration after reproducing the baseline.";

  return `# React Native Migration Strategy

Project: ${result.projectName}

## Strategy Summary

${readinessInstruction}

- Workflow: ${result.workflow}
- Current React Native: ${result.reactNative ?? "not detected"}
- Overall risk level: ${result.riskLevel.toUpperCase()}
- Package manager: ${result.packageManager}
- Lockfiles: ${result.lockfiles.length ? result.lockfiles.join(", ") : "none detected"}
- Mixed lockfiles: ${result.hasMixedLockfiles ? "Yes" : "No"}
- Native platform phase required: ${nativePhaseRequired ? "Yes" : "No"}

## Baseline Readiness

${renderBaselineReadiness(result)}

## Recommended Upgrade Path

- Strategy: ${result.upgradeRecommendation.strategy}
- Target/path: ${result.upgradeRecommendation.target}
- Note: ${result.upgradeRecommendation.note}

Do not hardcode a newer target than the audit recommendation. Follow the staged path and validate after each milestone.

## Migration Phases

### Phase 0 — Baseline Stabilization

Goal: reproduce the current baseline before changing dependencies or native files.

${
    result.baselineReadiness.status === "not-ready"
      ? "Do not begin the React Native upgrade yet. Resolve or accept baseline blockers first, document baseline command failures, and create a clean migration branch."
      : result.baselineReadiness.status === "warning"
        ? "Review and document baseline warnings before starting the React Native upgrade."
        : "Proceed with normal staged workflow after baseline validation is reproduced."
  }

Focus:

${list([
    "Confirm current dependency install status and lockfile behavior.",
    "Run or document typecheck, test, and lint baseline commands.",
    "Run Android and iOS build baselines when local environments are available.",
    "Inspect git status and create a clean migration branch.",
    "Document any baseline command failures before proceeding.",
  ])}

Available validation script signals:

${list(getValidationScriptSummary(result))}

### Phase 1 — Dependency & Tooling Preparation

Goal: prepare dependencies and native build tooling before React Native version changes.

Focus:

${list([
    `Use package manager: ${result.packageManager}.`,
    result.hasMixedLockfiles
      ? "Multiple lockfiles were detected. Confirm the intended package manager before running installs."
      : "Review lockfile consistency and avoid switching package managers.",
    `${result.riskyDependencies.length} risky dependency package(s) require staged review.`,
    `Android Gradle Plugin: ${result.nativeVersions.androidGradlePlugin ?? "not detected"}; Gradle: ${result.nativeVersions.gradle ?? "not detected"}.`,
    `Podfile present: ${result.hasPodfile ? "yes" : "no"}; use_frameworks!: ${result.nativeVersions.hasUseFrameworks ? "yes" : "no"}.`,
    "Add or document missing validation scripts before relying on Codex changes.",
  ])}

Risky dependency review list:

${list(
    result.riskyDependencies.map(
      (dep) => `${dep.name} ${dep.version}${dep.suggestedAction ? ` - ${dep.suggestedAction}` : ""}`,
    ),
  )}

### Phase 2 — React Native Version Upgrade

Goal: apply the recommended React Native upgrade path in controlled stages.

Focus:

${list([
    "Follow the audit upgrade recommendation instead of jumping directly to latest React Native.",
    "For old RN baselines, validate after each milestone before moving to the next one.",
    "Keep React Native, React, Metro, Babel, and native template changes grouped and reviewable.",
    "Do not upgrade unrelated application dependencies in the same change set.",
    "Stop if validation failures cannot be explained.",
  ])}

### Phase 3 — Native Platform Migration

${renderNativePhase(result)}

### Phase 4 — Migration-Sensitive Area Verification

Goal: verify app areas most likely to break after React Native and native dependency changes.

Migration-sensitive areas from the audit:

${renderMigrationAreas(result)}

### Phase 5 — Final Verification & Release Readiness

Goal: confirm the upgraded app is ready for human review and release planning.

Focus:

${list([
    "Run all available validation scripts and document any missing checks.",
    "Build Android when the local Android environment is available.",
    "Build iOS and run CocoaPods validation when the local iOS environment is available.",
    "Complete manual smoke tests for migration-sensitive areas.",
    "Prepare a release risk summary with unresolved issues and rollback notes.",
    "Do not promise migration success until validation is complete and reviewed.",
  ])}

## Key Risks To Manage

${renderRiskList(result)}

## Stop Conditions

${list([
    "Baseline cannot be reproduced.",
    "Package install is unstable or lockfile changes are not understood.",
    "Android or iOS native build errors are unclear.",
    "Custom native module behavior is unclear.",
    "Validation commands fail without an understood cause.",
    "Codex suggests broad rewrites or unrelated refactors.",
  ])}

## Suggested Commit Strategy

${list([
    "Use one commit per phase when changes are small and coherent.",
    "Use one commit per dependency group when dependency changes are isolated.",
    "Use one commit per native platform fix for Android or iOS changes.",
    "Use one commit per migration-sensitive area when behavior fixes are needed.",
    "Use a final verification commit for documentation and release readiness notes.",
  ])}`;
}
