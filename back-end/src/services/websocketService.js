import jwt from "jsonwebtoken";
import { supabaseService } from "../config/supabase.js";
import { getParkingStats } from "./statsService.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const clients = new Map();
const offlineTimers = new Map(); // userId -> setTimeout handle (grace period)
const OFFLINE_GRACE_MS = 60 * 60 * 1000;

// Discord webhook cooldown
let lastDiscordNotifyAt = 0;
const DISCORD_COOLDOWN_MS = 5 * 60 * 1000; 


/**
 * Parse a specific cookie value from the raw "Cookie" HTTP header string.
 * @param {string} cookieHeader - raw header value, e.g. "a=1; b=2"
 * @param {string} name - cookie name to extract
 * @returns {string|null}
 */
function parseCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

export function initWebSocketServer(wss) {
  console.log("🔌 WebSocket server initialized");

  wss.on("connection", async (ws, req) => {
    console.log("New WebSocket connection");

    const url = new URL(req.url, `http://${req.headers.host}`);

    // Priority 1: HttpOnly cookie (browser clients — most secure)
    // Priority 2: URL query token (backwards compat, Postman, internal tools)
    const token =
      parseCookie(req.headers.cookie, "access_token") ||
      url.searchParams.get("token");

    let user = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { data: userData } = await supabaseService
          .from("users")
          .select("id, nama, username, email, role, status")
          .eq("id", decoded.id)
          .is("deleted_at", null)
          .single();

        if (userData) {
          user = userData;
          console.log(`Authenticated: ${user.username} (${user.role})`);

          // Cancel any pending offline timer (e.g. from a page refresh)
          if (offlineTimers.has(user.id)) {
            clearTimeout(offlineTimers.get(user.id));
            offlineTimers.delete(user.id);
            console.log(`Cancelled offline timer for ${user.username} (reconnected)`);
          }

          await supabaseService
            .from("users")
            .update({ status: "online" })
            .eq("id", user.id);
        }
      } catch (err) {
        console.warn("Invalid WebSocket token:", err.message);
      }
    }

    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    clients.set(clientId, { ws, user, connectedAt: new Date() });

    console.log(`Active clients: ${clients.size}`);

    try {
      const stats = await getParkingStats();
      ws.send(JSON.stringify({ type: "vehicle_stats", data: stats }));
    } catch (error) {
      console.error("Failed to send initial stats:", error);
    }

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`Message from ${user?.username || "guest"}:`, data.type);

        if (data.type === "ping") {
          ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
        } else if (data.type === "request_stats") {
          getParkingStats().then((stats) => {
            ws.send(JSON.stringify({ type: "vehicle_stats", data: stats }));
          }).catch((err) => console.error("Stats error:", err));
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    });

    ws.on("close", async () => {
      clients.delete(clientId);
      console.log(`Client disconnected: ${user?.username || "guest"}`);
      console.log(`Active clients: ${clients.size}`);

      if (user && user.id) {
        // Use a grace period before marking offline
        // This prevents page refreshes from briefly showing "offline"
        const timer = setTimeout(async () => {
          offlineTimers.delete(user.id);
          
          // Check if user reconnected during grace period
          const isStillConnected = Array.from(clients.values()).some(
            (c) => c.user?.id === user.id
          );

          if (!isStillConnected) {
            try {
              await supabaseService
                .from("users")
                .update({ status: 'offline' })
                .eq('id', user.id);
              console.log(`User ${user.username} marked as OFFLINE (after grace period)`);
            } catch (err) {
              console.error("Failed to update offline status:", err);
            }
          }
        }, OFFLINE_GRACE_MS);

        offlineTimers.set(user.id, timer);
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clients.delete(clientId);
    });

    ws.send(JSON.stringify({
      type: "welcome",
      message: "Connected to Smart Parking WebSocket",
      clientId,
      user: user ? { id: user.id, nama: user.nama, username: user.username, role: user.role } : null,
    }));
  });

  const heartbeatInterval = setInterval(() => {
    clients.forEach((client, clientId) => {
      if (client.ws.readyState === client.ws.OPEN) {
        client.ws.send(JSON.stringify({ type: "heartbeat", timestamp: Date.now() }));
      } else {
        clients.delete(clientId);
      }
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(heartbeatInterval);
    console.log("WebSocket server closed");
  });
}

export function broadcastToClients(message, filterFn = null) {
  let sentCount = 0;

  clients.forEach((client, clientId) => {
    if (filterFn && !filterFn(client)) {
      return;
    }

    if (client.ws.readyState === client.ws.OPEN) {
      try {
        client.ws.send(JSON.stringify(message));
        sentCount++;
      } catch (error) {
        console.error(`Failed to send to client ${clientId}:`, error);
      }
    }
  });

  if (sentCount > 0) {
    console.log(`📡 Broadcasted ${message.type} to ${sentCount} client(s)`);
  }

  // Auto-trigger Discord notification on parking_full
  if (message.type === 'parking_full') {
    sendDiscordNotification(message.message || 'Parkir sudah penuh!').catch(err => {
      console.error('Discord notify error:', err.message);
    });
  }
}

async function sendDiscordNotification(message) {
  const now = Date.now();
  if (now - lastDiscordNotifyAt < DISCORD_COOLDOWN_MS) {
    console.log('Discord notification cooldown active, skipping');
    return;
  }

  try {
    const { data: settings } = await supabaseService
      .from('settings')
      .select('discord_webhook_url')
      .single();

    const webhookUrl = settings?.discord_webhook_url;
    if (!webhookUrl) {
      console.log('No Discord webhook URL configured, skipping');
      return;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: 'PARKIN — Parkir Penuh!',
          description: message,
          color: 0xEF4444,
          thumbnail: { url: 'https://cdn-icons-png.flaticon.com/512/2913/2913112.png' },
          footer: { text: 'PARKIN Notification System' },
          timestamp: new Date().toISOString()
        }]
      })
    });

    if (response.ok) {
      lastDiscordNotifyAt = now;
      console.log('Discord notification sent');
    } else {
      console.error('Discord webhook failed:', response.status);
    }
  } catch (error) {
    console.error('Discord notification error:', error.message);
  }
}
