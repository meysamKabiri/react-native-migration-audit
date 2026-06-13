import { generateReactNativeUpgradePath } from "../rules/rnVersionRules";
import {
  renderActionRegisterSummaryMarkdown,
  renderPatternGroupSummaryMarkdown,
} from "../knowledge/migrationPatterns";
import type { MigrationPattern } from "../models/MigrationPattern";
import type { BaselineReadiness } from "../models/BaselineReadiness";
import type { MigrationArea } from "../models/MigrationArea";
import type { RiskyDependency } from "../models/Risk";
import type { NativeModuleGroup } from "../scanners/nativeModuleScanner";

export type AuditResultLike = {
  projectName: string;
  reactNative: string | null;
  reactNativeSemver?: string | null;
  upgradeRecommendation: {
    strategy: string;
    target: string;
    note: string;
  };
  baselineReadiness: BaselineReadiness;
  packageManager?: string;
  lockfiles?: string[];
  hasMixedLockfiles?: boolean;
  hasIOS: boolean;
  hasAndroid: boolean;
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
  riskyDependencies?: RiskyDependency[];
  migrationAreas?: MigrationArea[];
  nativeModuleGroups?: NativeModuleGroup[];
  knownMigrationPatterns?: MigrationPattern[];
  scripts?: Record<string, string>;
};

function getPackageManager(result: AuditResultLike) {
  return result.packageManager ?? "unknown";
}

function getCommandPackageManager(result: AuditResultLike) {
  const packageManager = getPackageManager(result);

  if (packageManager !== "unknown") return packageManager;

  // React Native project scripts are commonly run through Yarn even when no lockfile is present.
  if (result.hasAndroidScript || result.hasIOSScript) return "yarn";

  return "npm";
}

function list(items: string[]) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None detected.";
}

function getScriptCommand(result: AuditResultLike, scriptName: string) {
  const packageManager = getCommandPackageManager(result);

  if (packageManager === "yarn") return `yarn ${scriptName}`;
  if (packageManager === "pnpm") return `pnpm ${scriptName}`;
  if (packageManager === "bun") return `bun run ${scriptName}`;
  return `npm run ${scriptName}`;
}

function getInstallCommand(result: AuditResultLike) {
  const packageManager = getCommandPackageManager(result);

  if (packageManager === "yarn") return "yarn install";
  if (packageManager === "pnpm") return "pnpm install";
  if (packageManager === "bun") return "bun install";
  return "npm install";
}

function getValidationCommands(result: AuditResultLike) {
  const commands = [getInstallCommand(result)];

  if (result.hasTypecheckScript) {
    commands.push(getScriptCommand(result, result.typecheckScriptName ?? "typecheck"));
  }

  if (result.hasLintScript) commands.push(getScriptCommand(result, "lint"));
  if (result.hasTestScript) commands.push(getScriptCommand(result, "test"));
  if (result.hasAndroidScript) commands.push(getScriptCommand(result, "android"));
  if (result.hasIOSScript) commands.push(getScriptCommand(result, "ios"));

  return commands;
}

function getMilestoneValidationCommands(result: AuditResultLike) {
  return getValidationCommands(result).map((command) => {
    if (command === getScriptCommand(result, "android")) {
      return `${command} - Run if the local native environment is available. Otherwise document the required environment.`;
    }

    if (command === getScriptCommand(result, "ios")) {
      return `${command} - Run if the local native environment is available. Otherwise document the required environment.`;
    }

    return command;
  });
}

function getBaselineInstruction(readiness: BaselineReadiness) {
  if (readiness.status === "not-ready") {
    return "Do not start dependency or React Native version changes until blockers are resolved or explicitly accepted in writing.";
  }

  if (readiness.status === "warning") {
    return "Proceed only after warnings are reviewed, documented, and accepted by the migration owner.";
  }

  return "Proceed after reproducing the baseline validation commands on a clean migration branch.";
}

function getUpgradeMilestones(result: AuditResultLike) {
  const versionForRules = result.reactNativeSemver ?? result.reactNative;
  const path = generateReactNativeUpgradePath(versionForRules).path;

  if (!path.length) return ["Manual review required before selecting upgrade milestones"];
  return path;
}

function getCurrentReactNativeVersion(result: AuditResultLike) {
  return result.reactNativeSemver ?? result.reactNative ?? "current detected version";
}

function getStageSuffix(index: number) {
  return String.fromCharCode("A".charCodeAt(0) + index);
}

function isSafeCommitVersion(version: string) {
  return /^\d+\.\d+(?:\.\d+)?$/.test(version);
}

function getMilestoneCommitMessage(from: string, to: string, isModern: boolean) {
  if (isModern || !isSafeCommitVersion(from) || !isSafeCommitVersion(to)) {
    return "Apply React Native minor upgrade milestone";
  }

  return `Upgrade React Native from ${from} to ${to}`;
}

function getFilesToInspect(result: AuditResultLike) {
  return [
    "package.json",
    result.lockfiles?.length ? result.lockfiles.join(", ") : "project lockfile if present",
    "metro.config.js",
    "babel.config.js",
    result.hasTestScript ? "Jest configuration if present" : null,
    result.hasAndroid || result.hasAndroidScript ? "android/build.gradle" : null,
    result.hasAndroid || result.hasAndroidScript ? "android/app/build.gradle" : null,
    result.hasAndroid || result.hasAndroidScript
      ? "android/gradle/wrapper/gradle-wrapper.properties"
      : null,
    result.hasIOS || result.hasIOSScript ? "ios/Podfile" : null,
    result.hasIOS || result.hasIOSScript ? "ios/Podfile.lock" : null,
    "index.js, index.ts, App.js, App.tsx",
  ].filter((item): item is string => item !== null);
}

function renderMilestoneExecutionSection(
  result: AuditResultLike,
  index: number,
  from: string,
  to: string,
) {
  const stage = `2${getStageSuffix(index)}`;
  const commitMessage = getMilestoneCommitMessage(from, to, false);

  return `### Stage ${stage} — Upgrade React Native ${from} → ${to}

#### Goal

Upgrade React Native from ${from} to ${to} with the smallest safe set of framework, tooling, native template, and directly required dependency changes.

#### Allowed changes

${list([
    `React Native version changes required for ${to}.`,
    "React version changes if required by the React Native milestone.",
    "Metro, Babel, and Jest package/config changes if required by the milestone.",
    "Android and iOS template-aligned changes if required by the official upgrade diff.",
    "Dependency compatibility fixes directly required for this milestone.",
  ])}

#### Forbidden changes

${list([
    "Do not refactor unrelated app code.",
    "Do not redesign UI.",
    "Do not change business logic unless required by migration.",
    "Do not upgrade unrelated packages.",
    "Do not jump to a later milestone.",
    "Do not silence TypeScript errors without explanation.",
    "Do not continue if Android/iOS build failures are unclear.",
  ])}

#### Files to inspect

${list(getFilesToInspect(result))}

#### Implementation guidance

${list([
    `Inspect the official React Native upgrade diff for ${from} to ${to} before editing.`,
    "Compare native template changes before editing Android or iOS files.",
    "Update framework and package versions minimally for this milestone only.",
    `Run ${getInstallCommand(result)} after package changes.`,
    "Resolve Android and iOS build errors in isolated commits when native changes are required.",
    "Document blockers instead of guessing when the upgrade diff or native build failure is unclear.",
  ])}

#### Validation commands

${list(getMilestoneValidationCommands(result))}

#### Success criteria

${list([
    `React Native is upgraded to ${to} for this milestone only.`,
    "Install completes and lockfile changes are understood.",
    "Available typecheck, lint, and test commands pass or have documented migration blockers.",
    "Available Android and iOS commands pass when local native environments are available, or environment blockers are documented.",
    "No broad unrelated app code, UI, or business-logic changes are included.",
  ])}

#### Commit checkpoint

\`\`\`bash
git add .
git commit -m "${commitMessage}"
\`\`\`

#### Stop conditions

${list([
    "Install fails for unexplained reasons.",
    "Lockfile changes unexpectedly.",
    "Android build errors are unclear.",
    "iOS build errors are unclear.",
    "Broad unrelated files change.",
    "App behavior cannot be verified.",
  ])}`;
}

function renderModernMilestoneExecutionSection(result: AuditResultLike) {
  const from = getCurrentReactNativeVersion(result);
  const to = "current stable / minor update only";
  const commitMessage = getMilestoneCommitMessage(from, to, true);

  return `### Stage 2A — Modern React Native Minor Update

#### Goal

Apply a narrow modern React Native minor update from ${from} toward ${to} without introducing old staged-upgrade hops.

#### Allowed changes

${list([
    "React Native version changes required for the selected minor update.",
    "React version changes if required by the React Native minor update.",
    "Metro, Babel, and Jest package/config changes if required by the update.",
    "Android and iOS template-aligned changes if required by the official upgrade diff.",
    "Dependency compatibility fixes directly required for this minor update.",
  ])}

#### Forbidden changes

${list([
    "Do not refactor unrelated app code.",
    "Do not redesign UI.",
    "Do not change business logic unless required by migration.",
    "Do not upgrade unrelated packages.",
    "Do not jump to a later milestone.",
    "Do not silence TypeScript errors without explanation.",
    "Do not continue if Android/iOS build failures are unclear.",
  ])}

#### Files to inspect

${list(getFilesToInspect(result))}

#### Implementation guidance

${list([
    "Inspect the official React Native upgrade diff for the selected modern minor update before editing.",
    "Compare native template changes before editing Android or iOS files.",
    "Update framework and package versions minimally for the selected minor update only.",
    `Run ${getInstallCommand(result)} after package changes.`,
    "Resolve Android and iOS build errors in isolated commits when native changes are required.",
    "Document blockers instead of guessing when the upgrade diff or native build failure is unclear.",
  ])}

#### Validation commands

${list(getMilestoneValidationCommands(result))}

#### Success criteria

${list([
    "The project uses the selected modern React Native minor update without legacy staged milestones.",
    "Install completes and lockfile changes are understood.",
    "Available typecheck, lint, and test commands pass or have documented migration blockers.",
    "Available Android and iOS commands pass when local native environments are available, or environment blockers are documented.",
    "No broad unrelated app code, UI, or business-logic changes are included.",
  ])}

#### Commit checkpoint

\`\`\`bash
git add .
git commit -m "${commitMessage}"
\`\`\`

#### Stop conditions

${list([
    "Install fails for unexplained reasons.",
    "Lockfile changes unexpectedly.",
    "Android build errors are unclear.",
    "iOS build errors are unclear.",
    "Broad unrelated files change.",
    "App behavior cannot be verified.",
  ])}`;
}

function renderMilestoneExecutionTemplates(result: AuditResultLike) {
  if (result.upgradeRecommendation.strategy === "modern-upgrade") {
    return renderModernMilestoneExecutionSection(result);
  }

  const milestones = getUpgradeMilestones(result);
  let from = getCurrentReactNativeVersion(result);

  return milestones
    .map((to, index) => {
      const section = renderMilestoneExecutionSection(result, index, from, to);
      from = to;
      return section;
    })
    .join("\n\n");
}

function renderMilestoneSummary(result: AuditResultLike) {
  const milestones = getUpgradeMilestones(result);
  const firstMilestone = milestones[0];
  const isModern = result.upgradeRecommendation.strategy === "modern-upgrade";

  if (isModern) {
    return `- Upgrade mode: modern upgrade / minor update only
- First milestone: current stable / minor update only
- Milestones: ${milestones.join(" -> ")}
- Guidance: keep the upgrade narrow and avoid legacy staged-upgrade assumptions.`;
  }

  return `- Upgrade mode: ${result.upgradeRecommendation.strategy}
- First milestone: ${firstMilestone}
- Milestones: ${milestones.join(" -> ")}
- Guidance: validate and commit after each milestone before continuing.`;
}

function renderNativeModuleCaution(result: AuditResultLike) {
  const nativeModuleGroups = result.nativeModuleGroups ?? [];

  if (!nativeModuleGroups.length) {
    return "No custom native module groups were detected. Still review native template diffs and build output after each upgrade milestone.";
  }

  return `Native module caution: custom native module groups were detected. Treat native bridge compatibility as a stop/go gate before moving between milestones.

${list(
    nativeModuleGroups.map(
      (group) =>
        `${group.name}: ${group.platforms.join(", ")} (${group.severity}); files: ${group.files.join(", ")}`,
    ),
  )}`;
}

function renderMigrationAreaFocus(result: AuditResultLike) {
  const migrationAreas = result.migrationAreas ?? [];

  if (!migrationAreas.length) {
    return "No migration-sensitive areas were detected from package usage. Keep a general app smoke test after each milestone.";
  }

  return list(
    migrationAreas.map(
      (area) =>
        `${area.area} (${area.risk}): ${area.packages.join(", ")}${area.suggestedAction ? `. ${area.suggestedAction}` : ""}`,
    ),
  );
}

function renderDependencyFocus(result: AuditResultLike) {
  const dependencies = (result.riskyDependencies ?? []).map(
    (dependency) =>
      `${dependency.name} ${dependency.version}${dependency.suggestedAction ? ` - ${dependency.suggestedAction}` : ""}`,
  );

  return list([
    result.hasMixedLockfiles
      ? "Mixed lockfiles detected. Confirm the intended package manager before installs."
      : `Use ${getPackageManager(result)} consistently and avoid package-manager switching.`,
    `Lockfiles: ${result.lockfiles?.length ? result.lockfiles.join(", ") : "none detected"}.`,
    ...dependencies,
  ]);
}

function renderKnownMigrationRisks(result: AuditResultLike) {
  const patterns = result.knownMigrationPatterns ?? [];

  if (!patterns.length) return "";

  return `### Known Migration Risks

${renderPatternGroupSummaryMarkdown(patterns, 4)}

#### Detected Risk Actions

${list(
    patterns.map(
      (pattern) =>
        `${pattern.id}: ${pattern.title} (${pattern.patternGroup?.title ?? "Uncategorized"}, ${pattern.confidence ?? "medium"} confidence) - ${pattern.recommendation}`,
    ),
  )}`;
}

export function generateUpgradeExecutionPlan(result: AuditResultLike): string {
  const validationCommands = getValidationCommands(result);
  const knownMigrationRisksSection = renderKnownMigrationRisks(result);
  const actionRegisterSection = renderActionRegisterSummaryMarkdown(
    result.knownMigrationPatterns ?? [],
  );

  return `# Upgrade Execution Plan

Project: ${result.projectName}

## Execution Rule

This plan is for controlled upgrade execution only. Do not execute upgrades automatically, do not modify audited app repositories from the audit tool, and do not combine feature work with migration work.

${renderMilestoneSummary(result)}

${actionRegisterSection}

${knownMigrationRisksSection}

## Baseline Gate

- Status: ${result.baselineReadiness.status.toUpperCase()}
- Summary: ${result.baselineReadiness.summary}
- Instruction: ${getBaselineInstruction(result.baselineReadiness)}

### Blockers

${list(result.baselineReadiness.blockers)}

### Warnings

${list(result.baselineReadiness.warnings)}

### Required Actions

${list(result.baselineReadiness.requiredActions)}

## Upgrade Stages

### Stage 0 - Baseline Reproduction

Goal: prove the existing app state before dependency or native changes.

${list([
    "Start from a clean migration branch.",
    "Run install and all available validation commands.",
    "Document missing local iOS or Android environments instead of skipping silently.",
    "Stop if baseline failures are unexplained.",
  ])}

### Stage 1 - Package Manager And Dependency Preparation

Goal: stabilize install behavior and identify packages that need isolated treatment.

${renderDependencyFocus(result)}

### Stage 2 - React Native Upgrade Milestones

Goal: apply the React Native upgrade in controlled milestones.

${renderMilestoneSummary(result)}

Rules:

${list([
    "Change React Native, React, Metro, Babel, and template-linked files together only when required by the milestone.",
    "Do not upgrade unrelated application dependencies in the same change set.",
    "Run validation after each milestone and commit only after the milestone is understood.",
    "For modern projects, prefer current stable / minor update only language and avoid unnecessary legacy staged hops.",
  ])}

## Milestone Execution Templates

${renderMilestoneExecutionTemplates(result)}

### Stage 3 - Android Native Tooling

Goal: validate Android native compatibility when Android is present.

${list([
    result.hasAndroid ? "Android folder detected; review Gradle, Android Gradle Plugin, app build.gradle, Kotlin, and RN template diffs." : "Android folder not detected; document whether Android is intentionally unsupported.",
    `Android Gradle Plugin: ${result.nativeVersions.androidGradlePlugin ?? "not detected"}.`,
    `Gradle: ${result.nativeVersions.gradle ?? "not detected"}.`,
    result.hasAndroidScript ? "Android script detected; run it when the local Android environment is available." : "Android script not detected; document Android validation strategy.",
  ])}

### Stage 4 - iOS Native Tooling

Goal: validate iOS native compatibility when iOS is present.

${list([
    result.hasIOS ? "iOS folder detected; review Podfile, CocoaPods behavior, native template diffs, and Xcode build settings." : "iOS folder not detected; document whether iOS is intentionally unsupported.",
    `Podfile use_frameworks!: ${result.nativeVersions.hasUseFrameworks ? "yes" : "no"}.`,
    result.hasIOSScript ? "iOS script detected; run it when the local iOS environment is available." : "iOS script not detected; document iOS validation strategy.",
  ])}

### Stage 5 - Native Modules And Migration-Sensitive Areas

Goal: verify native bridge compatibility and app areas most likely to break.

${renderNativeModuleCaution(result)}

Migration-sensitive areas:

${renderMigrationAreaFocus(result)}

### Stage 6 - Final Verification And Release Readiness

Goal: produce a reviewable upgraded state with documented residual risk.

${list([
    "Run all available validation commands.",
    "Complete manual smoke tests for migration-sensitive areas.",
    "Document unresolved failures, environment gaps, and rollback notes.",
    "Prepare a final release-readiness summary before handing off for human review.",
  ])}

## Codex Execution Rules

${list([
    "Inspect files before editing.",
    "Make the smallest migration-related change possible.",
    "Do not refactor unrelated app code.",
    "Do not remove code only to make validation pass unless the removal is clearly part of the migration.",
    "Do not continue to the next stage after unexplained validation failures.",
    "If the native upgrade path is unclear, stop and document the blocker instead of guessing.",
  ])}

## Validation Commands

${list(validationCommands)}

## Commit Strategy

${list([
    "Commit Stage 0 baseline documentation separately.",
    "Commit each React Native milestone separately.",
    "Commit Android and iOS native fixes separately when possible.",
    "Commit risky dependency compatibility fixes separately from framework version changes.",
    "Commit final verification documentation separately.",
  ])}

## Stop Conditions

${list([
    "Baseline cannot be reproduced or accepted.",
    "Package install changes lockfiles in an unexplained way.",
    "React Native milestone produces broad unrelated diffs.",
    "Android or iOS native build errors are not understood.",
    "Custom native module compatibility is unclear.",
    "Validation commands fail without an understood cause.",
  ])}`;
}
