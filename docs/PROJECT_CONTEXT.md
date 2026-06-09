# React Native Migration Rescue - Project Context

## Project Goal

Build a React Native / Expo Migration Rescue product.

The initial business model is a productized service, not SaaS.

Primary offer:

- Upgrade Audit ($99-$299 initially)
- Upgrade Sprint ($750-$3500)
- Maintenance Plan ($300-$1000/month)

The audit should help evaluate a React Native or Expo repository and produce a professional migration report that can be delivered to customers.

The goal is to help small teams, startups, agencies, and indie founders safely upgrade React Native and Expo applications.

---

## Current Development Stage

We are currently building the Upgrade Audit CLI.

The audit tool should:

1. Scan a React Native / Expo repository
2. Collect migration-related facts
3. Analyze risks
4. Generate a professional report
5. Generate a proposal and implementation estimate

The audit tool is becoming the delivery engine for the paid Upgrade Audit service.

---

## Architecture Principles

### Important

Do NOT hardcode logic for a specific customer project.

Avoid:

- project-specific assumptions
- app-specific package names
- fixed React Native versions
- fixed upgrade paths

Prefer:

- generic scanners
- configurable rules
- reusable classification systems
- semver-based logic

---

## Current Architecture

### Scanners

Implemented:

- package.json scanner
- dependency scanner
- AST scanner
- native tooling scanner
- native module scanner

Scanners should collect facts only.

Scanners should not decide risk.

---

### Rules

Rules are responsible for:

- risk classification
- migration area classification
- scoring
- recommendations

The long-term architecture should be:

Project Facts
↓
Rule Engine
↓
Findings
↓
Report
↓
Proposal

---

## Already Implemented

### Version Analysis

Detect:

- React Native
- React
- Expo
- TypeScript

### Dependency Analysis

Detect:

- risky dependencies
- migration-sensitive dependencies

### Native Tooling Analysis

Detect:

- Android Gradle Plugin
- Gradle version
- Podfile
- use_frameworks
- Expo config
- EAS config

### AST Analysis

Detect:

- deprecated RN imports
- React patterns
- package usage

### Migration Areas

Group packages into:

- Navigation
- Camera
- Bluetooth
- Authentication
- Media
- Permissions
- Storage
- UI Components

### Native Module Scanner

Detect:

- ReactPackage
- ReactContextBaseJavaModule
- RCT_EXPORT_MODULE
- RCT_EXPORT_METHOD
- Swift ObjC bridges

### Complexity Score

Generate:

- score
- classification
- score drivers

---

## Current Report Sections

Implemented:

- Executive Summary
- Risk Summary
- Migration Complexity Score
- Migration Sensitive Areas
- Deprecated API Findings
- Native Tooling Analysis
- Native Module Findings
- Upgrade Tasks
- Recommended Migration Plan
- Effort Estimate

---

## What Is Not Done Yet

### Proposal Generator

Generate:

- recommended service
- fixed-price estimate
- implementation scope
- out-of-scope items
- recommended engagement

### Price Estimation Engine

Estimate:

- audit price
- migration sprint price

Based on:

- complexity score
- migration areas
- effort estimate
- native findings

### Dynamic Upgrade Path

Current implementation contains hardcoded upgrade paths.

Need:

generateUpgradePath(currentRNVersion)

using semver-based logic.

---

## Coding Guidelines

- TypeScript only
- Prefer small pure functions
- Keep scanners independent
- Avoid business logic in scanners
- Avoid project-specific assumptions
- Keep report customer-friendly
- Prefer aggregated findings over noisy file-level findings

---

## Immediate Next Goal

Build Proposal Generator.

Input:

- complexity score
- migration areas
- effort estimate
- native findings
- risk summary

Output:

- recommended service
- fixed-price range
- implementation estimate
- scope
- out-of-scope
- next steps
