import { createClient } from "npm:@supabase/supabase-js@2";

const encoder = new TextEncoder();
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } }
);

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

async function validBoldSignature(rawBody: string, signature: string) {
  const secret = Deno.env.get("BOLD_WEBHOOK_SECRET") || "";
  if (!secret || !signature) return false;
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const encodedBody = bytesToBase64(encoder.encode(rawBody));
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(encodedBody)));
  return safeEqual(bytesToHex(digest), signature.toLowerCase());
}

async function processApprovedSale(event: any) {
  if (event.type !== "SALE_APPROVED") return;
  const data = event.data || {};
  const reference = data.metadata?.reference || "";
  const expectedReference = Deno.env.get("BOLD_PAYMENT_REFERENCE") || "LNK_84NNU7YDX9";
  if (reference !== expectedReference) return;
  const email = String(data.payer_email || "").trim().toLowerCase();
  if (!email) return;

  const { error } = await supabase.rpc("grant_bold_premium", {
    p_event_id: String(event.id || event.subject),
    p_payment_id: String(data.payment_id || event.subject || ""),
    p_payer_email: email,
    p_payment_reference: reference,
    p_amount: data.amount?.total ?? null,
    p_currency: data.amount?.currency ?? null,
    p_payment_method: data.payment_method ?? null,
    p_status: event.type,
    p_payload: event
  });
  if (error) throw error;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const rawBody = await request.text();
  const signature = request.headers.get("x-bold-signature") || "";
  if (!await validBoldSignature(rawBody, signature)) return new Response("Invalid signature", { status: 401 });
  const event = JSON.parse(rawBody);
  EdgeRuntime.waitUntil(processApprovedSale(event));
  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "content-type": "application/json" } });
});
