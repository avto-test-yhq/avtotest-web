'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { useLanguage } from '@/context/LanguageContext'
import UserProfileHeader from '@/components/UserProfileHeader'
import QoidalarHeader from '@/components/QoidalarHeader'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz'
const RULES_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz'

function getSignImageUrl(imagePath) {
  if (!imagePath) return null
  const base = `${RULES_BASE}/uploads/rules/signs`
  if (imagePath.startsWith('http')) {
    try {
      const url = new URL(imagePath)
      const p = url.pathname.replace(/^\/rules\/images\/signs\//, '').replace(/^\/uploads\/rules\/signs\//, '')
      return p ? `${base}/${p}` : base
    } catch { return `${base}/${imagePath}` }
  }
  return `${base}/${imagePath}`
}

export default function YolBelgilariPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const [categories, setCategories] = useState([])
  const [signs, setSigns] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/rules/signs?lang=${lang || 'uzl'}`)
      if (!res.ok) throw new Error('API xatolik')
      const data = await res.json()
      setCategories(data.chapters || [])
      setSigns(data.items || [])
    } catch (e) {
      console.error('Belgilarni yuklashda xatolik:', e)
      setCategories([])
      setSigns([])
    } finally {
      setLoading(false)
    }
  }, [lang])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getCategorySignCount = (catId) => signs.filter((s) => s.chapter_id === catId).length
  const popularSigns = signs.filter((s) => s.is_popular).slice(0, 8)

  return (
    <div className="bg-[#161c24] md:bg-slate-50 md:dark:bg-[#0f172a] text-white md:text-slate-900 md:dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">

      {/* HEADER */}
      <QoidalarHeader title="Yo'l belgilari" backUrl="/qoidalar" />

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
        {/* SIDEBAR */}
        <aside className="hidden lg:block w-80 border-r border-slate-200 dark:border-slate-800 p-6 overflow-y-auto h-[calc(100vh-64px)] sticky top-16 custom-scrollbar bg-white dark:bg-[#1e293b]/50">
          <nav className="space-y-1">
            <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">Guruhlar</span>
            </div>

            {loading && categories.length === 0 ? (
              <div className="px-3 text-sm text-slate-400">Yuklanmoqda...</div>
            ) : (
              categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/qoidalar/yol-belgilari/${cat.image_folder || cat.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
                >
                  <span className="material-icons-round text-[20px] text-slate-400 group-hover:text-slate-500">folder</span>
                  <span className="line-clamp-1">{cat.name}</span>
                </Link>
              ))
            )}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto max-w-5xl mx-auto w-full">
          {loading ? (
            <div className="text-center py-12 text-[#9AA4B2] md:text-slate-400">Yuklanmoqda...</div>
          ) : (
            <>
              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
                {categories.map((cat) => {
                  const count = getCategorySignCount(cat.id)
                  const sampleSign = signs.find((s) => s.chapter_id === cat.id)
                  return (
                    <Link
                      key={cat.id}
                      href={`/qoidalar/yol-belgilari/${cat.image_folder || cat.id}`}
                      className="group flex items-center justify-between p-4 md:p-6 rounded-[24px] bg-[#212936] md:bg-white md:dark:bg-[#1e293b] border border-[#313C50] md:border-slate-100 md:dark:border-slate-800 hover:shadow-lg dark:hover:shadow-none hover:border-blue-500/30 md:hover:border-sky-500/30 transition-all duration-300 active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-[16px] md:rounded-2xl bg-[#161c24] md:bg-slate-50 md:dark:bg-slate-800 flex items-center justify-center p-2 border border-[#313C50] md:border-slate-100 md:dark:border-slate-700">
                          {sampleSign?.image ? (
                            <img
                              src={getSignImageUrl(sampleSign.image)}
                              alt=""
                              width={48}
                              height={48}
                              className="object-contain w-10 h-10 md:w-12 md:h-12"
                            />
                          ) : (
                            <span className="material-icons-round text-[#9AA4B2] md:text-slate-400 text-2xl md:text-3xl">sms_failed</span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-base md:text-lg font-bold text-white md:text-slate-900 md:dark:text-white group-hover:text-blue-500 md:group-hover:text-sky-500 transition-colors mb-1 line-clamp-1">{cat.name}</h3>
                          <p className="text-[13px] md:text-sm text-[#9AA4B2] md:text-slate-500 md:dark:text-slate-400">{count} ta belgi</p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#161c24] md:bg-transparent flex items-center justify-center group-hover:bg-blue-600 transition-colors shrink-0">
                        <span className="material-icons-round text-[20px] text-[#9AA4B2] md:text-slate-300 md:group-hover:text-sky-500 group-hover:text-white md:group-hover:translate-x-1 transition-all">arrow_forward</span>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {popularSigns.length > 0 && (
                <div>
                  <h2 className="flex items-center gap-2 text-[18px] md:text-lg font-bold text-white md:text-slate-900 md:dark:text-white mb-4 md:mb-6">
                    <span className="text-yellow-500 md:text-amber-500">🔥</span> Ommabop belgilar
                  </h2>
                  <div className="flex gap-3 md:gap-4 overflow-x-auto pb-6 -mx-4 px-4 custom-scrollbar hide-scrollbar-mobile">
                    {popularSigns.map((s) => (
                      <Link
                        key={s.id}
                        href={`/qoidalar/yol-belgilari/${categories.find((c) => c.id === s.chapter_id)?.image_folder || s.chapter_id}/${s.id}`}
                        className="shrink-0 w-28 md:w-32 rounded-[20px] md:rounded-2xl bg-[#212936] md:bg-white md:dark:bg-[#1e293b] border border-[#313C50] md:border-slate-100 md:dark:border-slate-800 overflow-hidden hover:shadow-md hover:border-blue-500/30 md:hover:border-sky-500/30 transition-all group active:scale-[0.98]"
                      >
                        <div className="relative w-full h-20 md:h-24 bg-[#161c24] md:bg-slate-50 md:dark:bg-slate-800/50 flex items-center justify-center p-3 md:p-4 border-b border-[#313C50] md:border-slate-100 md:dark:border-slate-800/50">
                          <img
                            src={getSignImageUrl(s.image) || '/imgage/background.jpg'}
                            alt={s.name}
                            className="object-contain max-w-full max-h-full p-2 group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-3">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#161c24] md:bg-sky-50 md:dark:bg-sky-900/30 text-[#9AA4B2] md:text-sky-600 md:dark:text-sky-400 mb-1">{s.code}</span>
                          <p className="text-[11px] md:text-xs font-medium text-white md:text-slate-700 md:dark:text-slate-300 line-clamp-2 leading-snug">{s.name}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
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
