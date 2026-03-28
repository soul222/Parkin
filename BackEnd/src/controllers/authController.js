import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabaseService } from "../config/supabase.js";

// CONSTANTS
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";


const ACCESS_TOKEN_EXPIRES = "15m"; 
const REFRESH_TOKEN_EXPIRES = "7d"; 

/** Cookie options: HttpOnly prevents JS access (XSS mitigation) */
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
};

const ACCESS_COOKIE_OPTS = { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 }; // 15 min
const REFRESH_COOKIE_OPTS = {
  ...COOKIE_OPTS,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  // Restrict refresh cookie to auth route only
  path: "/api/auth", 
};

// HELPERS
/**
 * Generate access + refresh token pair for a user
 * @param {{ id: string, role: string }} user
 * @returns {{ accessToken: string, refreshToken: string }}
 */
function generateTokenPair(user) {
  const payload = { id: user.id, role: user.role };
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
  });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
  });
  return { accessToken, refreshToken };
}

/**
 * Set access + refresh tokens as HttpOnly cookies
 * @param {import('express').Response} res
 * @param {string} accessToken
 * @param {string} refreshToken
 */
function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie("access_token", accessToken, ACCESS_COOKIE_OPTS);
  res.cookie("refresh_token", refreshToken, REFRESH_COOKIE_OPTS);
}

/** Clear both auth cookies (used on logout) */
function clearAuthCookies(res) {
  res.clearCookie("access_token", { ...COOKIE_OPTS, path: "/" });
  res.clearCookie("refresh_token", { ...COOKIE_OPTS, path: "/api/auth" });
}

// REGISTER
export async function register(req, res) {
  try {
    const { nama, username, email, password, no_hp } = req.body;

    if (!nama || !username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (no_hp) {
      const phoneRegex = /^[0-9]{9,15}$/;
      if (!phoneRegex.test(no_hp)) {
        return res.status(400).json({ message: "Format no handphone tidak valid (hanya angka 9-15 karakter)" });
      }
    }

    const { data: existing } = await supabaseService
      .from("users")
      .select("id")
      .or(`username.eq.${username},email.eq.${email}`)
      .single();

    if (existing) {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
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
        no_hp: no_hp || null 
      })
      .select("id, nama, username, email, role, status, no_hp")
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Registration successful", user });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message || "Registration failed" });
  }
}

// LOGIN
export async function login(req, res) {
  try {
    const { username, email, password } = req.body;

    // Accept either username or email
    const loginField = username || email;
    if (!loginField || !password) {
      return res
        .status(400)
        .json({ message: "Username/email and password required" });
    }

    // Find user by username first, fallback to email
    let user = null;
    const { data: byUsername } = await supabaseService
      .from("users")
      .select("*")
      .eq("username", loginField)
      .is("deleted_at", null)
      .single();

    if (byUsername) {
      user = byUsername;
    } else {
      const { data: byEmail } = await supabaseService
        .from("users")
        .select("*")
        .eq("email", loginField)
        .is("deleted_at", null)
        .single();
      user = byEmail;
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate tokens & set as HttpOnly cookies
    const { accessToken, refreshToken } = generateTokenPair(user);
    setAuthCookies(res, accessToken, refreshToken);

    // Mark user online
    await supabaseService
      .from("users")
      .update({ status: "online", updated_at: new Date() })
      .eq("id", user.id);

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        email: user.email,
        role: user.role,
        status: "online",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// REFRESH TOKEN
export async function refresh(req, res) {
  try {
    const token = req.cookies?.refresh_token;

    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (err) {
      clearAuthCookies(res);
      return res.status(401).json({ message: "Refresh token invalid or expired" });
    }

    // Verify user still exists and is active
    const { data: user, error } = await supabaseService
      .from("users")
      .select("id, nama, username, email, role, status")
      .eq("id", decoded.id)
      .is("deleted_at", null)
      .single();

    if (error || !user) {
      clearAuthCookies(res);
      return res.status(401).json({ message: "User not found" });
    }

    // Issue new token pair (token rotation)
    const { accessToken, refreshToken } = generateTokenPair(user);
    setAuthCookies(res, accessToken, refreshToken);

    res.json({ message: "Token refreshed", user });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ message: "Token refresh failed" });
  }
}

// LOGOUT
export async function logout(req, res) {
  try {
    if (req.user?.id) {
      await supabaseService
        .from("users")
        .update({ status: "offline", updated_at: new Date() })
        .eq("id", req.user.id);
    }

    clearAuthCookies(res);
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Logout failed" });
  }
}

// VALIDATE TOKEN (ping endpoint for auth check)
export async function validateToken(req, res) {
  res.json({ valid: true, user: req.user });
}
