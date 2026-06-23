import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Navigation, Flag, Wifi, WifiOff, Plug, MapPin, Star, Clock, Send, Bookmark, BookmarkCheck, CalendarPlus, CalendarCheck } from 'lucide-react'
import { getLocations, getReviews, addReview } from '../utils/locationStore'
import { directionsUrl } from '../utils/distance'
import { logEvent } from '../utils/eventLogger'
import { useApp } from '../context/AppContext'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import GlassCard from '../components/common/GlassCard'
import Modal from '../components/common/Modal'

const priceLabel = { low: '$ (Low)', medium: '$$ (Medium)', high: '$$$ (High)' }

export default function LocationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const loc = useMemo(() => getLocations().find((l) => l.id === id), [id])
  const { isFavorite, toggleFavorite, isInItinerary, addToItinerary } = useApp()

  const [reportOpen, setReportOpen] = useState(false)
  const [reportDone, setReportDone] = useState(false)
  const [speed, setSpeed] = useState('')
  const [speedDone, setSpeedDone] = useState(false)
  const [reviews, setReviews] = useState(() => (loc ? getReviews(loc.id) : { list: [], average: null, count: 0 }))
  const [newRating, setNewRating] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [reviewDone, setReviewDone] = useState(false)

  useEffect(() => { if (loc) logEvent('screen_view', `location:${loc.name}`) }, [loc])

  if (!loc) {
    return (
      <div className="container-app py-20 text-center">
        <p className="text-gray-500">404 — location not found.</p>
        <Link to="/map" className="text-brand-500 font-semibold">{t('common.back')}</Link>
      </div>
    )
  }

  const getDirections = () => {
    logEvent('get_directions', loc.name)
    window.open(directionsUrl(loc.address), '_blank')
  }

  const submitReport = (kind) => {
    logEvent('report_issue', `${loc.name}:${kind}`)
    setReportDone(true)
    setTimeout(() => { setReportOpen(false); setReportDone(false) }, 1400)
  }

  const submitSpeed = (e) => {
    e.preventDefault()
    if (!speed) return
    logEvent('speed_test', `${loc.name}:${speed}mbps`)
    setSpeedDone(true)
  }

  const onToggleFavorite = () => {
    toggleFavorite(loc.id)
    logEvent('toggle_favorite', loc.name)
  }

  const onAddItinerary = () => {
    addToItinerary(loc.id)
    logEvent('itinerary_add', loc.name)
  }

  const submitReview = (e) => {
    e.preventDefault()
    if (!newRating) return
    logEvent('submit_review', `${loc.name}:${newRating}stars`)
    setReviews(addReview(loc.id, { rating: newRating, comment: newComment.trim() }))
    setReviewDone(true)
    setNewRating(0)
    setNewComment('')
    setTimeout(() => setReviewDone(false), 1400)
  }

  return (
    <section className="py-8">
      <div className="container-app max-w-2xl">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-500 mb-5">
          <ArrowLeft size={16} /> {t('common.back')}
        </button>

        <GlassCard className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{loc.name}</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <MapPin size={13} /> {loc.address}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge tone={loc.open_now ? 'green' : 'gray'}>
                <Clock size={11} /> {loc.open_now ? t('common.openNow') : t('common.closed')}
              </Badge>
              <button
                onClick={onAddItinerary}
                title={isInItinerary(loc.id) ? t('itinerary.added') : t('itinerary.add')}
                className={`p-2 rounded-full border transition-colors ${isInItinerary(loc.id) ? 'text-brand-500 border-brand-300' : 'text-gray-400 border-gray-200 dark:border-gray-700 hover:text-brand-500'}`}
              >
                {isInItinerary(loc.id) ? <CalendarCheck size={16} /> : <CalendarPlus size={16} />}
              </button>
              <button
                onClick={onToggleFavorite}
                title={isFavorite(loc.id) ? t('favorites.remove') : t('favorites.add')}
                className={`p-2 rounded-full border transition-colors ${isFavorite(loc.id) ? 'text-brand-500 border-brand-300' : 'text-gray-400 border-gray-200 dark:border-gray-700 hover:text-brand-500'}`}
              >
                {isFavorite(loc.id) ? <BookmarkCheck size={16} className="fill-brand-500/20" /> : <Bookmark size={16} />}
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Info label={t('detail.wifiSpeed')}>
              {loc.wifi_speed_mbps != null ? (
                <Badge tone="green"><Wifi size={11} /> {loc.wifi_speed_mbps} Mbps</Badge>
              ) : (
                <Badge tone="gray"><WifiOff size={11} /> {t('map.speedNotVerified')}</Badge>
              )}
            </Info>
            <Info label={t('map.powerOutlet')}>
              {loc.has_power_outlet ? <Badge tone="blue"><Plug size={11} /> ✓</Badge> : <Badge tone="gray">—</Badge>}
            </Info>
            <Info label={t('detail.priceRange')}><span className="font-semibold text-gray-800 dark:text-gray-100">{priceLabel[loc.price_range]}</span></Info>
            <Info label="Rating">
              {loc.rating ? <span className="inline-flex items-center gap-1 font-semibold"><Star size={13} className="text-brand-500 fill-brand-500" /> {loc.rating}</span> : '—'}
            </Info>
            <Info label={t('detail.lastUpdated')}><span className="text-sm">{loc.last_updated}</span></Info>
            <Info label="Distance"><span className="text-sm font-semibold">{loc.distance_km} km</span></Info>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={getDirections}><Navigation size={16} /> {t('detail.getDirections')}</Button>
            <Button variant="secondary" onClick={() => setReportOpen(true)}><Flag size={16} /> {t('detail.reportIssue')}</Button>
          </div>

          {loc.wifi_speed_mbps == null && (
            <div className="mt-6 rounded-2xl bg-brand-50 dark:bg-white/5 border border-brand-200/60 dark:border-white/10 p-4">
              {speedDone ? (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">{t('detail.speedThanks')}</p>
              ) : (
                <form onSubmit={submitSpeed}>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('detail.helpSpeed')}</p>
                  <div className="flex gap-2">
                    <input
                      type="number" min="0" value={speed} onChange={(e) => setSpeed(e.target.value)}
                      placeholder={t('detail.speedPlaceholder')}
                      className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                    <Button type="submit"><Send size={15} /></Button>
                  </div>
                </form>
              )}
            </div>
          )}

          <div className="mt-8 border-t border-gray-100 dark:border-white/10 pt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 dark:text-white">{t('review.title')}</h2>
              {reviews.average != null && (
                <span className="inline-flex items-center gap-1 text-sm font-semibold">
                  <Star size={14} className="text-brand-500 fill-brand-500" /> {reviews.average}
                  <span className="text-xs text-gray-400 font-normal ml-1">{t('review.reviewsCount', { count: reviews.count })}</span>
                </span>
              )}
            </div>

            {reviews.list.length === 0 ? (
              <p className="text-sm text-gray-400 mb-4">{t('review.noReviews')}</p>
            ) : (
              <ul className="space-y-2 mb-4 max-h-56 overflow-y-auto">
                {reviews.list.slice().reverse().map((r, i) => (
                  <li key={i} className="rounded-xl bg-white/50 dark:bg-white/5 p-3 border border-white/40 dark:border-white/10">
                    <span className="inline-flex items-center gap-0.5 text-brand-500 mb-1">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} size={12} className={s < r.rating ? 'fill-brand-500' : 'text-gray-300 dark:text-gray-600'} />
                      ))}
                    </span>
                    {r.comment && <p className="text-sm text-gray-700 dark:text-gray-200">{r.comment}</p>}
                  </li>
                ))}
              </ul>
            )}

            {reviewDone ? (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">{t('review.thanks')}</p>
            ) : (
              <form onSubmit={submitReview} className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('review.yourRating')}</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button type="button" key={i} onClick={() => setNewRating(i + 1)}>
                      <Star size={20} className={i < newRating ? 'text-brand-500 fill-brand-500' : 'text-gray-300 dark:text-gray-600'} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t('review.commentPlaceholder')}
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
                <Button type="submit" disabled={!newRating}>{t('review.submit')}</Button>
              </form>
            )}
          </div>
        </GlassCard>
      </div>

      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title={t('detail.reportTitle')}>
        {reportDone ? (
          <p className="text-green-600 dark:text-green-400 font-medium text-center py-4">{t('detail.reportThanks')}</p>
        ) : (
          <div className="space-y-2">
            {[['closed', t('detail.issueClosed')], ['wifi', t('detail.issueWifi')], ['other', t('detail.issueOther')]].map(([k, label]) => (
              <button key={k} onClick={() => submitReport(k)}
                className="w-full text-left rounded-2xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm font-medium hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-white/5 transition-colors">
                {label}
              </button>
            ))}
          </div>
        )}
      </Modal>
    </section>
  )
}

function Info({ label, children }) {
  return (
    <div className="rounded-2xl bg-white/50 dark:bg-white/5 p-3 border border-white/40 dark:border-white/10">
      <div className="text-[11px] text-gray-400 mb-1">{label}</div>
      {children}
    </div>
  )
}
