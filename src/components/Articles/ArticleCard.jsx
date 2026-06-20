import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Clock } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import Badge from '../common/Badge'

export default function ArticleCard({ article }) {
  const { t } = useTranslation()
  const { lang } = useLanguage()
  const title = lang === 'en' ? article.title_en : article.title
  const excerpt = lang === 'en' ? article.excerpt_en : article.excerpt
  const category = lang === 'en' ? article.category_en : article.category

  return (
    <Link to={`/articles/${article.id}`} className="group block h-full">
      <div className="h-full rounded-3xl overflow-hidden bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
        <div className="relative h-40 overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            src={article.image} alt={title} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          <span className="absolute top-3 left-3"><Badge tone="brand">{category}</Badge></span>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">{title}</h3>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{excerpt}</p>
          <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
            <Clock size={12} /> {article.read_time_minutes} {t('common.minRead')}
          </div>
        </div>
      </div>
    </Link>
  )
}
