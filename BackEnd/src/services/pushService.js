import webpush from "web-push";
import { supabaseService } from "../config/supabase.js";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

let lastFullPushAt = 0;
const COOLDOWN_MS = 5 * 60 * 1000;

export async function pushParkingFullToAll(message) {
  const now = Date.now();
  if (now - lastFullPushAt < COOLDOWN_MS) return;
  lastFullPushAt = now;

  const { data: subs, error } = await supabaseService
    .from("push_subscriptions")
    .select("endpoint,p256dh,auth");

  if (error) throw new Error(error.message);
  if (!subs?.length) return;

  const payload = JSON.stringify({
    title: "⚠️ Parkir Penuh",
    body: message,
    url: "/home"
  });

  for (const s of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload
      );
    } catch (e) {
      const code = e?.statusCode;
      if (code === 404 || code === 410) {
        await supabaseService.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
      }
    }
  }
}
