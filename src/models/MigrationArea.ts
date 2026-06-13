export type MigrationAreaRisk = "high" | "medium" | "low";

export type MigrationArea = {
  area: string;
  risk: MigrationAreaRisk;
  packages: string[];
  reason: string;
  suggestedAction: string;
};

export type MigrationAreaEvidenceSource =
  | "ast"
  | "dependency"
  | "native-module"
  | "mixed";

export type MigrationAreaEvidence = {
  area: string;
  source: MigrationAreaEvidenceSource;
  evidence: string[];
};
