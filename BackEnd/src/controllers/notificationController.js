import webPush from "web-push";
import { supabaseService } from "../config/supabase.js";

// Setup Web Push
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(
    "mailto:admin@smartparking.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}


// SUBSCRIBE TO PUSH NOTIFICATIONS
export async function subscribe(req, res) {
  try {
    const subscription = req.body;
    const userId = req.user?.id;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: "Invalid subscription" });
    }

    // Save subscription to database
    if (userId) {
      console.log(`User ${userId} subscribed to push notifications`);
    }

    res.status(201).json({
      message: "Subscribed to push notifications",
      ok: true,
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    res.status(500).json({ message: "Failed to subscribe" });
  }
}


// SEND PUSH NOTIFICATION (Internal use)
export async function sendPushNotification(subscription, payload) {
  try {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.warn("VAPID keys not configured, skipping push notification");
      return false;
    }

    await webPush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error("Send push notification error:", error);
    return false;
  }
}


// BROADCAST NOTIFICATION TO ALL SUBSCRIBED USERS
export async function broadcastNotification(req, res) {
  try {
    // Admin only
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { title, body, url } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: "title and body required" });
    }

    // Get all subscriptions from database
    // For now, we'll just acknowledge the request
    // In production, you'd query push_subscriptions table

    const payload = {
      title,
      body,
      url: url || "/",
    };

    // TODO: Iterate through subscriptions and send
    // const subscriptions = await getSubscriptionsFromDB();
    // for (const sub of subscriptions) {
    //   await sendPushNotification(sub, payload);
    // }

    res.json({
      message: "Notification broadcast initiated",
      payload,
    });
  } catch (error) {
    console.error("Broadcast notification error:", error);
    res.status(500).json({ message: "Failed to broadcast notification" });
  }
}


// TEST NOTIFICATION
export async function testNotification(req, res) {
  try {
    const subscription = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: "Invalid subscription" });
    }

    const payload = {
      title: "Test Notification",
      body: "This is a test notification from Smart Parking System",
      url: "/",
    };

    const success = await sendPushNotification(subscription, payload);

    if (success) {
      res.json({ message: "Test notification sent successfully" });
    } else {
      res.status(500).json({ message: "Failed to send test notification" });
    }
  } catch (error) {
    console.error("Test notification error:", error);
    res.status(500).json({ message: "Failed to send test notification" });
  }
}