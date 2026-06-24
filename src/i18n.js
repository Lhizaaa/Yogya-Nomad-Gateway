import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import id from './locales/id.json'
import en from './locales/en.json'

const stored = (() => {
  try { return localStorage.getItem('lang') } catch { return null }
})()

i18n.use(initReactI18next).init({
  resources: {
    id: { translation: id },
    en: { translation: en }
  },
  lng: stored || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

export default i18n
