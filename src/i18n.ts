import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'

const KEY = 'tomato-mandi-lang'

function savedLanguage() {
  try {
    return localStorage.getItem(KEY) === 'te' ? 'te' : 'en'
  } catch {
    return 'en'
  }
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnObjects: true,
})

function loadTeluguFonts() {
  if (document.getElementById('te-fonts')) return
  const link = document.createElement('link')
  link.id = 'te-fonts'
  link.rel = 'stylesheet'
  link.href =
    'https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400..700&family=Noto+Serif+Telugu:wght@500..700&display=swap'
  document.head.appendChild(link)
}

/** Telugu strings and fonts load only when someone actually picks Telugu. */
export async function setLanguage(lng: 'en' | 'te') {
  if (lng === 'te') {
    loadTeluguFonts()
    if (!i18n.hasResourceBundle('te', 'translation')) {
      const te = await import('./locales/te.json')
      i18n.addResourceBundle('te', 'translation', te.default)
    }
  }
  await i18n.changeLanguage(lng)
  document.documentElement.lang = lng
  try {
    localStorage.setItem(KEY, lng)
  } catch {
    /* Private mode: the choice just won't persist. */
  }
}

if (savedLanguage() === 'te') void setLanguage('te')

export default i18n
