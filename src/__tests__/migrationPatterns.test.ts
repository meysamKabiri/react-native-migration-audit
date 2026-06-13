import assert from "node:assert/strict";
import { detectMigrationPatterns } from "../knowledge/migrationPatterns";
import {
  MUST_FIX,
  PLAN_LATER,
  VALIDATE_DURING_MIGRATION,
} from "../models/ActionPriority";
import type {
  MigrationPattern,
  MigrationPatternAuditFacts,
} from "../models/MigrationPattern";

type PatternId =
  | "PATTERN-002"
  | "PATTERN-008"
  | "PATTERN-014"
  | "PATTERN-019"
  | "PATTERN-020"
  | "PATTERN-022";

type TestCase = {
  name: string;
  run: () => void;
};

const tests: TestCase[] = [];

function test(name: string, run: () => void) {
  tests.push({ name, run });
}

function facts(overrides: MigrationPatternAuditFacts = {}): MigrationPatternAuditFacts {
  return {
    reactNative: "0.76.9",
    reactNativeSemver: "0.76.9",
    dependencyVersions: {},
    riskyDependencies: [],
    deprecatedApiFindings: [],
    astScan: { packageUsages: [] },
    migrationAreas: [],
    nativeVersions: {},
    ...overrides,
  };
}

function findPattern(
  result: MigrationPatternAuditFacts,
  id: PatternId,
): MigrationPattern | undefined {
  return detectMigrationPatterns(result).find((pattern) => pattern.id === id);
}

function expectPattern(
  result: MigrationPatternAuditFacts,
  id: PatternId,
): MigrationPattern {
  const pattern = findPattern(result, id);
  assert.ok(pattern, `${id} should match`);
  return pattern;
}

function expectNoPattern(result: MigrationPatternAuditFacts, id: PatternId) {
  assert.equal(findPattern(result, id), undefined, `${id} should not match`);
}

function expectSignal(pattern: MigrationPattern, expectedText: string) {
  assert.ok(
    pattern.detectedSignals?.some((signal) => signal.includes(expectedText)),
    `${pattern.id} should include detected signal containing: ${expectedText}`,
  );
}

test("PATTERN-002 matches mixed React Navigation major families", () => {
  const pattern = expectPattern(
    facts({
      dependencyVersions: {
        "@react-navigation/native": "5.9.8",
        "@react-navigation/stack": "6.3.20",
        "react-native-gesture-handler": "1.10.3",
      },
    }),
    "PATTERN-002",
  );

  assert.equal(pattern.confidence, "high");
  assert.equal(pattern.actionPriority, VALIDATE_DURING_MIGRATION);
  expectSignal(pattern, "Mixed @react-navigation major families");
});

test("PATTERN-002 does not match compatible navigation package family", () => {
  expectNoPattern(
    facts({
      dependencyVersions: {
        "@react-navigation/native": "5.9.8",
        "@react-navigation/stack": "5.14.9",
        "react-native-gesture-handler": "1.10.3",
      },
    }),
    "PATTERN-002",
  );
});

test("PATTERN-008 matches missing iOS permission handler setup", () => {
  const pattern = expectPattern(
    facts({
      hasIOS: true,
      hasPodfile: true,
      hasSetupPermissions: false,
      dependencyVersions: {
        "react-native-permissions": "3.8.0",
      },
    }),
    "PATTERN-008",
  );

  assert.equal(pattern.confidence, "high");
  assert.equal(pattern.actionPriority, MUST_FIX);
  expectSignal(pattern, "react-native-permissions dependency is installed");
  expectSignal(pattern, "Podfile lacks setup_permissions");
});

test("PATTERN-008 does not match permissions dependency without iOS", () => {
  expectNoPattern(
    facts({
      hasIOS: false,
      dependencyVersions: {
        "react-native-permissions": "3.8.0",
      },
    }),
    "PATTERN-008",
  );
});

test("PATTERN-014 matches older native Android library under modern RN context", () => {
  const pattern = expectPattern(
    facts({
      hasAndroid: true,
      dependencyVersions: {
        "react-native-video": "5.2.1",
      },
      nativeVersions: {
        androidGradlePlugin: "8.6.0",
      },
    }),
    "PATTERN-014",
  );

  assert.equal(pattern.confidence, "medium");
  assert.equal(pattern.actionPriority, MUST_FIX);
  expectSignal(pattern, "Android project is present");
  expectSignal(pattern, "Older native Android libraries detected");
});

test("PATTERN-014 does not match when old native package evidence is absent", () => {
  expectNoPattern(
    facts({
      hasAndroid: true,
      dependencyVersions: {
        "react-native-video": "6.19.2",
      },
      nativeVersions: {
        androidGradlePlugin: "8.6.0",
      },
    }),
    "PATTERN-014",
  );
});

test("PATTERN-019 matches large barrel analysis and reports signals", () => {
  const pattern = expectPattern(
    facts({
      hasMetroConfig: true,
      migrationAreas: [
        { area: "Navigation", packages: [] },
        { area: "Camera", packages: [] },
        { area: "Media", packages: [] },
      ],
      barrelAnalysis: {
        hasLargeBarrels: true,
        barrelCount: 2,
        largestBarrelExportCount: 12,
        barrelFiles: ["src/components/index.ts"],
        barrelDetails: [{ path: "src/components/index.ts", reexportCount: 12 }],
      },
    }),
    "PATTERN-019",
  );

  assert.equal(pattern.confidence, "medium");
  assert.equal(pattern.actionPriority, PLAN_LATER);
  expectSignal(pattern, "2 barrel file(s)");
  expectSignal(pattern, "Large barrel files found");
  expectSignal(pattern, "Confirmed circular dependency chains are not currently produced");
});

test("PATTERN-019 reports low confidence for large barrel only", () => {
  const pattern = expectPattern(
    facts({
      barrelAnalysis: {
        hasLargeBarrels: true,
        barrelCount: 1,
        largestBarrelExportCount: 15,
        barrelFiles: ["src/components/index.ts"],
        barrelDetails: [{ path: "src/components/index.ts", reexportCount: 15 }],
      },
    }),
    "PATTERN-019",
  );

  assert.equal(pattern.confidence, "low");
});

test("PATTERN-019 does not match when large barrels are absent", () => {
  expectNoPattern(
    facts({
      barrelAnalysis: {
        hasLargeBarrels: false,
        barrelCount: 1,
        largestBarrelExportCount: 2,
        barrelFiles: ["src/index.ts"],
        barrelDetails: [{ path: "src/index.ts", reexportCount: 2 }],
      },
    }),
    "PATTERN-019",
  );
});

test("PATTERN-020 matches legacy SoLoader init without merged mapping", () => {
  const pattern = expectPattern(
    facts({
      hasAndroid: true,
      androidMainApplicationContent: "SoLoader.init(this, false);",
      androidUsesLegacySoLoaderInit: true,
      androidUsesOpenSourceMergedSoMapping: false,
    }),
    "PATTERN-020",
  );

  assert.equal(pattern.confidence, "high");
  assert.equal(pattern.actionPriority, MUST_FIX);
  expectSignal(pattern, "Legacy SoLoader.init");
  expectSignal(pattern, "OpenSourceMergedSoMapping is not referenced");
});

test("PATTERN-020 does not match when OpenSourceMergedSoMapping is present", () => {
  expectNoPattern(
    facts({
      hasAndroid: true,
      androidMainApplicationContent: "SoLoader.init(this, OpenSourceMergedSoMapping.INSTANCE);",
      androidUsesLegacySoLoaderInit: true,
      androidUsesOpenSourceMergedSoMapping: true,
    }),
    "PATTERN-020",
  );
});

test("PATTERN-022 matches prerelease react-native-video and reports signals", () => {
  const pattern = expectPattern(
    facts({
      hasAndroid: true,
      hasIOS: true,
      dependencyVersions: {
        "react-native-video": "5.2.0-alpha1",
      },
    }),
    "PATTERN-022",
  );

  assert.equal(pattern.confidence, "high");
  assert.equal(pattern.actionPriority, VALIDATE_DURING_MIGRATION);
  expectSignal(pattern, "react-native-video version: 5.2.0-alpha1");
  expectSignal(pattern, "alpha release detected");
});

test("PATTERN-022 does not match stable react-native-video 6.x", () => {
  expectNoPattern(
    facts({
      dependencyVersions: {
        "react-native-video": "6.19.2",
      },
    }),
    "PATTERN-022",
  );
});

let failures = 0;

for (const { name, run } of tests) {
  try {
    run();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}`);
    console.error(error);
  }
}

if (failures > 0) {
  console.error(`${failures} test(s) failed.`);
  process.exit(1);
}

console.log(`${tests.length} migration pattern test(s) passed.`);
