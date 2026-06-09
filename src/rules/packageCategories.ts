export type PackageCategoryRule = {
  category:
    | "navigation"
    | "storage"
    | "camera"
    | "bluetooth"
    | "media"
    | "auth"
    | "permissions"
    | "ui"
    | "native-module"
    | "unknown";

  risk: "critical" | "high" | "medium" | "low";
  reason: string;
  suggestedAction: string;
};

export function isBluetoothPackage(packageName: string) {
  const normalizedName = packageName.toLowerCase();

  return (
    normalizedName.includes("bluetooth") ||
    normalizedName.includes("ble-plx") ||
    normalizedName.includes("-ble") ||
    normalizedName.includes("ble-") ||
    normalizedName === "react-native-ble-plx"
  );
}

export function classifyPackage(packageName: string): PackageCategoryRule {
  if (packageName.includes("camera")) {
    return {
      category: "camera",
      risk: "high",
      reason: "Camera packages usually include native iOS/Android integration.",
      suggestedAction:
        "Review camera package compatibility with the target React Native version and verify native setup.",
    };
  }

  if (isBluetoothPackage(packageName)) {
    return {
      category: "bluetooth",
      risk: "high",
      reason:
        "Bluetooth packages usually depend on native Android/iOS APIs and permissions.",
      suggestedAction:
        "Review Bluetooth permissions, native setup, and package compatibility before upgrading.",
    };
  }

  if (packageName.includes("navigation")) {
    return {
      category: "navigation",
      risk: "medium",
      reason:
        "Navigation packages can be sensitive to React Native and gesture-handler changes.",
      suggestedAction:
        "Verify navigation behavior and related dependencies after upgrade.",
    };
  }

  if (packageName.includes("async-storage")) {
    return {
      category: "storage",
      risk: "low",
      reason:
        "Async Storage is a native package, but this modern package is the expected replacement for old core AsyncStorage.",
      suggestedAction:
        "Verify persistence behavior after upgrade, but do not treat this as deprecated core AsyncStorage.",
    };
  }

  if (packageName.includes("picker")) {
    return {
      category: "ui",
      risk: "low",
      reason: "Picker package is the modern replacement for old core Picker.",
      suggestedAction:
        "Verify picker UI behavior after upgrade, but do not treat this as deprecated core Picker.",
    };
  }

  if (packageName.includes("clipboard")) {
    return {
      category: "ui",
      risk: "low",
      reason:
        "Clipboard package is the modern replacement for old core Clipboard.",
      suggestedAction:
        "Verify clipboard behavior after upgrade, but do not treat this as deprecated core Clipboard.",
    };
  }

  if (
    packageName.includes("video") ||
    packageName.includes("media") ||
    packageName.includes("sound")
  ) {
    return {
      category: "media",
      risk: "medium",
      reason:
        "Media packages often include native playback or audio/video integrations.",
      suggestedAction:
        "Verify media playback and native configuration after upgrade.",
    };
  }

  if (
    packageName.includes("signin") ||
    packageName.includes("login") ||
    packageName.includes("fbsdk") ||
    packageName.includes("firebase")
  ) {
    return {
      category: "auth",
      risk: "medium",
      reason:
        "Authentication packages often depend on native SDKs and platform configuration.",
      suggestedAction:
        "Verify iOS/Android native SDK setup, URL schemes, Gradle config, and app credentials after upgrade.",
    };
  }

  if (packageName.includes("permission")) {
    return {
      category: "permissions",
      risk: "medium",
      reason:
        "Permission packages require platform-specific Android/iOS configuration.",
      suggestedAction:
        "Verify AndroidManifest, Info.plist, and runtime permission behavior after upgrade.",
    };
  }

  if (
    packageName.startsWith("react-native-") ||
    packageName.startsWith("@react-native-")
  ) {
    return {
      category: "native-module",
      risk: "medium",
      reason:
        "React Native package may include native code or platform-specific setup.",
      suggestedAction:
        "Check compatibility with the target React Native version and verify both platform builds.",
    };
  }

  return {
    category: "unknown",
    risk: "low",
    reason: "No specific migration category detected.",
    suggestedAction:
      "Review only if this package is involved in broken builds or runtime errors.",
  };
}
