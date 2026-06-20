import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import ThemeToggle from '../common/ThemeToggle'
import LanguageToggle from '../common/LanguageToggle'

export default function Navbar() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/touchdown', label: t('nav.touchdown') },
    { to: '/map', label: t('nav.map') },
    { to: '/starter-kit', label: t('nav.starterKit') }
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/60 dark:border-white/10 bg-white/70 dark:bg-neutral-950/70 backdrop-blur-xl transition-colors">
      <nav className="container-app flex items-center justify-between h-16">
        <Logo />
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                pathname === l.to
                  ? 'text-brand-600 dark:text-brand-300 bg-brand-50 dark:bg-white/5'
                  : 'text-gray-600 dark:text-gray-300 hover:text-brand-600 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
