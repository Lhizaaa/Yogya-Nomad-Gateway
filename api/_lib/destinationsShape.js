// ---------------------------------------------------------------------------
// Kolom & transformasi bersama untuk semua endpoint /api/destinations/*.
// Bentuk respons dibuat PERSIS seperti src/data/locations.json.
// ---------------------------------------------------------------------------
export const SELECT_FIELDS = `
  id, name, type, address, lat, lng, distance_km, wifi_speed_mbps,
  has_power_outlet, price_range, open_now, rating,
  to_char(last_updated, 'YYYY-MM-DD') AS last_updated,
  description, city, province, image_url, opening_hours
`

// PostgreSQL mengembalikan kolom DECIMAL/NUMERIC sebagai string (mis. "-7.9075").
// Frontend butuh angka asli, jadi kita konversi field numerik di sini.
const toNum = (v) => (v === null || v === undefined ? null : Number(v))

export function toLocationShape(row) {
  return {
    ...row,
    lat: toNum(row.lat),
    lng: toNum(row.lng),
    distance_km: toNum(row.distance_km),
    rating: toNum(row.rating),
  }
}
