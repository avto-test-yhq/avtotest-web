'use client'

import { useLanguage } from '@/context/LanguageContext'

// Soddalashtirilgan i18n: faqat UI matnlar uchun
// Keylar: 'nav.dashboard', 'nav.rules', va hokazo
import uzlData from '../locales/uzl.json'
import uzkData from '../locales/uzk.json'
import ruData from '../locales/ru.json'


export const messages = {
  uzl: uzlData,
  uzk: uzkData,
  ru: ruData,
}

export function t(lang, key) {
  const dict = messages[lang] || messages.uzl
  return dict[key] || messages.uzl[key] || key
}

export function useI18n() {
  const { lang } = useLanguage()
  return (key) => t(lang, key)
}

