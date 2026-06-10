# MVP Status

## Project Status

Current status: **Technical Validation MVP**.

This project has moved beyond a simple React Native audit tool. It now provides a migration preparation workflow for React Native and Expo projects: it scans a target repository, identifies migration risks, checks whether the baseline is ready, generates a migration strategy, produces Codex/OpenCode-ready migration tasks, and writes a staged upgrade execution workflow.

The goal is not to automatically upgrade an app. The goal is to make upgrade work safer, more predictable, and easier to execute with humans and AI coding assistants.

## Current Workflow

```text
Project
↓
Audit
↓
Baseline Readiness
↓
Migration Strategy
↓
Migration Tasks
↓
Upgrade Execution Plan
```

The CLI writes these outputs to the selected output directory:

- `audit-result.json`: structured machine-readable audit facts, risks, scores, proposal data, migration areas, evidence, and generated recommendations.
- `report.md`: customer-friendly audit report summarizing risks, readiness, migration areas, native tooling, proposal, and recommended next steps.
- `migration-plan.md`: migration strategy for humans and AI assistants to understand the recommended phased approach.
- `migration-tasks.md`: preparation and review tasks with context, allowed changes, forbidden changes, validation guidance, and commit checkpoints.
- `upgrade-execution-plan.md`: staged upgrade execution workflow with baseline gates, upgrade milestones, validation commands, commit strategy, and stop conditions.

## Current Capabilities

### Audit

- React Native version detection, including normalization for Yarn patch specs and known Expo React Native tarball baselines.
- Expo detection.
- Workflow detection for managed Expo, bare/prebuild Expo, bare React Native, and unknown projects.
- Package manager detection from lockfiles.
- Lockfile detection and mixed lockfile warnings.
- Android build tooling detection, including Gradle wrapper version, Android Gradle Plugin version where available, and `present-unknown` when AGP usage is present but no version can be resolved.
- Risky dependency detection from known migration-sensitive React Native packages.
- Native/config file detection such as Podfile, Gradle files, Metro config, Babel config, EAS config, and Expo app config.

### Migration Intelligence

- Migration-sensitive area detection, including Navigation, Camera, Authentication SDKs, Media, Permissions, Storage, Bluetooth, and UI/native visual components.
- Migration area evidence with source confidence: `AST`, `Dependency`, `Native Module`, or `Mixed`.
- Native module and bridge pattern detection for Android and iOS.
- Baseline readiness checks for old React Native baselines, critical risk, custom native modules, native build tooling age, package manager state, workflow, and validation scripts.
- Complexity scoring with visible score drivers.
- Proposal generation for audit/sprint/manual-review recommendations.
- Upgrade path recommendation based on the detected React Native baseline.

### Execution Planning

- Migration strategy generation with staged phases.
- Migration task generation for preparation and review work.
- Upgrade execution plan generation for staged upgrade workflow control.
- Commit checkpoints for task-level progress.
- Validation guidance for typecheck, lint, test, iOS, and Android commands when available.
- Safety rules that discourage broad rewrites, unrelated dependency changes, package-manager switching, and silent TypeScript suppression.

## Validation Coverage

The tool has been validated against sample and real-world React Native / Expo repositories:

- FastPong
- In1Bank
- Tourist Wallet
- Rocket.Chat.ReactNative
- Artsy Eigen
- Status Mobile
- react-native-firebase
- firebase-instagram

Major accuracy fixes discovered during validation include:

- Bluetooth false positives from package-name substring matching were removed.
- React Native version normalization was improved for Yarn patch protocol and Expo tarball baselines.
- Dependency fallback migration areas were added for projects where AST parsing sees little source usage, such as Status Mobile's ClojureScript-heavy codebase.
- Typecheck script detection now recognizes aliases and embedded `tsc` commands, including scripts such as `type-check`, `ci:type-check`, and `lint` commands that run `tsc`.
- Mixed package-manager lockfiles are detected and reported as a migration risk.
- Android Gradle Plugin detection now reports either a detected version or `present-unknown` when plugin usage is present but the version is not locally resolvable.
- Migration area evidence now explains whether each area came from AST/source usage, dependencies, native module evidence, or mixed sources.

Current validation details are tracked in `validation-results/validation-matrix.md` and `validation-results/validation-summary.json`.

## Known Limitations

- The tool does not execute migrations.
- The tool does not verify runtime behavior.
- The tool does not build iOS or Android projects.
- The tool does not run customer test suites, lint, typecheck, or native build commands.
- The tool does not understand every source language.
- ClojureScript support is indirect via dependency fallback, not direct source parsing.
- Android Gradle Plugin detection may remain `present-unknown` in convention-plugin setups, external Gradle metadata, or projects that omit a local version declaration.
- Native module analysis is heuristic and identifies patterns, not full runtime behavior.
- Migration area labels are broad; for example, Firebase packages may currently map to Authentication SDKs even when the service is analytics or messaging.
- Risk/proposal differences may need more explanatory copy for customer-facing clarity.
- Generated effort and pricing are estimates, not fixed quotes.

## What This Tool Is Not

This tool is **not**:

- a React Native upgrader
- a code migration engine
- a replacement for Codex, Cursor, OpenCode, or a human engineer
- a build system
- a guarantee that a migration will succeed

Instead, it prepares migration work and reduces migration risk by making the current project state, likely blockers, validation gaps, and execution plan visible before code changes begin.

## Why Use This Instead Of Only Codex

Codex and similar tools can modify files. That is useful, but migration work often fails when the assistant starts editing before the project baseline is understood.

This tool provides:

- audit facts
- readiness gates
- migration strategy
- migration task planning
- evidence-backed findings
- risk visibility
- customer-friendly reporting

The intended workflow is to use this tool before AI-assisted implementation. The audit gives the assistant and human operator a shared map of what to inspect, what not to change, what to validate, and when to stop.

The goal is to make AI-assisted React Native migrations safer, smaller, and more predictable.

## Roadmap

### Next Accuracy Improvements

- Better support for non-TypeScript source languages and layouts, including direct ClojureScript import analysis.
- More dependency categories and richer package metadata.
- Richer native-module analysis and native module purpose classification.
- Better Android Gradle Plugin version resolution for convention plugins and external Gradle metadata.
- Clearer Firebase/service-specific migration area labels.
- Better explanation when risk level, complexity score, and proposal recommendation diverge.

### Future Features

- Migration verification reports after implementation work.
- Release readiness reports.
- CI integration for audit and readiness checks.
- Automated upgrade checkpoints.
- Structured export for implementation tracking.
- More customer-ready proposal and scope templates.
