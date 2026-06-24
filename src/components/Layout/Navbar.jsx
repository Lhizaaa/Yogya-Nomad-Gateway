import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bookmark, CalendarCheck } from 'lucide-react'
import Logo from './Logo'
import SearchBar from './SearchBar'
import ThemeToggle from '../common/ThemeToggle'
import LanguageToggle from '../common/LanguageToggle'
import { useApp } from '../../context/AppContext'

export default function Navbar() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { favorites, itinerary } = useApp()

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/touchdown', label: t('nav.touchdown') },
    { to: '/map', label: t('nav.map') },
    { to: '/starter-kit', label: t('nav.starterKit') }
  ]

  return (
    <header className="sticky top-3 sm:top-4 z-40 transition-all">
      <nav className="container-app flex items-center justify-between h-16 px-4 sm:px-6 rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/70 dark:bg-neutral-950/70 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/30 transition-colors">
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
          <SearchBar />
          <Link to="/itinerary" title={t('nav.itinerary')} className="relative p-2 rounded-full text-gray-500 dark:text-gray-300 hover:text-brand-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <CalendarCheck size={18} />
            {itinerary.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid place-items-center w-4 h-4 rounded-full bg-brand-500 text-white text-[9px] font-bold">{itinerary.length}</span>
            )}
          </Link>
          <Link to="/my-spots" title={t('nav.mySpots')} className="relative p-2 rounded-full text-gray-500 dark:text-gray-300 hover:text-brand-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <Bookmark size={18} />
            {favorites.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid place-items-center w-4 h-4 rounded-full bg-brand-500 text-white text-[9px] font-bold">{favorites.length}</span>
            )}
          </Link>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
