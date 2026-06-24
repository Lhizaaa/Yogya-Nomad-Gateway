import { createContext, useContext, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation()

  useEffect(() => {
    document.documentElement.setAttribute('lang', i18n.language)
  }, [i18n.language])

  const setLang = useCallback((lng) => {
    i18n.changeLanguage(lng)
    try { localStorage.setItem('lang', lng) } catch { /* ignore */ }
    document.documentElement.setAttribute('lang', lng)
  }, [i18n])

  const toggle = useCallback(() => {
    setLang(i18n.language === 'id' ? 'en' : 'id')
  }, [i18n.language, setLang])

  return (
    <LanguageContext.Provider value={{ lang: i18n.language, setLang, toggle }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
