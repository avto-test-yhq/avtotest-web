'use client'

import { useTheme } from '@/context/ThemeContext'

export default function ThemeToggle({ className = '', size = 'md' }) {
  const { theme, toggleTheme } = useTheme()

  const sizeClass = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9 sm:w-10 sm:h-10'
  const iconClass = size === 'sm' ? 'w-4 h-4' : 'w-4 h-4 sm:w-5 sm:h-5'

  return (
    <button
      type="button"
      id="theme-toggle"
      onClick={toggleTheme}
      className={`flex items-center justify-center rounded-full bg-night-800/50 hover:bg-night-800 border border-white/5 text-slate-400 hover:text-white transition-all theme-toggle-btn ${sizeClass} ${className}`}
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
