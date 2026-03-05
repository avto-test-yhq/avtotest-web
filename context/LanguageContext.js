'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const LANG_STORAGE_KEY = 'appLanguage'

// allowed: 'uzl' (o'zbek lotin), 'uzk' (o'zbek kiril), 'ru'
const DEFAULT_LANG = 'uzl'

const LanguageContext = createContext({
  lang: DEFAULT_LANG,
  setLang: () => { },
})

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANG)

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      const saved = localStorage.getItem(LANG_STORAGE_KEY)
      if (saved && ['uzl', 'uzk', 'ru'].includes(saved)) {
        setLangState(saved)
      }
    } catch {
      // ignore
    }
  }, [])

  const setLang = useCallback((value) => {
    const next = ['uzl', 'uzk', 'ru'].includes(value) ? value : DEFAULT_LANG
    setLangState(next)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANG_STORAGE_KEY, next)
      }
    } catch {
      // ignore
    }
  }, [])

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

export function getLanguageLabel(code) {
  if (code === 'uzl') return "O'zbek (Lotin)"
  if (code === 'uzk') return "Ўзбек (Кирилл)"
  if (code === 'ru') return "Русский"
  return "O'zbek (Lotin)"
}
