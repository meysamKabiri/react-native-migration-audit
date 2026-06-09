import fs from "fs-extra";
import path from "node:path";

const sourceExtensions = "{js,jsx,ts,tsx}";

const candidateSourceDirs = [
  "src",
  "app",
  "screens",
  "components",
  "containers",
  "hooks",
  "navigation",
  "Store",
  "store",
  "redux",
  "services",
  "utils",
  "integrations",
  "constant",
  "constants",
  "custom",
  "pages",
  "modal-contents",
];

const candidateRootFiles = ["App", "index"];

export function getSourceFilePatterns(projectPath: string) {
  const seenDirs = new Set<string>();
  const patterns = candidateSourceDirs
    .filter((dir) => {
      const sourcePath = path.join(projectPath, dir);
      if (!fs.pathExistsSync(sourcePath)) return false;

      const normalizedPath = sourcePath.toLowerCase();
      if (seenDirs.has(normalizedPath)) return false;

      seenDirs.add(normalizedPath);
      return true;
    })
    .map((dir) => `${dir}/**/*.${sourceExtensions}`);

  for (const fileName of candidateRootFiles) {
    patterns.push(`${fileName}.${sourceExtensions}`);
  }

  return patterns;
}
