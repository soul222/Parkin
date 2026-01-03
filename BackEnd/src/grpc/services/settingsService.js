import grpc from "@grpc/grpc-js";
import { supabase } from "../../config/supabase.js";

const watchers = new Map(); // watcherId -> call

export const settingsService = {
  GetSettings: async (call, callback) => {
    try {
      const { data: s, error } = await supabase
        .from("settings")
        .select("*")
        .limit(1)
        .single();

      if (error) throw error;

      callback(null, toProtoSettings(s));
    } catch (e) {
      callback({ code: grpc.status.INTERNAL, message: e.message });
    }
  },

  UpdateSettings: async (call, callback) => {
    try {
      const req = call.request;

      // ambil id kalau kosong
      let settingsId = req.id;
      if (!settingsId) {
        const { data: row, error } = await supabase
          .from("settings")
          .select("id")
          .limit(1)
          .single();
        if (error) throw error;
        settingsId = row.id;
      }

      const updateData = {
        updated_at: new Date()
      };

      // proto default bisa 0/empty, jadi pakai guard
      if (req.max_mobil > 0) updateData.max_mobil = req.max_mobil;
      if (req.max_motor > 0) updateData.max_motor = req.max_motor;
      if (typeof req.stream_url === "string") updateData.stream_url = req.stream_url;
      if (typeof req.stream_type === "string" && req.stream_type) updateData.stream_type = req.stream_type;
      if (typeof req.line_position === "number" && req.line_position > 0) updateData.line_position = req.line_position;

      const { data: updated, error } = await supabase
        .from("settings")
        .update(updateData)
        .eq("id", settingsId)
        .select("*")
        .single();

      if (error) throw error;

      // broadcast to watchers (YOLO clients)
      broadcastSettings(updated);

      callback(null, {
        success: true,
        message: "Settings updated successfully",
        settings: toProtoSettings(updated)
      });
    } catch (e) {
      callback({ code: grpc.status.INTERNAL, message: e.message });
    }
  },

  StreamSettingsUpdates: async (call) => {
    const watcherId = `watcher_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    watchers.set(watcherId, call);
    console.log(`⚙️ Settings watcher connected: ${watcherId}`);

    // kirim initial settings
    try {
      const { data: s, error } = await supabase
        .from("settings")
        .select("*")
        .limit(1)
        .single();

      if (!error && s) {
        call.write(toProtoSettings(s));
      }
    } catch (e) {
      // kalau gagal initial, tetap biarkan stream hidup
      console.error("initial settings error:", e.message);
    }

    const cleanup = () => {
      if (watchers.has(watcherId)) watchers.delete(watcherId);
      try { call.end(); } catch {}
      console.log(`⚙️ Settings watcher disconnected: ${watcherId}`);
    };

    call.on("cancelled", cleanup);
    call.on("close", cleanup);
    call.on("error", cleanup);
  }
};

function toProtoSettings(s) {
  return {
    id: s.id,
    max_mobil: s.max_mobil ?? 30,
    max_motor: s.max_motor ?? 30,
    stream_url: s.stream_url ?? "",
    stream_type: s.stream_type ?? "youtube",
    line_position: typeof s.line_position === "number" ? s.line_position : 0.6,
    updated_at: new Date(s.updated_at || Date.now()).getTime()
  };
}

function broadcastSettings(updatedRow) {
  const payload = toProtoSettings(updatedRow);

  watchers.forEach((call, watcherId) => {
    try {
      call.write(payload);
    } catch (e) {
      console.error(`broadcast to ${watcherId} failed:`, e.message);
      watchers.delete(watcherId);
    }
  });
}
