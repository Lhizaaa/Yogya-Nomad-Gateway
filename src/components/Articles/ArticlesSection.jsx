import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import SectionHeading from '../common/SectionHeading'
import ArticleCard from './ArticleCard'
import Button from '../common/Button'
import { getArticles } from '../../utils/articleStore'

const CATS = ['Wisata Alam', 'Kuliner', 'Budaya', 'Tips Nomad']

export default function ArticlesSection() {
  const { t } = useTranslation()
  const [cat, setCat] = useState('all')
  const [limit, setLimit] = useState(6)
  // Data artikel dari database (via localStorage) dengan fallback JSON.
  const articles = useMemo(() => getArticles(), [])

  const filtered = useMemo(
    () => (cat === 'all' ? articles : articles.filter((a) => a.category === cat)),
    [cat]
  )
  const shown = filtered.slice(0, limit)

  return (
    <section id="articles" className="py-16">
      <div className="container-app">
        <SectionHeading title={t('articles.title')} subtitle={t('articles.subtitle')} />

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {['all', ...CATS].map((c) => (
            <button
              key={c}
              onClick={() => { setCat(c); setLimit(6) }}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                cat === c
                  ? 'bg-brand-500 text-white shadow'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-brand-400'
              }`}
            >
              {c === 'all' ? t('common.all') : t(`articles.categories.${c}`)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {shown.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
            >
              <ArticleCard article={a} />
            </motion.div>
          ))}
        </div>

        {limit < filtered.length && (
          <div className="mt-8 text-center">
            <Button variant="secondary" onClick={() => setLimit((l) => l + 3)}>
              {t('common.loadMore')}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
