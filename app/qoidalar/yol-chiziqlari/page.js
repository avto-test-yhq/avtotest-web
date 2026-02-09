'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

const categories = [
  {
    id: 'horizontal',
    name: 'Yotiq chiziqlar',
    count: 40,
    icon: 'horizontal',
    iconBg: 'bg-orange-500/20',
  },
  {
    id: 'vertical',
    name: 'Tik chiziqlar',
    count: 9,
    icon: 'vertical',
    iconBg: 'bg-orange-500/20',
  },
]

export default function YolChiziqlariPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#161821] text-white font-sans">
      <header className="h-16 flex items-center gap-4 px-4 lg:px-8 bg-[#1e2130] border-b border-white/5 shrink-0">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-[#2a2d3e] hover:bg-[#35394b] flex items-center justify-center text-slate-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m7 7l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-lg font-bold text-white">Yo&apos;l chiziqlari</h1>
      </header>

      <main className="p-4 lg:p-8 max-w-2xl mx-auto pb-24">
        <div className="space-y-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/qoidalar/yol-chiziqlari/${cat.id}`}
              className="flex items-center justify-between p-4 rounded-xl bg-[#1e2130] border border-white/5 hover:border-orange-500/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${cat.iconBg} flex items-center justify-center`}>
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {cat.id === 'horizontal' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                    )}
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white">{cat.name}</p>
                  <p className="text-xs text-slate-500">{cat.count} ta chiziq</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-slate-400 group-hover:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
