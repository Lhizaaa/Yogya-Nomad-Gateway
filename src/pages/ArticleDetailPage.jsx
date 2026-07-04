import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Clock, Share2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import ArticleCard from '../components/Articles/ArticleCard'
import { getArticles } from '../utils/articleStore'
import { logEvent } from '../utils/eventLogger'

export default function ArticleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { lang } = useLanguage()
  const [toast, setToast] = useState(false)

  // Data artikel dari database (via localStorage) dengan fallback JSON.
  const articles = useMemo(() => getArticles(), [])
  const article = useMemo(() => articles.find((a) => a.id === id), [articles, id])
  useEffect(() => { window.scrollTo(0, 0); if (article) logEvent('article_view', article.id) }, [article])

  if (!article) {
    return (
      <div className="container-app py-20 text-center">
        <p className="text-gray-500">404 — article not found.</p>
        <Link to="/" className="text-brand-500 font-semibold">{t('common.back')}</Link>
      </div>
    )
  }

  const title = lang === 'en' ? article.title_en : article.title
  const content = lang === 'en' ? article.content_en : article.content
  const category = lang === 'en' ? article.category_en : article.category
  const related = articles.filter((a) => a.category === article.category && a.id !== article.id).slice(0, 3)

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title, url })
      else { await navigator.clipboard.writeText(url); setToast(true); setTimeout(() => setToast(false), 1800) }
    } catch { /* cancelled */ }
  }

  return (
    <article className="py-8">
      <div className="container-app max-w-3xl">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-500 mb-5">
          <ArrowLeft size={16} /> {t('common.back')}
        </button>

        <Badge tone="brand">{category}</Badge>
        <h1 className="mt-3 text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">{title}</h1>
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1"><Clock size={13} /> {article.read_time_minutes} {t('common.minRead')}</span>
          <button onClick={share} className="flex items-center gap-1 hover:text-brand-500"><Share2 size={13} /> {t('common.share')}</button>
        </div>

        <img src={article.image} alt={title} className="mt-5 w-full h-56 sm:h-72 object-cover rounded-3xl" loading="lazy"
          onError={(e) => { e.currentTarget.style.display = 'none' }} />

        <div className="mt-6 prose-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
          {content}
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('articles.related')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((a) => <ArticleCard key={a.id} article={a} />)}
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 rounded-full bg-gray-900 text-white text-sm px-4 py-2 shadow-xl">
          {t('common.copied')}
        </div>
      )}
    </article>
  )
}
