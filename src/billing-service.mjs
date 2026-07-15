import { Browser } from "@capacitor/browser";

export const BOLD_CHECKOUT_URL = "https://checkout.bold.co/payment/LNK_84NNU7YDX9";
export const externalBillingEnabled = import.meta.env?.VITE_EXTERNAL_BILLING_ENABLED !== "false";

export async function openBoldCheckout() {
  if (!externalBillingEnabled) throw new Error("EXTERNAL_BILLING_DISABLED");
  await Browser.open({ url: BOLD_CHECKOUT_URL, presentationStyle: "popover" });
}
