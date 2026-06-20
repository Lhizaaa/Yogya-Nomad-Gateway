import { useLanguage } from '../../context/LanguageContext'

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage()
  return (
    <div className="flex items-center rounded-full bg-gray-100 dark:bg-white/10 p-0.5 text-xs font-semibold">
      {['id', 'en'].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-2.5 py-1 rounded-full transition-colors ${
            lang === l
              ? 'bg-brand-500 text-white shadow'
              : 'text-gray-500 dark:text-gray-400 hover:text-brand-600'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
