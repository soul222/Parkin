import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// Import services
import { initWebSocketServer } from "./services/websocketService.js";
import { startGRPCServer } from "./services/grpcService.js";

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const GRPC_PORT = process.env.GRPC_PORT || 50051;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ============================================
// STATIC FILES (PWA)
// ============================================
app.use(express.static(path.join(__dirname, "../public")));

// ============================================
// API ROUTES
// ============================================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Smart Parking System API",
    version: "2.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      vehicles: "/api/vehicles",
      settings: "/api/settings",
      notifications: "/api/notifications",
      websocket: "/ws",
    },
  });
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// ============================================
// HTTP + WEBSOCKET SERVER
// ============================================
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

// Initialize WebSocket handlers
initWebSocketServer(wss);

// ============================================
// START SERVERS
// ============================================
server.listen(PORT, () => {
  console.log("===========================================");
  console.log("🚀 Smart Parking System - Backend Server");
  console.log("===========================================");
  console.log(`📡 HTTP Server: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("===========================================");
});

// Start gRPC server for YOLO client
startGRPCServer(GRPC_PORT).then(() => {
  console.log(`🔧 gRPC Server: localhost:${GRPC_PORT}`);
  console.log("===========================================");
}).catch((err) => {
  console.error("❌ Failed to start gRPC server:", err);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on("SIGINT", () => {
  console.log("\n⚠️  Shutting down gracefully...");
  server.close(() => {
    console.log("✅ HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("\n⚠️  SIGTERM received, shutting down...");
  server.close(() => {
    console.log("✅ HTTP server closed");
    process.exit(0);
  });
});

export default app;