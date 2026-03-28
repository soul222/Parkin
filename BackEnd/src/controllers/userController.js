import bcrypt from "bcryptjs";
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
    console.error("Get users error:", error);
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
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { nama, username, email, currentPassword, newPassword, no_hp } = req.body;

    if (no_hp) {
      const phoneRegex = /^[0-9]{9,15}$/;
      if (!phoneRegex.test(no_hp)) {
        return res.status(400).json({ message: "Format no handphone tidak valid (hanya angka 9-15 karakter)" });
      }
    }

    // Get current user data
    const { data: currentUser, error: fetchError } = await supabaseService
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchError) throw fetchError;

    // Prepare update data (TIDAK boleh update role!)
    const updates = {
      nama: nama || currentUser.nama,
      username: username || currentUser.username,
      email: email || currentUser.email,
      no_hp: no_hp || currentUser.no_hp,
      updated_at: new Date().toISOString(),
    };

    // Handle password change
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

    // Update profile
    const { data: updatedUser, error: updateError } = await supabaseService
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select("id, nama, username, email, role, status, no_hp, created_at")
      .single();

    if (updateError) throw updateError;

    res.json({
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
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

    // Validate role
    if (!["admin", "security"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Check if user exists
    const { data: existing } = await supabaseService
      .from("users")
      .select("id")
      .or(`username.eq.${username},email.eq.${email}`)
      .single();

    if (existing) {
      return res.status(409).json({ message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (uses service_role to bypass RLS)
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
    console.error("Create user error:", error);
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

    // Prepare updates
    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (nama) updates.nama = nama;
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (password) updates.password = await bcrypt.hash(password, 10);

    // Update user
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
    console.error("Update user error:", error);
    res.status(500).json({ message: error.message || "Failed to update user" });
  }
}

export async function deleteUser(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;

    // Prevent deleting self
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
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
}