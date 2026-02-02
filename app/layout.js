import './globals.css'
import { Inter, Outfit } from 'next/font/google'
import Script from 'next/script'

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

export const metadata = {
  title: 'PravachiUZ - Premium Haydovchilik',
  description: 'Haydovchilikni kelajakda o\'rganing',
}

export default function RootLayout({ children }) {
  return (
    <html lang="uz" className="scroll-smooth">
      <body className={`${inter.variable} ${outfit.variable} selection:bg-brand-cyan selection:text-night-950`}>
        {children}
        <Script src="https://unpkg.com/aos@2.3.1/dist/aos.js" strategy="afterInteractive" />
        <Script id="aos-init" strategy="afterInteractive">
          {`AOS.init({ duration: 800, once: true, offset: 50 });`}
        </Script>
      </body>
    </html>
  )
}
