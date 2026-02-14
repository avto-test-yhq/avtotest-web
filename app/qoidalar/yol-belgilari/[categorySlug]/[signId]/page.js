'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import UserProfileHeader from '@/components/UserProfileHeader'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

function getSignImageUrl(imagePath) {
  if (!imagePath) return null
  const base = `${API_URL}/rules/images/signs`
  return imagePath.startsWith('http') ? imagePath : `${base}/${imagePath}`
}

export default function SignDetailPage() {
  const router = useRouter()
  const params = useParams()
  const categorySlug = params?.categorySlug || ''
  const signId = parseInt(params?.signId, 10) || 0

  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState(null)
  const [sign, setSign] = useState(null)
  const [allSigns, setAllSigns] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/rules/signs?lang=uzl`)
      if (!res.ok) throw new Error('API xatolik')
      const data = await res.json()
      const cats = data.categories || []
      const list = data.signs || []

      const cat = cats.find((c) => (c.folder || String(c.id)) === categorySlug)
      const s = list.find((x) => x.id === signId)
      const sorted = list.filter((x) => x.category_id === cat?.id).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

      setCategories(cats)
      setCategory(cat || { name: 'Belgi' })
      setSign(s || null)
      setAllSigns(sorted)
    } catch (e) {
      console.error('Belgini yuklashda xatolik:', e)
      setCategories([])
      setCategory({ name: 'Belgi' })
      setSign(null)
      setAllSigns([])
    } finally {
      setLoading(false)
    }
  }, [categorySlug, signId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const currentIndex = allSigns.findIndex((s) => s.id === signId)
  const prevSign = currentIndex > 0 ? allSigns[currentIndex - 1] : null
  const nextSign = currentIndex >= 0 && currentIndex < allSigns.length - 1 ? allSigns[currentIndex + 1] : null
  const total = allSigns.length

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
            <h1 className="text-xl font-bold text-slate-800 dark:text-white truncate max-w-[200px] md:max-w-md">{category?.name || 'Belgi tafsilotlari'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 mr-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-sm font-medium text-slate-600 dark:text-slate-400">
              {currentIndex >= 0 ? currentIndex + 1 : 0} / {total}
            </div>
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
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">Guruhlar</span>
            </div>
            {loading && categories.length === 0 ? (
              <div className="px-3 text-sm text-slate-400">Yuklanmoqda...</div>
            ) : (
              categories.map(cat => {
                const isActive = (cat.folder || String(cat.id)) === categorySlug
                return (
                  <Link
                    key={cat.id}
                    href={`/qoidalar/yol-belgilari/${cat.folder || cat.id}`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isActive
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    <span className={`material-icons-round text-[20px] ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-500'}`}>folder</span>
                    <span className="line-clamp-1">{cat.name}</span>
                  </Link>
                )
              })
            )}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Yuklanmoqda...</div>
          ) : sign ? (
            <div className="space-y-8 pb-24">
              <div className="flex justify-center py-8">
                <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-3xl bg-white dark:bg-[#1e293b] flex items-center justify-center shadow-lg shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800 p-6">
                  <img
                    src={getSignImageUrl(sign.image)}
                    alt={sign.name}
                    className="object-contain max-w-full max-h-full"
                  />
                  <div className="absolute top-4 right-4 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {sign.code}
                  </div>
                </div>
              </div>

              <div className="text-center max-w-2xl mx-auto space-y-4">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{sign.name}</h2>
              </div>

              <div className="rounded-3xl bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-sky-500">
                  <span className="material-icons-round">info</span>
                  <span className="text-sm font-bold uppercase tracking-wider">Tavsif</span>
                </div>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{sign.description}</p>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => prevSign && router.push(`/qoidalar/yol-belgilari/${categorySlug}/${prevSign.id}`)}
                  disabled={!prevSign}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <span className="material-icons-round">arrow_back</span>
                  <div className="text-left hidden sm:block">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Oldingi</span>
                    <span className="block text-sm">Belgi</span>
                  </div>
                </button>

                <div className="text-center md:hidden">
                  <span className="text-sm font-bold text-slate-400">{currentIndex + 1} / {total}</span>
                </div>

                <button
                  onClick={() => nextSign && router.push(`/qoidalar/yol-belgilari/${categorySlug}/${nextSign.id}`)}
                  disabled={!nextSign}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-sky-500 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/20"
                >
                  <div className="text-right hidden sm:block">
                    <span className="block text-[10px] text-sky-100 uppercase font-bold">Keyingi</span>
                    <span className="block text-sm">Belgi</span>
                  </div>
                  <span className="material-icons-round">arrow_forward</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center py-12 text-slate-400">Belgi topilmadi</p>
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
