export type PackageRule = {
  category:
    | "navigation"
    | "native-module"
    | "storage"
    | "firebase"
    | "ui"
    | "unknown";
  risk: "critical" | "high" | "medium" | "low";
  notes: string[];
  suggestedAction: string;
};

export const packageRules: Record<string, PackageRule> = {
  "react-native-gesture-handler": {
    category: "navigation",
    risk: "medium",
    notes: [
      "Often used with React Navigation.",
      "May require native setup verification after RN upgrades.",
    ],
    suggestedAction:
      "Check compatibility with current React Navigation and target React Native version.",
  },

  "react-native-screens": {
    category: "navigation",
    risk: "medium",
    notes: [
      "Tightly connected to React Navigation behavior.",
      "Native screen handling can change during upgrades.",
    ],
    suggestedAction:
      "Verify navigation behavior after upgrade on both iOS and Android.",
  },

  "react-native-vector-icons": {
    category: "ui",
    risk: "low",
    notes: [
      "Usually manageable, but fonts/linking can break during native upgrades.",
    ],
    suggestedAction: "Verify font linking and icon rendering after upgrade.",
  },

  "react-native-webview": {
    category: "native-module",
    risk: "medium",
    notes: [
      "Native module used on both iOS and Android.",
      "WebView behavior can vary by platform after upgrades.",
    ],
    suggestedAction:
      "Check WebView compatibility and manually test screens using WebView.",
  },

  "react-native-reanimated": {
    category: "native-module",
    risk: "high",
    notes: [
      "Requires Babel/plugin setup.",
      "Often has version-specific compatibility requirements.",
    ],
    suggestedAction:
      "Verify Babel config and upgrade Reanimated according to target RN version.",
  },

  "@react-native-firebase/app": {
    category: "firebase",
    risk: "high",
    notes: [
      "Firebase native modules can create iOS/Android build issues.",
      "Often requires Gradle, CocoaPods, and Google services file checks.",
    ],
    suggestedAction:
      "Check Firebase package versions, Pods, Gradle setup, and platform config files.",
  },
};
