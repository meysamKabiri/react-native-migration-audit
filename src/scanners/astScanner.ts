import { Project, SyntaxKind } from "ts-morph";
import path from "node:path";
import { classifyPackage } from "../rules/packageCategories";
export type PackageUsage = {
  packageName: string;
  files: string[];
  count: number;
  category: string;
  risk: string;
  reason: string;
  suggestedAction: string;
};

export type DeprecatedImportUsage = {
  importName: string;
  replacement: string;
  files: string[];
  count: number;
};

export type ReactPatternUsage = {
  pattern: "class-component" | "legacy-lifecycle" | "react-create-ref";
  files: string[];
  count: number;
};

export type AstScanResult = {
  packageUsages: PackageUsage[];
  deprecatedImports: DeprecatedImportUsage[];
  reactPatterns: ReactPatternUsage[];
};

const deprecatedReactNativeImports: Record<string, string> = {
  AsyncStorage: "@react-native-async-storage/async-storage",
  NetInfo: "@react-native-community/netinfo",
  Clipboard: "@react-native-clipboard/clipboard",
  Picker: "@react-native-picker/picker",
};

const legacyLifecycleMethods = new Set([
  "componentWillMount",
  "componentWillReceiveProps",
  "componentWillUpdate",
  "UNSAFE_componentWillMount",
  "UNSAFE_componentWillReceiveProps",
  "UNSAFE_componentWillUpdate",
]);

function isReactNativeRelatedPackage(moduleName: string) {
  return (
    moduleName.startsWith("react-native-") ||
    moduleName.startsWith("@react-native-") ||
    moduleName.startsWith("@react-navigation/") ||
    moduleName.startsWith("expo-") ||
    moduleName.startsWith("@expo/")
  );
}

function normalizePackageName(moduleName: string) {
  // Convert deep imports like:
  // react-native-vector-icons/Icon
  // react-native-chart-kit/dist/line-chart/LineChart
  // into their root package names.
  if (moduleName.startsWith("@")) {
    const parts = moduleName.split("/");
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : moduleName;
  }

  return moduleName.split("/")[0];
}

function addToMap(map: Map<string, Set<string>>, key: string, file: string) {
  if (!map.has(key)) {
    map.set(key, new Set());
  }

  map.get(key)!.add(file);
}

function getClassHeritageText(
  classDeclaration: import("ts-morph").ClassDeclaration,
) {
  return classDeclaration
    .getHeritageClauses()
    .map((clause) => clause.getText())
    .join(" ");
}

function hasReactClassHeritage(heritageText: string) {
  return (
    heritageText.includes("React.Component") ||
    heritageText.includes("React.PureComponent") ||
    /\bextends\s+Component\b/.test(heritageText) ||
    /\bextends\s+PureComponent\b/.test(heritageText)
  );
}

export function scanAst(projectPath: string): AstScanResult {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      allowJs: true,
      jsx: 2,
    },
  });

  project.addSourceFilesAtPaths([
    path.join(projectPath, "src/**/*.{ts,tsx,js,jsx}"),
    path.join(projectPath, "app/**/*.{ts,tsx,js,jsx}"),
  ]);

  const packageUsageMap = new Map<string, Set<string>>();
  const deprecatedImportMap = new Map<string, Set<string>>();
  const reactPatternMap = new Map<ReactPatternUsage["pattern"], Set<string>>();

  for (const sourceFile of project.getSourceFiles()) {
    const relativeFilePath = path.relative(
      projectPath,
      sourceFile.getFilePath(),
    );

    for (const declaration of sourceFile.getImportDeclarations()) {
      const moduleName = declaration.getModuleSpecifierValue();

      if (isReactNativeRelatedPackage(moduleName)) {
        const packageName = normalizePackageName(moduleName);
        addToMap(packageUsageMap, packageName, relativeFilePath);
      }

      if (moduleName === "react-native") {
        for (const namedImport of declaration.getNamedImports()) {
          const importName = namedImport.getName();

          if (deprecatedReactNativeImports[importName]) {
            addToMap(deprecatedImportMap, importName, relativeFilePath);
          }
        }
      }
    }

    for (const classDeclaration of sourceFile.getClasses()) {
      const heritageText = getClassHeritageText(classDeclaration);

      if (hasReactClassHeritage(heritageText)) {
        addToMap(reactPatternMap, "class-component", relativeFilePath);
      }

      for (const method of classDeclaration.getMethods()) {
        const methodName = method.getName();

        if (legacyLifecycleMethods.has(methodName)) {
          addToMap(reactPatternMap, "legacy-lifecycle", relativeFilePath);
        }
      }
    }

    sourceFile.forEachDescendant((node) => {
      if (!node.isKind(SyntaxKind.CallExpression)) return;

      const expression = node.getExpression().getText();

      if (expression === "React.createRef") {
        addToMap(reactPatternMap, "react-create-ref", relativeFilePath);
      }
    });
  }

  return {
    packageUsages: [...packageUsageMap.entries()]
      .map(([packageName, files]) => {
        const classification = classifyPackage(packageName);

        return {
          packageName,
          files: [...files].sort(),
          count: files.size,
          ...classification,
        };
      })
      .sort((a, b) => b.count - a.count),

    deprecatedImports: [...deprecatedImportMap.entries()]
      .map(([importName, files]) => ({
        importName,
        replacement: deprecatedReactNativeImports[importName],
        files: [...files].sort(),
        count: files.size,
      }))
      .sort((a, b) => b.count - a.count),

    reactPatterns: [...reactPatternMap.entries()]
      .map(([pattern, files]) => ({
        pattern,
        files: [...files].sort(),
        count: files.size,
      }))
      .sort((a, b) => b.count - a.count),
  };
}
