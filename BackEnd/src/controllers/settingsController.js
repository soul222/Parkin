import { supabaseService } from "../config/supabase.js";

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
