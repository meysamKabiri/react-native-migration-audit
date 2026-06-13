export type RiskCategory =
  | "react-native"
  | "android"
  | "ios"
  | "dependency"
  | "scripts"
  | "typescript"
  | "expo"
  | "project";

export type RiskSeverity = "critical" | "high" | "medium" | "low";

export type Risk = {
  category: RiskCategory;
  severity: RiskSeverity;
  title: string;
  description: string;
};

export type RiskyDependency = {
  name: string;
  version: string;
  reason: string;
  category?: string;
  risk?: string;
  notes?: string[];
  suggestedAction?: string;
};
