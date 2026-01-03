import { supabaseService } from "../config/supabase.js";

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
