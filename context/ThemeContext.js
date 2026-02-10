'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext({ theme: 'dark', setTheme: () => {}, toggleTheme: () => {}, mounted: false })

const STORAGE_KEY = 'theme'

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('dark')
  const [mounted, setMounted] = useState(false)

  const applyTheme = useCallback((value) => {
    if (typeof document === 'undefined') return
    const html = document.documentElement
    if (value === 'light') {
      document.body.classList.add('light-mode')
      html.classList.remove('dark')
    } else {
      document.body.classList.remove('light-mode')
      html.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    const saved = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) || 'dark'
    setThemeState(saved)
    applyTheme(saved)
    setMounted(true)
  }, [applyTheme])

  const setTheme = useCallback(
    (value) => {
      const next = value === 'light' ? 'light' : 'dark'
      setThemeState(next)
      if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, next)
      applyTheme(next)
    },
    [applyTheme]
  )

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
  }, [theme, setTheme])

  const value = { theme, setTheme, toggleTheme, mounted }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
