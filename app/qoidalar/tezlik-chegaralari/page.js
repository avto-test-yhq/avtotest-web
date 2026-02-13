'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'
import UserProfileHeader from '@/components/UserProfileHeader'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

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
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/rules/speed-limits?lang=uzl`)
      if (!res.ok) throw new Error('API xatolik')
      const data = await res.json()
      setZones(data.zones || [])
    } catch (e) {
      console.error('Tezlik chegaralarini yuklashda xatolik:', e)
      setZones([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center justify-center text-slate-600 dark:text-slate-400"
            >
              <span className="material-icons-round">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Tezlik chegaralari</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="h-8 w-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-sky-500/20">
              <UserProfileHeader />
            </div>
          </div>
        </div>
      </header>

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
        <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Yuklanmoqda...</div>
          ) : (
            <div className="space-y-8 pb-24">
              {zones.map((zone) => (
                <div key={zone.id} id={`zone-${zone.id}`} className="scroll-mt-24 bg-white dark:bg-[#1e293b] rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${ICON_COLORS[zone.icon_color] || 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      <span className="material-icons-round text-3xl">{mapIcon(zone.icon)}</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{zone.name}</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {zone.limits?.map((limit, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#161821] border border-slate-100 dark:border-slate-800 hover:scale-[1.02] transition-transform">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1e293b] flex items-center justify-center shadow-sm">
                            <span className="material-icons-round text-slate-400">{mapVehicleIcon(limit.icon)}</span>
                          </div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{limit.vehicle}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{limit.speed}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">km/s</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {zones.length === 0 && <p className="text-center py-12 text-slate-400">Ma&apos;lumot topilmadi</p>}
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
