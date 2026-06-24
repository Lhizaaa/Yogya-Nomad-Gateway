import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, MapPin, ScrollText, Lock, LogOut, ArrowLeft } from 'lucide-react'
import { getLocations } from '../utils/locationStore'
import GlassCard from '../components/common/GlassCard'
import Button from '../components/common/Button'
import DashboardOverview from '../components/Admin/DashboardOverview'
import LocationManager from '../components/Admin/LocationManager'
import EventLogViewer from '../components/Admin/EventLogViewer'
import { logEvent } from '../utils/eventLogger'

const PASSWORD = 'admin123'
const SESSION_KEY = 'nomad_admin'

export default function AdminPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(() => {
    try { return sessionStorage.getItem(SESSION_KEY) === '1' } catch { return false }
  })
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)
  const [tab, setTab] = useState('overview')
  const [locations, setLocations] = useState(() => getLocations())

  useEffect(() => { logEvent('screen_view', 'admin') }, [])

  const login = (e) => {
    e.preventDefault()
    if (pw === PASSWORD) {
      setAuthed(true)
      try { sessionStorage.setItem(SESSION_KEY, '1') } catch { /* ignore */ }
    } else { setErr(true) }
  }

  const logout = () => {
    setAuthed(false)
    try { sessionStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
  }

  if (!authed) {
    return (
      <div className="container-app py-20 max-w-sm">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-500 mb-5">
          <ArrowLeft size={16} /> {t('common.back')}
        </button>
        <GlassCard className="p-8">
          <span className="mx-auto grid place-items-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white"><Lock size={24} /></span>
          <h1 className="mt-4 text-xl font-bold text-center text-gray-900 dark:text-white">{t('admin.title')}</h1>
          <form onSubmit={login} className="mt-5">
            <input
              type="password" value={pw} onChange={(e) => { setPw(e.target.value); setErr(false) }}
              placeholder={t('admin.password')} autoFocus
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            {err && <p className="mt-2 text-xs text-red-500">{t('admin.wrongPassword')}</p>}
            <Button type="submit" className="mt-4 w-full">{t('admin.login')}</Button>
            <p className="mt-3 text-center text-xs text-gray-400">{t('admin.loginHint')}</p>
          </form>
        </GlassCard>
      </div>
    )
  }

  const tabs = [
    { key: 'overview', icon: LayoutDashboard, label: t('admin.tabs.overview') },
    { key: 'locations', icon: MapPin, label: t('admin.tabs.locations') },
    { key: 'events', icon: ScrollText, label: t('admin.tabs.events') }
  ]

  return (
    <section className="py-8">
      <div className="container-app">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-500 mb-5">
          <ArrowLeft size={16} /> {t('common.back')}
        </button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{t('admin.title')}</h1>
          <Button variant="ghost" onClick={logout}><LogOut size={15} /> {t('admin.logout')}</Button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap transition-colors ${
                tab === tb.key ? 'bg-brand-500 text-white shadow' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <tb.icon size={15} /> {tb.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && <DashboardOverview locations={locations} />}
        {tab === 'locations' && <LocationManager locations={locations} setLocations={setLocations} />}
        {tab === 'events' && <EventLogViewer />}
      </div>
    </section>
  )
}
