import type { BaselineReadiness } from "./BaselineReadiness";
import type { MigrationArea, MigrationAreaEvidence } from "./MigrationArea";
import type { MigrationPattern } from "./MigrationPattern";
import type { Risk, RiskSeverity, RiskyDependency } from "./Risk";
import type { NativeModuleFinding, NativeModuleGroup } from "../scanners/nativeModuleScanner";

export const AUDIT_SCHEMA_VERSION = "1.0.0";

export type Workflow =
  | "expo-managed"
  | "expo-bare-or-prebuild"
  | "bare-react-native"
  | "unknown";

export type UpgradeTask = {
  id: string;
  priority: "high" | "medium" | "low";
  area: string;
  title: string;
  description: string;
};

export type ComplexityScore = {
  score: number;
  classification: "low" | "moderate" | "significant" | "high" | "extreme";
  drivers: string[];
};

export type UpgradeRecommendation = {
  strategy: string;
  target: string;
  note: string;
};

export type NativeVersions = {
  androidGradlePlugin: string | null;
  gradle: string | null;
  hasUseFrameworks: boolean;
};

export type AuditProposal = {
  recommendedService:
    | "Upgrade Audit"
    | "Upgrade Sprint"
    | "Maintenance Plan"
    | "Manual Review Required";
  priceRange: string;
  effortRange: string;
  rationale: string[];
  includedScope: string[];
  outOfScope: string[];
  recommendedNextStep: string;
};

export type AuditResult = {
  schemaVersion: typeof AUDIT_SCHEMA_VERSION;
  projectName: string;
  reactNative: string | null;
  reactNativeRaw?: string | null;
  reactNativeSemver?: string | null;
  packageManager: string;
  lockfiles: string[];
  hasMixedLockfiles: boolean;
  expo: string | null;
  react: string | null;
  typescript: string | null;
  dependencyVersions: Record<string, string>;
  hasIOS: boolean;
  hasAndroid: boolean;
  workflow: Workflow;
  risks: Risk[];
  riskLevel: RiskSeverity;
  upgradeRecommendation: UpgradeRecommendation;
  riskyDependencies: RiskyDependency[];
  nativeModuleFindings: NativeModuleFinding[];
  nativeModuleGroups: NativeModuleGroup[];
  complexityScore: ComplexityScore;
  migrationAreas: MigrationArea[];
  migrationAreaEvidence: MigrationAreaEvidence[];
  baselineReadiness: BaselineReadiness;
  knownMigrationPatterns: MigrationPattern[];
  proposal: AuditProposal;
  upgradeTasks: UpgradeTask[];
};
