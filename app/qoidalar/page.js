'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import QoidalarSidebar from '@/components/QoidalarSidebar'
import { useI18n, getCurrentLocale } from '@/lib/i18n'
import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz/api/v1';


export default function QoidalarPage() {
  const router = useRouter()
  const t = useI18n()
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const lang = getCurrentLocale()
        const res = await fetch(`${API_URL}/rules/topics?lang=${lang}`)
        if (res.ok) {
          const data = await res.json()
          setTopics(data.topics || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchTopics()
  }, [])

  return (
    <div className="bg-[#161c24] md:bg-slate-50 md:dark:bg-[#0f172a] text-white md:text-slate-900 md:dark:text-slate-100 min-h-screen transition-colors duration-200 font-sans">

      {/* DESKTOP SIDEBAR */}
      <QoidalarSidebar />

      <main className="lg:ml-72 min-h-screen pb-10">
        <header className="sticky top-0 bg-[#161c24]/90 md:bg-white/80 md:dark:bg-[#1e293b]/80 backdrop-blur-md border-b border-[#313C50] md:border-slate-200 md:dark:border-slate-800 z-40">
          <div className="max-w-5xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between gap-6">
            <div className="flex-1 max-w-xl relative flex items-center gap-3">
              <button onClick={() => router.back()} className="lg:hidden p-2 text-white md:text-slate-500 hover:bg-[#313C50] md:hover:bg-transparent rounded-xl transition-colors -ml-2">
                <span className="material-icons-round">arrow_back</span>
              </button>
              <h1 className="text-[20px] font-bold text-white md:text-slate-800 md:dark:text-white lg:hidden">{t('sidebar.rules')}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <LanguageSwitcher size="sm" />
              </div>
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
          <div className="mb-6 md:mb-10 text-center md:text-left">
            <h1 className="text-[24px] md:text-3xl font-bold text-white md:text-slate-900 md:dark:text-white mb-2">{t('rules.page.title')}</h1>
            <p className="text-[14px] text-[#9AA4B2] md:text-slate-500 md:dark:text-slate-400">{t('rules.page.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {loading ? (
              // Skeleton cards
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-[#212936] md:bg-white md:dark:bg-[#1e293b] p-6 rounded-[24px] border border-[#313C50] md:border-slate-200 md:dark:border-slate-800 min-h-[220px]">
                  <div className="w-12 h-12 rounded-[16px] bg-slate-700/20 mb-4" />
                  <div className="h-6 w-3/4 bg-slate-700/20 rounded mb-2" />
                  <div className="h-4 w-full bg-slate-700/10 rounded mb-1" />
                  <div className="h-4 w-1/2 bg-slate-700/10 rounded" />
                </div>
              ))
            ) : (
              topics.map((item) => {
                const href = `/qoidalar/${item.id}`;
                return (
                  <Link
                    key={item.id}
                    href={href}
                    className="group bg-[#212936] md:bg-white md:dark:bg-[#1e293b] p-6 rounded-[24px] border border-[#313C50] md:border-slate-200 md:dark:border-slate-800 hover:border-blue-500 md:hover:border-sky-500 shadow-sm md:hover:shadow-xl md:hover:shadow-sky-500/5 transition-all duration-300 active:scale-[0.98]"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 rounded-[16px] ${item.bg || 'bg-blue-50 dark:bg-blue-900/20'} flex items-center justify-center ${item.color || 'text-blue-500'}`}>
                        <span className="material-icons-round text-2xl">{item.icon || 'menu_book'}</span>
                      </div>
                      <span className="text-[11px] font-bold px-3 py-1 bg-[#161c24] md:bg-slate-100 md:dark:bg-slate-700 text-[#9AA4B2] md:text-slate-500 md:dark:text-slate-400 rounded-full">{item.badge}</span>
                    </div>
                    <h3 className="text-[18px] md:text-lg font-bold text-white md:text-slate-900 md:dark:text-white group-hover:text-blue-500 md:group-hover:text-sky-500 transition-colors mb-2">{item.name}</h3>
                    <p className="text-[13px] md:text-sm text-[#9AA4B2] md:text-slate-500 md:dark:text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-[13px] md:text-sm font-bold text-[#9AA4B2] md:text-slate-400">{t('rules.page.detail')}</span>
                      <div className="w-8 h-8 rounded-full bg-[#161c24] md:bg-transparent flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <span className="material-icons-round text-[20px] text-[#9AA4B2] md:text-slate-300 md:group-hover:text-sky-500 group-hover:text-white md:group-hover:translate-x-1 transition-all">arrow_forward</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
