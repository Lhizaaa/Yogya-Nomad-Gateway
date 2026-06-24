import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeftRight, Coins } from 'lucide-react'
import { useOnlineStatus } from '../../utils/useOnlineStatus'
import GlassCard from '../common/GlassCard'
import Skeleton from '../common/Skeleton'
import { logEvent } from '../../utils/eventLogger'

const CURRENCIES = ['USD', 'EUR', 'SGD', 'MYR', 'AUD', 'GBP']

export default function CurrencyConverter() {
  const { t } = useTranslation()
  const online = useOnlineStatus()
  const [rates, setRates] = useState(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [amount, setAmount] = useState(100)
  const [from, setFrom] = useState('USD')

  useEffect(() => {
    if (!online) { setLoading(false); return }
    let cancelled = false
    fetch('https://open.er-api.com/v6/latest/USD')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        if (data && data.rates && data.rates.IDR) { setRates(data.rates); setLoading(false) }
        else { setFailed(true); setLoading(false) }
      })
      .catch(() => { if (!cancelled) { setFailed(true); setLoading(false) } })
    return () => { cancelled = true }
  }, [online])

  const idr = rates ? (Number(amount) || 0) * (rates.IDR / rates[from]) : 0
  const rounded = Math.ceil(idr / 5000) * 5000

  const onConvert = () => logEvent('currency_convert', `${amount}${from}`)

  return (
    <GlassCard className="p-5">
      <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
        <Coins size={18} className="text-brand-500" /> {t('starterKit.currency.title')}
      </h2>

      {!online ? (
        <p className="text-sm text-gray-400 py-4 text-center">{t('starterKit.currency.offline')}</p>
      ) : loading ? (
        <Skeleton variant="shimmer" className="h-28 w-full" />
      ) : failed ? (
        <p className="text-sm text-gray-400 py-4 text-center">{t('starterKit.currency.offline')}</p>
      ) : (
        <>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">{t('starterKit.currency.amount')}</label>
              <input
                type="number" min="0" value={amount}
                onChange={(e) => { setAmount(e.target.value); onConvert() }}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div className="w-28">
              <label className="text-xs text-gray-400 mb-1 block">{t('starterKit.currency.from')}</label>
              <select
                value={from} onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-brand-50 dark:bg-white/5 border border-brand-200/60 dark:border-white/10 p-4 text-center">
            <div className="text-xs text-gray-400 flex items-center justify-center gap-1 mb-1">
              <ArrowLeftRight size={12} /> {t('starterKit.currency.result')}
            </div>
            <div className="text-2xl font-extrabold text-brand-600 dark:text-brand-300">
              Rp {Math.round(idr).toLocaleString('id-ID')}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2">
            <span className="text-gray-500 dark:text-gray-400">{t('starterKit.currency.tipCalc')}</span>
            <span className="font-semibold text-gray-900 dark:text-white">{t('starterKit.currency.rounded')} Rp {rounded.toLocaleString('id-ID')}</span>
          </div>

          <p className="mt-3 text-[11px] text-gray-400">{t('starterKit.currency.disclaimer')}</p>
        </>
      )}
    </GlassCard>
  )
}
