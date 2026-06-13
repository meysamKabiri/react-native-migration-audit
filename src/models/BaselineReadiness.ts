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
