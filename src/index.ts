import { Command } from "commander";
import process from "node:process";
import fs from "fs-extra";
import path from "node:path";
import chalk from "chalk";
import { riskyDependencies } from "./rules/riskyDependencies";
import {
  cleanVersion,
  getUpgradeRecommendation,
  normalizeReactNativeVersionSpec,
} from "./rules/rnVersionRules";
import { packageRules } from "./rules/packageRules";
import { scanSourceCode } from "./scanners/sourceCodeScanner";
import { scanAst } from "./scanners/astScanner";
import { scanBarrels } from "./scanners/barrelScanner";
import {
  groupNativeModuleFindings,
  scanNativeModules,
} from "./scanners/nativeModuleScanner";
import {
  buildMigrationAreaEvidence,
  buildMigrationAreas,
  type MigrationAreaEvidence,
} from "./rules/migrationAreas";
import { generateProposal, type Proposal } from "./core/generateProposal";
import { generateMigrationTasks } from "./core/generateMigrationTasks";
import { generateMigrationPlan } from "./core/generateMigrationPlan";
import { generateUpgradeExecutionPlan } from "./core/generateUpgradeExecutionPlan";
import {
  generateBaselineReadiness,
  type BaselineReadiness,
} from "./core/generateBaselineReadiness";
import {
  detectMigrationPatterns,
  renderMigrationPatternsMarkdown,
  type MigrationPattern,
} from "./knowledge/migrationPatterns";
type RiskCategory =
  | "react-native"
  | "android"
  | "ios"
  | "dependency"
  | "scripts"
  | "typescript"
  | "expo"
  | "project";

type RiskSeverity = "critical" | "high" | "medium" | "low";

type Risk = {
  category: RiskCategory;
  severity: RiskSeverity;
  title: string;
  description: string;
};

type Workflow =
  | "expo-managed"
  | "expo-bare-or-prebuild"
  | "bare-react-native"
  | "unknown";

type UpgradeTask = {
  id: string;
  priority: "high" | "medium" | "low";
  area: string;
  title: string;
  description: string;
};
type ComplexityScore = {
  score: number;
  classification: "low" | "moderate" | "significant" | "high" | "extreme";
  drivers: string[];
};

const program = new Command();

function addRisk(
  risks: Risk[],
  category: RiskCategory,
  severity: RiskSeverity,
  title: string,
  description: string,
) {
  risks.push({
    category,
    severity,
    title,
    description,
  });
}

async function readFileIfExists(filePath: string) {
  if (!(await fs.pathExists(filePath))) return null;
  return fs.readFile(filePath, "utf8");
}

function podfileHasActiveUseFrameworks(podfile: string | null) {
  return (
    podfile
      ?.split("\n")
      .some((line) => line.replace(/#.*/, "").includes("use_frameworks!")) ?? false
  );
}

function getSetupPermissionsInfo(podfile: string | null) {
  if (!podfile) {
    return {
      hasSetupPermissions: false,
      handlers: [] as string[],
      handlersIdentified: false,
      isEmpty: false,
    };
  }

  const uncommented = podfile
    .split("\n")
    .map((line) => line.replace(/#.*/, ""))
    .join("\n");
  const match = uncommented.match(/setup_permissions\s*\(([\s\S]*?)\)/m);

  if (!match) {
    return {
      hasSetupPermissions: false,
      handlers: [] as string[],
      handlersIdentified: false,
      isEmpty: false,
    };
  }

  const argument = match[1].trim();
  const handlers = Array.from(argument.matchAll(/["']([^"']+)["']/g)).map(
    (handlerMatch) => handlerMatch[1],
  );
  const isEmpty = /^\[\s*\]$/.test(argument) || argument.length === 0;

  return {
    hasSetupPermissions: true,
    handlers,
    handlersIdentified: handlers.length > 0,
    isEmpty,
  };
}

function podfileUsesLegacyReactNativePathConfig(podfile: string | null) {
  return Boolean(podfile?.match(/config\s*\[\s*["']reactNativePath["']\s*\]/));
}

function androidUsesLegacyReactGradleApply(appGradle: string | null) {
  return Boolean(appGradle?.includes("node_modules/react-native/react.gradle"));
}

function androidUsesLegacyReactNativeDependency(appGradle: string | null) {
  return Boolean(
    appGradle?.match(/com\.facebook\.react:react-native(?::|["'])/),
  );
}

function androidUsesProjectExtReact(appGradle: string | null) {
  return Boolean(appGradle?.includes("project.ext.react"));
}

function androidUsesFacebookReactPlugin(appGradle: string | null) {
  return Boolean(
    appGradle?.match(/apply plugin:\s*["']com\.facebook\.react["']/) ||
      appGradle?.match(/id\s*["']com\.facebook\.react["']/),
  );
}

function androidUsesReactAndroidDependency(appGradle: string | null) {
  return Boolean(appGradle?.includes("com.facebook.react:react-android"));
}

function parseYarnLockPackageVersions(
  lockfile: string | null,
  packageName: string,
) {
  if (!lockfile) return [];

  const versions = new Set<string>();

  for (const block of lockfile.split(/\n(?=\S)/)) {
    const [header = ""] = block.split("\n", 1);
    const specs = header
      .replace(/:$/, "")
      .split(/,\s*/)
      .map((spec) => spec.replace(/^"|"$/g, ""));

    if (!specs.some((spec) => spec.startsWith(`${packageName}@`))) {
      continue;
    }

    const version = block.match(/^  version "([^"]+)"/m)?.[1];
    if (version) versions.add(version);
  }

  return Array.from(versions).sort();
}

const androidGradlePluginPresentUnknown = "present-unknown";

function extractVersionFromMatches(
  text: string,
  patterns: RegExp[],
): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const version = match?.[1];

    if (version) return version;
  }

  return null;
}

function parseVersionCatalogVersions(catalog: string) {
  const versions = new Map<string, string>();
  const versionMatches = catalog.matchAll(
    /^\s*([A-Za-z0-9_.-]+)\s*=\s*["']([^"']+)["']/gm,
  );

  for (const match of versionMatches) {
    versions.set(match[1], match[2]);
  }

  return versions;
}

function extractAndroidGradlePluginVersionFromCatalog(catalog: string) {
  const versions = parseVersionCatalogVersions(catalog);
  const lines = catalog.split("\n");

  for (const line of lines) {
    if (!/com\.android\.(application|library)|com\.android\.tools\.build:gradle/.test(line)) {
      continue;
    }

    const directVersion = line.match(/version\s*=\s*["']([^"']+)["']/)?.[1];
    if (directVersion) return directVersion;

    const versionRef = line.match(/version\.ref\s*=\s*["']([^"']+)["']/)?.[1];
    if (versionRef && versions.has(versionRef)) return versions.get(versionRef) ?? null;

    const moduleVersion = line.match(
      /com\.android\.tools\.build:gradle:([0-9][A-Za-z0-9_.-]*)/,
    )?.[1];
    if (moduleVersion) return moduleVersion;
  }

  return null;
}

function extractGradleVariableVersions(text: string) {
  const versions = new Map<string, string>();
  const variableMatches = text.matchAll(
    /(?:def\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*["']([0-9][A-Za-z0-9_.-]*)["']/g,
  );

  for (const match of variableMatches) {
    versions.set(match[1], match[2]);
  }

  return versions;
}

function parseGradlePropertiesVersions(properties: string) {
  const versions = new Map<string, string>();
  const propertyMatches = properties.matchAll(
    /^\s*([A-Za-z0-9_.-]+)\s*=\s*([0-9][A-Za-z0-9_.-]*)\s*$/gm,
  );

  for (const match of propertyMatches) {
    versions.set(match[1], match[2]);
  }

  return versions;
}

function getLikelyAndroidGradlePluginVersion(
  versions: Map<string, string>,
) {
  const propertyNames = [
    "androidGradlePluginVersion",
    "agpVersion",
    "agp_version",
    "gradlePluginVersion",
  ];

  for (const propertyName of propertyNames) {
    const version = versions.get(propertyName);
    if (version) return version;
  }

  return null;
}

function extractAndroidGradlePluginVersionFromGradle(text: string) {
  const directVersion = extractVersionFromMatches(text, [
    /com\.android\.tools\.build:gradle:([0-9][A-Za-z0-9_.-]*)/,
    /com\.android\.tools\.build:gradle["']\s*,\s*version\s*[:=]\s*["']([0-9][A-Za-z0-9_.-]*)["']/,
    /id\s*\(?["']com\.android\.(?:application|library)["']\)?\s*version\s*\(?["']([0-9][A-Za-z0-9_.-]*)["']\)?/,
    /id\s*=\s*["']com\.android\.(?:application|library)["'][\s\S]{0,160}?version\s*=\s*["']([0-9][A-Za-z0-9_.-]*)["']/,
  ]);

  if (directVersion) return directVersion;

  const variables = extractGradleVariableVersions(text);
  const variableReference = extractVersionFromMatches(text, [
    /com\.android\.tools\.build:gradle:\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?/,
    /id\s*\(?["']com\.android\.(?:application|library)["']\)?\s*version\s+\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?/,
  ]);

  if (variableReference && variables.has(variableReference)) {
    return variables.get(variableReference) ?? null;
  }

  return null;
}

function hasAndroidGradlePluginUsage(text: string) {
  return /com\.android\.(application|library)|com\.android\.tools\.build:gradle/.test(
    text,
  );
}

function formatAndroidGradlePluginVersion(version: string | null) {
  if (version === androidGradlePluginPresentUnknown) {
    return "Present (version could not be determined)";
  }

  return version ?? "Not detected";
}

async function detectAndroidGradlePlugin(projectPath: string) {
  const propertiesVersions = new Map<string, string>();
  const propertyFilesToCheck = [
    "android/gradle.properties",
    "gradle.properties",
  ];
  const filesToCheck = [
    "android/build.gradle",
    "android/build.gradle.kts",
    "android/app/build.gradle",
    "android/app/build.gradle.kts",
    "android/settings.gradle",
    "android/settings.gradle.kts",
    "android/gradle/libs.versions.toml",
    "gradle/libs.versions.toml",
    "settings.gradle",
    "settings.gradle.kts",
    "build.gradle",
    "build.gradle.kts",
  ];
  let hasPluginUsage = false;

  for (const relativePath of propertyFilesToCheck) {
    const contents = await readFileIfExists(path.join(projectPath, relativePath));
    if (!contents) continue;

    for (const [name, version] of parseGradlePropertiesVersions(contents)) {
      propertiesVersions.set(name, version);
    }
  }

  for (const relativePath of filesToCheck) {
    const contents = await readFileIfExists(path.join(projectPath, relativePath));
    if (!contents) continue;

    const version = relativePath.endsWith(".toml")
      ? extractAndroidGradlePluginVersionFromCatalog(contents)
      : extractAndroidGradlePluginVersionFromGradle(contents);

    if (version) return version;
    if (hasAndroidGradlePluginUsage(contents)) {
      hasPluginUsage = true;

      const propertyVersion = getLikelyAndroidGradlePluginVersion(
        propertiesVersions,
      );
      if (propertyVersion) return propertyVersion;
    }
  }

  return hasPluginUsage ? androidGradlePluginPresentUnknown : null;
}

async function detectPackageManager(projectPath: string) {
  if (await fs.pathExists(path.join(projectPath, "yarn.lock"))) return "yarn";
  if (await fs.pathExists(path.join(projectPath, "pnpm-lock.yaml")))
    return "pnpm";
  if (await fs.pathExists(path.join(projectPath, "package-lock.json")))
    return "npm";
  if (
    (await fs.pathExists(path.join(projectPath, "bun.lockb"))) ||
    (await fs.pathExists(path.join(projectPath, "bun.lock")))
  ) {
    return "bun";
  }
  return "unknown";
}

const lockfileNames = [
  "yarn.lock",
  "package-lock.json",
  "pnpm-lock.yaml",
  "bun.lockb",
  "bun.lock",
];

async function detectLockfiles(projectPath: string) {
  const lockfiles: string[] = [];

  for (const lockfileName of lockfileNames) {
    if (await fs.pathExists(path.join(projectPath, lockfileName))) {
      lockfiles.push(lockfileName);
    }
  }

  return lockfiles;
}

const typecheckScriptNames = [
  "typecheck",
  "type-check",
  "tsc",
  "check-types",
  "types",
  "ci:typecheck",
  "ci:type-check",
];

function commandContainsTypecheck(command: string) {
  return /(?:^|[^\w-])(?:tsc|vue-tsc|tsc-files)(?=$|[^\w-])/.test(command);
}

function detectTypecheckScript(scripts: Record<string, string>) {
  for (const scriptName of typecheckScriptNames) {
    const command = scripts[scriptName];

    if (typeof command === "string") {
      return {
        hasTypecheckScript: true,
        typecheckScriptName: scriptName,
        typecheckScriptCommand: command,
      };
    }
  }

  for (const [scriptName, command] of Object.entries(scripts)) {
    if (typeof command === "string" && commandContainsTypecheck(command)) {
      return {
        hasTypecheckScript: true,
        typecheckScriptName: scriptName,
        typecheckScriptCommand: command,
      };
    }
  }

  return {
    hasTypecheckScript: false,
    typecheckScriptName: null,
    typecheckScriptCommand: null,
  };
}

function detectWorkflow(result: {
  expo: string | null;
  reactNative: string | null;
  hasIOS: boolean;
  hasAndroid: boolean;
}): Workflow {
  if (result.expo && !result.hasIOS && !result.hasAndroid)
    return "expo-managed";
  if (result.expo && result.hasIOS && result.hasAndroid)
    return "expo-bare-or-prebuild";

  if (
    !result.expo &&
    result.reactNative &&
    result.hasIOS &&
    result.hasAndroid
  ) {
    return "bare-react-native";
  }

  return "unknown";
}

function getRiskLevel(risks: Risk[]): RiskSeverity {
  if (risks.some((risk) => risk.severity === "critical")) return "critical";
  if (risks.some((risk) => risk.severity === "high")) return "high";
  if (risks.some((risk) => risk.severity === "medium")) return "medium";
  return "low";
}

function estimateEffort(risks: Risk[]) {
  const criticalCount = risks.filter(
    (risk) => risk.severity === "critical",
  ).length;
  const highCount = risks.filter((risk) => risk.severity === "high").length;

  if (criticalCount >= 2 || risks.length >= 8) {
    return {
      level: "large",
      range: "5-10+ days",
      note: "Multiple major upgrade blockers detected. Audit and staged implementation are recommended before committing to a fixed-price migration.",
    };
  }

  if (criticalCount >= 1 || highCount >= 3 || risks.length >= 5) {
    return {
      level: "medium-large",
      range: "3-7 days",
      note: "Several upgrade risks detected. Fixed-price implementation should only be offered after a detailed audit.",
    };
  }

  if (highCount >= 1 || risks.length >= 3) {
    return {
      level: "medium",
      range: "2-4 days",
      note: "Moderate upgrade risk. Implementation may be feasible after dependency and native checks.",
    };
  }

  return {
    level: "small",
    range: "1-2 days",
    note: "Low visible risk, assuming the current project builds successfully.",
  };
}

function getTopBlockers(risks: Risk[]) {
  return risks
    .filter((risk) => risk.severity === "critical" || risk.severity === "high")
    .slice(0, 5);
}

function createExecutiveSummary(result: {
  projectName: string;
  reactNative: string | null;
  workflow: Workflow;
  riskLevel: RiskSeverity;
  risks: Risk[];
  effortEstimate: {
    level: string;
    range: string;
    note: string;
  };
}) {
  const mainRisks = result.risks
    .slice(0, 5)
    .map((risk) => `- **${risk.title}**: ${risk.description}`)
    .join("\n");

  return `This audit found that **${result.projectName}** is a **${result.riskLevel} risk** React Native upgrade candidate.

The project currently uses **React Native ${result.reactNative ?? "unknown"}** with workflow type **${result.workflow}**.

The main upgrade concerns are:

${mainRisks || "- No major risks detected from the initial scan."}

Initial estimated effort: **${result.effortEstimate.range}**.

This is not a fixed quote. A successful migration should start with confirming the current iOS and Android builds, then upgrading in controlled stages.`;
}
function createMigrationPlan(result: {
  upgradeRecommendation: {
    strategy: string;
    target: string;
    note: string;
  };
  riskyDependencies: {
    name: string;
    version: string;
    reason: string;
    category?: string;
    risk?: string;
    notes?: string[];
    suggestedAction?: string;
  }[];

  nativeVersions: {
    androidGradlePlugin: string | null;
    gradle: string | null;
    hasUseFrameworks: boolean;
  };
}) {
  return `## Migration Plan

### Phase 1 — Baseline Verification

- Install dependencies with the current package manager.
- Confirm iOS builds successfully.
- Confirm Android builds successfully.
- Run lint, tests, and typecheck if available.
- Create a clean migration branch.

### Phase 2 — Dependency Alignment

- Run dependency alignment checks.
- Review risky native dependencies.
- Upgrade or replace unsupported packages.
${result.riskyDependencies
  .map(
    (dep) =>
      `- Check **${dep.name}** ${dep.version}: ${
        dep.suggestedAction ?? "Review compatibility manually."
      }`,
  )
  .join("\n")}

### Phase 3 — Native Tooling Upgrade

- Review Android Gradle Plugin version: ${result.nativeVersions.androidGradlePlugin ?? "Not detected"}.
- Review Gradle version: ${result.nativeVersions.gradle ?? "Not detected"}.
- Review iOS Podfile settings.
- Check use_frameworks!: ${result.nativeVersions.hasUseFrameworks ? "Yes" : "No"}.

### Phase 4 — React Native Upgrade

- Strategy: ${result.upgradeRecommendation.strategy}
- Suggested path: ${result.upgradeRecommendation.target}
- Note: ${result.upgradeRecommendation.note}

### Phase 5 — Final Verification

- Run iOS build.
- Run Android build.
- Run tests.
- Run typecheck.
- Perform manual smoke testing on both platforms.`;
}

function generateUpgradeTasks(result: {
  reactNative: string | null;
  workflow: Workflow;
  riskyDependencies: {
    name: string;
    version: string;
    reason: string;
    category?: string;
    risk?: string;
    suggestedAction?: string;
  }[];
  nativeVersions: {
    androidGradlePlugin: string | null;
    gradle: string | null;
    hasUseFrameworks: boolean;
  };
  hasTypecheckScript: boolean;
}): UpgradeTask[] {
  const tasks: UpgradeTask[] = [];

  if (result.reactNative) {
    tasks.push({
      id: "RN-001",
      priority: "high",
      area: "react-native",
      title: "Create staged React Native upgrade path",
      description:
        "Plan React Native upgrades in controlled stages and verify iOS/Android builds after each step.",
    });
  }

  if (result.workflow === "bare-react-native") {
    tasks.push({
      id: "NATIVE-001",
      priority: "high",
      area: "native",
      title: "Review native iOS and Android project diffs",
      description:
        "Compare native project changes for each React Native upgrade stage before applying changes.",
    });
  }

  if (result.nativeVersions.androidGradlePlugin) {
    tasks.push({
      id: "ANDROID-001",
      priority: "high",
      area: "android",
      title: "Validate Android Gradle Plugin upgrade path",
      description: `Current Android Gradle Plugin is ${result.nativeVersions.androidGradlePlugin}. Confirm compatible Gradle, Kotlin, and Android build settings for the target RN version.`,
    });
  }

  if (result.nativeVersions.hasUseFrameworks) {
    tasks.push({
      id: "IOS-001",
      priority: "medium",
      area: "ios",
      title: "Review Podfile use_frameworks! impact",
      description:
        "Check whether use_frameworks! creates CocoaPods or native dependency compatibility issues during the migration.",
    });
  }

  if (!result.hasTypecheckScript) {
    tasks.push({
      id: "TS-001",
      priority: "medium",
      area: "typescript",
      title: "Add typecheck verification command",
      description:
        "Add a reliable typecheck command before the migration so TypeScript issues can be detected automatically.",
    });
  }

  result.riskyDependencies.forEach((dep, index) => {
    const risk = dep.risk ?? "medium";

    tasks.push({
      id: `DEP-${String(index + 1).padStart(3, "0")}`,
      priority: risk === "high" ? "high" : risk === "low" ? "low" : "medium",
      area: dep.category ?? "dependency",
      title: `Review ${dep.name}`,
      description:
        dep.suggestedAction ??
        `Review ${dep.name} ${dep.version} compatibility with the target React Native version.`,
    });
  });

  return tasks;
}
function renderUpgradeTasks(tasks: UpgradeTask[]) {
  if (!tasks.length) return "No upgrade tasks generated.";

  const high = tasks.filter((task) => task.priority === "high");
  const medium = tasks.filter((task) => task.priority === "medium");
  const low = tasks.filter((task) => task.priority === "low");

  const renderGroup = (title: string, group: UpgradeTask[]) => {
    if (!group.length) return "";

    return `### ${title}

${group
  .map(
    (task) => `- **${task.id} — ${task.title}**  
  Area: ${task.area}  
  ${task.description}`,
  )
  .join("\n")}`;
  };

  return [
    renderGroup("High Priority", high),
    renderGroup("Medium Priority", medium),
    renderGroup("Low Priority", low),
  ]
    .filter(Boolean)
    .join("\n\n");
}
function renderDeprecatedApiFindings(
  findings: Awaited<ReturnType<typeof scanSourceCode>>,
) {
  if (!findings.length) {
    return "No potential legacy API references detected in scanned source files.";
  }

  return findings
    .map(
      (finding) => `### ${finding.api}

- Finding type: Potential legacy API reference
- Suggested action: ${finding.suggestedAction}
- Files:
${finding.files
  .map((file) => `  - ${file.file}: ${file.occurrences} occurrence(s)`)
  .join("\n")}`,
    )
    .join("\n\n");
}
function renderRuntimeRiskIndicators(
  result: Record<string, unknown>,
) {
  const barrelAnalysis = result.barrelAnalysis as {
    hasLargeBarrels?: boolean;
    largestBarrelExportCount?: number;
    barrelCount?: number;
    barrelFiles?: string[];
    barrelDetails?: { path: string; reexportCount: number }[];
  } | undefined;
  const migrationAreasCount = (result.migrationAreas as unknown[] | undefined)?.length ?? 0;
  const knownPatterns = result.knownMigrationPatterns as
    | { id: string; title: string }[]
    | undefined;
  const hasBarrelPattern = knownPatterns?.some(
    (p) => p.id === "PATTERN-019",
  );

  const indicators: string[] = [];

  if (barrelAnalysis?.hasLargeBarrels) {
    indicators.push(
      `Large barrel exports: ${barrelAnalysis.barrelDetails?.filter((b) => b.reexportCount >= 10).map((b) => `${b.path} (${b.reexportCount} exports)`).join(", ") || `${barrelAnalysis.barrelCount} barrel(s), largest has ${barrelAnalysis.largestBarrelExportCount} exports`}.`,
    );
  }

  if (hasBarrelPattern) {
    indicators.push(
      "Circular barrel import risk detected — consider validating screen imports and replacing runtime-sensitive barrel imports with direct imports.",
    );
  }

  if (barrelAnalysis?.barrelCount && barrelAnalysis.barrelCount > 0) {
    indicators.push(
      `${barrelAnalysis.barrelCount} barrel file(s) found in the project.`,
    );
  }

  if (migrationAreasCount >= 3) {
    indicators.push(
      `${migrationAreasCount} migration-sensitive areas — multiple screens likely import from shared barrels.`,
    );
  }

  if (!indicators.length) return "";

  return `## Runtime Risk Indicators

${indicators.map((i) => `- ${i}`).join("\n")}

This section is informational. It does not affect readiness scoring or migration recommendations.

`;
}

function renderNativeModuleFindings(
  groups: ReturnType<typeof groupNativeModuleFindings>,
) {
  if (!groups.length) {
    return "No custom native module or bridge patterns detected.";
  }

  return groups
    .map(
      (group) => `### ${group.name}

- Platforms: ${group.platforms
        .map((platform) => platform[0].toUpperCase() + platform.slice(1))
        .join(", ")}
- Severity: ${group.severity.toUpperCase()}
- Files:
${group.files.map((file) => `  - ${file}`).join("\n")}
- Finding types:
${group.findingTypes.map((type) => `  - ${type}`).join("\n")}`,
    )
    .join("\n\n");
}

function renderBaselineReadiness(readiness: BaselineReadiness) {
  return `- Baseline Readiness: ${readiness.status.toUpperCase()}
- Summary: ${readiness.summary}

### Checks

${readiness.checks
  .map(
    (check) => `- **${check.name}** (${check.status.toUpperCase()}): ${check.details} ${check.recommendation}`,
  )
  .join("\n")}

### Blockers

${
  readiness.blockers.length
    ? readiness.blockers.map((blocker) => `- ${blocker}`).join("\n")
    : "- No baseline readiness blockers detected."
}

### Warnings

${
  readiness.warnings.length
    ? readiness.warnings.map((warning) => `- ${warning}`).join("\n")
    : "- No baseline readiness warnings detected."
}

### Required Actions Before Migration

${
  readiness.requiredActions.length
    ? readiness.requiredActions.map((action) => `- ${action}`).join("\n")
    : "- No baseline readiness blockers detected."
}`;
}

function renderAstScan(scan: ReturnType<typeof scanAst>) {
  const sections: string[] = [];

  sections.push(`### React Native Related Package Usage

${
  scan.packageUsages.length
    ? scan.packageUsages
        .map(
          (usage) =>
            `- **${usage.packageName}** used in ${usage.count} file(s)`,
        )
        .join("\n")
    : "No React Native related package usage detected."
}`);

  sections.push(`### Deprecated imports from react-native detected

${
  scan.deprecatedImports.length
    ? scan.deprecatedImports
        .map(
          (item) => `- **${item.importName}** imported from react-native in ${
            item.count
          } file(s). Suggested replacement: **${item.replacement}**.
${item.files.map((file) => `  - ${file}`).join("\n")}`,
        )
        .join("\n")
    : "No deprecated imports from react-native detected."
}`);

  sections.push(`### React Code Patterns

${
  scan.reactPatterns.length
    ? scan.reactPatterns
        .map(
          (pattern) =>
            `- **${pattern.pattern}** found in ${pattern.count} file(s).`,
        )
        .join("\n")
    : "No older React patterns detected."
}`);

  return sections.join("\n\n");
}

function formatEvidenceSource(source: MigrationAreaEvidence["source"]) {
  if (source === "ast") return "AST";
  if (source === "dependency") return "Dependency";
  if (source === "native-module") return "Native Module";
  return "Mixed";
}

function renderMigrationAreas(
  migrationAreas: ReturnType<typeof buildMigrationAreas>,
  migrationAreaEvidence: MigrationAreaEvidence[],
) {
  if (!migrationAreas.length) {
    return "No major migration-sensitive areas detected from package usage.";
  }

  const evidenceByArea = new Map(
    migrationAreaEvidence.map((evidence) => [evidence.area, evidence]),
  );
  const summaryRows = migrationAreas
    .map((area) => {
      const evidence = evidenceByArea.get(area.area);

      return `| ${area.area} | ${formatEvidenceSource(evidence?.source ?? "dependency")} |`;
    })
    .join("\n");
  const details = migrationAreas
    .map((area) => {
      const evidence = evidenceByArea.get(area.area);
      const evidenceItems = evidence?.evidence.length
        ? evidence.evidence
        : area.packages.map((packageName) => `${packageName} package match`);

      return `#### ${area.area}

- Risk: ${area.risk.toUpperCase()}
- Source: ${formatEvidenceSource(evidence?.source ?? "dependency")}
- Packages:
${area.packages.map((pkg) => `  - ${pkg}`).join("\n")}
- Why it matters: ${area.reason}
- Suggested action: ${area.suggestedAction}

Evidence:

${evidenceItems.map((item) => `- ${item}`).join("\n")}`;
    })
    .join("\n\n");

  return `| Area | Confidence Source |
|---|---|
${summaryRows}

### Migration Area Evidence

${details}`;
}

function renderProposal(proposal: Proposal) {
  return `## Recommended Engagement Proposal

- Recommended service: ${proposal.recommendedService}
- Estimated price range: ${proposal.priceRange}
- Estimated effort: ${proposal.effortRange}
- Recommended next step: ${proposal.recommendedNextStep}

Pricing is an estimate based on the audit findings, not a binding quote.

### Why this recommendation

${proposal.rationale.map((item) => `- ${item}`).join("\n")}

### Included Scope

${proposal.includedScope.map((item) => `- ${item}`).join("\n")}

### Out Of Scope

${proposal.outOfScope.map((item) => `- ${item}`).join("\n")}`;
}
function calculateComplexityScore(result: {
  risks: Risk[];
  riskyDependencies: unknown[];
  nativeModuleGroups: unknown[];
  astScan: {
    deprecatedImports: unknown[];
    reactPatterns: unknown[];
    packageUsages: unknown[];
  };
  migrationAreas: {
    risk: "high" | "medium" | "low";
  }[];
  nativeVersions: {
    androidGradlePlugin: string | null;
    hasUseFrameworks: boolean;
  };
}): ComplexityScore {
  let score = 0;
  const drivers: string[] = [];

  const criticalRisks = result.risks.filter(
    (risk) => risk.severity === "critical",
  ).length;

  const highRisks = result.risks.filter(
    (risk) => risk.severity === "high",
  ).length;

  const mediumRisks = result.risks.filter(
    (risk) => risk.severity === "medium",
  ).length;

  if (criticalRisks > 0) {
    const points = Math.min(criticalRisks * 15, 25);
    score += points;
    drivers.push(`${criticalRisks} critical risk(s): +${points}`);
  }

  if (highRisks > 0) {
    const points = Math.min(highRisks * 7, 28);
    score += points;
    drivers.push(`${highRisks} high risk(s): +${points}`);
  }

  if (mediumRisks > 0) {
    const points = Math.min(mediumRisks * 3, 15);
    score += points;
    drivers.push(`${mediumRisks} medium risk(s): +${points}`);
  }

  if (result.riskyDependencies.length > 0) {
    const points = Math.min(result.riskyDependencies.length * 2, 10);
    score += points;
    drivers.push(
      `${result.riskyDependencies.length} risky dependency package(s): +${points}`,
    );
  }

  const highMigrationAreas = result.migrationAreas.filter(
    (area) => area.risk === "high",
  ).length;

  const mediumMigrationAreas = result.migrationAreas.filter(
    (area) => area.risk === "medium",
  ).length;

  if (highMigrationAreas > 0) {
    const points = Math.min(highMigrationAreas * 6, 18);
    score += points;
    drivers.push(
      `${highMigrationAreas} high-risk migration area(s): +${points}`,
    );
  }

  if (mediumMigrationAreas > 0) {
    const points = Math.min(mediumMigrationAreas * 2, 10);
    score += points;
    drivers.push(
      `${mediumMigrationAreas} medium-risk migration area(s): +${points}`,
    );
  }

  if (result.astScan.deprecatedImports.length > 0) {
    const points = Math.min(result.astScan.deprecatedImports.length * 3, 10);
    score += points;
    drivers.push(
      `${result.astScan.deprecatedImports.length} deprecated import group(s): +${points}`,
    );
  }

  if (result.astScan.reactPatterns.length > 0) {
    const points = Math.min(result.astScan.reactPatterns.length * 2, 8);
    score += points;
    drivers.push(
      `${result.astScan.reactPatterns.length} older React pattern group(s): +${points}`,
    );
  }

  if (result.nativeModuleGroups.length > 0) {
    const points = Math.min(result.nativeModuleGroups.length * 8, 25);
    score += points;
    drivers.push(
      `${result.nativeModuleGroups.length} custom native module group(s): +${points}`,
    );
  } else {
    drivers.push("No custom native module groups: +0");
  }

  if (result.nativeVersions.androidGradlePlugin) {
    const major = Number(
      result.nativeVersions.androidGradlePlugin.split(".")[0],
    );

    if (major < 7) {
      score += 7;
      drivers.push("Old Android Gradle Plugin: +7");
    }
  }

  if (result.nativeVersions.hasUseFrameworks) {
    score += 3;
    drivers.push("Podfile use_frameworks!: +3");
  }

  const finalScore = Math.min(score, 100);

  let classification: ComplexityScore["classification"] = "low";

  if (finalScore >= 85) classification = "extreme";
  else if (finalScore >= 65) classification = "high";
  else if (finalScore >= 45) classification = "significant";
  else if (finalScore >= 25) classification = "moderate";

  return {
    score: finalScore,
    classification,
    drivers,
  };
}

program
  .name("rn-rescue-audit")
  .description("React Native / Expo upgrade audit tool")
  .argument("<projectPath>", "Path to React Native project")
  .option("-o, --out <dir>", "Directory to write report.md and audit-result.json")
  .action(async (projectPath: string, options: { out?: string }) => {
    const absolutePath = path.resolve(projectPath);
    const outputDir = path.resolve(options.out ?? process.cwd());
    const packageJsonPath = path.join(absolutePath, "package.json");

    if (!(await fs.pathExists(packageJsonPath))) {
      console.error(chalk.red("package.json not found"));
      process.exit(1);
    }

    const packageJson = await fs.readJson(packageJsonPath);

    const dependencies = {
      ...(packageJson.dependencies ?? {}),
      ...(packageJson.devDependencies ?? {}),
    };

    const androidBuildGradlePath = path.join(
      absolutePath,
      "android",
      "build.gradle",
    );
    const androidGradleWrapperPath = path.join(
      absolutePath,
      "android",
      "gradle",
      "wrapper",
      "gradle-wrapper.properties",
    );
    const podfilePath = path.join(absolutePath, "ios", "Podfile");

    const reactNativeVersion = normalizeReactNativeVersionSpec(
      dependencies["react-native"],
    );
    const scripts = packageJson.scripts ?? {};
    const typecheckScript = detectTypecheckScript(scripts);
    const lockfiles = await detectLockfiles(absolutePath);

    const result = {
      projectName: packageJson.name ?? "unknown",
      reactNative: reactNativeVersion.displayVersion,
      reactNativeRaw: reactNativeVersion.rawVersion,
      reactNativeSemver: reactNativeVersion.semverVersion,
      packageManager: await detectPackageManager(absolutePath),
      lockfiles,
      hasMixedLockfiles: lockfiles.length > 1,
      expo: dependencies["expo"] ?? null,
      react: dependencies["react"] ?? null,
      typescript: dependencies["typescript"] ?? null,
      dependencyVersions: dependencies,

      hasIOS: await fs.pathExists(path.join(absolutePath, "ios")),
      hasAndroid: await fs.pathExists(path.join(absolutePath, "android")),
      workflow: "unknown" as Workflow,

      riskyDependencies: [] as {
        name: string;
        version: string;
        reason: string;
        category?: string;
        risk?: string;
        notes?: string[];
        suggestedAction?: string;
      }[],

      risks: [] as Risk[],
      riskLevel: "low" as RiskSeverity,

      upgradeRecommendation: getUpgradeRecommendation(
        dependencies["react-native"],
      ),

      hasPodfile: await fs.pathExists(podfilePath),
      hasSetupPermissions: false,
      setupPermissionsHandlers: [] as string[],
      setupPermissionsHandlersIdentified: false,
      setupPermissionsIsEmpty: false,
      podfileUsesLegacyReactNativePathConfig: false,
      androidUsesLegacyReactGradleApply: false,
      androidUsesLegacyReactNativeDependency: false,
      androidUsesProjectExtReact: false,
      androidUsesReactAndroidDependency: undefined as boolean | undefined,
      androidUsesFacebookReactPlugin: undefined as boolean | undefined,
      androidMainApplicationContent: null as string | null,
      androidUsesLegacySoLoaderInit: undefined as boolean | undefined,
      androidUsesOpenSourceMergedSoMapping: undefined as boolean | undefined,
      lockfilePackageVersions: {} as Record<string, string[]>,
      hasGradleBuild: await fs.pathExists(androidBuildGradlePath),
      hasAppGradleBuild: await fs.pathExists(
        path.join(absolutePath, "android", "app", "build.gradle"),
      ),
      hasMetroConfig: await fs.pathExists(
        path.join(absolutePath, "metro.config.js"),
      ),
      hasBabelConfig: await fs.pathExists(
        path.join(absolutePath, "babel.config.js"),
      ),
      hasEasConfig: await fs.pathExists(path.join(absolutePath, "eas.json")),
      hasAppConfig:
        (await fs.pathExists(path.join(absolutePath, "app.json"))) ||
        (await fs.pathExists(path.join(absolutePath, "app.config.js"))) ||
        (await fs.pathExists(path.join(absolutePath, "app.config.ts"))),

      nativeVersions: {
        androidGradlePlugin: null as string | null,
        gradle: null as string | null,
        hasUseFrameworks: false,
      },
      baselineReadiness: {
        status: "not-ready",
        summary: "Baseline readiness has not been calculated yet.",
        checks: [],
        blockers: [],
        warnings: [],
        requiredActions: [],
      } as BaselineReadiness,

      scripts,
      hasIOSScript: Boolean(packageJson.scripts?.ios),
      hasAndroidScript: Boolean(packageJson.scripts?.android),
      hasTestScript: Boolean(packageJson.scripts?.test),
      hasLintScript: Boolean(packageJson.scripts?.lint),
      hasTypecheckScript: typecheckScript.hasTypecheckScript,
      typecheckScriptName: typecheckScript.typecheckScriptName,
      typecheckScriptCommand: typecheckScript.typecheckScriptCommand,

      effortEstimate: {
        level: "unknown",
        range: "unknown",
        note: "Not estimated yet.",
      },
      upgradeTasks: [] as UpgradeTask[],
      deprecatedApiFindings: [] as Awaited<ReturnType<typeof scanSourceCode>>,
      astScan: {
        packageUsages: [],
        deprecatedImports: [],
        reactPatterns: [],
      } as ReturnType<typeof scanAst>,
      nativeModuleFindings: [] as Awaited<ReturnType<typeof scanNativeModules>>,
      nativeModuleGroups: [] as ReturnType<typeof groupNativeModuleFindings>,
      complexityScore: {
        score: 0,
        classification: "low",
        drivers: [],
      } as ComplexityScore,
      migrationAreas: [] as ReturnType<typeof buildMigrationAreas>,
      migrationAreaEvidence: [] as MigrationAreaEvidence[],
      barrelAnalysis: {
        hasLargeBarrels: false,
        largestBarrelExportCount: 0,
        barrelCount: 0,
        barrelFiles: [] as string[],
        barrelDetails: [] as { path: string; reexportCount: number }[],
      },
      knownMigrationPatterns: [] as MigrationPattern[],
      proposal: null as Proposal | null,
    };

    result.workflow = detectWorkflow(result);

    const androidBuildGradle = await readFileIfExists(androidBuildGradlePath);
    const androidAppBuildGradle = await readFileIfExists(
      path.join(absolutePath, "android", "app", "build.gradle"),
    );
    const gradleWrapper = await readFileIfExists(androidGradleWrapperPath);
    const podfile = await readFileIfExists(podfilePath);
    const yarnLock = await readFileIfExists(path.join(absolutePath, "yarn.lock"));

    // Read MainApplication.java or MainApplication.kt for SoLoader detection
    let mainApplicationContent: string | null = null;
    if (result.hasAndroid) {
      const javaDir = path.join(absolutePath, "android", "app", "src", "main", "java");
      try {
        const entries = await fs.readdir(javaDir, { recursive: true });
        const mainAppFile = (entries as string[]).find(
          (entry) =>
            entry.endsWith("/MainApplication.java") ||
            entry.endsWith("/MainApplication.kt"),
        );
        if (mainAppFile) {
          mainApplicationContent = await readFileIfExists(
            path.join(javaDir, mainAppFile),
          );
        }
      } catch {
        // Directory may not exist; leave mainApplicationContent as null
      }
    }
    result.androidMainApplicationContent = mainApplicationContent;
    result.androidUsesLegacySoLoaderInit = Boolean(
      mainApplicationContent?.match(
        /SoLoader\.init\s*\(\s*this\s*(?:,|\s*\))/
      ),
    );
    result.androidUsesOpenSourceMergedSoMapping = Boolean(
      mainApplicationContent?.includes("OpenSourceMergedSoMapping"),
    );
    const setupPermissionsInfo = getSetupPermissionsInfo(podfile);

    const gradleVersionMatch = gradleWrapper?.match(/gradle-([\d.]+)-/);

    result.nativeVersions = {
      androidGradlePlugin: await detectAndroidGradlePlugin(absolutePath),
      gradle: gradleVersionMatch?.[1] ?? null,
      hasUseFrameworks: podfileHasActiveUseFrameworks(podfile),
    };
    result.hasSetupPermissions = setupPermissionsInfo.hasSetupPermissions;
    result.setupPermissionsHandlers = setupPermissionsInfo.handlers;
    result.setupPermissionsHandlersIdentified =
      setupPermissionsInfo.handlersIdentified;
    result.setupPermissionsIsEmpty = setupPermissionsInfo.isEmpty;
    result.podfileUsesLegacyReactNativePathConfig =
      podfileUsesLegacyReactNativePathConfig(podfile);
    result.androidUsesLegacyReactGradleApply =
      androidUsesLegacyReactGradleApply(androidAppBuildGradle);
    result.androidUsesLegacyReactNativeDependency =
      androidUsesLegacyReactNativeDependency(androidAppBuildGradle);
    result.androidUsesProjectExtReact =
      androidUsesProjectExtReact(androidAppBuildGradle);
    result.androidUsesReactAndroidDependency =
      androidAppBuildGradle === null
        ? undefined
        : androidUsesReactAndroidDependency(androidAppBuildGradle);
    result.androidUsesFacebookReactPlugin =
      androidAppBuildGradle === null
        ? undefined
        : androidUsesFacebookReactPlugin(androidAppBuildGradle);
    result.lockfilePackageVersions = {
      "lru-cache": parseYarnLockPackageVersions(yarnLock, "lru-cache"),
    };

    if (result.expo && result.hasIOS && result.hasAndroid) {
      addRisk(
        result.risks,
        "expo",
        "high",
        "Expo with Native Folders",
        "Expo dependency exists together with ios/android folders. This may be a prebuild or bare workflow and needs native upgrade checks.",
      );
    }

    if (!result.expo && result.reactNative) {
      addRisk(
        result.risks,
        "react-native",
        "high",
        "Bare React Native Project",
        "Bare React Native projects have higher upgrade risk because iOS and Android native projects must be migrated too.",
      );
    }

    if (!result.reactNative && !result.expo) {
      addRisk(
        result.risks,
        "project",
        "critical",
        "React Native Not Detected",
        "Could not detect React Native or Expo dependency in package.json.",
      );
    }

    const rnVersion = cleanVersion(result.reactNativeRaw);

    if (rnVersion?.startsWith("0.63")) {
      addRisk(
        result.risks,
        "react-native",
        "critical",
        "Old React Native Version",
        "React Native 0.63.x is significantly behind modern releases and will likely require staged upgrades, dependency updates, and native iOS/Android changes.",
      );
    }

    if (result.react?.startsWith("16")) {
      addRisk(
        result.risks,
        "react-native",
        "high",
        "Old React Version",
        "React 16 detected. Modern React Native versions require newer React versions, so React upgrade risk exists.",
      );
    }

    if (result.typescript?.includes("4.2")) {
      addRisk(
        result.risks,
        "typescript",
        "medium",
        "Old TypeScript Version",
        "TypeScript 4.2 is old. TypeScript upgrade may reveal type errors during migration.",
      );
    }

    for (const [dependencyName, reason] of Object.entries(riskyDependencies)) {
      const installedVersion = dependencies[dependencyName];
      const packageRule = packageRules[dependencyName];

      if (installedVersion) {
        result.riskyDependencies.push({
          name: dependencyName,
          version: installedVersion,
          reason,
          category: packageRule?.category ?? "unknown",
          risk: packageRule?.risk ?? "medium",
          notes: packageRule?.notes ?? [],
          suggestedAction:
            packageRule?.suggestedAction ??
            "Review package compatibility with the target React Native version.",
        });
      }
    }

    if (result.riskyDependencies.length > 0) {
      addRisk(
        result.risks,
        "dependency",
        "high",
        "Risky Native Dependencies",
        `${result.riskyDependencies.length} risky native/dependency packages detected. Review compatibility before upgrading.`,
      );
    }

    if (!result.hasIOSScript) {
      addRisk(
        result.risks,
        "scripts",
        "medium",
        "Missing iOS Script",
        "No iOS script found in package.json. Build verification may require manual commands.",
      );
    }

    if (!result.hasAndroidScript) {
      addRisk(
        result.risks,
        "scripts",
        "medium",
        "Missing Android Script",
        "No Android script found in package.json. Build verification may require manual commands.",
      );
    }

    if (!result.hasTypecheckScript) {
      addRisk(
        result.risks,
        "typescript",
        "medium",
        "Missing Typecheck Script",
        "No typecheck script found. TypeScript migration issues may be harder to catch automatically.",
      );
    }

    if (result.hasMixedLockfiles) {
      addRisk(
        result.risks,
        "dependency",
        "medium",
        "Mixed package-manager lockfiles detected.",
        "Multiple lockfiles were found. This can make installs non-reproducible and should be resolved before migration.",
      );
    }

    if (result.nativeVersions.androidGradlePlugin) {
      const major = Number(
        result.nativeVersions.androidGradlePlugin.split(".")[0],
      );

      if (major < 7) {
        addRisk(
          result.risks,
          "android",
          "high",
          "Old Android Gradle Plugin",
          `Android Gradle Plugin ${result.nativeVersions.androidGradlePlugin} detected. Modern React Native upgrades may require Android Gradle Plugin 7+ or 8+.`,
        );
      }
    }

    if (result.nativeVersions.gradle) {
      const major = Number(result.nativeVersions.gradle.split(".")[0]);

      if (major < 7) {
        addRisk(
          result.risks,
          "android",
          "high",
          "Old Gradle Version",
          `Gradle ${result.nativeVersions.gradle} detected. Android build tooling is old and may need staged upgrades.`,
        );
      }
    }

    if (result.nativeVersions.hasUseFrameworks) {
      addRisk(
        result.risks,
        "ios",
        "medium",
        "Podfile Uses use_frameworks!",
        "Podfile uses use_frameworks!. This can increase iOS dependency compatibility risk during upgrades.",
      );
    }

    if (result.hasIOS && !result.hasPodfile) {
      addRisk(
        result.risks,
        "ios",
        "high",
        "Missing Podfile",
        "iOS folder exists but Podfile was not found. iOS build setup may be non-standard.",
      );
    }

    if (result.hasAndroid && !result.hasGradleBuild) {
      addRisk(
        result.risks,
        "android",
        "high",
        "Missing Android build.gradle",
        "Android folder exists but android/build.gradle was not found. Android build setup may be non-standard.",
      );
    }

    if (result.expo && !result.hasAppConfig) {
      addRisk(
        result.risks,
        "expo",
        "medium",
        "Missing App Config",
        "Expo dependency detected but no app.json/app.config file found.",
      );
    }

    if (
      packageJson.scripts?.["build:android:release"]?.trim().endsWith("gradlew")
    ) {
      addRisk(
        result.risks,
        "scripts",
        "medium",
        "Incomplete Android Release Script",
        "build:android:release script appears incomplete. It ends with './gradlew' without a task name.",
      );
    }

    if (packageJson.scripts?.format_all?.includes("node_modules_custom")) {
      addRisk(
        result.risks,
        "dependency",
        "medium",
        "Custom Dependency Folder",
        "Custom node_modules_custom folder detected in scripts. This may indicate patched or custom dependencies that need manual review.",
      );
    }

    if (
      packageJson.scripts?.["check-dependencies"]?.includes("rnx-align-deps")
    ) {
      addRisk(
        result.risks,
        "dependency",
        "low",
        "Dependency Alignment Script Found",
        "rnx-align-deps script detected. This is useful for dependency alignment and should be run during upgrade planning.",
      );
    }

    if (
      result.riskyDependencies.some(
        (dep) => dep.name === "react-native-reanimated",
      ) &&
      !result.hasBabelConfig
    ) {
      addRisk(
        result.risks,
        "dependency",
        "medium",
        "Reanimated Babel Config Check Needed",
        "react-native-reanimated detected but babel.config.js was not found. Reanimated setup should be checked manually.",
      );
    }

    result.riskLevel = getRiskLevel(result.risks);
    result.effortEstimate = estimateEffort(result.risks);
    result.complexityScore = calculateComplexityScore(result);

    result.upgradeTasks = generateUpgradeTasks(result);
    result.deprecatedApiFindings = await scanSourceCode(absolutePath);
    result.nativeModuleFindings = await scanNativeModules(absolutePath);
    result.nativeModuleGroups = groupNativeModuleFindings(
      result.nativeModuleFindings,
    );
    result.astScan = scanAst(absolutePath);
    result.barrelAnalysis = await scanBarrels(absolutePath);
    result.migrationAreas = buildMigrationAreas(
      result.astScan.packageUsages.map((usage) => usage.packageName),
      [
        ...Object.keys(dependencies),
        ...result.riskyDependencies.map((dependency) => dependency.name),
      ],
    );
    result.migrationAreaEvidence = buildMigrationAreaEvidence({
      migrationAreas: result.migrationAreas,
      astPackageUsages: result.astScan.packageUsages,
      dependencyPackageNames: [
        ...Object.keys(dependencies),
        ...result.riskyDependencies.map((dependency) => dependency.name),
      ],
      nativeModuleGroups: result.nativeModuleGroups,
    });

    if (result.astScan.deprecatedImports.length > 0) {
      addRisk(
        result.risks,
        "react-native",
        "high",
        "Deprecated imports from react-native detected",
        `${result.astScan.deprecatedImports.length} deprecated import group(s) detected from react-native through AST analysis.`,
      );
    }

    if (result.astScan.reactPatterns.length > 0) {
      addRisk(
        result.risks,
        "react-native",
        "medium",
        "Older React Patterns Detected",
        `${result.astScan.reactPatterns.length} older React pattern group(s) detected through AST analysis.`,
      );
    }
    if (result.nativeModuleGroups.length > 0) {
      addRisk(
        result.risks,
        "react-native",
        "high",
        "Custom Native Module Patterns Detected",
        `${result.nativeModuleGroups.length} custom native module group(s) detected in iOS/Android source files. These should be manually reviewed before migration.`,
      );
    }
    const migrationPlan = createMigrationPlan(result);
    const upgradeTasksSection = renderUpgradeTasks(result.upgradeTasks);
    const deprecatedApiSection = renderDeprecatedApiFindings(
      result.deprecatedApiFindings,
    );

    const astScanSection = renderAstScan(result.astScan);
    const nativeModuleSection = renderNativeModuleFindings(
      result.nativeModuleGroups,
    );
    const highRiskMigrationAreas = result.migrationAreas.filter(
      (area) => area.risk === "high",
    );

    if (highRiskMigrationAreas.length > 0) {
      addRisk(
        result.risks,
        "dependency",
        "high",
        "High-Risk Migration Areas Detected",
        `${highRiskMigrationAreas.length} high-risk migration area(s) detected: ${highRiskMigrationAreas
          .map((area) => area.area)
          .join(", ")}.`,
      );
    }

    result.riskLevel = getRiskLevel(result.risks);
    result.effortEstimate = estimateEffort(result.risks);
    result.complexityScore = calculateComplexityScore(result);
    result.baselineReadiness = generateBaselineReadiness(result);
    result.proposal = generateProposal(result);
    const executiveSummary = createExecutiveSummary(result);
    const topBlockers = getTopBlockers(result.risks);
    const migrationAreasSection = renderMigrationAreas(
      result.migrationAreas,
      result.migrationAreaEvidence,
    );
    const proposalSection = renderProposal(result.proposal);
    const baselineReadinessSection = renderBaselineReadiness(
      result.baselineReadiness,
    );
    result.knownMigrationPatterns = detectMigrationPatterns(result);
    const knownMigrationPatternsSection = renderMigrationPatternsMarkdown(
      result.knownMigrationPatterns,
    );
    const report = `# React Native Upgrade Audit Report
    

## Executive Summary

${executiveSummary}

## Project

- Overall risk level: ${result.riskLevel.toUpperCase()}
- Project: ${result.projectName}
- React Native: ${result.reactNative ?? "Not detected"}
- React: ${result.react ?? "Not detected"}
- Expo: ${result.expo ?? "Not detected"}
- TypeScript: ${result.typescript ?? "Not detected"}
- iOS folder: ${result.hasIOS ? "Yes" : "No"}
- Android folder: ${result.hasAndroid ? "Yes" : "No"}
- Package manager: ${result.packageManager}
- Lockfiles: ${result.lockfiles.length ? result.lockfiles.join(", ") : "None detected"}
- Mixed lockfiles: ${result.hasMixedLockfiles ? "Yes" : "No"}
- Workflow: ${result.workflow}

## Baseline Readiness

${baselineReadinessSection}

## Migration Complexity Score

- Score: ${result.complexityScore.score} / 100
- Classification: ${result.complexityScore.classification.toUpperCase()}

### Main Score Drivers

${
  result.complexityScore.drivers.length
    ? result.complexityScore.drivers.map((driver) => `- ${driver}`).join("\n")
    : "- No major complexity drivers detected."
}

## Top Upgrade Blockers

${
  topBlockers.length
    ? topBlockers
        .map(
          (blocker, index) => `### ${index + 1}. ${blocker.title}

- Severity: ${blocker.severity.toUpperCase()}
- Category: ${blocker.category}
- Details: ${blocker.description}`,
        )
        .join("\n\n")
    : "No critical or high-risk blockers detected."
}

## Risk Summary

${result.risks
  .map(
    (risk) =>
      `- **${risk.title}** (${risk.severity}, ${risk.category}): ${risk.description}`,
  )
  .join("\n")}

## Risky Dependencies

${
  result.riskyDependencies.length
    ? result.riskyDependencies
        .map(
          (dep) => `### ${dep.name}

- Current version: ${dep.version}
- Category: ${dep.category ?? "unknown"}
- Risk: ${(dep.risk ?? "medium").toUpperCase()}
- Why it matters: ${dep.reason}
- Suggested action: ${dep.suggestedAction ?? "Review compatibility manually."}
${
  dep.notes?.length
    ? `- Notes:\n${dep.notes.map((note) => `  - ${note}`).join("\n")}`
    : ""
}`,
        )
        .join("\n\n")
    : "No known risky dependencies detected."
}

${knownMigrationPatternsSection}

${renderRuntimeRiskIndicators(result)}

## Recommended Next Steps

1. Confirm current app builds successfully before upgrading.
2. Create a clean migration branch.
3. Upgrade React Native incrementally instead of jumping directly to the latest version.
4. Review native iOS and Android diffs carefully.
5. Upgrade risky native dependencies one by one.
6. Run iOS and Android builds after each major step.

## Upgrade Recommendation

- Strategy: ${result.upgradeRecommendation.strategy}
- Suggested path: ${result.upgradeRecommendation.target}
- Note: ${result.upgradeRecommendation.note}

${migrationPlan}

## Potential Legacy API References

${deprecatedApiSection}

## Migration Areas

${migrationAreasSection}

## Source Code Findings

### Deprecated imports from react-native detected

${
  result.astScan.deprecatedImports.length
    ? result.astScan.deprecatedImports
        .map(
          (item) => `- **${item.importName}** imported from react-native in ${
            item.count
          } file(s). Suggested replacement: **${item.replacement}**.
${item.files.map((file) => `  - ${file}`).join("\n")}`,
        )
        .join("\n")
    : "No deprecated imports from react-native detected."
}

### React Code Patterns

${
  result.astScan.reactPatterns.length
    ? result.astScan.reactPatterns
        .map(
          (pattern) =>
            `- **${pattern.pattern}** found in ${pattern.count} file(s).`,
        )
        .join("\n")
    : "No older React patterns detected."
}

## Native / Config Files

- Podfile: ${result.hasPodfile ? "Yes" : "No"}
- Android root build.gradle: ${result.hasGradleBuild ? "Yes" : "No"}
- Android app build.gradle: ${result.hasAppGradleBuild ? "Yes" : "No"}
- Metro config: ${result.hasMetroConfig ? "Yes" : "No"}
- Babel config: ${result.hasBabelConfig ? "Yes" : "No"}
- EAS config: ${result.hasEasConfig ? "Yes" : "No"}
- App config: ${result.hasAppConfig ? "Yes" : "No"}

## Native Module Findings

${nativeModuleSection}

## Upgrade Tasks
${upgradeTasksSection}
## Native Build Tooling

- Android Gradle Plugin: ${formatAndroidGradlePluginVersion(result.nativeVersions.androidGradlePlugin)}
- Gradle: ${result.nativeVersions.gradle ?? "Not detected"}
- Podfile use_frameworks!: ${result.nativeVersions.hasUseFrameworks ? "Yes" : "No"}

## Project Scripts

- iOS script: ${result.hasIOSScript ? "Yes" : "No"}
- Android script: ${result.hasAndroidScript ? "Yes" : "No"}
- Test script: ${result.hasTestScript ? "Yes" : "No"}
- Lint script: ${result.hasLintScript ? "Yes" : "No"}
- Typecheck script: ${result.hasTypecheckScript ? `Yes (\`${result.typecheckScriptName ?? "unknown"}\`)` : "No"}

## Effort Estimate

- Level: ${result.effortEstimate.level}
- Range: ${result.effortEstimate.range}
- Note: ${result.effortEstimate.note}

${proposalSection}
`;

    await fs.ensureDir(outputDir);

    const reportPath = path.join(outputDir, "report.md");
    await fs.writeFile(reportPath, report);

    const jsonPath = path.join(outputDir, "audit-result.json");
    await fs.writeJson(jsonPath, result, {
      spaces: 2,
    });

    const migrationPlanPath = path.join(outputDir, "migration-plan.md");
    await fs.writeFile(migrationPlanPath, generateMigrationPlan(result));

    const migrationTasksPath = path.join(outputDir, "migration-tasks.md");
    await fs.writeFile(migrationTasksPath, generateMigrationTasks(result));

    const upgradeExecutionPlanPath = path.join(outputDir, "upgrade-execution-plan.md");
    await fs.writeFile(
      upgradeExecutionPlanPath,
      generateUpgradeExecutionPlan(result),
    );

    console.log(chalk.blue(`\nReport generated: ${reportPath}`));
    console.log(chalk.blue(`JSON generated: ${jsonPath}`));
    console.log(chalk.blue(`Migration plan generated: ${migrationPlanPath}`));
    console.log(chalk.blue(`Migration tasks generated: ${migrationTasksPath}`));
    console.log(
      chalk.blue(`Upgrade execution plan generated: ${upgradeExecutionPlanPath}`),
    );

    console.log(chalk.green("\nReact Native Audit Result\n"));
    console.log(JSON.stringify(result, null, 2));
  });

program.parse();
