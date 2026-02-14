-- Step 1
-- ==========================================
-- 1. SETUP EKSTENSI & FUNGSI BANTUAN
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. BUAT TABLE UTAMA
-- ==========================================

-- Table Users (dengan Soft Delete)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Ingat, ini harus di-hash (bcrypt) dari backend
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'security')),
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- Kolom Soft Delete
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table Vehicle Logs
CREATE TABLE vehicle_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jenis_kendaraan VARCHAR(20) NOT NULL CHECK (jenis_kendaraan IN ('mobil', 'motor')),
    status VARCHAR(10) NOT NULL CHECK (status IN ('in', 'out')),
    track_id INTEGER, -- Opsional, untuk tracking ID dari YOLO/CCTV
    confidence FLOAT, -- Opsional, tingkat akurasi AI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table Settings
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    max_mobil INTEGER DEFAULT 30,
    max_motor INTEGER DEFAULT 30,
    stream_url TEXT,
    stream_type VARCHAR(20) DEFAULT 'youtube' CHECK (stream_type IN ('youtube', 'rtsp')),
    line_position DECIMAL(3,2) DEFAULT 0.6,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- ==========================================
-- 3. INDEXING (OPTIMASI PERFORMA)
-- ==========================================
CREATE INDEX idx_vehicle_logs_created_at ON vehicle_logs(created_at DESC);
CREATE INDEX idx_vehicle_logs_type_status ON vehicle_logs(jenis_kendaraan, status);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_deleted_at ON users(deleted_at); -- Agar filter user aktif cepat

-- ==========================================
-- 4. RPC FUNCTION (LOGIKA HITUNG CEPAT)
-- ==========================================
-- Fungsi ini akan dipanggil Backend untuk mendapatkan statistik instan
CREATE OR REPLACE FUNCTION get_parking_stats()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_max_mobil int;
  v_max_motor int;
  v_mobil_in bigint;
  v_mobil_out bigint;
  v_motor_in bigint;
  v_motor_out bigint;
BEGIN
  -- Ambil Setting Kapasitas
  SELECT max_mobil, max_motor INTO v_max_mobil, v_max_motor FROM settings LIMIT 1;

  -- Hitung Mobil (Hanya ambil log yg relevan)
  SELECT 
    count(*) FILTER (WHERE status = 'in'),
    count(*) FILTER (WHERE status = 'out')
  INTO v_mobil_in, v_mobil_out
  FROM vehicle_logs WHERE jenis_kendaraan = 'mobil';
  
  -- Hitung Motor
  SELECT 
    count(*) FILTER (WHERE status = 'in'),
    count(*) FILTER (WHERE status = 'out')
  INTO v_motor_in, v_motor_out
  FROM vehicle_logs WHERE jenis_kendaraan = 'motor';

  -- Return format JSON yang siap dipakai Frontend
  RETURN json_build_object(
    'mobil', json_build_object(
      'terisi', GREATEST(0, v_mobil_in - v_mobil_out),
      'max_capacity', COALESCE(v_max_mobil, 30),
      'count_in', v_mobil_in,
      'count_out', v_mobil_out
    ),
    'motor', json_build_object(
      'terisi', GREATEST(0, v_motor_in - v_motor_out),
      'max_capacity', COALESCE(v_max_motor, 30),
      'count_in', v_motor_in,
      'count_out', v_motor_out
    )
  );
END;
$$;

-- ==========================================
-- 5. ROW LEVEL SECURITY (KEAMANAN DATA)
-- ==========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policy Users
CREATE POLICY "Public register" ON users FOR INSERT WITH CHECK (true);

CREATE POLICY "Users select policy" ON users FOR SELECT USING (
  (select auth.jwt() ->> 'role') = 'admin' OR 
  (select auth.jwt() ->> 'id') = id::text
);

CREATE POLICY "Users update policy" ON users FOR UPDATE USING (
  (select auth.jwt() ->> 'role') = 'admin' OR
  (select auth.jwt() ->> 'id') = id::text
);

CREATE POLICY "Admin delete users" ON users FOR DELETE USING (
  (select auth.jwt() ->> 'role') = 'admin'
);

-- Policy Vehicle Logs & Settings (Semua user login bisa baca)
CREATE POLICY "Auth users read logs" ON vehicle_logs FOR SELECT USING ((select auth.uid()) IS NOT NULL);
CREATE POLICY "System insert logs" ON vehicle_logs FOR INSERT WITH CHECK (true); -- Terbuka untuk API Key / Service Role
CREATE POLICY "Auth users read settings" ON settings FOR SELECT USING ((select auth.uid()) IS NOT NULL);
CREATE POLICY "Admin manage settings" ON settings FOR ALL USING ((select auth.jwt() ->> 'role') = 'admin');

-- ==========================================
-- 6. SEED DATA (DATA AWAL)
-- ==========================================
-- Insert Default Settings
INSERT INTO settings (max_mobil, max_motor) VALUES (30, 30);

-- Insert Default Admin (Password: admin123 -> Hashed)
-- Hash ini mungkin tidak cocok dengan backend Anda (tergantung salt bcrypt). 
-- Sebaiknya buat user lewat API Register / Postman setelah backend jalan.
-- INSERT INTO users (nama, username, email, password, role, status) 
-- VALUES ('Super Admin', 'admin', 'admin@parkir.com', '$2a$10$X7...', 'admin', 'offline');


-- Step 2

-- Table Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'security')),
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table Vehicle Logs
CREATE TABLE vehicle_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jenis_kendaraan VARCHAR(20) NOT NULL CHECK (jenis_kendaraan IN ('mobil', 'motor')),
    status VARCHAR(10) NOT NULL CHECK (status IN ('in', 'out')),
    track_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table Settings
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    max_mobil INTEGER DEFAULT 30,
    max_motor INTEGER DEFAULT 30,
    stream_url TEXT,
    stream_type VARCHAR(20) DEFAULT 'youtube' CHECK (stream_type IN ('youtube', 'rtsp')),
    line_position DECIMAL(3,2) DEFAULT 0.6,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- Insert default settings
INSERT INTO settings (max_mobil, max_motor) VALUES (30, 30);

-- Indexes
CREATE INDEX idx_vehicle_logs_created_at ON vehicle_logs(created_at DESC);
CREATE INDEX idx_users_username ON users(username);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Users: Admin full access, Security read-only
CREATE POLICY "Admin

full access on users"
ON users FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Security read own profile"
ON users FOR SELECT
USING (auth.jwt() ->> 'id' = id::text OR auth.jwt() ->> 'role' = 'admin');
-- Vehicle Logs: All authenticated users can read
CREATE POLICY "Authenticated users can read vehicle_logs"
ON vehicle_logs FOR SELECT
USING (true);
CREATE POLICY "System can insert vehicle_logs"
ON vehicle_logs FOR INSERT
WITH CHECK (true);
-- Settings: Admin full access, others read-only
CREATE POLICY "Admin full access on settings"
ON settings FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "All can read settings"
ON settings FOR SELECT
USING (true);

-- Additional recommended indexes:
CREATE INDEX idx_vehicle_logs_jenis ON vehicle_logs(jenis_kendaraan);
CREATE INDEX idx_vehicle_logs_status ON vehicle_logs(status);

-- Step 3
-- Add line_orientation column if not exists
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS line_orientation VARCHAR(20) DEFAULT 'horizontal';

-- Update existing rows
UPDATE settings SET line_orientation = 'horizontal' WHERE line_orientation IS NULL;

-- Step 4: Notification System
-- Add phone number to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS no_hp VARCHAR(20);

-- Add Discord webhook URL to settings
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS discord_webhook_url TEXT;

-- Push subscription storage for Web Push API
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subs_user ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_endpoint ON push_subscriptions(endpoint);
