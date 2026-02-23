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
  title: 'PravachiUZ - Premium Haydovchilik',
  description: 'Haydovchilikni kelajakda o\'rganing',
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
