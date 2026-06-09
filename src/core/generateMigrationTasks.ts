type Severity = "critical" | "high" | "medium" | "low";

type MigrationArea = {
  area: string;
  risk: "high" | "medium" | "low";
  packages: string[];
};

type NativeModuleGroup = {
  name: string;
  platforms: ("android" | "ios")[];
  files: string[];
  findingTypes: string[];
  severity: Severity;
};

type AuditResultForMigrationTasks = {
  projectName: string;
  packageManager: string;
  reactNative: string | null;
  react: string | null;
  typescript: string | null;
  workflow: string;
  upgradeRecommendation: {
    strategy: string;
    target: string;
    note: string;
  };
  nativeVersions: {
    androidGradlePlugin: string | null;
    gradle: string | null;
    hasUseFrameworks: boolean;
  };
  riskyDependencies: {
    name: string;
    version: string;
    risk?: string;
    suggestedAction?: string;
  }[];
  migrationAreas: MigrationArea[];
  nativeModuleGroups: NativeModuleGroup[];
  astScan: {
    deprecatedImports: {
      importName: string;
      replacement: string;
      files: string[];
    }[];
  };
  deprecatedApiFindings: {
    api: string;
    files: {
      file: string;
      occurrences: number;
    }[];
  }[];
  hasIOS: boolean;
  hasAndroid: boolean;
  hasIOSScript: boolean;
  hasAndroidScript: boolean;
  hasTestScript: boolean;
  hasLintScript: boolean;
  hasTypecheckScript: boolean;
  scripts: Record<string, string>;
};

type MigrationTask = {
  title: string;
  goal: string;
  context: string[];
  allowedChanges: string[];
  forbiddenChanges: string[];
  filesToInspect: string[];
  instructions: string[];
  validationCommands: string[];
  successCriteria: string[];
  rollbackNote: string;
};

const safetyRules = [
  "Do not make broad rewrites.",
  "Do not change business logic unless required for the migration.",
  "Do not remove files unless clearly obsolete and justified.",
  "Do not silence TypeScript errors without explaining why.",
  "Do not edit generated files manually unless required.",
  "Keep changes small and commit-ready.",
  "If unsure, document the blocker instead of guessing.",
];

const doNotContinueInstruction =
  "Do not continue to the next task until validation is complete or blockers are documented.";

const mobileEnvironmentCaveat =
  "Run if the local iOS/Android environment is available. If not available, document the blocker and required environment.";

function list(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function taskSection(title: string, items: string[]) {
  return `### ${title}\n\n${list(items)}`;
}

function isMobileRunCommand(command: string) {
  return /^(yarn|pnpm) (ios|android)$/.test(command) ||
    /^npm run (ios|android)$/.test(command);
}

function formatValidationCommand(command: string) {
  if (!isMobileRunCommand(command)) return command;
  return `${command} — ${mobileEnvironmentCaveat}`;
}

function getCommitMessage(title: string) {
  const messages: Record<string, string> = {
    "Baseline Verification": "Document baseline verification before migration",
    "Create Migration Branch": "Create migration branch for RN upgrade",
    "Dependency And Package Manager Review":
      "Review dependencies and package manager for RN migration",
    "React Native Upgrade Path Planning": "Plan staged React Native upgrade path",
    "Android Build Tooling Review":
      "Review Android build tooling for RN migration",
    "iOS And CocoaPods Review": "Review iOS CocoaPods setup for RN migration",
    "Risky Dependency Review": "Review risky dependencies for RN migration",
    "Native Module Review": "Review custom native modules for RN migration",
    "Android Native Bridge Review":
      "Review Android native bridges for RN migration",
    "iOS Native Bridge Review": "Review iOS native bridges for RN migration",
    "Final Verification": "Document final migration verification",
  };

  return messages[title] ?? `${title} for RN migration`;
}

function renderCommitCheckpoint(task: MigrationTask) {
  return `### Commit checkpoint\n\nAfter this task passes validation, commit the isolated changes with a clear message, for example:\n\n\`\`\`bash\ngit add .\ngit commit -m "${getCommitMessage(
    task.title,
  )}"\n\`\`\``;
}

function getPackageManagerCommand(result: AuditResultForMigrationTasks) {
  if (result.packageManager === "yarn") return "yarn install";
  if (result.packageManager === "pnpm") return "pnpm install";
  return "npm install";
}

function getScriptCommand(
  result: AuditResultForMigrationTasks,
  scriptName: string,
) {
  if (result.packageManager === "yarn") return `yarn ${scriptName}`;
  if (result.packageManager === "pnpm") return `pnpm ${scriptName}`;
  return `npm run ${scriptName}`;
}

function getVerificationCommands(result: AuditResultForMigrationTasks) {
  const commands: string[] = [];

  if (result.hasTypecheckScript) {
    commands.push(
      getScriptCommand(result, result.scripts.typecheck ? "typecheck" : "tsc"),
    );
  }

  if (result.hasLintScript) commands.push(getScriptCommand(result, "lint"));
  if (result.hasTestScript) commands.push(getScriptCommand(result, "test"));
  if (result.hasAndroidScript) commands.push(getScriptCommand(result, "android"));
  if (result.hasIOSScript) commands.push(getScriptCommand(result, "ios"));

  return commands.length ? commands : ["Document available verification commands."];
}

function createTask(task: MigrationTask) {
  return {
    ...task,
    instructions: [...task.instructions, doNotContinueInstruction],
    validationCommands: task.validationCommands.map(formatValidationCommand),
    forbiddenChanges: [...task.forbiddenChanges, ...safetyRules],
  };
}

function renderTask(task: MigrationTask, index: number) {
  return `## Task ${index} — ${task.title}\n\n${taskSection(
    "Goal",
    [task.goal],
  )}\n\n${taskSection("Context from audit", task.context)}\n\n${taskSection(
    "Allowed changes",
    task.allowedChanges,
  )}\n\n${taskSection("Forbidden changes", task.forbiddenChanges)}\n\n${taskSection(
    "Files to inspect",
    task.filesToInspect,
  )}\n\n${taskSection(
    "Implementation instructions",
    task.instructions,
  )}\n\n${taskSection(
    "Validation commands",
    task.validationCommands,
  )}\n\n${taskSection("Success criteria", task.successCriteria)}\n\n${taskSection(
    "Rollback note",
    [task.rollbackNote],
  )}\n\n${renderCommitCheckpoint(task)}`;
}

function createAreaTask(
  area: MigrationArea,
  result: AuditResultForMigrationTasks,
) {
  const titleByArea: Record<string, string> = {
    Navigation: "Navigation Verification",
    Camera: "Camera Verification",
    Bluetooth: "Bluetooth Verification",
    "Authentication SDKs": "Authentication SDK Verification",
    Media: "Media Verification",
    Permissions: "Permissions Verification",
    Storage: "Storage Verification",
    "UI / Native Visual Components": "UI And Native Component Smoke Testing",
  };

  return createTask({
    title: titleByArea[area.area] ?? `${area.area} Verification`,
    goal: `Verify migration-sensitive ${area.area} behavior after upgrade changes.`,
    context: [
      `${area.area} was detected as a ${area.risk.toUpperCase()} risk migration area.`,
      `Detected packages: ${area.packages.join(", ")}.`,
    ],
    allowedChanges: [
      "Inspect affected screens, integration code, and native setup.",
      "Make minimal compatibility fixes required by the migration.",
      "Add a short manual smoke-test checklist if automated coverage is unavailable.",
    ],
    forbiddenChanges: [
      "Do not redesign flows or UI.",
      "Do not replace packages unless the current package is confirmed incompatible.",
      "Do not mix feature work with migration fixes.",
    ],
    filesToInspect: [
      "package.json",
      "src/",
      "app/",
      "screens/",
      "components/",
      "ios/",
      "android/",
    ],
    instructions: [
      "Inspect before editing and identify the exact usage points for the detected packages.",
      "Make the smallest migration-related fix possible.",
      "If native configuration is required, inspect both iOS and Android setup before editing.",
      "Report what changed and what still needs manual device verification.",
    ],
    validationCommands: getVerificationCommands(result),
    successCriteria: [
      `${area.area} usage points are identified and documented.`,
      "Any required compatibility changes are small and isolated.",
      "Validation commands pass or blockers are documented with exact errors.",
    ],
    rollbackNote:
      "Revert only the isolated migration changes for this area if validation fails.",
  });
}

export function generateMigrationTasks(result: AuditResultForMigrationTasks) {
  const verificationCommands = getVerificationCommands(result);
  const tasks: MigrationTask[] = [
    createTask({
      title: "Baseline Verification",
      goal: "Establish a clean baseline before making any migration changes.",
      context: [
        `Project: ${result.projectName}.`,
        `Workflow: ${result.workflow}.`,
        `React Native: ${result.reactNative ?? "not detected"}; React: ${
          result.react ?? "not detected"
        }; TypeScript: ${result.typescript ?? "not detected"}.`,
      ],
      allowedChanges: ["Documentation-only notes about baseline status."],
      forbiddenChanges: ["Do not edit app, native, or dependency files in this task."],
      filesToInspect: ["package.json", "README*", "ios/", "android/"],
      instructions: [
        "Inspect the repository before editing.",
        "Install dependencies with the current package manager if needed.",
        "Run available verification commands and record the baseline result.",
        "Stop if installation or baseline builds fail for unclear reasons.",
      ],
      validationCommands: [getPackageManagerCommand(result), ...verificationCommands],
      successCriteria: [
        "Baseline commands and failures are documented.",
        "No migration changes have been made yet.",
      ],
      rollbackNote: "No code rollback should be needed because this task should not edit code.",
    }),
    createTask({
      title: "Create Migration Branch",
      goal: "Create a safe branch for migration work and confirm the working tree is understood.",
      context: ["Migration work should be isolated from feature development."],
      allowedChanges: ["Create or switch to a migration branch."],
      forbiddenChanges: ["Do not commit unrelated local changes.", "Do not discard user work."],
      filesToInspect: ["git status output"],
      instructions: [
        "Inspect git status before making changes.",
        "Create a migration branch if one does not already exist.",
        "Document any pre-existing dirty files before continuing.",
      ],
      validationCommands: ["git status --short", "git branch --show-current"],
      successCriteria: ["Migration work is isolated on a clear branch."],
      rollbackNote: "Switch back to the original branch if migration work is paused.",
    }),
    createTask({
      title: "Dependency And Package Manager Review",
      goal: "Review dependency state before upgrading anything.",
      context: [
        `Detected package manager: ${result.packageManager}.`,
        `${result.riskyDependencies.length} risky dependency package(s) were detected.`,
      ],
      allowedChanges: ["Document dependency risks and package manager commands."],
      forbiddenChanges: ["Do not upgrade unrelated packages.", "Do not switch package managers."],
      filesToInspect: ["package.json", "yarn.lock", "package-lock.json", "pnpm-lock.yaml"],
      instructions: [
        "Inspect dependencies and lockfiles before editing.",
        "Identify packages that must be checked against the target React Native version.",
        "Do not run bulk upgrade commands in this task.",
      ],
      validationCommands: [getPackageManagerCommand(result)],
      successCriteria: ["Dependency risks and package manager constraints are documented."],
      rollbackNote: "Revert lockfile changes if dependency installation changes more than expected.",
    }),
    createTask({
      title: "React Native Upgrade Path Planning",
      goal: "Plan the React Native upgrade path without changing versions yet.",
      context: [
        `Current React Native: ${result.reactNative ?? "not detected"}.`,
        `Recommended strategy: ${result.upgradeRecommendation.strategy}.`,
        `Suggested path: ${result.upgradeRecommendation.target}.`,
        result.upgradeRecommendation.note,
      ],
      allowedChanges: ["Create or update migration notes only."],
      forbiddenChanges: ["Do not jump directly to latest React Native.", "Do not edit package versions in this task."],
      filesToInspect: ["package.json", "android/", "ios/", "metro.config.js", "babel.config.js"],
      instructions: [
        "Inspect current RN, React, Metro, Babel, Android, and iOS setup.",
        "Break the upgrade into the suggested stages.",
        "For each stage, list the expected validation commands.",
      ],
      validationCommands: ["Document planned commands for each upgrade stage."],
      successCriteria: ["A staged, verifiable upgrade plan exists before version edits begin."],
      rollbackNote: "Keep this as a planning-only task; no code rollback should be needed.",
    }),
    createTask({
      title: "Android Build Tooling Review",
      goal: "Review Android tooling before React Native version changes.",
      context: [
        `Android Gradle Plugin: ${result.nativeVersions.androidGradlePlugin ?? "not detected"}.`,
        `Gradle: ${result.nativeVersions.gradle ?? "not detected"}.`,
      ],
      allowedChanges: ["Document required Android tooling upgrade steps.", "Make only minimal compatibility fixes if needed."],
      forbiddenChanges: ["Do not rewrite Gradle files broadly.", "Do not change signing config unless required and documented."],
      filesToInspect: ["android/build.gradle", "android/app/build.gradle", "android/gradle/wrapper/gradle-wrapper.properties"],
      instructions: [
        "Inspect Android configuration before editing.",
        "Identify AGP, Gradle, Kotlin, compileSdk, minSdk, and targetSdk compatibility constraints.",
        "Stop if native build errors are unclear.",
      ],
      validationCommands: result.hasAndroidScript
        ? [getScriptCommand(result, "android")]
        : ["Document Android build command for this project."],
      successCriteria: ["Android upgrade constraints are known and validation path is documented."],
      rollbackNote: "Revert Android build file changes as a unit if Gradle sync or build fails unexpectedly.",
    }),
    createTask({
      title: "iOS And CocoaPods Review",
      goal: "Review iOS/CocoaPods setup before React Native version changes.",
      context: [
        `iOS folder detected: ${result.hasIOS ? "yes" : "no"}.`,
        `Podfile use_frameworks!: ${result.nativeVersions.hasUseFrameworks ? "yes" : "no"}.`,
      ],
      allowedChanges: ["Document required Podfile and CocoaPods upgrade steps.", "Make only minimal compatibility fixes if needed."],
      forbiddenChanges: ["Do not rewrite the Podfile broadly.", "Do not remove pods without a clear migration reason."],
      filesToInspect: ["ios/Podfile", "ios/Podfile.lock", "ios/*.xcodeproj", "ios/*.xcworkspace"],
      instructions: [
        "Inspect Podfile and native iOS project settings before editing.",
        "Check whether use_frameworks!, modular headers, or custom pods affect the migration.",
        "Stop if CocoaPods or Xcode errors are unclear.",
      ],
      validationCommands: ["cd ios && pod install", ...(result.hasIOSScript ? [getScriptCommand(result, "ios")] : [])],
      successCriteria: ["iOS upgrade constraints are known and validation path is documented."],
      rollbackNote: "Revert Podfile, Podfile.lock, and Xcode project changes together if validation fails.",
    }),
    createTask({
      title: "Risky Dependency Review",
      goal: "Review risky dependencies before upgrading React Native.",
      context: result.riskyDependencies.length
        ? result.riskyDependencies.map(
            (dep) => `${dep.name} ${dep.version}: ${dep.suggestedAction ?? "Review compatibility."}`,
          )
        : ["No known risky dependency packages were detected."],
      allowedChanges: ["Document compatibility requirements for risky dependencies."],
      forbiddenChanges: ["Do not upgrade all dependencies at once.", "Do not replace libraries without a confirmed migration reason."],
      filesToInspect: ["package.json", "babel.config.js", "metro.config.js", "android/", "ios/"],
      instructions: [
        "Inspect each risky dependency before editing versions.",
        "Plan dependency upgrades one at a time and tie each to a validation command.",
        "Report any dependency that requires manual native setup.",
      ],
      validationCommands: verificationCommands,
      successCriteria: ["Risky dependencies have a staged compatibility plan."],
      rollbackNote: "Revert each dependency version change independently if validation fails.",
    }),
  ];

  if (result.nativeModuleGroups.length > 0) {
    const nativeContext = result.nativeModuleGroups.map(
      (group) => `${group.name}: ${group.platforms.join(", ")} (${group.severity})`,
    );

    tasks.push(
      createTask({
        title: "Native Module Review",
        goal: "Review custom native module groups before changing React Native versions.",
        context: nativeContext,
        allowedChanges: ["Document module purpose, platform coverage, and migration risks."],
        forbiddenChanges: ["Do not rewrite native modules before understanding JS callers."],
        filesToInspect: result.nativeModuleGroups.flatMap((group) => group.files),
        instructions: [
          "Inspect all grouped native module files and their JavaScript call sites.",
          "Identify whether each module uses old bridge APIs that may need changes.",
          "Stop if native behavior is unclear and document the blocker.",
        ],
        validationCommands: verificationCommands,
        successCriteria: ["Each custom native module has an owner, purpose, and migration risk note."],
        rollbackNote: "Do not change native modules in this review task unless the fix is trivial and validated.",
      }),
    );

    if (result.nativeModuleGroups.some((group) => group.platforms.includes("android"))) {
      tasks.push(
        createTask({
          title: "Android Native Bridge Review",
          goal: "Verify Android custom bridge compatibility during the migration.",
          context: nativeContext,
          allowedChanges: ["Make minimal Android bridge compatibility fixes."],
          forbiddenChanges: ["Do not rewrite Android modules or package registration broadly."],
          filesToInspect: result.nativeModuleGroups.flatMap((group) =>
            group.files.filter((file) => file.startsWith("android/")),
          ),
          instructions: [
            "Inspect Android module and package files before editing.",
            "Confirm package registration and JS call sites still work after each upgrade stage.",
            "Stop if Gradle or bridge errors are unclear.",
          ],
          validationCommands: result.hasAndroidScript
            ? [getScriptCommand(result, "android")]
            : ["Document Android native validation command."],
          successCriteria: ["Android custom bridge code compiles or blockers are documented."],
          rollbackNote: "Revert Android native bridge changes as one isolated set if validation fails.",
        }),
      );
    }

    if (result.nativeModuleGroups.some((group) => group.platforms.includes("ios"))) {
      tasks.push(
        createTask({
          title: "iOS Native Bridge Review",
          goal: "Verify iOS custom bridge compatibility during the migration.",
          context: nativeContext,
          allowedChanges: ["Make minimal Objective-C or Swift bridge compatibility fixes."],
          forbiddenChanges: ["Do not rewrite iOS modules broadly.", "Do not change app entitlements or signing unless required."],
          filesToInspect: result.nativeModuleGroups.flatMap((group) =>
            group.files.filter((file) => file.startsWith("ios/")),
          ),
          instructions: [
            "Inspect iOS bridge files before editing.",
            "Confirm exported methods/events and JS call sites still match.",
            "Stop if CocoaPods, Xcode, or Swift/Obj-C bridge errors are unclear.",
          ],
          validationCommands: ["cd ios && pod install", ...(result.hasIOSScript ? [getScriptCommand(result, "ios")] : [])],
          successCriteria: ["iOS custom bridge code builds or blockers are documented."],
          rollbackNote: "Revert iOS native bridge changes as one isolated set if validation fails.",
        }),
      );
    }
  }

  for (const area of result.migrationAreas) {
    tasks.push(createAreaTask(area, result));
  }

  if (result.astScan.deprecatedImports.length > 0) {
    tasks.push(
      createTask({
        title: "Replace Deprecated React Native Imports",
        goal: "Replace confirmed deprecated imports from react-native.",
        context: result.astScan.deprecatedImports.map(
          (item) => `${item.importName} -> ${item.replacement} in ${item.files.length} file(s).`,
        ),
        allowedChanges: ["Update imports and minimal call-site usage required by replacement packages."],
        forbiddenChanges: ["Do not change unrelated component behavior."],
        filesToInspect: result.astScan.deprecatedImports.flatMap((item) => item.files),
        instructions: [
          "Inspect each file before editing.",
          "Replace one deprecated import group at a time.",
          "Run validation after each import group if changes are non-trivial.",
        ],
        validationCommands: verificationCommands,
        successCriteria: ["No deprecated imports from react-native remain for the listed APIs."],
        rollbackNote: "Revert import replacement changes if validation fails and document the failing API.",
      }),
    );
  }

  if (result.deprecatedApiFindings.length > 0) {
    tasks.push(
      createTask({
        title: "Manually Verify Potential Legacy API References",
        goal: "Separate real deprecated API usage from modern package usage or text references.",
        context: result.deprecatedApiFindings.map(
          (finding) => `${finding.api}: ${finding.files.length} file group(s).`,
        ),
        allowedChanges: ["Update only references confirmed to be deprecated core React Native APIs."],
        forbiddenChanges: ["Do not change modern package imports just because names match.", "Do not edit copy text unless required."],
        filesToInspect: result.deprecatedApiFindings.flatMap((finding) =>
          finding.files.map((file) => file.file),
        ),
        instructions: [
          "Inspect each potential reference before editing.",
          "Treat AST deprecated imports as the source of truth for confirmed deprecated import risk.",
          "Document false positives instead of changing code unnecessarily.",
        ],
        validationCommands: verificationCommands,
        successCriteria: ["Potential references are classified as confirmed usage or false positives."],
        rollbackNote: "Revert any change made to a reference that turns out to be modern usage or plain text.",
      }),
    );
  }

  if (!result.hasTypecheckScript || !result.hasLintScript || !result.hasTestScript) {
    tasks.push(
      createTask({
        title: "Add Or Document Missing Verification Scripts",
        goal: "Ensure migration validation commands are available or explicitly documented.",
        context: [
          `Typecheck script: ${result.hasTypecheckScript ? "present" : "missing"}.`,
          `Lint script: ${result.hasLintScript ? "present" : "missing"}.`,
          `Test script: ${result.hasTestScript ? "present" : "missing"}.`,
        ],
        allowedChanges: ["Add minimal package.json scripts only if the underlying tooling already exists."],
        forbiddenChanges: ["Do not add new tooling packages unless explicitly required and justified."],
        filesToInspect: ["package.json", "tsconfig.json", ".eslintrc*", "eslint.config.*", "jest.config.*"],
        instructions: [
          "Inspect existing tooling before editing package.json.",
          "Prefer documenting commands when tooling is absent.",
          "If adding a script, run it and document the result.",
        ],
        validationCommands: verificationCommands,
        successCriteria: ["Verification commands are available or missing prerequisites are documented."],
        rollbackNote: "Revert package.json script changes if commands are invalid or unsupported.",
      }),
    );
  }

  tasks.push(
    createTask({
      title: "Final Verification",
      goal: "Run final verification after all staged migration changes are complete.",
      context: [
        `Recommended engagement: ${result.upgradeRecommendation.strategy}.`,
        "Final verification should happen after each upgrade stage and after the final target is reached.",
      ],
      allowedChanges: ["Fix only small issues discovered by final validation."],
      forbiddenChanges: ["Do not start new feature work.", "Do not hide failing checks."],
      filesToInspect: ["package.json", "report.md", "audit-result.json", "migration-tasks.md"],
      instructions: [
        "Run all available validation commands.",
        "Verify Android and iOS builds if native folders exist.",
        "Prepare a short verification report listing passed checks, failed checks, and residual risks.",
      ],
      validationCommands: verificationCommands,
      successCriteria: [
        "All available checks pass or blockers are documented with exact errors.",
        "No unrelated changes are included.",
        "A verification summary is ready for review.",
      ],
      rollbackNote: "If final verification fails, revert the smallest failing change set and rerun checks.",
    }),
  );

  return `# Codex Migration Task Plan\n\nProject: **${result.projectName}**\n\nThis plan turns the audit into small Codex-ready migration prompts. Paste one task at a time into Codex and complete validation before moving to the next task.\n\n${tasks
    .map((task, index) => renderTask(task, index + 1))
    .join("\n\n")}`;
}
