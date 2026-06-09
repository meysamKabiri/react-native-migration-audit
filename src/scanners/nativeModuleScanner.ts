import fg from "fast-glob";
import fs from "fs-extra";
import path from "node:path";

export type NativeModuleFinding = {
  platform: "android" | "ios";
  type:
    | "react-package"
    | "native-module"
    | "native-method"
    | "bridge-module"
    | "swift-objc-bridge";
  file: string;
  matches: string[];
  severity: "critical" | "high" | "medium" | "low";
};

const nativePatterns = [
  {
    platform: "android" as const,
    type: "react-package" as const,
    pattern: /\bimplements\s+ReactPackage\b/g,
    severity: "high" as const,
  },
  {
    platform: "android" as const,
    type: "native-module" as const,
    pattern: /\bextends\s+ReactContextBaseJavaModule\b/g,
    severity: "high" as const,
  },
  {
    platform: "android" as const,
    type: "native-module" as const,
    pattern: /\bNativeModule\b/g,
    severity: "medium" as const,
  },
  {
    platform: "ios" as const,
    type: "bridge-module" as const,
    pattern: /\bRCT_EXPORT_MODULE\b/g,
    severity: "high" as const,
  },
  {
    platform: "ios" as const,
    type: "native-method" as const,
    pattern: /\bRCT_EXPORT_METHOD\b/g,
    severity: "high" as const,
  },
  {
    platform: "ios" as const,
    type: "swift-objc-bridge" as const,
    pattern: /@objc\s*\(/g,
    severity: "medium" as const,
  },
];

function getPlatform(filePath: string): "android" | "ios" | null {
  if (filePath.includes(`${path.sep}android${path.sep}`)) return "android";
  if (filePath.includes(`${path.sep}ios${path.sep}`)) return "ios";
  return null;
}

function getMatches(content: string, pattern: RegExp) {
  return [...content.matchAll(pattern)].map((match) => match[0]);
}

export async function scanNativeModules(
  projectPath: string,
): Promise<NativeModuleFinding[]> {
  const files = await fg(
    ["android/**/*.{java,kt}", "ios/**/*.{h,m,mm,swift}"],
    {
      cwd: projectPath,
      absolute: true,
      ignore: [
        "**/node_modules/**",
        "**/Pods/**",
        "**/build/**",
        "**/.gradle/**",
        "**/DerivedData/**",
      ],
    },
  );

  const findings: NativeModuleFinding[] = [];

  for (const filePath of files) {
    const platform = getPlatform(filePath);
    if (!platform) continue;

    const content = await fs.readFile(filePath, "utf8");
    const relativeFile = path.relative(projectPath, filePath);

    for (const nativePattern of nativePatterns) {
      if (nativePattern.platform !== platform) continue;

      const matches = getMatches(content, nativePattern.pattern);

      if (matches.length > 0) {
        findings.push({
          platform,
          type: nativePattern.type,
          file: relativeFile,
          matches,
          severity: nativePattern.severity,
        });
      }
    }
  }

  return findings;
}
