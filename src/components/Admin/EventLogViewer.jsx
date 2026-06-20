import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Inbox, Trash2 } from 'lucide-react'
import { getEvents, clearEvents } from '../../utils/eventLogger'
import GlassCard from '../common/GlassCard'
import Button from '../common/Button'

export default function EventLogViewer() {
  const { t } = useTranslation()
  const [events, setEvents] = useState(() => [...getEvents()].reverse())
  const [type, setType] = useState('all')
  const [date, setDate] = useState('')

  const types = useMemo(() => ['all', ...new Set(events.map((e) => e.type))], [events])

  const filtered = events.filter((e) =>
    (type === 'all' || e.type === type) && (!date || (e.ts || '').slice(0, 10) === date)
  )

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select value={type} onChange={(e) => setType(e.target.value)} className={inp}>
          {types.map((ty) => <option key={ty} value={ty}>{ty === 'all' ? t('common.all') : ty}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inp} />
        <Button variant="ghost" className="ml-auto" onClick={() => { clearEvents(); setEvents([]) }}>
          <Trash2 size={15} /> {t('common.delete')}
        </Button>
      </div>

      <GlassCard className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 grid place-items-center text-center text-gray-400">
            <Inbox className="mb-2 opacity-50" size={32} />
            <p className="text-sm">{t('common.noData')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-white/5 text-left text-xs uppercase text-gray-500 dark:text-gray-400 sticky top-0">
                <tr>
                  <th className="px-3 py-2.5">{t('admin.event.type')}</th>
                  <th className="px-3 py-2.5">{t('admin.event.detail')}</th>
                  <th className="px-3 py-2.5">{t('admin.event.time')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/60 dark:divide-white/10">
                {filtered.map((e, i) => (
                  <tr key={i} className="hover:bg-gray-50/60 dark:hover:bg-white/5">
                    <td className="px-3 py-2.5"><span className="rounded-full bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 px-2 py-0.5 text-xs font-medium">{e.type}</span></td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{e.detail || '—'}</td>
                    <td className="px-3 py-2.5 text-gray-400 text-xs">{new Date(e.ts).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  )
}

const inp = 'rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400'
