#!/usr/bin/env python3
"""
Smart Parking System - Automated Backend Setup Script
Run this in the BackEnd directory to create all necessary files
"""

import os
import sys

def create_file(path, content):
    """Create a file with given content"""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Created: {path}")

def main():
    print("🚀 Smart Parking System - Backend Setup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('package.json'):
        print("❌ Error: package.json not found!")
        print("Please run this script in the BackEnd directory")
        sys.exit(1)
    
    # 1. Config Files
    print("\n📁 Creating config files...")
    
    create_file('src/config/supabase.js', '''import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

export function getSupabaseWithAuth(jwt) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
  });
}

export default supabaseService;
''')

    # 2. Middleware Files
    print("\n🔒 Creating middleware files...")
    
    create_file('src/middlewares/authMiddleware.js', '''import jwt from "jsonwebtoken";
import { supabaseService } from "../config/supabase.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.substring(7);

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      return res.status(401).json({ message: "Invalid token" });
    }

    const { data: user, error } = await supabaseService
      .from("users")
      .select("id, nama, username, email, role, status")
      .eq("id", decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
}

export function adminMiddleware(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    const { data: user } = await supabaseService
      .from("users")
      .select("id, nama, username, email, role, status")
      .eq("id", decoded.id)
      .single();

    if (user) {
      req.user = user;
      req.token = token;
    }

    next();
  } catch (error) {
    next();
  }
}
''')

    # 3. Controller Files
    print("\n🎮 Creating controller files...")
    
    # Auth Controller
    create_file('src/controllers/authController.js', '''import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabaseService } from "../config/supabase.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const JWT_EXPIRES = "7d";

export async function register(req, res) {
  try {
    const { nama, username, email, password } = req.body;

    if (!nama || !username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const { data: existing } = await supabaseService
      .from("users")
      .select("id")
      .or(`username.eq.${username},email.eq.${email}`)
      .single();

    if (existing) {
      return res.status(409).json({ message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabaseService
      .from("users")
      .insert({
        nama,
        username,
        email,
        password: hashedPassword,
        role: "admin",
        status: "offline",
      })
      .select("id, nama, username, email, role, status")
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "Registration successful",
      user,
    });
  } catch (error) {
    console.error("❌ Register error:", error);
    res.status(500).json({ message: error.message || "Registration failed" });
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const { data: user, error } = await supabaseService
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await supabaseService
      .from("users")
      .update({ status: "online" })
      .eq("id", user.id);

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    delete user.password;

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
}

export async function logout(req, res) {
  try {
    const userId = req.user?.id;

    if (userId) {
      await supabaseService
        .from("users")
        .update({ status: "offline" })
        .eq("id", userId);
    }

    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("❌ Logout error:", error);
    res.status(500).json({ message: "Logout failed" });
  }
}

export async function validateToken(req, res) {
  try {
    res.json({
      valid: true,
      user: req.user,
    });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
}
''')

    # Users Controller
    create_file('src/controllers/usersController.js', '''import bcrypt from "bcryptjs";
import { supabaseService } from "../config/supabase.js";

export async function getAllUsers(req, res) {
  try {
    const { data: users, error } = await supabaseService
      .from("users")
      .select("id, nama, username, email, role, status, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ data: users || [] });
  } catch (error) {
    console.error("❌ Get users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
}

export async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    const { data: user, error } = await supabaseService
      .from("users")
      .select("id, nama, username, email, role, status, created_at")
      .eq("id", userId)
      .single();

    if (error) throw error;

    res.json({ data: user });
  } catch (error) {
    console.error("❌ Get profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { nama, username, email, currentPassword, newPassword } = req.body;

    const { data: currentUser, error: fetchError } = await supabaseService
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchError) throw fetchError;

    const updates = {
      nama: nama || currentUser.nama,
      username: username || currentUser.username,
      email: email || currentUser.email,
      updated_at: new Date().toISOString(),
    };

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password required" });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, currentUser.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Current password incorrect" });
      }

      updates.password = await bcrypt.hash(newPassword, 10);
    }

    const { data: updatedUser, error: updateError } = await supabaseService
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select("id, nama, username, email, role, status, created_at")
      .single();

    if (updateError) throw updateError;

    res.json({
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("❌ Update profile error:", error);
    res.status(500).json({ message: error.message || "Failed to update profile" });
  }
}

export async function createUser(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { nama, username, email, password, role } = req.body;

    if (!nama || !username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!["admin", "security"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const { data: existing } = await supabaseService
      .from("users")
      .select("id")
      .or(`username.eq.${username},email.eq.${email}`)
      .single();

    if (existing) {
      return res.status(409).json({ message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newUser, error } = await supabaseService
      .from("users")
      .insert({
        nama,
        username,
        email,
        password: hashedPassword,
        role,
        status: "offline",
      })
      .select("id, nama, username, email, role, status, created_at")
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    console.error("❌ Create user error:", error);
    res.status(500).json({ message: error.message || "Failed to create user" });
  }
}

export async function updateUser(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;
    const { nama, username, email, role, password } = req.body;

    if (role && !["admin", "security"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (nama) updates.nama = nama;
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (password) updates.password = await bcrypt.hash(password, 10);

    const { data: updatedUser, error } = await supabaseService
      .from("users")
      .update(updates)
      .eq("id", id)
      .select("id, nama, username, email, role, status, created_at")
      .single();

    if (error) throw error;

    res.json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("❌ Update user error:", error);
    res.status(500).json({ message: error.message || "Failed to update user" });
  }
}

export async function deleteUser(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const { error } = await supabaseService
      .from("users")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("❌ Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
}
''')

    # Vehicles Controller (simplified)
    create_file('src/controllers/vehiclesController.js', '''import { supabaseService } from "../config/supabase.js";

export async function getStats(req, res) {
  try {
    const { data: settings } = await supabaseService
      .from("settings")
      .select("max_mobil, max_motor")
      .single();

    const maxMobil = settings?.max_mobil || 30;
    const maxMotor = settings?.max_motor || 30;

    const { data: logs } = await supabaseService
      .from("vehicle_logs")
      .select("jenis_kendaraan, status")
      .order("created_at", { ascending: false })
      .limit(1000);

    let mobilIn = 0, mobilOut = 0;
    let motorIn = 0, motorOut = 0;

    logs?.forEach((log) => {
      if (log.jenis_kendaraan === "mobil") {
        if (log.status === "in") mobilIn++;
        else mobilOut++;
      } else if (log.jenis_kendaraan === "motor") {
        if (log.status === "in") motorIn++;
        else motorOut++;
      }
    });

    const mobilTerisi = Math.max(0, mobilIn - mobilOut);
    const motorTerisi = Math.max(0, motorIn - motorOut);

    const stats = {
      mobil: {
        terisi: mobilTerisi,
        tersedia: Math.max(0, maxMobil - mobilTerisi),
        max_capacity: maxMobil,
        count_in: mobilIn,
        count_out: mobilOut,
        is_full: mobilTerisi >= maxMobil,
      },
      motor: {
        terisi: motorTerisi,
        tersedia: Math.max(0, maxMotor - motorTerisi),
        max_capacity: maxMotor,
        count_in: motorIn,
        count_out: motorOut,
        is_full: motorTerisi >= maxMotor,
      },
      total: {
        terisi: mobilTerisi + motorTerisi,
        tersedia: Math.max(0, (maxMobil + maxMotor) - (mobilTerisi + motorTerisi)),
        max_capacity: maxMobil + maxMotor,
        is_full: (mobilTerisi + motorTerisi) >= (maxMobil + maxMotor),
      },
    };

    res.json({ data: stats });
  } catch (error) {
    console.error("❌ Get stats error:", error);
    res.status(500).json({ message: "Failed to get stats" });
  }
}

export async function getLogs(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      vehicle_type,
      status,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseService
      .from("vehicle_logs")
      .select("*", { count: "exact" });

    if (vehicle_type) {
      query = query.eq("jenis_kendaraan", vehicle_type);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: logs, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      data: {
        logs: logs || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error("❌ Get logs error:", error);
    res.status(500).json({ message: "Failed to get logs" });
  }
}

export async function addLog(req, res) {
  try {
    const { jenis_kendaraan, status, track_id } = req.body;

    if (!jenis_kendaraan || !status) {
      return res.status(400).json({ message: "jenis_kendaraan and status required" });
    }

    const { data: log, error } = await supabaseService
      .from("vehicle_logs")
      .insert({
        jenis_kendaraan,
        status,
        track_id: track_id || null,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "Log added successfully",
      data: log,
    });
  } catch (error) {
    console.error("❌ Add log error:", error);
    res.status(500).json({ message: "Failed to add log" });
  }
}

export async function deleteOldLogs(req, res) {
  try {
    const { days = 30 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const { error } = await supabaseService
      .from("vehicle_logs")
      .delete()
      .lt("created_at", cutoffDate.toISOString());

    if (error) throw error;

    res.json({ message: `Logs older than ${days} days deleted` });
  } catch (error) {
    console.error("❌ Delete old logs error:", error);
    res.status(500).json({ message: "Failed to delete old logs" });
  }
}
''')

    # Settings Controller (simplified)
    create_file('src/controllers/settingsController.js', '''import { supabaseService } from "../config/supabase.js";

export async function getSettings(req, res) {
  try {
    const { data: settings, error } = await supabaseService
      .from("settings")
      .select("*")
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (!settings) {
      return res.json({
        data: {
          max_mobil: 30,
          max_motor: 30,
          stream_url: "",
          stream_type: "youtube",
          line_position: 0.6,
        },
      });
    }

    res.json({ data: settings });
  } catch (error) {
    console.error("❌ Get settings error:", error);
    res.status(500).json({ message: "Failed to get settings" });
  }
}

export async function updateSettings(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const {
      max_mobil,
      max_motor,
      stream_url,
      stream_type,
      line_position,
    } = req.body;

    if (stream_type && !["youtube", "rtsp"].includes(stream_type)) {
      return res.status(400).json({ message: "Invalid stream_type" });
    }

    if (line_position && (line_position < 0.1 || line_position > 0.9)) {
      return res.status(400).json({ message: "line_position must be between 0.1 and 0.9" });
    }

    const { data: existing } = await supabaseService
      .from("settings")
      .select("id")
      .single();

    const updates = {
      ...(max_mobil && { max_mobil: parseInt(max_mobil) }),
      ...(max_motor && { max_motor: parseInt(max_motor) }),
      ...(stream_url !== undefined && { stream_url }),
      ...(stream_type && { stream_type }),
      ...(line_position && { line_position: parseFloat(line_position) }),
      updated_at: new Date().toISOString(),
      updated_by: req.user.id,
    };

    let result;
    if (existing) {
      const { data, error } = await supabaseService
        .from("settings")
        .update(updates)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabaseService
        .from("settings")
        .insert({
          ...updates,
          max_mobil: max_mobil || 30,
          max_motor: max_motor || 30,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    res.json({
      message: "Settings updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Update settings error:", error);
    res.status(500).json({ message: error.message || "Failed to update settings" });
  }
}
''')

    # Notifications Controller (simplified)
    create_file('src/controllers/notificationsController.js', '''import webPush from "web-push";

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
''')

    print("\n✅ All controllers created!")
    
    # 4. Routes Files  
    print("\n🛣️  Creating routes files...")
    
    create_file('src/routes/authRoutes.js', '''import express from "express";
import {
  register,
  login,
  logout,
  validateToken,
} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.get("/validate", authMiddleware, validateToken);

export default router;
''')

    create_file('src/routes/userRoutes.js', '''import express from "express";
import {
  getAllUsers,
  getProfile,
  updateProfile,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/usersController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAllUsers);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/", authMiddleware, createUser);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);

export default router;
''')

    create_file('src/routes/vehicleRoutes.js', '''import express from "express";
import {
  getStats,
  getLogs,
  addLog,
  deleteOldLogs,
} from "../controllers/vehiclesController.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/stats", authMiddleware, getStats);
router.get("/logs", authMiddleware, getLogs);
router.post("/logs", addLog);
router.delete("/logs/cleanup", authMiddleware, adminMiddleware, deleteOldLogs);

export default router;
''')

    create_file('src/routes/settingsRoutes.js', '''import express from "express";
import {
  getSettings,
  updateSettings,
} from "../controllers/settingsController.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getSettings);
router.put("/", authMiddleware, adminMiddleware, updateSettings);

export default router;
''')

    create_file('src/routes/notificationRoutes.js', '''import express from "express";
import {
  subscribe,
  broadcastNotification,
  testNotification,
} from "../controllers/notificationsController.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/subscribe", subscribe);
router.post("/test", testNotification);
router.post("/broadcast", authMiddleware, adminMiddleware, broadcastNotification);

export default router;
''')

    print("\n✅ All routes created!")
    
    # 5. Services (Simplified - without gRPC for now)
    print("\n⚙️  Creating services...")
    
    create_file('src/services/websocketService.js', '''import jwt from "jsonwebtoken";
import { supabaseService } from "../config/supabase.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const clients = new Map();

export function initWebSocketServer(wss) {
  console.log("🔌 WebSocket server initialized");

  wss.on("connection", async (ws, req) => {
    console.log("📱 New WebSocket connection");

    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    let user = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { data: userData } = await supabaseService
          .from("users")
          .select("id, nama, username, email, role, status")
          .eq("id", decoded.id)
          .single();

        if (userData) {
          user = userData;
          console.log(`✅ Authenticated: ${user.username} (${user.role})`);
        }
      } catch (err) {
        console.warn("⚠️  Invalid WebSocket token:", err.message);
      }
    }

    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    clients.set(clientId, { ws, user, connectedAt: new Date() });

    console.log(`📊 Active clients: ${clients.size}`);

    try {
      const stats = await getInitialStats();
      ws.send(JSON.stringify({ type: "vehicle_stats", data: stats }));
    } catch (error) {
      console.error("❌ Failed to send initial stats:", error);
    }

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`📨 Message from ${user?.username || "guest"}:`, data.type);

        if (data.type === "ping") {
          ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
        } else if (data.type === "request_stats") {
          getInitialStats().then((stats) => {
            ws.send(JSON.stringify({ type: "vehicle_stats", data: stats }));
          });
        }
      } catch (error) {
        console.error("❌ Failed to parse WebSocket message:", error);
      }
    });

    ws.on("close", () => {
      clients.delete(clientId);
      console.log(`❌ Client disconnected: ${user?.username || "guest"}`);
      console.log(`📊 Active clients: ${clients.size}`);
    });

    ws.on("error", (error) => {
      console.error("❌ WebSocket error:", error);
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
    console.log("🔌 WebSocket server closed");
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
        console.error(`❌ Failed to send to client ${clientId}:`, error);
      }
    }
  });

  if (sentCount > 0) {
    console.log(`📡 Broadcasted ${message.type} to ${sentCount} client(s)`);
  }
}

async function getInitialStats() {
  const { data: settings } = await supabaseService
    .from("settings")
    .select("max_mobil, max_motor")
    .single();

  const maxMobil = settings?.max_mobil || 30;
  const maxMotor = settings?.max_motor || 30;

  const { data: logs } = await supabaseService
    .from("vehicle_logs")
    .select("jenis_kendaraan, status")
    .order("created_at", { ascending: false })
    .limit(1000);

  let mobilIn = 0, mobilOut = 0, motorIn = 0, motorOut = 0;

  logs?.forEach((log) => {
    if (log.jenis_kendaraan === "mobil") {
      if (log.status === "in") mobilIn++;
      else mobilOut++;
    } else if (log.jenis_kendaraan === "motor") {
      if (log.status === "in") motorIn++;
      else motorOut++;
    }
  });

  const mobilTerisi = Math.max(0, mobilIn - mobilOut);
  const motorTerisi = Math.max(0, motorIn - motorOut);

  return {
    mobil: {
      terisi: mobilTerisi,
      tersedia: Math.max(0, maxMobil - mobilTerisi),
      max_capacity: maxMobil,
      count_in: mobilIn,
      count_out: mobilOut,
      is_full: mobilTerisi >= maxMobil,
    },
    motor: {
      terisi: motorTerisi,
      tersedia: Math.max(0, maxMotor - motorTerisi),
      max_capacity: maxMotor,
      count_in: motorIn,
      count_out: motorOut,
      is_full: motorTerisi >= maxMotor,
    },
    total: {
      terisi: mobilTerisi + motorTerisi,
      tersedia: Math.max(0, maxMobil + maxMotor - (mobilTerisi + motorTerisi)),
      max_capacity: maxMobil + maxMotor,
      is_full: mobilTerisi + motorTerisi >= maxMobil + maxMotor,
    },
  };
}
''')

    create_file('src/services/grpcService.js', '''export async function startGRPCServer(port = 50051) {
  console.log(`ℹ️  gRPC server not started (optional feature)`);
  console.log(`   To enable: Install @grpc/grpc-js and @grpc/proto-loader`);
  return Promise.resolve();
}
''')

    print("\n✅ All service files created!")
    
    # 6. Check/create .env
    print("\n🔐 Checking .env file...")
    if not os.path.exists('.env'):
        print("⚠️  .env file not found. Creating template...")
        create_file('.env', '''# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this

# Server Configuration
PORT=3000
GRPC_PORT=50051
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173

# Web Push (Optional)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
''')
        print("⚠️  IMPORTANT: Edit .env with your actual Supabase credentials!")
    else:
        print("✅ .env file already exists")
    
    print("\n" + "=" * 50)
    print("✅ Backend setup complete!")
    print("=" * 50)
    print("\n📝 Next steps:")
    print("1. Edit .env with your Supabase credentials")
    print("   Get them from: https://supabase.com/dashboard/project/_/settings/api")
    print("\n2. Run SQL script in Supabase SQL Editor:")
    print("   - Copy SQL from the artifact: fixed_rls_policies")
    print("   - Paste in Supabase Dashboard → SQL Editor")
    print("   - Execute")
    print("\n3. Start the backend:")
    print("   npm run dev")
    print("\n4. Test the endpoints:")
    print("   curl http://localhost:3000/health")
    print("\n🎉 Happy coding!")

if __name__ == "__main__":
    main()