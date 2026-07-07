// ---------------------------------------------------------------------------
// Koneksi PostgreSQL (READ-ONLY) — connection pool untuk database yogya_nomad_db
// Konfigurasi diambil dari server/.env. Semua query di aplikasi ini hanya READ.
// ---------------------------------------------------------------------------
import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

// Buat pool koneksi. Pool otomatis mengelola beberapa koneksi sekaligus,
// jadi lebih efisien daripada membuka koneksi baru di setiap request.
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'yogya_nomad_db',
  max: 10, // maksimal 10 koneksi dalam pool
  idleTimeoutMillis: 30000, // tutup koneksi idle setelah 30 detik
  connectionTimeoutMillis: 5000, // gagal jika tidak konek dalam 5 detik
})

// Tangani error tak terduga pada koneksi idle agar server tidak crash.
pool.on('error', (err) => {
  console.error('[database] Error tak terduga pada koneksi idle:', err.message)
})

// Helper query: dipakai semua route agar konsisten (async/await).
// Contoh: const { rows } = await query('SELECT * FROM destinations')
export function query(text, params) {
  return pool.query(text, params)
}

// Test koneksi ke database. Dipanggil saat server start (dan bisa dari skrip test).
// Return true jika berhasil, false jika gagal — tidak meng-crash aplikasi.
export async function testConnection() {
  try {
    const { rows } = await pool.query('SELECT NOW() AS now')
    console.log(`[database] ✅ Terhubung ke "${process.env.DB_NAME || 'yogya_nomad_db'}" — waktu server DB: ${rows[0].now}`)
    return true
  } catch (err) {
    console.error(`[database] ❌ Gagal terhubung ke database: ${err.message}`)
    return false
  }
}

export { pool }
export default pool
