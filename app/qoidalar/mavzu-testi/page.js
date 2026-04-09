'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ThemeToggle from '@/components/ThemeToggle'
import { useLanguage } from '@/context/LanguageContext'
import { apiFetch } from '@/lib/apiClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz'

// Mavzu ID → ikonka / rang mapping
const topicStyles = {
  rules: {
    icon: 'menu_book',
    gradient: 'from-blue-600 to-blue-700',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  },
  road_signs: {
    icon: 'warning',
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  },
  road_markings: {
    icon: 'edit_road',
    gradient: 'from-orange-500 to-amber-600',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
    badge: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  },
  hazard_labels: {
    icon: 'report',
    gradient: 'from-rose-500 to-red-600',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
    badge: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
  },
  vehicle_signs: {
    icon: 'local_shipping',
    gradient: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  },
  first_aid: {
    icon: 'medical_services',
    gradient: 'from-teal-500 to-emerald-600',
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800',
    badge: 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300',
  },
  speed_limits: {
    icon: 'speed',
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  },
};

const defaultStyle = {
  icon: 'auto_stories',
  gradient: 'from-slate-500 to-slate-600',
  bg: 'bg-slate-50 dark:bg-slate-800',
  text: 'text-slate-600 dark:text-slate-400',
  border: 'border-slate-200 dark:border-slate-700',
  badge: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
}

export default function MavzuTestiPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiFetch(`/rules/topics?lang=${lang || 'uzl'}`)
      if (!res.ok) throw new Error('API xatolik')
      const data = await res.json()
      setTopics(data.topics || [])
    } catch (e) {
      console.error('Mavzularni yuklashda xatolik:', e)
      setTopics([])
    } finally {
      setLoading(false)
    }
  }, [lang])

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  return (
    <div className="bg-[#161c24] md:bg-slate-50 md:dark:bg-[#0f172a] text-white md:text-slate-900 md:dark:text-slate-100 min-h-screen font-sans transition-colors duration-200">

      {/* DESKTOP SIDEBAR */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col z-50">
        <div className="p-6">
          <div className="flex flex-col gap-6 mb-10">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10">
                <Image src="/imgage/avtotest-logo.png" alt="Logo" fill className="object-contain group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="font-heading text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                PravachiUZ
              </span>
            </Link>
          </div>
          <nav className="space-y-1">
            <Link href="/qoidalar" className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <span className="material-icons-round">menu_book</span>
              Qoidalar
            </Link>
            <div className="flex items-center gap-3 px-4 py-3 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl font-semibold">
              <span className="material-icons-round">quiz</span>
              Mavzu bo'yicha test
            </div>
            <Link href="/biletlar" className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <span className="material-icons-round">fact_check</span>
              Biletlar
            </Link>
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <span className="material-icons-round">dashboard</span>
              Dashboard
            </Link>
          </nav>
        </div>
      </aside>

      <main className="lg:ml-72 min-h-screen pb-10">
        {/* HEADER */}
        <header className="sticky top-0 bg-[#161c24]/90 md:bg-white/80 md:dark:bg-[#1e293b]/80 backdrop-blur-md border-b border-[#313C50] md:border-slate-200 md:dark:border-slate-800 z-40">
          <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="lg:hidden p-2 text-white md:text-slate-500 hover:bg-[#313C50] md:hover:bg-slate-100 rounded-xl transition-colors"
              >
                <span className="material-icons-round">arrow_back</span>
              </button>
              <div>
                <h1 className="text-lg font-bold text-white md:text-slate-900 md:dark:text-white leading-tight">
                  Mavzu bo'yicha test
                </h1>
                <p className="text-[11px] text-[#9AA4B2] md:text-slate-400 hidden md:block">
                  Mavzuni o'rganib, bilimingizni sinab ko'ring
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="p-4 md:p-6 lg:p-10 max-w-6xl mx-auto">
          {/* Hero section */}
          <div className="mb-8 md:mb-10">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 md:p-10 text-white">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <span className="material-icons-round text-white text-4xl md:text-5xl">auto_stories</span>
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Mavzu bo'yicha test</h2>
                  <p className="text-blue-100 text-sm md:text-base max-w-lg leading-relaxed">
                    Qoidalarni mavzu bo'yicha o'rganib, har bir bob yoki band uchun maxsus tayyorlangan testlarni ishlang. Bu usul bilimni mustahkamlashning eng samarali yo'li!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Topics grid */}
          <div className="mb-6">
            <h2 className="text-lg md:text-xl font-bold text-white md:text-slate-800 md:dark:text-white mb-2">Mavzularni tanlang</h2>
            <p className="text-sm text-[#9AA4B2] md:text-slate-500 md:dark:text-slate-400">
              Quyidagi mavzulardan birini tanlab, boblarni o'qib chiqing va testni boshlang
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-[#212936] md:bg-white md:dark:bg-[#1e293b] rounded-[24px] p-6 border border-[#313C50] md:border-slate-200 md:dark:border-slate-800 animate-pulse">
                  <div className="w-12 h-12 rounded-2xl bg-[#313C50] md:bg-slate-200 mb-4" />
                  <div className="h-5 bg-[#313C50] md:bg-slate-200 rounded-lg mb-2 w-3/4" />
                  <div className="h-4 bg-[#313C50] md:bg-slate-200 rounded-lg mb-6 w-full" />
                  <div className="h-10 bg-[#313C50] md:bg-slate-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {topics.map((topic) => {
                const style = topicStyles[topic.id] || defaultStyle
                return (
                  <div
                    key={topic.id}
                    className={`group bg-[#212936] md:bg-white md:dark:bg-[#1e293b] rounded-[24px] border border-[#313C50] md:border-slate-200 md:dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300 active:scale-[0.98]`}
                  >
                    {/* Card header with gradient */}
                    <div className={`bg-gradient-to-br ${style.gradient} p-5 md:p-6 relative overflow-hidden`}>
                      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                          <span className="material-icons-round text-white text-2xl">{style.icon}</span>
                        </div>
                        {topic.has_chapters && (
                          <span className="text-[10px] font-bold bg-white/20 text-white px-3 py-1 rounded-full uppercase tracking-wider">
                            Boblar bor
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-5 md:p-6">
                      <h3 className="text-[17px] md:text-lg font-bold text-white md:text-slate-900 md:dark:text-white mb-2 leading-tight">
                        {topic.name}
                      </h3>
                      <p className="text-[13px] md:text-sm text-[#9AA4B2] md:text-slate-500 md:dark:text-slate-400 leading-relaxed mb-5 line-clamp-2">
                        {topic.description}
                      </p>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/qoidalar/mavzu-testi/${topic.id}`}
                          className={`flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r ${style.gradient} text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg`}
                        >
                          <span className="material-icons-round text-[18px]">play_circle</span>
                          O'qish va Test Ishlash
                        </Link>
                        <Link
                          href={`/qoidalar/${topic.id === 'rules' ? 'yol-harakati' : topic.id === 'road_signs' ? 'yol-belgilari' : topic.id === 'road_markings' ? 'yol-chiziqlari' : topic.id === 'speed_limits' ? 'tezlik-chegaralari' : topic.id}`}
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-[#161c24] md:bg-slate-100 md:dark:bg-slate-800 text-[#9AA4B2] md:text-slate-600 md:dark:text-slate-300 font-semibold text-sm hover:opacity-80 transition-opacity"
                        >
                          <span className="material-icons-round text-[16px]">menu_book</span>
                          Faqat o'qish
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}

              {topics.length === 0 && (
                <p className="col-span-full text-center py-20 text-[#9AA4B2] md:text-slate-400">
                  Mavzular topilmadi
                </p>
              )}
            </div>
          )}

          {/* Info card */}
          <div className="mt-10 bg-[#212936] md:bg-white md:dark:bg-[#1e293b] rounded-3xl border border-[#313C50] md:border-slate-200 md:dark:border-slate-800 p-5 md:p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <span className="material-icons-round text-amber-500 text-xl">lightbulb</span>
            </div>
            <div>
              <h4 className="font-bold text-white md:text-slate-800 md:dark:text-white text-sm mb-1">Qanday ishlaydi?</h4>
              <p className="text-[13px] text-[#9AA4B2] md:text-slate-500 md:dark:text-slate-400 leading-relaxed">
                Mavzuni tanlab, har bir bobni o'qib chiqing. Har bir bob uchun maxsus tayyorlangan testlar mavjud.
                Bob testini ishlash uchun <strong className="text-amber-500">«Test Ishlash»</strong> tugmasini bosing.
                Bilimingizni real imtihon rejimida sinab ko'ring!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
