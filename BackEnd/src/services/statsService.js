/**
 * Stats Service
 *
 * Sumber tunggal (Single Source of Truth) untuk kalkulasi statistik parkir.
 * Menggunakan Supabase RPC `get_parking_stats()` yang sudah di-optimize
 * di level database — akurat tanpa batas log.
 *
 * Digunakan oleh:
 * - websocketService.js (initial stats on WS connect)
 * - vehicleController.js (GET /api/vehicles/stats)
 */
import { supabaseService } from "../config/supabase.js";

/**
 * Ambil statistik parkir dari Supabase RPC.
 * RPC `get_parking_stats()` menghitung di DB — akurat dan performant.
 *
 * @returns {Promise<{mobil: object, motor: object, total: object}>}
 */
export async function getParkingStats() {
  const { data, error } = await supabaseService.rpc("get_parking_stats");

  if (error) throw error;

  const { mobil, motor } = data;
  const maxMobil = mobil.max_capacity;
  const maxMotor = motor.max_capacity;
  const mobilTerisi = mobil.terisi;
  const motorTerisi = motor.terisi;

  return {
    mobil: {
      terisi: mobilTerisi,
      tersedia: Math.max(0, maxMobil - mobilTerisi),
      max_capacity: maxMobil,
      count_in: mobil.count_in,
      count_out: mobil.count_out,
      is_full: mobilTerisi >= maxMobil,
    },
    motor: {
      terisi: motorTerisi,
      tersedia: Math.max(0, maxMotor - motorTerisi),
      max_capacity: maxMotor,
      count_in: motor.count_in,
      count_out: motor.count_out,
      is_full: motorTerisi >= maxMotor,
    },
    total: {
      terisi: mobilTerisi + motorTerisi,
      tersedia: Math.max(0, maxMobil + maxMotor - (mobilTerisi + motorTerisi)),
      max_capacity: maxMobil + maxMotor,
      is_full: mobilTerisi + motorTerisi >= maxMobil + maxMotor,
    },
  };
}
