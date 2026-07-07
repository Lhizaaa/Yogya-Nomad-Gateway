// ---------------------------------------------------------------------------
// Koneksi PostgreSQL (READ-ONLY) — connection pool untuk database yogya_nomad_db
// Konfigurasi diambil dari server/.env. Semua query di aplikasi ini hanya READ.
// ---------------------------------------------------------------------------
import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

console.log('[database] DEBUG: DATABASE_URL =', process.env.DATABASE_URL ? '(set)' : '(NOT set)')
console.log('[database] DEBUG: DB_HOST =', process.env.DB_HOST || '(undefined)')

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
  : new Pool({
      host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.PGPORT || process.env.DB_PORT || 5432, 10),
      user: process.env.PGUSER || process.env.DB_USER || 'postgres',
      password: process.env.PGPASSWORD || process.env.DB_PASSWORD || '',
      database: process.env.PGDATABASE || process.env.DB_NAME || 'yogya_nomad_db',
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })

console.log('[database] Using:', process.env.DATABASE_URL ? 'DATABASE_URL (Railway)' : 'localhost config')

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
