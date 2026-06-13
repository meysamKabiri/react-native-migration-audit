import type { Risk, RiskSeverity } from "../models/Risk";
import type { MigrationArea } from "../models/MigrationArea";
import type {
  AuditProposal,
  ComplexityScore,
  NativeVersions,
} from "../models/AuditResult";

export type Proposal = AuditProposal;

type AuditResultForProposal = {
  workflow: string;
  expo: string | null;
  hasAndroid: boolean;
  hasIOS: boolean;
  nativeVersions: NativeVersions;
  complexityScore: Pick<ComplexityScore, "score" | "classification">;
  effortEstimate: {
    level: string;
    range: string;
  };
  migrationAreas: Pick<MigrationArea, "area" | "risk">[];
  nativeModuleGroups: unknown[];
  riskLevel: RiskSeverity;
  risks: Risk[];
};

function getTopBlockers(risks: Risk[]) {
  return risks
    .filter((risk) => risk.severity === "critical" || risk.severity === "high")
    .slice(0, 3);
}

function hasManyMigrationAreas(result: AuditResultForProposal) {
  return result.migrationAreas.length >= 2;
}

function hasMultipleHighRiskMigrationAreas(result: AuditResultForProposal) {
  return result.migrationAreas.filter((area) => area.risk === "high").length >= 2;
}

function hasSmallOrMediumEffort(result: AuditResultForProposal) {
  return (
    result.effortEstimate.level === "small" ||
    result.effortEstimate.level === "medium"
  );
}

function getRecommendedService(result: AuditResultForProposal) {
  if (result.nativeModuleGroups.length > 0) {
    return "Manual Review Required" as const;
  }

  if (
    result.complexityScore.classification === "low" &&
    hasSmallOrMediumEffort(result)
  ) {
    return "Upgrade Audit" as const;
  }

  if (
    result.complexityScore.classification === "moderate" &&
    hasSmallOrMediumEffort(result) &&
    !hasMultipleHighRiskMigrationAreas(result)
  ) {
    return "Upgrade Audit" as const;
  }

  if (
    result.complexityScore.classification === "significant" ||
    result.complexityScore.classification === "high" ||
    result.complexityScore.classification === "extreme" ||
    hasMultipleHighRiskMigrationAreas(result) ||
    result.effortEstimate.level === "large" ||
    result.effortEstimate.level === "medium-large"
  ) {
    return "Upgrade Sprint" as const;
  }

  return result.workflow === "bare-react-native"
    ? ("Upgrade Sprint" as const)
    : ("Upgrade Audit" as const);
}

function getPriceRange(result: AuditResultForProposal) {
  const recommendedService = getRecommendedService(result);

  if (recommendedService === "Manual Review Required") {
    return "Custom quote after technical review";
  }

  if (recommendedService === "Upgrade Audit") {
    return result.complexityScore.classification === "moderate"
      ? "$149-$299 estimated range"
      : "$99-$199 estimated range";
  }

  if (
    result.complexityScore.classification === "extreme" ||
    result.effortEstimate.level === "large"
  ) {
    return "$2,500-$5,000 estimated range";
  }

  return "$1,500-$3,500 estimated range";
}

function getIncludedScope(result: AuditResultForProposal) {
  const scope = new Set<string>();

  if (result.expo) {
    scope.add("Expo SDK upgrade planning and compatibility review.");
  } else {
    scope.add("React Native version upgrade planning.");
  }

  if (result.hasAndroid || result.nativeVersions.androidGradlePlugin) {
    scope.add("Android build tooling updates related to the migration.");
  }

  if (result.hasIOS || result.nativeVersions.hasUseFrameworks) {
    scope.add("iOS dependency and CocoaPods update review related to the migration.");
  }

  for (const area of result.migrationAreas) {
    if (area.area === "Navigation") {
      scope.add("Navigation flow and gesture verification.");
    } else if (area.area === "Camera") {
      scope.add("Camera package compatibility and runtime verification.");
    } else if (area.area === "Authentication SDKs") {
      scope.add("Authentication SDK configuration and callback verification.");
    } else if (area.area === "Bluetooth") {
      scope.add("Bluetooth permission and native integration verification.");
    } else if (area.area === "Media") {
      scope.add("Media playback package verification.");
    } else if (area.area === "Permissions") {
      scope.add("Android and iOS permission configuration verification.");
    } else if (area.area === "Storage") {
      scope.add("Storage and persistence behavior verification.");
    } else if (area.area === "UI / Native Visual Components") {
      scope.add("Native UI component smoke testing after upgrade changes.");
    }
  }

  if (result.nativeModuleGroups.length > 0) {
    scope.add("Technical review of custom native module or bridge findings.");
  }

  scope.add("Summary of completed review, recommended path, and remaining migration risks.");

  return [...scope];
}

export function generateProposal(result: AuditResultForProposal): Proposal {
  const topBlockers = getTopBlockers(result.risks);
  const hasCustomNativeModules = result.nativeModuleGroups.length > 0;
  const recommendedService = getRecommendedService(result);
  const priceRange = getPriceRange(result);
  const includedScope = getIncludedScope(result);

  const rationale = [
    `Complexity is estimated as ${result.complexityScore.classification.toUpperCase()} (${result.complexityScore.score}/100).`,
    `Overall audit risk is ${result.riskLevel.toUpperCase()}.`,
  ];

  if (topBlockers.length > 0) {
    rationale.push(
      `Main blockers to review: ${topBlockers
        .map((blocker) => blocker.title)
        .join(", ")}.`,
    );
  }

  if (result.migrationAreas.length > 0) {
    rationale.push(
      `${result.migrationAreas.length} migration-sensitive area(s) were detected.`,
    );
  }

  if (hasManyMigrationAreas(result) && !hasCustomNativeModules) {
    rationale.push(
      "This project may also be a good candidate for a monthly maintenance plan after the initial migration is completed.",
    );
  }

  if (recommendedService === "Manual Review Required") {
    if (hasCustomNativeModules) {
      rationale.push(
        "Custom native module or bridge patterns were detected, so the migration needs technical review before a fixed scope is agreed.",
      );
    }

    return {
      recommendedService,
      priceRange,
      effortRange: "Technical review required before estimate",
      rationale,
      includedScope,
      outOfScope: [
        "New feature development.",
        "UI redesign.",
        "Backend changes.",
        "Product enhancements unrelated to migration.",
        "Guaranteed migration success or fixed delivery dates.",
      ],
      recommendedNextStep:
        "Perform a technical discovery session before estimating migration work.",
    };
  }

  if (recommendedService === "Upgrade Sprint") {
    return {
      recommendedService,
      priceRange,
      effortRange: result.effortEstimate.range,
      rationale,
      includedScope,
      outOfScope: [
        "New feature development.",
        "UI redesign.",
        "Backend changes.",
        "Product enhancements unrelated to migration.",
        "Guaranteed migration success or fixed delivery dates.",
      ],
      recommendedNextStep:
        "Schedule a migration sprint and create a staged upgrade plan before implementation.",
    };
  }

  return {
    recommendedService,
    priceRange,
    effortRange: result.effortEstimate.range,
    rationale,
    includedScope,
    outOfScope: [
      "New feature development.",
      "UI redesign.",
      "Backend changes.",
      "Product enhancements unrelated to migration.",
      "Guaranteed migration success or fixed delivery dates.",
    ],
    recommendedNextStep: "Schedule a migration audit and repository review.",
  };
}
