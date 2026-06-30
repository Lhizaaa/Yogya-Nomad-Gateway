import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, Plane, Map, Backpack } from 'lucide-react'

export default function BottomNav() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  const items = [
    { to: '/', icon: Home, label: t('nav.home') },
    { to: '/touchdown', icon: Plane, label: t('nav.touchdown') },
    { to: '/map', icon: Map, label: t('nav.map') },
    { to: '/starter-kit', icon: Backpack, label: t('nav.starterKit') }
  ]

  const isActive = (to) => (to === '/' ? pathname === '/' : pathname.startsWith(to))

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200/70 dark:border-white/10 bg-white/85 dark:bg-neutral-950/85 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around">
        {items.map(({ to, icon: Icon, label }) => {
          const active = isActive(to)
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 flex-1 transition-colors ${
                active ? 'text-brand-500' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
