'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import UserProfileHeader from '@/components/UserProfileHeader'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

function getSignImageUrl(imagePath) {
  if (!imagePath) return null
  const base = `${API_URL}/rules/images/signs`
  return imagePath.startsWith('http') ? imagePath : `${base}/${imagePath}`
}

export default function YolBelgilariPage() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [signs, setSigns] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/rules/signs?lang=uzl`)
      if (!res.ok) throw new Error('API xatolik')
      const data = await res.json()
      setCategories(data.categories || [])
      setSigns(data.signs || [])
    } catch (e) {
      console.error('Belgilarni yuklashda xatolik:', e)
      setCategories([])
      setSigns([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getCategorySignCount = (catId) => signs.filter((s) => s.category_id === catId).length
  const popularSigns = signs.filter((s) => s.is_popular).slice(0, 8)

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
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Yo&apos;l belgilari</h1>
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
                  href={`/qoidalar/yol-belgilari/${cat.folder || cat.id}`}
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
        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto max-w-5xl mx-auto">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Yuklanmoqda...</div>
          ) : (
            <>
              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {categories.map((cat) => {
                  const count = getCategorySignCount(cat.id)
                  const sampleSign = signs.find((s) => s.category_id === cat.id)
                  return (
                    <Link
                      key={cat.id}
                      href={`/qoidalar/yol-belgilari/${cat.folder || cat.id}`}
                      className="group flex items-center justify-between p-6 rounded-3xl bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 hover:shadow-lg dark:hover:shadow-none hover:border-sky-500/30 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-2 border border-slate-100 dark:border-slate-700">
                          {sampleSign?.image ? (
                            <Image
                              src={getSignImageUrl(sampleSign.image)}
                              alt=""
                              width={48}
                              height={48}
                              className="object-contain"
                              unoptimized
                            />
                          ) : (
                            <span className="material-icons-round text-slate-400 text-3xl">sms_failed</span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors mb-1">{cat.name}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{count} ta belgi</p>
                        </div>
                      </div>
                      <span className="material-icons-round text-slate-300 group-hover:text-sky-500 group-hover:translate-x-1 transition-all">arrow_forward</span>
                    </Link>
                  )
                })}
              </div>

              {popularSigns.length > 0 && (
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-6">
                    <span className="text-amber-500">🔥</span> Ommabop belgilar
                  </h2>
                  <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 custom-scrollbar">
                    {popularSigns.map((s) => (
                      <Link
                        key={s.id}
                        href={`/qoidalar/yol-belgilari/${categories.find((c) => c.id === s.category_id)?.folder || s.category_id}/${s.id}`}
                        className="shrink-0 w-32 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-md hover:border-sky-500/30 transition-all group"
                      >
                        <div className="relative w-full h-24 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center p-4">
                          <Image
                            src={getSignImageUrl(s.image)}
                            alt={s.name}
                            fill
                            className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                            unoptimized
                          />
                        </div>
                        <div className="p-3">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 mb-1">{s.code}</span>
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-2 leading-snug">{s.name}</p>
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
