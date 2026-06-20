import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Upload, RotateCcw, Pencil, Trash2 } from 'lucide-react'
import { saveLocations, resetLocations, parseCSV } from '../../utils/locationStore'
import GlassCard from '../common/GlassCard'
import Button from '../common/Button'
import Modal from '../common/Modal'

const EMPTY = {
  id: '', name: '', type: 'cafe', address: '', distance_km: 0,
  lat: '', lng: '', wifi_speed_mbps: '', has_power_outlet: false,
  price_range: 'low', open_now: true, rating: '', last_updated: ''
}

export default function LocationManager({ locations, setLocations }) {
  const { t } = useTranslation()
  const fileRef = useRef(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const persist = (list) => { setLocations(list); saveLocations(list) }

  const openAdd = () => { setForm({ ...EMPTY, id: `loc-${Date.now()}` }); setModalOpen(true) }
  const openEdit = (loc) => { setForm({ ...EMPTY, ...loc, wifi_speed_mbps: loc.wifi_speed_mbps ?? '', rating: loc.rating ?? '' }); setModalOpen(true) }

  const remove = (id) => persist(locations.filter((l) => l.id !== id))

  const save = () => {
    const clean = {
      ...form,
      distance_km: Number(form.distance_km) || 0,
      lat: form.lat === '' ? null : Number(form.lat),
      lng: form.lng === '' ? null : Number(form.lng),
      wifi_speed_mbps: form.wifi_speed_mbps === '' ? null : Number(form.wifi_speed_mbps),
      rating: form.rating === '' ? null : Number(form.rating),
      last_updated: form.last_updated || new Date().toISOString().slice(0, 10)
    }
    const exists = locations.some((l) => l.id === clean.id)
    persist(exists ? locations.map((l) => (l.id === clean.id ? clean : l)) : [...locations, clean])
    setModalOpen(false)
  }

  const onCsv = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const rows = parseCSV(text)
    if (rows.length) persist(rows)
    e.target.value = ''
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <Button onClick={openAdd}><Plus size={15} /> {t('admin.loc.addNew')}</Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()}><Upload size={15} /> {t('admin.loc.uploadCsv')}</Button>
        <Button variant="ghost" onClick={() => persist(resetLocations())}><RotateCcw size={15} /> {t('admin.loc.resetData')}</Button>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={onCsv} />
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5 text-left text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-3 py-2.5">{t('admin.loc.name')}</th>
                <th className="px-3 py-2.5">{t('admin.loc.type')}</th>
                <th className="px-3 py-2.5 hidden sm:table-cell">{t('admin.loc.distance')}</th>
                <th className="px-3 py-2.5 hidden sm:table-cell">{t('admin.loc.wifi')}</th>
                <th className="px-3 py-2.5">{t('admin.loc.price')}</th>
                <th className="px-3 py-2.5 text-right">{t('admin.loc.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/60 dark:divide-white/10">
              {locations.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50/60 dark:hover:bg-white/5">
                  <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white">{l.name}</td>
                  <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400">{t(`map.types.${l.type}`)}</td>
                  <td className="px-3 py-2.5 hidden sm:table-cell text-gray-500 dark:text-gray-400">{l.distance_km} km</td>
                  <td className="px-3 py-2.5 hidden sm:table-cell text-gray-500 dark:text-gray-400">{l.wifi_speed_mbps ?? '—'}</td>
                  <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400 uppercase">{l.price_range}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(l)} className="p-1.5 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-white/5"><Pencil size={15} /></button>
                      <button onClick={() => remove(l.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-white/5"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={form.name || t('admin.loc.addNew')}>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <Field label={t('admin.loc.name')}><input className={inp} value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('admin.loc.type')}>
              <select className={inp} value={form.type} onChange={(e) => set('type', e.target.value)}>
                <option value="cafe">cafe</option><option value="coworking">coworking</option><option value="wifi-spot">wifi-spot</option>
              </select>
            </Field>
            <Field label={t('admin.loc.price')}>
              <select className={inp} value={form.price_range} onChange={(e) => set('price_range', e.target.value)}>
                <option value="low">low</option><option value="medium">medium</option><option value="high">high</option>
              </select>
            </Field>
          </div>
          <Field label={t('admin.loc.address')}><input className={inp} value={form.address} onChange={(e) => set('address', e.target.value)} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label={t('admin.loc.distance')}><input type="number" className={inp} value={form.distance_km} onChange={(e) => set('distance_km', e.target.value)} /></Field>
            <Field label="Lat"><input type="number" className={inp} value={form.lat} onChange={(e) => set('lat', e.target.value)} /></Field>
            <Field label="Lng"><input type="number" className={inp} value={form.lng} onChange={(e) => set('lng', e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('admin.loc.wifi')}><input type="number" className={inp} value={form.wifi_speed_mbps} onChange={(e) => set('wifi_speed_mbps', e.target.value)} /></Field>
            <Field label="Rating"><input type="number" step="0.1" className={inp} value={form.rating} onChange={(e) => set('rating', e.target.value)} /></Field>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.has_power_outlet} onChange={(e) => set('has_power_outlet', e.target.checked)} /> {t('admin.loc.power')}</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.open_now} onChange={(e) => set('open_now', e.target.checked)} /> {t('common.openNow')}</label>
          </div>
        </div>
        <div className="mt-4 flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={save}>{t('common.save')}</Button>
        </div>
      </Modal>
    </div>
  )
}

const inp = 'w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400'

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] text-gray-400 mb-1">{label}</span>
      {children}
    </label>
  )
}
