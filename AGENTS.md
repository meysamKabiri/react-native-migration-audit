# AGENTS.md

## Repo Shape

- This repo is a TypeScript CLI for auditing external React Native/Expo projects; it is not itself a React Native app.
- The CLI entrypoint is `src/index.ts`; package scripts run it through `tsx` and require a target project path containing `package.json`.
- Use Yarn v1 here (`yarn.lock` is a Yarn v1 lockfile).

## Commands

- Install dependencies with `yarn install`.
- Run an audit with `yarn run audit <path-to-rn-project>` or `yarn run dev <path-to-rn-project>`; prefer `yarn run audit` over bare `yarn audit` to avoid Yarn command ambiguity.
- Run typecheck with `yarn typecheck` (`tsc --noEmit` with the root `tsconfig.json`).
- There are currently no configured `test` or `lint` scripts; do not claim those checks exist unless you add them.

## Generated Outputs

- Each CLI run writes `report.md` and `audit-result.json` to the current working directory (`process.cwd()`) by default; use `--out <dir>` to write them elsewhere.
- Treat root `report.md` and `audit-result.json` as generated audit output; avoid hand-editing them unless the task is specifically about report content.

## Scanner Boundaries

- Source scanning uses `src/scanners/sourceRoots.ts` to include `src`, `app`, and common top-level RN source dirs/files that exist, excluding `node_modules`, `ios`, and `android`.
- Native module scanning only covers target `android/**/*.{java,kt}` and `ios/**/*.{h,m,mm,swift}`, excluding common generated/build directories.
- AST scanning uses `ts-morph` with `skipAddingFilesFromTsConfig: true`; it does not read the target project's TypeScript config.
- Dependency analysis merges the target project's `dependencies` and `devDependencies`; lockfiles are only used to detect package manager.

## Rule Updates

- Known risky dependency names live in `src/rules/riskyDependencies.ts`; richer metadata for exact packages lives in `src/rules/packageRules.ts`.
- Heuristic package classification for imported RN-related packages lives in `src/rules/packageCategories.ts`.
- Migration-sensitive area grouping lives in `src/rules/migrationAreas.ts` and is built from AST-detected package usage.
