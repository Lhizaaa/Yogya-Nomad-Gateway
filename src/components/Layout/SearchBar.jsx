import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { searchAll } from '../../utils/search'
import { logEvent } from '../../utils/eventLogger'
import Skeleton from '../common/Skeleton'

export default function SearchBar() {
  const { t } = useTranslation()
  const { lang } = useLanguage()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (!query || query.trim().length < 2) { setResults(null); setLoading(false); return }
    setLoading(true)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setResults(searchAll(query))
      setLoading(false)
      logEvent('search', query)
    }, 300)
    return () => clearTimeout(timeoutRef.current)
  }, [query])

  const close = () => { setOpen(false); setQuery(''); setResults(null) }

  const goTo = (path) => { close(); navigate(path) }

  const hasResults = results && (results.locations.length || results.articles.length || results.starterKit.length)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1 sm:p-2 rounded-full text-gray-500 dark:text-gray-300 hover:text-brand-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        title={t('search.placeholder')}
      >
        <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-20 sm:pt-28">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b border-gray-100 dark:border-white/10">
              <Search size={18} className="text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
              />
              <button onClick={close} className="p-1 rounded-full text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="max-h-96 overflow-y-auto p-3">
              {loading && (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} variant="shimmer" className="h-10" />)}
                </div>
              )}

              {!loading && results && !hasResults && (
                <p className="text-sm text-gray-400 text-center py-6">{t('search.noResults')}</p>
              )}

              {!loading && results?.locations.length > 0 && (
                <ResultGroup label={t('search.locations')}>
                  {results.locations.map((l) => (
                    <ResultItem key={l.id} title={l.name} subtitle={l.address} onClick={() => goTo(`/map/${l.id}`)} />
                  ))}
                </ResultGroup>
              )}

              {!loading && results?.articles.length > 0 && (
                <ResultGroup label={t('search.articles')}>
                  {results.articles.map((a) => (
                    <ResultItem
                      key={a.id}
                      title={lang === 'en' ? a.title_en : a.title}
                      subtitle={lang === 'en' ? a.category_en : a.category}
                      onClick={() => goTo(`/articles/${a.id}`)}
                    />
                  ))}
                </ResultGroup>
              )}

              {!loading && results?.starterKit.length > 0 && (
                <ResultGroup label={t('search.starterKit')}>
                  {results.starterKit.map((k, i) => (
                    <ResultItem key={i} title={k.label} subtitle={k.section} onClick={() => goTo('/starter-kit')} />
                  ))}
                </ResultGroup>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function ResultGroup({ label, children }) {
  return (
    <div className="mb-3">
      <p className="text-[11px] font-semibold uppercase text-gray-400 px-2 mb-1">{label}</p>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function ResultItem({ title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 rounded-xl hover:bg-brand-50 dark:hover:bg-white/5 transition-colors"
    >
      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{title}</div>
      {subtitle && <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{subtitle}</div>}
    </button>
  )
}
