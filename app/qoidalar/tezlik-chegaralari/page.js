'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'
import { useLanguage } from '@/context/LanguageContext'
import UserProfileHeader from '@/components/UserProfileHeader'
import QoidalarHeader from '@/components/QoidalarHeader'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz'

const mapIcon = (iconName) => {
  switch (iconName) {
    case 'building': return 'apartment'
    case 'school': return 'school'
    case 'home': return 'home'
    case 'highway': return 'add_road'
    case 'mountain': return 'terrain'
    default: return 'place'
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

const ICON_COLORS = {
  blue: 'bg-blue-500/10 text-blue-500',
  red: 'bg-red-500/10 text-red-500',
  orange: 'bg-amber-500/10 text-amber-500',
  green: 'bg-emerald-500/10 text-emerald-500',
}

export default function TezlikChegaralariPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/rules/speed-limits?lang=${lang || 'uzl'}`)
      if (!res.ok) throw new Error('API xatolik')
      const data = await res.json()
      setZones(data.zones || [])
    } catch (e) {
      console.error('Tezlik chegaralarini yuklashda xatolik:', e)
      setZones([])
    } finally {
      setLoading(false)
    }
  }, [lang])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="bg-[#161c24] md:bg-slate-50 md:dark:bg-[#0f172a] text-white md:text-slate-900 md:dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">

      {/* HEADER */}
      <QoidalarHeader title="Tezlik chegaralari" />

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
        {/* SIDEBAR */}
        <aside className="hidden lg:block w-80 border-r border-slate-200 dark:border-slate-800 p-6 h-[calc(100vh-64px)] sticky top-16 bg-white dark:bg-[#1e293b]/50 overflow-y-auto custom-scrollbar">
          <nav className="space-y-1">
            <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">Hududlar</span>
            </div>
            {loading && zones.length === 0 ? (
              <div className="px-3 text-sm text-slate-400">Yuklanmoqda...</div>
            ) : (
              zones.map((zone) => (
                <a
                  key={zone.id}
                  href={`#zone-${zone.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
                >
                  <span className={`material-icons-round text-lg ${zone.icon === 'building' ? 'text-sky-500' : 'text-slate-400 group-hover:text-slate-500'}`}>
                    {mapIcon(zone.icon)}
                  </span>
                  <span className="line-clamp-1">{zone.name}</span>
                </a>
              ))
            )}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-4xl mx-auto w-full">
          {loading ? (
            <div className="text-center py-12 text-[#9AA4B2] md:text-slate-400">Yuklanmoqda...</div>
          ) : (
            <div className="space-y-6 md:space-y-8 pb-24">
              {zones.map((zone) => (
                <div key={zone.id} id={`zone-${zone.id}`} className="scroll-mt-24 bg-[#212936] md:bg-white md:dark:bg-[#1e293b] rounded-[24px] md:rounded-3xl p-5 md:p-8 shadow-sm border border-[#313C50] md:border-slate-100 md:dark:border-slate-800">
                  <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-[16px] md:rounded-2xl flex items-center justify-center shrink-0 border border-[#313C50] md:border-none ${ICON_COLORS[zone.icon_color] || 'bg-[#161c24] md:bg-slate-100 md:dark:bg-slate-800 text-[#9AA4B2] md:text-slate-500'}`}>
                      <span className="material-icons-round text-[24px] md:text-3xl">{mapIcon(zone.icon)}</span>
                    </div>
                    <h2 className="text-[18px] md:text-xl font-bold text-white md:text-slate-900 md:dark:text-white leading-tight">{zone.name}</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {zone.limits?.map((limit, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 md:p-4 rounded-[16px] md:rounded-xl bg-[#161c24] md:bg-slate-50 md:dark:bg-[#161821] border border-[#313C50] md:border-slate-100 md:dark:border-slate-800 hover:scale-[1.02] md:hover:scale-[1.02] transition-transform active:scale-[0.98] md:active:scale-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 md:w-10 md:h-10 rounded-full bg-[#212936] md:bg-white md:dark:bg-[#1e293b] flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.2)] md:shadow-sm border border-[#313C50] md:border-none">
                            <span className="material-icons-round text-[#9AA4B2] md:text-slate-400">{mapVehicleIcon(limit.icon)}</span>
                          </div>
                          <span className="font-bold md:font-medium text-[13px] md:text-base text-white md:text-slate-700 md:dark:text-slate-300">{limit.vehicle}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[20px] md:text-2xl font-black md:font-bold text-white md:text-slate-900 md:dark:text-white leading-none">{limit.speed}</span>
                          <span className="text-[9px] md:text-[10px] font-bold text-[#9AA4B2] md:text-slate-400 uppercase mt-0.5">km/s</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {zones.length === 0 && <p className="text-center py-12 text-[#9AA4B2] md:text-slate-400">Ma'lumot topilmadi</p>}
            </div>
          )}
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
      `}</style>
    </div>
  )
}
