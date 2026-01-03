import jwt from "jsonwebtoken";
import { supabaseService } from "../config/supabase.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

// ============================================
// AUTH MIDDLEWARE
// ============================================
export async function authMiddleware(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      return res.status(401).json({ message: "Invalid token" });
    }

    // Get user from database
    const { data: user, error } = await supabaseService
      .from("users")
      .select("id, nama, username, email, role, status")
      .eq("id", decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
}

// ============================================
// ADMIN MIDDLEWARE
// ============================================
export function adminMiddleware(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

// ============================================
// OPTIONAL AUTH (allows both authenticated and guest)
// ============================================
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(); // No token, continue as guest
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
    // Invalid token, continue as guest
    next();
  }
}