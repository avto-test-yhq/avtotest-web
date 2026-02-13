'use client'

import { useTheme } from '@/context/ThemeContext'

export default function ThemeToggle({ className = '', size = 'md' }) {
  const { theme, toggleTheme } = useTheme()

  const sizeClass = size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10 sm:w-11 sm:h-11'
  const iconClass = size === 'sm' ? 'w-5 h-5' : 'w-5 h-5 sm:w-6 sm:h-6'

  return (
    <button
      type="button"
      id="theme-toggle"
      onClick={toggleTheme}
      className={`flex items-center justify-center rounded-full transition-all theme-toggle-btn ${sizeClass} ${className} ${theme === 'dark'
          ? 'bg-slate-800/50 hover:bg-slate-800 text-white border border-white/5'
          : 'bg-transparent text-slate-900 hover:bg-slate-100'
        }`}
      title={theme === 'dark' ? "Kun rejimi" : "Tun rejimi"}
      aria-label={theme === 'dark' ? "Kun rejimiga o'tish" : "Tun rejimiga o'tish"}
    >
      {theme === 'dark' ? (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  )
}

