import webPush from "web-push";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(
    "mailto:admin@smartparking.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export async function subscribe(req, res) {
  try {
    const subscription = req.body;
    const userId = req.user?.id;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: "Invalid subscription" });
    }

    console.log(`📱 User ${userId || 'guest'} subscribed to push notifications`);

    res.status(201).json({
      message: "Subscribed to push notifications",
      ok: true,
    });
  } catch (error) {
    console.error("❌ Subscribe error:", error);
    res.status(500).json({ message: "Failed to subscribe" });
  }
}

export async function testNotification(req, res) {
  try {
    res.json({ message: "Notification feature available" });
  } catch (error) {
    console.error("❌ Test notification error:", error);
    res.status(500).json({ message: "Failed to send test notification" });
  }
}

export async function broadcastNotification(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { title, body, url } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: "title and body required" });
    }

    res.json({
      message: "Notification broadcast initiated",
      payload: { title, body, url: url || "/" },
    });
  } catch (error) {
    console.error("❌ Broadcast notification error:", error);
    res.status(500).json({ message: "Failed to broadcast notification" });
  }
}
