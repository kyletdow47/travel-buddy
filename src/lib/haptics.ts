// Haptics helper with graceful fallback.
// If expo-haptics is installed, these methods fire device haptics.
// If not, they silently no-op so the UI still works.

type HapticsModule = {
  impactAsync: (style: unknown) => Promise<void>;
  selectionAsync: () => Promise<void>;
  notificationAsync: (type: unknown) => Promise<void>;
  ImpactFeedbackStyle: { Light: unknown; Medium: unknown; Heavy: unknown };
  NotificationFeedbackType: { Success: unknown; Warning: unknown; Error: unknown };
};

let mod: HapticsModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  mod = require('expo-haptics') as HapticsModule;
} catch {
  mod = null;
}

export const haptics = {
  selection() {
    mod?.selectionAsync().catch(() => undefined);
  },
  light() {
    mod?.impactAsync(mod.ImpactFeedbackStyle.Light).catch(() => undefined);
  },
  medium() {
    mod?.impactAsync(mod.ImpactFeedbackStyle.Medium).catch(() => undefined);
  },
  heavy() {
    mod?.impactAsync(mod.ImpactFeedbackStyle.Heavy).catch(() => undefined);
  },
  success() {
    mod?.notificationAsync(mod.NotificationFeedbackType.Success).catch(() => undefined);
  },
  warning() {
    mod?.notificationAsync(mod.NotificationFeedbackType.Warning).catch(() => undefined);
  },
  error() {
    mod?.notificationAsync(mod.NotificationFeedbackType.Error).catch(() => undefined);
  },
};
