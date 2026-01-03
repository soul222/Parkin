import { supabase } from "../config/supabase.js";

export async function getVehicleStats() {
  const { data: settings } = await supabase
    .from("settings")
    .select("max_mobil,max_motor")
    .limit(1)
    .single();

  const maxMobil = settings?.max_mobil ?? 30;
  const maxMotor = settings?.max_motor ?? 30;

  const [mobilIn, mobilOut, motorIn, motorOut] = await Promise.all([
    countLogs("mobil", "in"),
    countLogs("mobil", "out"),
    countLogs("motor", "in"),
    countLogs("motor", "out")
  ]);

  const terisiMobil = Math.max(0, mobilIn - mobilOut);
  const terisiMotor = Math.max(0, motorIn - motorOut);

  const tersediaMobil = Math.max(0, maxMobil - terisiMobil);
  const tersediaMotor = Math.max(0, maxMotor - terisiMotor);

  const totalTerisi = terisiMobil + terisiMotor;
  const totalMax = maxMobil + maxMotor;
  const totalTersedia = tersediaMobil + tersediaMotor;

  const mobilFull = terisiMobil >= maxMobil;
  const motorFull = terisiMotor >= maxMotor;

  return {
    mobil: {
      terisi: terisiMobil,
      tersedia: tersediaMobil,
      max_capacity: maxMobil,
      count_in: mobilIn,
      count_out: mobilOut,
      is_full: mobilFull
    },
    motor: {
      terisi: terisiMotor,
      tersedia: tersediaMotor,
      max_capacity: maxMotor,
      count_in: motorIn,
      count_out: motorOut,
      is_full: motorFull
    },
    total: {
      terisi: totalTerisi,
      tersedia: totalTersedia,
      max_capacity: totalMax,
      is_full: mobilFull || motorFull
    },
    timestamp: Date.now()
  };
}

async function countLogs(jenis, status) {
  const { count } = await supabase
    .from("vehicle_logs")
    .select("id", { count: "exact", head: true })
    .eq("jenis_kendaraan", jenis)
    .eq("status", status);
  return count || 0;
}
