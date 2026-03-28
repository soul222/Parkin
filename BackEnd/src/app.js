import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { WebSocketServer } from "ws";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables first
dotenv.config();

// Import routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// Import services
import { initWebSocketServer, broadcastToClients } from "./services/websocketService.js";
import { startGrpcServer } from "./grpc/server.js";

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;


// SECURITY MIDDLEWARE
// HTTP security headers (CSP, HSTS, X-Frame-Options, etc.)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || "http://localhost:5173"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Needed for some resource loading
}));


// RATE LIMITING
/** General API rate limiter: 100 req per 15 min per IP */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

/** Auth rate limiter: 10 login attempts per 15 min per IP */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later." },
  skipSuccessfulRequests: true, // Don't count successful logins
});


// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true, // Required for HttpOnly cookies
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// REQUEST LOGGING (only in development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}


// STATIC FILES (PWA)
app.use(express.static(path.join(__dirname, "../public")));


// API ROUTES (with rate limiting)
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", apiLimiter, userRoutes);
app.use("/api/vehicles", apiLimiter, vehicleRoutes);
app.use("/api/settings", apiLimiter, settingsRoutes);
app.use("/api/notifications", apiLimiter, notificationRoutes);

// Health check (no rate limit — used by uptime monitors)
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), uptime: process.uptime() });
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


// ERROR HANDLING
// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});


// HTTP + WEBSOCKET SERVER
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });
initWebSocketServer(wss);


// START SERVERS
server.listen(PORT, () => {
  console.log("===========================================");
  console.log("🚀 Smart Parking System — Backend Server");
  console.log("===========================================");
  console.log(`📡 HTTP  : http://localhost:${PORT}`);
  console.log(`🔌 WS    : ws://localhost:${PORT}/ws`);
  console.log(`🌍 Mode  : ${process.env.NODE_ENV || "development"}`);
  console.log("===========================================");
});

// Start gRPC server for YOLO client
try {
  startGrpcServer({ broadcast: broadcastToClients });
} catch (err) {
  console.error("❌ Failed to start gRPC server:", err);
}


// GRACEFUL SHUTDOWN
function gracefulShutdown(signal) {
  console.log(`\n⚠️  ${signal} received, shutting down gracefully...`);
  server.close(() => {
    console.log("✅ HTTP server closed");
    process.exit(0);
  });
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

export default app;