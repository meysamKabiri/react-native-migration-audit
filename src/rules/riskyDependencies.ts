export const riskyDependencies: Record<string, string> = {
  "react-native-reanimated":
    "Often needs version-specific setup and Babel/plugin changes.",
  "react-native-gesture-handler":
    "Can require native linking and navigation compatibility checks.",
  "react-native-screens":
    "Commonly tied to React Navigation and native behavior changes.",
  "react-native-maps":
    "Native iOS/Android dependency. Upgrade risk is usually higher.",
  "@react-native-firebase/app":
    "Firebase native modules can create iOS/Android build issues.",
  "react-native-firebase":
    "Legacy Firebase package. Modern projects usually use @react-native-firebase/*.",
  "react-native-navigation": "Heavy native integration. Upgrade risk is high.",
  "react-native-mmkv":
    "Native module. Check compatibility with RN version and New Architecture.",
  realm:
    "Native database dependency. Can cause build/runtime migration issues.",
  "react-native-code-push":
    "Native update system. Check compatibility and maintenance status.",
  "react-native-vector-icons":
    "Common dependency, but can require font/linking fixes during upgrade.",
  "react-native-webview":
    "Native module. Usually manageable but should be checked.",
};
