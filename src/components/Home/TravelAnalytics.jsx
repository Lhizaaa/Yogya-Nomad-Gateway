import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../context/LanguageContext'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts'
import SectionHeading from '../common/SectionHeading'
import GlassCard from '../common/GlassCard'
import Reveal from '../common/Reveal'
import data from '../../data/arrivalTwin.json'

const COLORS = ['#FF7300', '#FF9233', '#FFB066', '#FFD0A8']

export default function TravelAnalytics() {
  const { t } = useTranslation()
  const { lang } = useLanguage()

  const arrivals = data.daily_arrivals.map((d) => ({
    name: lang === 'en' ? d.day_en : d.day,
    value: d.arrivals
  }))
  const dest = data.popular_destinations.map((d) => ({ name: d.name, value: d.percent }))

  return (
    <section id="analytics" className="py-16">
      <div className="container-app">
        <SectionHeading title={t('analytics.title')} subtitle={t('analytics.subtitle')} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Reveal className="lg:col-span-2">
            <GlassCard className="p-5 h-full">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 text-sm">{t('analytics.weeklyArrivals')}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={arrivals} margin={{ left: -18, right: 6, top: 6 }}>
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF7300" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#FF7300" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(125,125,125,0.15)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="value" stroke="#FF7300" strokeWidth={2.5} fill="url(#grad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </Reveal>

          <Reveal delay={0.1}>
            <GlassCard className="p-5 h-full">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 text-sm">{t('analytics.destShare')}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dest} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={3}>
                      {dest.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {dest.map((d, i) => (
                  <span key={d.name} className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    {d.name}
                  </span>
                ))}
              </div>
            </GlassCard>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

const tooltipStyle = {
  background: 'rgba(20,20,20,0.9)',
  border: 'none',
  borderRadius: 12,
  color: '#fff',
  fontSize: 12
}
