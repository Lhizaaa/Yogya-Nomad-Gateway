// ---------------------------------------------------------------------------
// Koneksi PostgreSQL ke Supabase — dipakai semua Vercel Serverless Functions.
// max:1 karena tiap function instance menangani request secara terisolasi;
// pooling sesungguhnya ditangani oleh Supabase Connection Pooler (PgBouncer)
// di sisi DATABASE_URL (port 6543, mode "Transaction").
// ---------------------------------------------------------------------------
import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  ssl: { rejectUnauthorized: false },
})

pool.on('error', (err) => {
  console.error('[db] Error tak terduga pada koneksi idle:', err.message)
})

export function query(text, params) {
  return pool.query(text, params)
}

export { pool }
export default pool
