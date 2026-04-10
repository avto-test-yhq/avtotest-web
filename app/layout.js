import './globals.css'
import { Inter, Outfit, Plus_Jakarta_Sans } from 'next/font/google'
import ThemeProviderWrapper from './ThemeProviderWrapper'
import { ExamSettingsProvider } from '@/context/ExamSettingsContext'
import AosInit from '@/components/AosInit'


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata = {
  title: 'PravachiUZ – Haydovchilik Guvohnomasi №1 Platforma',
  description: "Sun'iy intellekt (AI) yordamida haydovchilik guvohnomasini birinchi urinishda oling. 1200+ YHQ test savollari, simulyatsiya imtihonlari, xatolar banki va bepul boshlash imkoniyati.",
  keywords: [
    'haydovchilik guvohnomasi', 'avtotest', 'YHQ test', 'yo\'l harakati qoidalari',
    'haydovchilik imtihoni', 'PravachiUZ', 'pravachi', 'avtotest o\'zbekiston',
    'haydovchilik kursi', 'AI mentor', 'online test', 'yo\'l qoidalari',
  ],
  authors: [{ name: 'PravachiUZ' }],
  creator: 'PravachiUZ',
  metadataBase: new URL('https://pravachi.uz'),
  openGraph: {
    title: 'PravachiUZ – Haydovchilik Guvohnomasi №1 Platforma',
    description: "Sun'iy intellekt yordamida haydovchilik guvohnomasini birinchi urinishda oling. 1200+ test savoli va bepul boshlash.",
    url: 'https://pravachi.uz',
    siteName: 'PravachiUZ',
    locale: 'uz_UZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PravachiUZ – Haydovchilik №1 Platforma',
    description: "1200+ YHQ test savollari, AI Mentor va simulyatsiya imtihoni bilan guvohnomani birinchi urinishda oling.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

// Tema flash oldini olish: sahifa yuklanishidan oldin localStorage dan temani o'qib body ga qo'llash
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('theme');
    document.body.classList.toggle('light-mode', t === 'light');
  } catch (e) {}
})();
`

export default function RootLayout({ children }) {
  return (
    <html lang="uz" className="scroll-smooth">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
        <link rel="icon" href="/imgage/avtotest-logo.png" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} ${plusJakarta.variable} font-sans selection:bg-brand-cyan selection:text-night-950 transition-colors duration-300`}>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ExamSettingsProvider>
          <ThemeProviderWrapper>
            {children}
          </ThemeProviderWrapper>
        </ExamSettingsProvider>
        <AosInit />
      </body>
    </html>
  )
}
