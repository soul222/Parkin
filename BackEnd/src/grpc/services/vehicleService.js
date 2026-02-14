import { supabaseService } from "../../config/supabase.js";
import { getVehicleStats } from "../../services/statsService.js";
import { pushParkingFullToAll } from "../../services/pushService.js";

// wsBroadcaster akan di-inject dari app.js (biar gampang)
export function makeVehicleService(wsBroadcaster) {
  return {
    StreamDetections: (call, callback) => {
      call.on("data", async (detection) => {
        try {
          // simpan log
          const { error } = await supabaseService.from("vehicle_logs").insert([
            {
              jenis_kendaraan: detection.vehicle_type,
              status: detection.direction,
              track_id: detection.track_id || null,
            },
          ]);

          if (error) console.error("DB insert error:", error.message);

          // hitung stats terbaru
          const stats = await getVehicleStats();

          // Level 1: broadcast realtime ke dashboard (WS)
          wsBroadcaster.broadcast({
            type: "vehicle_log_new",
            data: {
              jenis_kendaraan: detection.vehicle_type,
              status: detection.direction,
              track_id: detection.track_id,
              created_at: new Date().toISOString(),
            },
          });

          // Broadcast updated stats so dashboard updates in real-time
          wsBroadcaster.broadcast({
            type: "vehicle_stats",
            data: stats,
          });

          // Level 1: in-app alert message
          if (stats.total.is_full) {
            wsBroadcaster.broadcast({
              type: "parking_full",
              message: "PARKIR PENUH!",
            });
          }

          // Level 2: push notif HP
          if (stats.total.is_full) {
            const msg = `Mobil terisi ${stats.mobil.terisi}/${stats.mobil.max_capacity}, Motor terisi ${stats.motor.terisi}/${stats.motor.max_capacity}`;
            pushParkingFullToAll(msg).catch(console.error);
          }
        } catch (e) {
          console.error("process detection error:", e.message);
        }
      });

      call.on("end", async () => {
        const stats = await getVehicleStats();
        callback(null, {
          success: true,
          message: "Stream ended",
          current_stats: stats,
        });
      });

      call.on("error", (e) => console.error("Stream error:", e.message));
    },
  };
}
