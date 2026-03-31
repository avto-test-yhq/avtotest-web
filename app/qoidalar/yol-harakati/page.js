'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ThemeToggle from '@/components/ThemeToggle'
import { useLanguage } from '@/context/LanguageContext'
import { useI18n } from '@/lib/i18n'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz'

export default function YolHarakatiPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const t = useI18n()
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchChapters = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/rules/traffic?lang=${lang || 'uzl'}`)
      if (!res.ok) throw new Error('API xatolik')
      const data = await res.json()
      setChapters(data.chapters || [])
    } catch (e) {
      console.error('Qoidalarni yuklashda xatolik:', e)
      setChapters([])
    } finally {
      setLoading(false)
    }
  }, [lang])

  useEffect(() => {
    fetchChapters()
  }, [fetchChapters])

  const filtered = chapters.filter(
    (c) =>
      !search.trim() ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.code?.toString().includes(search)
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
    <div className="bg-[#161c24] md:bg-slate-50 md:dark:bg-[#0f172a] text-white md:text-slate-900 md:dark:text-slate-100 min-h-screen transition-colors duration-200 font-sans">

      {/* DESKTOP SIDEBAR */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col z-50">
        <div className="p-6">
          <div className="flex flex-col gap-6 mb-10">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10">
                <Image
                  src="/imgage/avtotest-logo.png"
                  alt="AvtoTest Logo"
                  fill
                  className="object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="font-heading text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                PravachiUZ
              </span>
            </Link>
          </div>
          <nav className="space-y-1">
            <Link href="/qoidalar" className="flex items-center gap-3 px-4 py-3 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl font-semibold">
              <span className="material-icons-round">menu_book</span>
              {t('sidebar.rules')}
            </Link>
            <Link href="/biletlar" className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <span className="material-icons-round">quiz</span>
              {t('sidebar.tests')}
            </Link>
            <Link href="/qoidalar/yol-belgilari" className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <span className="material-icons-round">warning</span>
              {t('rules.signs.title')}
            </Link>
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <span className="material-icons-round">dashboard</span>
              {t('sidebar.dashboard')}
            </Link>
          </nav>
        </div>
      </aside>

      <main className="lg:ml-72 min-h-screen pb-10">
        <header className="sticky top-0 bg-[#161c24]/90 md:bg-white/80 md:dark:bg-[#1e293b]/80 backdrop-blur-md border-b border-[#313C50] md:border-slate-200 md:dark:border-slate-800 z-40">
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-6">
            <div className="flex-1 max-w-2xl relative flex items-center gap-2">
              <button onClick={() => router.push('/qoidalar')} className="lg:hidden p-2 text-white md:text-slate-500 hover:bg-[#313C50] md:hover:bg-transparent rounded-xl transition-colors">
                <span className="material-icons-round">arrow_back</span>
              </button>
              <div className="relative flex-1">
                <span className="material-icons-round absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-[#9AA4B2] md:text-slate-400 text-lg md:text-xl">search</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 bg-[#212936] md:bg-slate-100 md:dark:bg-slate-800 border border-[#313C50] md:border-none focus:ring-1 focus:ring-blue-500 md:focus:ring-2 md:focus:ring-sky-500 rounded-[16px] md:rounded-2xl text-white md:text-slate-800 md:dark:text-white placeholder:text-[#9AA4B2] md:placeholder:text-slate-400 transition-all outline-none text-sm md:text-base"
                  placeholder={t('rules.traffic.searchPlaceholder')}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
          <div className="mb-6 md:mb-10 text-center md:text-left">
            <h1 className="text-[24px] md:text-3xl font-bold text-white md:text-slate-900 md:dark:text-white mb-2">{t('rules.traffic.pageTitle')}</h1>
            <p className="text-[14px] text-[#9AA4B2] md:text-slate-500 md:dark:text-slate-400">{t('rules.traffic.pageSubtitle')}</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-[#9AA4B2] md:text-slate-400">{t('common.loading')}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {filtered.map((ch, idx) => {
                const style = getRandomColor(idx)
                const icon = getRandomIcon(idx)
                return (
                  <Link
                    key={ch.id}
                    href={`/qoidalar/yol-harakati/${ch.id}`}
                    className="group bg-[#212936] md:bg-white md:dark:bg-[#1e293b] p-6 rounded-[24px] border border-[#313C50] md:border-slate-200 md:dark:border-slate-800 hover:border-blue-500 md:hover:border-sky-500 shadow-sm md:hover:shadow-xl md:hover:shadow-sky-500/5 transition-all duration-300 active:scale-[0.98]"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 rounded-[16px] ${style.bg} flex items-center justify-center ${style.text}`}>
                        <span className="material-icons-round text-2xl">{icon}</span>
                      </div>
                      <span className="text-[11px] font-bold px-3 py-1 bg-[#161c24] md:bg-slate-100 md:dark:bg-slate-800 text-[#9AA4B2] md:text-slate-500 md:dark:text-slate-400 rounded-full">{ch.code}-BOB</span>
                    </div>
                    <h3 className="text-[18px] md:text-lg font-bold text-white md:text-slate-900 md:dark:text-white group-hover:text-blue-500 md:group-hover:text-sky-500 transition-colors mb-2 leading-tight">{ch.name}</h3>
                    <p className="text-[13px] md:text-sm text-[#9AA4B2] md:text-slate-500 md:dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {t('rules.traffic.chapterDesc').replace('{topic}', ch.name?.toLowerCase() || '')}
                    </p>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-[13px] md:text-sm font-bold text-[#9AA4B2] md:text-slate-400">{ch.item_count} {t('rules.traffic.articlesCount')}</span>
                      <div className="w-8 h-8 rounded-full bg-[#161c24] md:bg-transparent flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <span className="material-icons-round text-[20px] text-[#9AA4B2] md:text-slate-300 md:group-hover:text-sky-500 group-hover:text-white md:group-hover:translate-x-1 transition-all">arrow_forward</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
              {filtered.length === 0 && <p className="col-span-full text-center py-12 text-[#9AA4B2] md:text-slate-400">{t('rules.traffic.noResults')}</p>}
            </div>
          )}
        </main>
      </main>
    </div>
  )
}
