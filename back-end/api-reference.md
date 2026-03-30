# 📖 Spesifikasi API PARKIN

Dokumentasi ini mencakup *endpoint* API yang digunakan di dalam *smart parking system* PARKIN.
Semua koneksi sudah dilindungi otentikasi JWT berbasis *HttpOnly Cookie* kecuali *endpoint* publik (*login, register, add payload camera*).

## 🔒 Base URL
- Development: `http://localhost:3000/api`
- Production: `https://api.parkin.my.id/api`

---

## 1. Authentication (`/api/auth`)

### 1.1 Register
- **Method:** `POST`
- **Endpoint:** `/auth/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "nama": "User Name",
    "username": "user123",
    "email": "user@mail.com",
    "password": "Password123",
    "no_hp": "08123456789" // (Opsional)
  }
  ```
- **Response (201):** `{"message": "Registration successful", "user": { "id": "...", "nama": "...", "username": "...", "email": "...", "role": "admin", "status": "offline", "no_hp": "..." }}`

### 1.2 Login
- **Method:** `POST`
- **Endpoint:** `/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "username": "user123", // Bisa menggunakan email
    "password": "Password123"
  }
  ```
- **Response (200):** 
  ```json
  {
    "message": "Login successful",
    "user": { "id": "uuid", "nama": "User Name", "username": "user123", "email": "user@mail.com", "role": "admin", "status": "online" }
  }
  ```
- **Header:** `Set-Cookie: access_token=<JWT>; HttpOnly`, `Set-Cookie: refresh_token=<JWT>; HttpOnly`

### 1.3 Refresh Token
- **Method:** `POST`
- **Endpoint:** `/auth/refresh`
- **Access:** Public (Membaca session cookie *refresh_token*)
- **Response (200):** Memperbarui `Set-Cookie` *access_token* dan *refresh_token*.
- **Response (401):** Sesi kedaluwarsa.

### 1.4 Logout
- **Method:** `POST`
- **Endpoint:** `/auth/logout`
- **Access:** Protected (JWT Cookie)
- **Response (200):** Menghapus seluruh cookies sesi dan merubah status user ke "offline".

---

## 2. Vehicles (`/api/vehicle`)

### 2.1 Get Statistics
- **Method:** `GET`
- **Endpoint:** `/vehicle/stats`
- **Access:** Protected (JWT Cookie)
- **Response (200):** *(Berdasarkan RPC Supabase GetParkingStats)*
  ```json
  {
    "data": { ...stats Object }
  }
  ```

### 2.2 Get Logs
- **Method:** `GET`
- **Endpoint:** `/vehicle/logs?page=1&limit=20&vehicle_type=mobil&status=in`
- **Access:** Protected
- **Response (200):**
  ```json
  {
    "data": {
      "logs": [
        {
          "id": "uuid",
          "jenis_kendaraan": "mobil", 
          "status": "in",
          "track_id": 12,
          "confidence": 0.98,
          "created_at": "2026-03-29T10:00:00Z"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 150,
        "totalPages": 8
      }
    }
  }
  ```

### 2.3 Add External Vehicle Log (IoT/Camera)
- **Method:** `POST`
- **Endpoint:** `/vehicle/logs`
- **Access:** Internal / Public
- **Request Body:**
  ```json
  {
    "jenis_kendaraan": "mobil", // "mobil" atau "motor"
    "status": "in", // "in" atau "out"
    "track_id": 123, // (Opsional) Int
    "confidence": 0.95 // (Opsional) Float
  }
  ```
- **Response (201):** Data berhasil ditambahkan.

### 2.4 Cleanup Old Logs
- **Method:** `DELETE`
- **Endpoint:** `/vehicle/logs/cleanup?days=30`
- **Access:** Protected (Admin Role)
- **Response (200):** Menghapus data lebih lama dari parameter hari yang dikirim.

---

## ⛔ Standar Error Codes

Setiap *error* akan menghasilkan susunan JSON berikut:
```json
{
  "message": "Pesan deskripsi error (Manusiawi)."
}
```
- **400 Bad Request**: Input payload tidak valid atau kurang.
- **401 Unauthorized**: Cookie token tidak ditemukan (habis masa berlaku) atau rusak.
- **403 Forbidden**: Role tidak mencukupi (contoh: *Bukan Admin* mencoba menghapus logs).
- **500 Internal Server Error**: Layanan database Supabase *down* atau *unhandled exception*.
