'use client'

import { ThemeProvider } from '@/context/ThemeContext'

export default function ThemeProviderWrapper({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
