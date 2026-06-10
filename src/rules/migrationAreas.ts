import {
  isBluetoothPackage,
  packageHasToken,
  packageHasTokenSequence,
} from "./packageCategories";

export type MigrationArea = {
  area: string;
  risk: "high" | "medium" | "low";
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

type PackageUsageLike = {
  packageName: string;
  files?: string[];
};

type NativeModuleGroupLike = {
  name: string;
  platforms: string[];
  files: string[];
};

const areaRules = [
  {
    area: "Navigation",
    risk: "medium" as const,
    match: ["navigation", "gesture-handler", "screens"],
    reason:
      "Navigation stacks can be sensitive to React Native, gesture-handler, and screen behavior changes.",
    suggestedAction:
      "Verify navigation flows, modals, gestures, tabs, and stack transitions after each upgrade stage.",
  },
  {
    area: "Camera",
    risk: "high" as const,
    match: ["camera"],
    reason:
      "Camera packages usually require native Android/iOS configuration and can break during major RN upgrades.",
    suggestedAction:
      "Review camera package maintenance status, native setup, permissions, and runtime behavior on both platforms.",
  },
  {
    area: "Bluetooth",
    risk: "high" as const,
    match: ["bluetooth"],
    reason:
      "Bluetooth integrations usually depend on native permissions, Android/iOS APIs, and device-specific behavior.",
    suggestedAction:
      "Verify Bluetooth permissions, pairing/scanning behavior, background behavior, and native package compatibility.",
  },
  {
    area: "Authentication SDKs",
    risk: "medium" as const,
    match: ["signin", "login", "fbsdk", "firebase", "kakao"],
    reason:
      "Authentication SDKs often depend on native platform configuration, URL schemes, Gradle setup, and app credentials.",
    suggestedAction:
      "Verify native SDK setup, URL schemes, app credentials, Android/iOS configuration, and login callbacks.",
  },
  {
    area: "Media",
    risk: "medium" as const,
    match: ["video", "sound", "media"],
    reason:
      "Media packages often include native playback, audio session, or platform-specific behavior.",
    suggestedAction:
      "Test video/audio playback, permissions, background behavior, and native configuration after upgrade.",
  },
  {
    area: "Permissions",
    risk: "medium" as const,
    match: ["permission"],
    reason:
      "Permission packages require AndroidManifest, Info.plist, and runtime permission behavior checks.",
    suggestedAction:
      "Verify AndroidManifest, Info.plist, permission prompts, and runtime behavior after upgrade.",
  },
  {
    area: "Storage",
    risk: "low" as const,
    match: ["async-storage", "mmkv", "realm"],
    reason:
      "Storage packages can affect persistence behavior and may include native dependencies.",
    suggestedAction:
      "Verify stored data migration, persistence behavior, and native package compatibility.",
  },
  {
    area: "UI / Native Visual Components",
    risk: "medium" as const,
    match: [
      "linear-gradient",
      "radial-gradient",
      "picker",
      "calendar",
      "chart",
      "icons",
      "icomoon",
      "webview",
      "view-shot",
    ],
    reason:
      "UI packages with native components may require compatibility checks after React Native upgrades.",
    suggestedAction:
      "Run visual smoke tests on screens using native UI components after each upgrade stage.",
  },
];

function matchesAreaRule(packageName: string, rule: (typeof areaRules)[number]) {
  if (rule.area === "Bluetooth") return isBluetoothPackage(packageName);

  if (rule.area === "Navigation") {
    return (
      packageName.toLowerCase() === "react-navigation" ||
      packageHasToken(packageName, ["navigation", "navigator", "screens"]) ||
      packageHasTokenSequence(packageName, ["gesture", "handler"])
    );
  }

  if (rule.area === "Storage") {
    return (
      packageHasToken(packageName, ["mmkv", "realm"]) ||
      packageHasTokenSequence(packageName, ["async", "storage"])
    );
  }

  if (rule.area === "Permissions") {
    return packageHasToken(packageName, ["permission", "permissions"]);
  }

  if (rule.area === "Camera") {
    return packageHasToken(packageName, ["camera", "cameraroll"]);
  }

  if (rule.area === "Authentication SDKs") {
    return packageHasToken(packageName, ["signin", "login", "fbsdk", "firebase", "kakao"]);
  }

  if (rule.area === "Media") {
    return packageHasToken(packageName, ["video", "sound", "media", "audio"]);
  }

  if (rule.area === "UI / Native Visual Components") {
    return (
      packageHasToken(packageName, [
        "picker",
        "calendar",
        "chart",
        "icons",
        "icomoon",
        "webview",
      ]) ||
      packageHasTokenSequence(packageName, ["linear", "gradient"]) ||
      packageHasTokenSequence(packageName, ["radial", "gradient"]) ||
      packageHasTokenSequence(packageName, ["view", "shot"])
    );
  }

  return rule.match.some((keyword) => packageHasToken(packageName, [keyword]));
}

function buildAreasFromPackages(packageNames: string[]): MigrationArea[] {
  const areas: MigrationArea[] = [];

  for (const rule of areaRules) {
    const matchedPackages = packageNames.filter((packageName) =>
      matchesAreaRule(packageName, rule),
    );

    if (matchedPackages.length > 0) {
      areas.push({
        area: rule.area,
        risk: rule.risk,
        packages: [...new Set(matchedPackages)].sort(),
        reason: rule.reason,
        suggestedAction: rule.suggestedAction,
      });
    }
  }

  return areas.sort((a, b) => {
    const weight = { high: 3, medium: 2, low: 1 };
    return weight[b.risk] - weight[a.risk];
  });
}

function getEvidenceSource(sources: Set<Exclude<MigrationAreaEvidenceSource, "mixed">>) {
  if (sources.size > 1) return "mixed";
  return [...sources][0] ?? "dependency";
}

function appendEvidence(
  evidence: Map<string, { sources: Set<Exclude<MigrationAreaEvidenceSource, "mixed">>; evidence: Set<string> }>,
  area: string,
  source: Exclude<MigrationAreaEvidenceSource, "mixed">,
  item: string,
) {
  if (!evidence.has(area)) {
    evidence.set(area, {
      sources: new Set(),
      evidence: new Set(),
    });
  }

  const areaEvidence = evidence.get(area)!;
  areaEvidence.sources.add(source);
  areaEvidence.evidence.add(item);
}

function addPackageEvidence(
  evidence: Map<string, { sources: Set<Exclude<MigrationAreaEvidenceSource, "mixed">>; evidence: Set<string> }>,
  packageName: string,
  source: "ast" | "dependency",
  detail: string,
) {
  for (const rule of areaRules) {
    if (matchesAreaRule(packageName, rule)) {
      appendEvidence(evidence, rule.area, source, detail);
    }
  }
}

function addNativeModuleEvidence(
  evidence: Map<string, { sources: Set<Exclude<MigrationAreaEvidenceSource, "mixed">>; evidence: Set<string> }>,
  group: NativeModuleGroupLike,
) {
  for (const rule of areaRules) {
    if (matchesAreaRule(group.name, rule)) {
      appendEvidence(
        evidence,
        rule.area,
        "native-module",
        `${group.name} native module group (${group.platforms.join(", ")})`,
      );
    }
  }
}

export function buildMigrationAreaEvidence(input: {
  migrationAreas: MigrationArea[];
  astPackageUsages: PackageUsageLike[];
  dependencyPackageNames: string[];
  nativeModuleGroups: NativeModuleGroupLike[];
}): MigrationAreaEvidence[] {
  const evidence = new Map<
    string,
    { sources: Set<Exclude<MigrationAreaEvidenceSource, "mixed">>; evidence: Set<string> }
  >();

  for (const usage of input.astPackageUsages) {
    const files = usage.files?.length
      ? ` used in ${usage.files.slice(0, 3).join(", ")}${usage.files.length > 3 ? ` and ${usage.files.length - 3} more file(s)` : ""}`
      : " import";
    addPackageEvidence(evidence, usage.packageName, "ast", `${usage.packageName}${files}`);
  }

  const astPackageNames = new Set(
    input.astPackageUsages.map((usage) => usage.packageName),
  );

  for (const packageName of input.dependencyPackageNames) {
    if (astPackageNames.has(packageName)) continue;
    addPackageEvidence(evidence, packageName, "dependency", `${packageName} dependency`);
  }

  for (const group of input.nativeModuleGroups) {
    addNativeModuleEvidence(evidence, group);
  }

  return input.migrationAreas.map((area) => {
    const areaEvidence = evidence.get(area.area);
    const packageFallback = area.packages.map((packageName) => `${packageName} package match`);

    return {
      area: area.area,
      source: areaEvidence ? getEvidenceSource(areaEvidence.sources) : "dependency",
      evidence: areaEvidence
        ? [...areaEvidence.evidence].sort()
        : packageFallback.length
          ? packageFallback
          : ["Migration area matched by package classification."],
    };
  });
}

export function buildMigrationAreas(
  packageNames: string[],
  fallbackPackageNames: string[] = [],
): MigrationArea[] {
  const primaryAreas = buildAreasFromPackages(packageNames);

  if (!fallbackPackageNames.length || primaryAreas.length > 1) {
    return primaryAreas;
  }

  const fallbackAreas = buildAreasFromPackages([
    ...new Set([...packageNames, ...fallbackPackageNames]),
  ]);

  return fallbackAreas.length > primaryAreas.length ? fallbackAreas : primaryAreas;
}
