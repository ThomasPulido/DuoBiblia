import { Capacitor, registerPlugin } from "@capacitor/core";

const NativeExperience = registerPlugin("NativeExperience");
let webWakeLock = null;

export async function setPrayerKeepAwake(enabled) {
  if (Capacitor.isNativePlatform()) {
    try {
      await NativeExperience.setKeepAwake({ enabled: Boolean(enabled) });
      return true;
    } catch {
      // Fall through to the browser Wake Lock API when a native bridge is not available.
    }
  }
  if (!enabled) {
    try { await webWakeLock?.release(); } catch { /* already released */ }
    webWakeLock = null;
    return true;
  }
  if (!navigator.wakeLock?.request || document.hidden) return false;
  try {
    webWakeLock = await navigator.wakeLock.request("screen");
    webWakeLock.addEventListener?.("release", () => { webWakeLock = null; }, { once: true });
    return true;
  } catch {
    return false;
  }
}

export async function openNotificationSettings() {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    await NativeExperience.openNotificationSettings();
    return true;
  } catch {
    return false;
  }
}
