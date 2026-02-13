'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

export default function YolHarakatiPage() {
  const router = useRouter()
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchChapters = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/rules/traffic?lang=uzl`)
      if (!res.ok) throw new Error('API xatolik')
      const data = await res.json()
      setChapters(data.chapters || [])
    } catch (e) {
      console.error('Qoidalarni yuklashda xatolik:', e)
      setChapters([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChapters()
  }, [fetchChapters])

  const filtered = chapters.filter(
    (c) =>
      !search.trim() ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.number?.includes(search)
  )

  const getRandomColor = (index) => {
    const colors = [
      { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-500' },
      { bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-500' },
      { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-500' },
      { bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-600' },
      { bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-600' },
      { bg: 'bg-yellow-50 dark:bg-yellow-900/30', text: 'text-yellow-600' },
      { bg: 'bg-cyan-50 dark:bg-cyan-900/30', text: 'text-cyan-600' },
    ]
    return colors[index % colors.length]
  }

  const getRandomIcon = (index) => {
    const icons = ['info', 'directions_car', 'report', 'directions_walk', 'groups', 'emergency', 'traffic']
    return icons[index % icons.length]
  }

  return (
    <div className="bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-200 font-sans">

      {/* DESKTOP SIDEBAR */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col z-50">
        <div className="p-6">
          <div className="flex items-center gap-3 text-sky-500 mb-10">
            <span className="material-icons-round text-3xl">traffic</span>
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white leading-tight">Yo'l Harakati</span>
          </div>
          <nav className="space-y-1">
            <Link href="/qoidalar" className="flex items-center gap-3 px-4 py-3 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl font-semibold">
              <span className="material-icons-round">menu_book</span>
              Qoidalar
            </Link>
            <Link href="/biletlar" className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <span className="material-icons-round">quiz</span>
              Testlar
            </Link>
            <Link href="/qoidalar/yol-belgilari" className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <span className="material-icons-round">warning</span>
              Belgilar
            </Link>
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <span className="material-icons-round">dashboard</span>
              Dashboard
            </Link>
          </nav>
        </div>
      </aside>

      <main className="lg:ml-72 min-h-screen pb-10">
        <header className="sticky top-0 bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-40">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
            <div className="flex-1 max-w-2xl relative">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-sky-500 rounded-2xl text-slate-800 dark:text-white placeholder:text-slate-400 transition-all outline-none"
                placeholder="Bob nomini qidiring..."
              />
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="lg:hidden p-2 text-slate-500">
                <span className="material-icons-round">arrow_back</span>
              </button>
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-10 max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Yo'l harakati qoidalari</h1>
            <p className="text-slate-500 dark:text-slate-400">O'zbekiston Respublikasi Yo'l harakati qoidalarining to'liq ro'yxati</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Yuklanmoqda...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((ch, idx) => {
                const style = getRandomColor(idx)
                const icon = getRandomIcon(idx)
                return (
                  <Link
                    key={ch.id}
                    href={`/qoidalar/yol-harakati/${ch.id}`}
                    className="group bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 shadow-sm hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 rounded-2xl ${style.bg} flex items-center justify-center ${style.text}`}>
                        <span className="material-icons-round text-2xl">{icon}</span>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full">{ch.number}-BOB</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors mb-2">{ch.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">Ushbu bobda {ch.title.toLowerCase()} haqida to'liq ma'lumot berilgan.</p>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-400">{ch.article_count} ta modda</span>
                      <span className="material-icons-round text-slate-300 group-hover:text-sky-500 group-hover:translate-x-1 transition-all">arrow_forward</span>
                    </div>
                  </Link>
                )
              })}
              {filtered.length === 0 && <p className="col-span-full text-center py-12 text-slate-400">Natija topilmadi</p>}
            </div>
          )}
        </main>
      </main>
    </div>
  )
}
