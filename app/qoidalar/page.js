'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

const cards = [
  {
    id: 'yol-harakati',
    href: '/qoidalar/yol-harakati',
    icon: '📖',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    title: "Yo'l harakati qoidalari",
    subtitle: '30 bob',
  },
  {
    id: 'yol-belgilari',
    href: '/qoidalar/yol-belgilari',
    icon: '🛑',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    title: "Yo'l belgilari",
    subtitle: '7 kategoriya',
  },
  {
    id: 'yol-chiziqlari',
    href: '/qoidalar/yol-chiziqlari',
    icon: '🛣️',
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
    title: "Yo'l chiziqlari",
    subtitle: 'Yotiq va tik',
  },
  {
    id: 'tezlik-chegaralari',
    href: '/qoidalar/tezlik-chegaralari',
    icon: '⏱️',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    title: 'Tezlik chegaralari',
    subtitle: "Tez ma'lumot",
  },
  {
    id: 'kerakli-hujjatlar',
    href: '/qoidalar/kerakli-hujjatlar',
    icon: '📄',
    iconBg: 'bg-slate-500/20',
    iconColor: 'text-slate-300',
    title: 'Kerakli hujjatlar',
    subtitle: "Toifalar bo'yicha hujjatlar ro'yxati",
  },
]

export default function QoidalarPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#161821] text-white font-sans">
      <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-[#1e2130] border-b border-white/5 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-lg bg-[#2a2d3e] hover:bg-[#35394b] flex items-center justify-center text-slate-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m7 7l-7-7 7-7" /></svg>
          </button>
          <div className="flex items-center gap-2">
            <Image src="/imgage/avtotest-logo.png" alt="Logo" width={32} height={32} className="rounded-lg object-contain" />
            <h1 className="text-lg font-bold text-white">Qoidalar</h1>
          </div>
        </div>
      </header>

      <main className="p-4 lg:p-8 max-w-4xl mx-auto pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="rounded-2xl bg-[#1e2130] border border-white/5 p-6 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group block"
            >
              <div className={`w-14 h-14 rounded-full ${card.iconBg} flex items-center justify-center text-2xl mb-4 ${card.iconColor}`}>
                {card.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-300">{card.title}</h3>
              <p className="text-sm text-slate-400">{card.subtitle}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
