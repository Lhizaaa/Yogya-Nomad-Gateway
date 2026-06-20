import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Logo({ withText = true, size = 36, to = '/' }) {
  const { t } = useTranslation()
  const content = (
    <span className="flex items-center gap-2.5">
      <img src="/logo.svg" alt="Yogya Nomad Gateway" width={size} height={size} className="drop-shadow-sm" />
      {withText && (
        <span className="font-extrabold leading-tight text-gray-900 dark:text-white">
          <span className="text-brand-500">Yogya</span> Nomad
          <span className="block text-[10px] font-medium tracking-wide text-gray-400 dark:text-gray-500">
            {t('tagline')}
          </span>
        </span>
      )}
    </span>
  )
  return to ? <Link to={to} className="shrink-0">{content}</Link> : content
}
