export const MUST_FIX = "MUST_FIX";
export const VALIDATE_DURING_MIGRATION = "VALIDATE_DURING_MIGRATION";
export const PLAN_LATER = "PLAN_LATER";
export const INFORMATIONAL = "INFORMATIONAL";

export type ActionPriority =
  | typeof MUST_FIX
  | typeof VALIDATE_DURING_MIGRATION
  | typeof PLAN_LATER
  | typeof INFORMATIONAL;
