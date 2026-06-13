import type { RiskyDependency } from "./Risk";
import type { MigrationArea } from "./MigrationArea";

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

export type MigrationPatternAuditFacts = {
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
  riskyDependencies?: Pick<RiskyDependency, "name" | "version">[];
  deprecatedApiFindings?: { api: string }[];
  astScan?: {
    packageUsages?: { packageName: string }[];
  };
  migrationAreas?: Pick<MigrationArea, "area" | "packages">[];
  nativeVersions?: {
    androidGradlePlugin?: string | null;
    gradle?: string | null;
  };
  barrelAnalysis?: {
    hasLargeBarrels: boolean;
    largestBarrelExportCount: number;
    barrelCount: number;
    barrelFiles: string[];
    barrelDetails: { path: string; reexportCount: number }[];
  };
  androidMainApplicationContent?: string | null;
  androidUsesLegacySoLoaderInit?: boolean;
  androidUsesOpenSourceMergedSoMapping?: boolean;
  patchFiles?: string[];
};
