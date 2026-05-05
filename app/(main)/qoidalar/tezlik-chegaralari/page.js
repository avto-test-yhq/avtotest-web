'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'
import { useLanguage } from '@/context/LanguageContext'
import QoidalarHeader from '@/components/QoidalarHeader'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz'

const mapIcon = (iconName) => {
  switch (iconName) {
    case 'building': return 'apartment'
    case 'highway': return 'add_road'
    case 'mountain': return 'terrain'
    case 'building-2': return 'business'
    case 'route': return 'directions_run'
    case 'trees': return 'park'
    default: return 'speed'
  }
}

const mapVehicleIcon = (iconName) => {
  switch (iconName) {
    case 'car': return 'directions_car'
    case 'truck': return 'local_shipping'
    case 'motorcycle': return 'two_wheeler'
    case 'bus': return 'directions_bus'
    default: return 'commute'
  }
}

const ICON_COLORS = [
  'bg-blue-500/10 text-blue-500',
  'bg-emerald-500/10 text-emerald-500',
  'bg-amber-500/10 text-amber-500',
  'bg-rose-500/10 text-rose-500',
];

export default function TezlikChegaralariPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const [chapters, setChapters] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/v1/rules/speed-limits?lang=${lang || 'uzl'}`)
      if (!res.ok) throw new Error('API xatolik')
      const data = await res.json()
      setChapters(data.chapters || [])
      setItems(data.items || [])
    } catch (e) {
      console.error('Tezlik chegaralarini yuklashda xatolik:', e)
      setChapters([])
    } finally {
      setLoading(false)
    }
  }, [lang])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="flex flex-col w-full h-full relative z-10">
      <QoidalarHeader title="Tezlik chegaralari" />

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
        {/* SIDEBAR */}
        <aside className="hidden lg:block w-80 border-r border-slate-200 dark:border-slate-800 p-6 h-[calc(100vh-64px)] sticky top-16 bg-white dark:bg-[#1e293b]/50 overflow-y-auto custom-scrollbar">
          <nav className="space-y-1">
            <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">Hududlar</span>
            </div>
            {loading ? (
              <div className="px-3 text-sm text-slate-400 animate-pulse">Yuklanmoqda...</div>
            ) : (
              chapters.map((ch) => (
                <a
                  key={ch.id}
                  href={`#chapter-${ch.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
                >
                  <span className="material-icons-round text-lg text-slate-400 group-hover:text-blue-500 transition-colors">
                    {mapIcon(ch.icon)}
                  </span>
                  <span className="line-clamp-1">{ch.name?.[lang] || ch.name}</span>
                </a>
              ))
            )}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-4xl mx-auto w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-[#9AA4B2] md:text-slate-400">Tezlik chegaralari yuklanmoqda...</p>
            </div>
          ) : (
            <div className="space-y-6 md:space-y-10 pb-24">
              {chapters.map((ch, idx) => {
                const chapterItems = items.filter(it => it.chapter_id === ch.id);
                return (
                  <div key={ch.id} id={`chapter-${ch.id}`} className="scroll-mt-24">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-3xl p-6 md:p-8 shadow-sm">
                       <div className="flex items-center gap-4 text-white">
                          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <span className="material-icons-round text-3xl">{mapIcon(ch.icon)}</span>
                          </div>
                          <div>
                            <h2 className="text-xl md:text-2xl font-bold leading-tight">{ch.name?.[lang] || ch.name}</h2>
                            <p className="text-blue-100 text-sm mt-1">{chapterItems.length} ta transport turi</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-[#212936] md:bg-white md:dark:bg-[#1e293b] rounded-b-3xl p-5 md:p-8 shadow-sm border-x border-b border-[#313C50] md:border-slate-100 md:dark:border-slate-800">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        {chapterItems.map((item, i) => {
                           const speed = (item.name?.[lang] || item.name).split('-')[1]?.trim() || '';
                           const vehicle = (item.name?.[lang] || item.name).split('-')[0]?.trim() || '';
                           
                           return (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[#161c24] md:bg-slate-50 md:dark:bg-[#161821] border border-[#313C50] md:border-slate-100 md:dark:border-slate-800 hover:border-blue-500 transition-all group">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-[#212936] md:bg-white md:dark:bg-[#1e293b] flex items-center justify-center border border-[#313C50] md:border-none shadow-sm text-blue-500">
                                  <span className="material-icons-round">{mapVehicleIcon(item.image)}</span>
                                </div>
                                <span className="font-bold text-sm md:text-base text-white md:text-slate-700 md:dark:text-slate-300">{vehicle}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-2xl md:text-2xl font-black text-white md:text-blue-600 md:dark:text-blue-400 group-hover:scale-110 transition-transform">{speed}</span>
                                <span className="text-[10px] font-bold text-[#9AA4B2] md:text-slate-400 uppercase">km/s</span>
                              </div>
                            </div>
                           );
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
              {chapters.length === 0 && (
                <div className="text-center py-20 bg-[#212936] md:bg-white md:dark:bg-[#1e293b] rounded-3xl border border-[#313C50] md:border-slate-200 md:dark:border-slate-800">
                  <span className="material-icons-round text-5xl text-slate-300 mb-4 block">speed</span>
                  <p className="text-slate-500">Ma'lumot topilmadi</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  )
}
