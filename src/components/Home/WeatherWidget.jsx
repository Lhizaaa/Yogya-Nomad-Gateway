import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog } from 'lucide-react'
import { useOnlineStatus } from '../../utils/useOnlineStatus'
import Skeleton from '../common/Skeleton'

// Yogyakarta International Airport / Kulon Progo
const LAT = -7.9008
const LNG = 110.0585

function weatherMeta(code) {
  if (code === 0) return { Icon: Sun, label: 'Clear' }
  if ([1, 2, 3].includes(code)) return { Icon: Cloud, label: 'Cloudy' }
  if ([45, 48].includes(code)) return { Icon: CloudFog, label: 'Fog' }
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { Icon: CloudRain, label: 'Rain' }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { Icon: CloudSnow, label: 'Snow' }
  if ([95, 96, 99].includes(code)) return { Icon: CloudLightning, label: 'Storm' }
  return { Icon: Cloud, label: 'Cloudy' }
}

export default function WeatherWidget() {
  const { t } = useTranslation()
  const online = useOnlineStatus()
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!online) { setLoading(false); return }
    let cancelled = false
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LNG}&current=temperature_2m,apparent_temperature,weather_code&timezone=Asia%2FJakarta`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        setWeather(data.current)
        setLoading(false)
      })
      .catch(() => { if (!cancelled) { setFailed(true); setLoading(false) } })
    return () => { cancelled = true }
  }, [online])

  if (!online || failed) return null
  if (loading) return <Skeleton variant="shimmer" className="h-12 w-44" />
  if (!weather) return null

  const { Icon, label } = weatherMeta(weather.weather_code)

  return (
    <div className="inline-flex items-center gap-3 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur px-4 py-2.5 border border-white/40 dark:border-white/10">
      <Icon size={24} className="text-brand-500" />
      <div>
        <div className="text-sm font-bold text-gray-900 dark:text-white">{Math.round(weather.temperature_2m)}°C · {label}</div>
        <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('weather.feelsLike')} {Math.round(weather.apparent_temperature)}°C</div>
      </div>
    </div>
  )
}
