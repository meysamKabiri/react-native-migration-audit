# React Native Migration Audit

CLI tool for auditing React Native and Expo repositories, assessing migration readiness, and generating migration strategy/task outputs.

## MVP Status

Current status: **Technical Validation MVP**.

The tool now produces an end-to-end migration preparation workflow: audit, baseline readiness, migration strategy, task planning, and staged upgrade execution planning. See [`docs/MVP_STATUS.md`](docs/MVP_STATUS.md) for capabilities, validation status, limitations, and roadmap.

## Features

- React Native / Expo version analysis
- Dependency analysis
- Native tooling analysis
- Deprecated API detection
- Migration-sensitive area classification
- Migration area evidence and source confidence
- Complexity scoring
- Upgrade recommendations
- Proposal generation
- Baseline readiness checks
- Migration strategy generation
- AI-ready migration task generation
- Staged upgrade execution plan generation

## Outputs

- `audit-result.json`
- `report.md`
- `migration-plan.md`: migration strategy
- `migration-tasks.md`: preparation and review tasks
- `upgrade-execution-plan.md`: staged upgrade execution workflow

## Usage

```bash
yarn install
yarn run audit /path/to/react-native-project
```

## Development Validation

```bash
yarn typecheck
```

Runs `tsc --noEmit` with the root `tsconfig.json` for compile-time validation. Suitable for CI usage and pre-commit workflows.
