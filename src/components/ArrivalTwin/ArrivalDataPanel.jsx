import { useTranslation } from 'react-i18next'
import { TrendingUp, Plane, Globe2, MapPin, CircleCheck } from 'lucide-react'
import GlassCard from '../common/GlassCard'
import CountUp from '../common/CountUp'
import Reveal from '../common/Reveal'
import data from '../../data/arrivalTwin.json'

function Card({ children, delay }) {
  return (
    <Reveal delay={delay}>
      <GlassCard className="p-4 sm:p-5 h-full" hover>{children}</GlassCard>
    </Reveal>
  )
}

export default function ArrivalDataPanel() {
  const { t } = useTranslation()
  const a = data

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {/* Total Visitor */}
      <Card delay={0}>
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
          <Globe2 size={14} className="text-brand-500" /> {t('arrivalTwin.totalVisitor')}
        </div>
        <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          <CountUp value={a.total_visitor} />
        </div>
        <div className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
          <TrendingUp size={12} /> ↑{a.visitor_growth_percent}% {t('arrivalTwin.thisMonth')}
        </div>
      </Card>

      {/* Flight activity */}
      <Card delay={0.05}>
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
          <Plane size={14} className="text-brand-500" /> {t('arrivalTwin.flightActivity')}
        </div>
        <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          <CountUp value={a.flight_today.total} />
        </div>
        <div className="mt-1 flex gap-2 text-[11px] text-gray-500 dark:text-gray-400">
          <span className="text-brand-600 dark:text-brand-300 font-semibold">{a.flight_today.international}</span> {t('arrivalTwin.international')}
          <span className="text-sky-600 dark:text-sky-300 font-semibold ml-1">{a.flight_today.domestic}</span> {t('arrivalTwin.domestic')}
        </div>
      </Card>

      {/* Top origin */}
      <Card delay={0.1}>
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-2">
          <MapPin size={14} className="text-brand-500" /> {t('arrivalTwin.topOrigin')}
        </div>
        <ul className="space-y-1.5">
          {a.top_origin_countries.slice(0, 3).map((c, i) => (
            <li key={c.code} className="flex items-center justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-200">
                <span className="text-brand-500 font-bold mr-1.5">{i + 1}.</span>{c.country}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">{c.visitors.toLocaleString('id-ID')}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Popular destinations */}
      <Card delay={0.15}>
        <div className="text-gray-500 dark:text-gray-400 text-xs mb-2">🏛️ {t('arrivalTwin.popularDest')}</div>
        <ul className="space-y-2">
          {a.popular_destinations.map((d) => (
            <li key={d.name}>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-gray-700 dark:text-gray-200">{d.name}</span>
                <span className="text-gray-500 dark:text-gray-400">{d.percent}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-200/70 dark:bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${d.percent}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* Airport status — full width */}
      <div className="col-span-2">
        <Card delay={0.2}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
              📊 {t('arrivalTwin.airportStatus')}
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 px-2.5 py-1 text-xs font-semibold border border-green-500/20">
              <CircleCheck size={13} /> {t('arrivalTwin.normal')}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/40 dark:bg-white/5 p-3 text-center">
              <div className="text-lg font-extrabold text-gray-900 dark:text-white">{a.airport_status.active_gate} / {a.airport_status.total_gate}</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('arrivalTwin.activeGate')}</div>
            </div>
            <div className="rounded-2xl bg-white/40 dark:bg-white/5 p-3 text-center">
              <div className="text-lg font-extrabold text-gray-900 dark:text-white">{a.airport_status.avg_waiting_minutes} {t('arrivalTwin.minutes')}</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('arrivalTwin.avgWaiting')}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
