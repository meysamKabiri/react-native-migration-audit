import fg from "fast-glob";
import fs from "fs-extra";
import path from "node:path";

export type DeprecatedApiFinding = {
  api: string;
  severity: "critical" | "high" | "medium" | "low";
  suggestedAction: string;
  files: {
    file: string;
    occurrences: number;
  }[];
};

const deprecatedApiRules = [
  {
    api: "AsyncStorage",
    severity: "high" as const,
    pattern: /\bAsyncStorage\b/g,
    suggestedAction:
      "Replace core AsyncStorage usage with @react-native-async-storage/async-storage.",
  },
  {
    api: "NetInfo",
    severity: "medium" as const,
    pattern: /\bNetInfo\b/g,
    suggestedAction:
      "Replace old NetInfo usage with @react-native-community/netinfo.",
  },
  {
    api: "Clipboard",
    severity: "medium" as const,
    pattern: /\bClipboard\b/g,
    suggestedAction:
      "Replace core Clipboard usage with @react-native-clipboard/clipboard.",
  },
  {
    api: "Picker",
    severity: "medium" as const,
    pattern: /\bPicker\b/g,
    suggestedAction:
      "Replace core Picker usage with @react-native-picker/picker.",
  },
  {
    api: "componentWillMount",
    severity: "medium" as const,
    pattern: /\bcomponentWillMount\b/g,
    suggestedAction:
      "Replace legacy lifecycle method with safer lifecycle or hooks-based logic.",
  },
  {
    api: "componentWillReceiveProps",
    severity: "medium" as const,
    pattern: /\bcomponentWillReceiveProps\b/g,
    suggestedAction:
      "Replace legacy lifecycle method with safer lifecycle or hooks-based logic.",
  },
  {
    api: "componentWillUpdate",
    severity: "medium" as const,
    pattern: /\bcomponentWillUpdate\b/g,
    suggestedAction:
      "Replace legacy lifecycle method with safer lifecycle or hooks-based logic.",
  },
];

function countMatches(content: string, pattern: RegExp) {
  return [...content.matchAll(pattern)].length;
}

export async function scanSourceCode(
  projectPath: string,
): Promise<DeprecatedApiFinding[]> {
  const files = await fg(
    ["src/**/*.{js,jsx,ts,tsx}", "app/**/*.{js,jsx,ts,tsx}"],
    {
      cwd: projectPath,
      absolute: true,
      ignore: ["**/node_modules/**", "**/ios/**", "**/android/**"],
    },
  );

  const findings: DeprecatedApiFinding[] = [];

  for (const rule of deprecatedApiRules) {
    const fileFindings: DeprecatedApiFinding["files"] = [];

    for (const filePath of files) {
      const content = await fs.readFile(filePath, "utf8");
      const occurrences = countMatches(content, rule.pattern);

      if (occurrences > 0) {
        fileFindings.push({
          file: path.relative(projectPath, filePath),
          occurrences,
        });
      }
    }

    if (fileFindings.length > 0) {
      findings.push({
        api: rule.api,
        severity: rule.severity,
        suggestedAction: rule.suggestedAction,
        files: fileFindings,
      });
    }
  }

  return findings;
}
