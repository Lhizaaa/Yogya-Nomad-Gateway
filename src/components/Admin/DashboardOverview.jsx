import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import { MapPin, Activity, Navigation, Gauge, Inbox } from 'lucide-react'
import GlassCard from '../common/GlassCard'
import CountUp from '../common/CountUp'
import { getEvents, eventsPerDay, topDirections } from '../../utils/eventLogger'

const COLORS = ['#FF7300', '#FF9233', '#FFB066', '#FFD0A8']
const tooltipStyle = { background: 'rgba(20,20,20,0.9)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }

export default function DashboardOverview({ locations }) {
  const { t } = useTranslation()

  const events = getEvents()
  const directionsCount = events.filter((e) => e.type === 'get_directions').length
  const wifiVals = locations.filter((l) => l.wifi_speed_mbps != null).map((l) => l.wifi_speed_mbps)
  const avgWifi = wifiVals.length ? Math.round(wifiVals.reduce((a, b) => a + b, 0) / wifiVals.length) : 0

  const byType = useMemo(() => {
    const m = { cafe: 0, coworking: 0, 'wifi-spot': 0 }
    locations.forEach((l) => { m[l.type] = (m[l.type] || 0) + 1 })
    return [
      { name: t('map.types.cafe'), value: m.cafe },
      { name: t('map.types.coworking'), value: m.coworking },
      { name: t('map.types.wifi-spot'), value: m['wifi-spot'] }
    ]
  }, [locations, t])

  const byPrice = useMemo(() => {
    const m = { low: 0, medium: 0, high: 0 }
    locations.forEach((l) => { m[l.price_range] = (m[l.price_range] || 0) + 1 })
    return [
      { name: 'Low', value: m.low },
      { name: 'Medium', value: m.medium },
      { name: 'High', value: m.high }
    ]
  }, [locations])

  const daily = eventsPerDay()
  const topClicked = topDirections(5)

  const stats = [
    { icon: MapPin, label: t('admin.stats.totalLocations'), value: locations.length },
    { icon: Activity, label: t('admin.stats.totalEvents'), value: events.length },
    { icon: Navigation, label: t('admin.stats.totalDirections'), value: directionsCount },
    { icon: Gauge, label: t('admin.stats.avgWifi'), value: avgWifi }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <GlassCard key={i} className="p-4" hover>
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white"><s.icon size={18} /></span>
            <div className="mt-3 text-2xl font-extrabold text-gray-900 dark:text-white"><CountUp value={s.value} /></div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">{t('admin.charts.byType')}</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byType} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(125,125,125,0.15)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,115,0,0.08)' }} />
                <Bar dataKey="value" fill="#FF7300" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">{t('admin.charts.priceDist')}</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byPrice} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {byPrice.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">{t('admin.charts.dailyEvents')}</h3>
          <div className="h-56">
            {daily.length === 0 ? <Empty t={t} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(125,125,125,0.15)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="count" stroke="#FF7300" strokeWidth={2.5} dot={{ r: 3, fill: '#FF7300' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">{t('admin.charts.topClicked')}</h3>
          <div className="h-56">
            {topClicked.length === 0 ? <Empty t={t} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topClicked} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <XAxis type="number" allowDecimals={false} hide />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,115,0,0.08)' }} />
                  <Bar dataKey="count" fill="#FF9233" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

function Empty({ t }) {
  return (
    <div className="h-full grid place-items-center text-center text-gray-400">
      <div>
        <Inbox className="mx-auto mb-2 opacity-50" size={32} />
        <p className="text-sm">{t('common.noData')}</p>
      </div>
    </div>
  )
}
