'use client'

import { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'

const OPTIONS = [
  { code: 'uzl', label: "O'zbek", sub: 'Lotin' },
  { code: 'uzk', label: "O'zbek", sub: 'Kiril' },
  { code: 'ru', label: 'Русский', sub: '' },
]

export default function LanguageSwitcher({ size = 'md' }) {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)

  const current = OPTIONS.find((o) => o.code === lang) || OPTIONS[0]

  const baseText = size === 'sm' ? 'text-[11px]' : 'text-xs'

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 ${baseText} font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors`}
      >
        <span>{current.label}</span>
        {current.sub && <span className="text-[10px] font-normal opacity-80">({current.sub})</span>}
        <svg
          className={`w-3 h-3 text-slate-500 dark:text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-40 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg py-1 z-50">
          {OPTIONS.map((opt) => {
            const active = opt.code === lang
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => {
                  setLang(opt.code)
                  setOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-left text-[11px] ${
                  active
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span>{opt.label}</span>
                {opt.sub && <span className="text-[10px] opacity-80">{opt.sub}</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

