import { Capacitor, registerPlugin } from "@capacitor/core";

const PremiumState = registerPlugin("PremiumState");

export async function syncNativePremiumState(premium) {
  if (Capacitor.getPlatform() !== "android") return;
  await PremiumState.setPremium({ premium: Boolean(premium) });
}
