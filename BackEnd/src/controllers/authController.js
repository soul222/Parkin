import bcrypt from "bcryptjs";
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

// export async function login(req, res) {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({ message: "Username and password required" });
//     }

//     const { data: user, error } = await supabaseService
//       .from("users")
//       .select("*")
//       .eq("username", username)
//       .single();

//     if (error || !user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const isValidPassword = await bcrypt.compare(password, user.password);
//     if (!isValidPassword) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     await supabaseService
//       .from("users")
//       .update({ status: "online" })
//       .eq("id", user.id);

//     const token = jwt.sign(
//       { id: user.id, username: user.username, role: user.role },
//       JWT_SECRET,
//       { expiresIn: JWT_EXPIRES }
//     );

//     delete user.password;

//     res.json({
//       message: "Login successful",
//       token,
//       user,
//     });
//   } catch (error) {
//     console.error("❌ Login error:", error);
//     res.status(500).json({ message: "Login failed" });
//   }
// }

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // 1. Cek User (Pastikan tidak deleted)
    const { data: user } = await supabaseService
      .from("users")
      .select("*")
      .eq("email", email)
      .is("deleted_at", null) // Filter user aktif
      .single();

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2. Cek Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Generate Token (Set 1 Hari sesuai request sebelumnya)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // 4. UPDATE STATUS JADI 'ONLINE'
    await supabaseService
      .from("users")
      .update({ status: "online", updated_at: new Date() })
      .eq("id", user.id);

    // 5. Kirim Response
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        email: user.email,
        role: user.role,
        status: "online", // Update objek return juga
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// export async function logout(req, res) {
//   try {
//     const userId = req.user?.id;

//     if (userId) {
//       await supabaseService
//         .from("users")
//         .update({ status: "offline" })
//         .eq("id", userId);
//     }

//     res.json({ message: "Logout successful" });
//   } catch (error) {
//     console.error("❌ Logout error:", error);
//     res.status(500).json({ message: "Logout failed" });
//   }
// }

export async function logout(req, res) {
  try {
    // req.user didapat dari middleware authMiddleware
    if (req.user && req.user.id) {
      // UPDATE STATUS JADI 'OFFLINE'
      await supabaseService
        .from("users")
        .update({ status: "offline", updated_at: new Date() })
        .eq("id", req.user.id);
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
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
