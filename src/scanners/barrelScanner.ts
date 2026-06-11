import fg from "fast-glob";
import fs from "fs-extra";
import path from "node:path";
import { getSourceFilePatterns } from "./sourceRoots";

export type BarrelInfo = {
  barrelFiles: string[];
  barrelCount: number;
  largestBarrelExportCount: number;
  hasLargeBarrels: boolean;
  barrelDetails: {
    path: string;
    reexportCount: number;
  }[];
};

export async function scanBarrels(projectPath: string): Promise<BarrelInfo> {
  const patterns = getSourceFilePatterns(projectPath);

  const indexFiles: string[] = [];

  for (const pattern of patterns) {
    if (!pattern.includes("/**/")) {
      continue;
    }
    const dirPart = pattern.replace("/**/*.{js,jsx,ts,tsx}", "");
    const indexPattern = `${dirPart}/**/index.{ts,tsx}`;
    const matches = await fg(indexPattern, {
      cwd: projectPath,
      absolute: true,
    });
    indexFiles.push(...matches);
  }

  const rootIndexFiles = ["index.ts", "index.tsx"].map((f) =>
    path.join(projectPath, f),
  );
  for (const rootFile of rootIndexFiles) {
    if (await fs.pathExists(rootFile)) {
      indexFiles.push(rootFile);
    }
  }

  const barrelDetails: { path: string; reexportCount: number }[] = [];

  for (const filePath of indexFiles) {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      const reexportMatches = content.match(
        /export\s+(?:\*\s+from|{[\s\S]*?}\s+from)\s+['"]/g,
      );
      const count = reexportMatches?.length ?? 0;
      if (count > 0) {
        barrelDetails.push({
          path: path.relative(projectPath, filePath),
          reexportCount: count,
        });
      }
    } catch {
      // skip unreadable files
    }
  }

  const counts = barrelDetails.map((b) => b.reexportCount);
  const largestBarrelExportCount = counts.length ? Math.max(...counts) : 0;
  const barrelCount = barrelDetails.length;
  const hasLargeBarrels = largestBarrelExportCount >= 10;

  return {
    barrelFiles: barrelDetails.map((b) => b.path),
    barrelCount,
    largestBarrelExportCount,
    hasLargeBarrels,
    barrelDetails,
  };
}
