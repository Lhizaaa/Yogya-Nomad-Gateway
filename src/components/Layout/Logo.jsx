import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Logo({ withText = true, to = '/' }) {
  const { t } = useTranslation()
  const content = (
    <span className="flex items-center gap-2 sm:gap-2.5 min-w-0">
      <img
        src="/logo-new.png" alt="Yogya Nomad Gateway"
        className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover drop-shadow-sm shrink-0"
      />
      {withText && (
        <span className="hidden min-[360px]:inline-block font-extrabold leading-tight text-gray-900 dark:text-white text-sm sm:text-base truncate">
          <span className="text-brand-500">Yogya</span> Nomad
          <span className="hidden sm:block text-[10px] font-medium tracking-wide text-gray-400 dark:text-gray-500">
            {t('tagline')}
          </span>
        </span>
      )}
    </span>
  )
  return to ? <Link to={to} className="shrink-0">{content}</Link> : content
}
