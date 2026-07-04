// ---------------------------------------------------------------------------
// Skrip test koneksi database (READ-ONLY).
// Jalankan: node scripts/test-connection.js  (dari folder server/)
// ---------------------------------------------------------------------------
import pool, { testConnection } from '../config/database.js'

const ok = await testConnection()

if (ok) {
  // Bonus: cek apakah tabel destinations sudah ada dan berapa isinya.
  try {
    const { rows } = await pool.query('SELECT COUNT(*) AS total FROM destinations')
    console.log(`[test] Tabel "destinations" ditemukan — total baris: ${rows[0].total}`)
  } catch (err) {
    console.log(`[test] Tabel "destinations" belum ada / belum bisa dibaca: ${err.message}`)
    console.log('[test] (Wajar jika Anda belum menjalankan migrasi data.)')
  }
}

await pool.end()
process.exit(ok ? 0 : 1)
