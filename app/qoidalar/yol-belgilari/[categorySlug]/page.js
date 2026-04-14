'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
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

export default function CategorySignsPage() {
  const router = useRouter()
  const params = useParams()
  const { lang } = useLanguage()
  const categorySlug = params?.categorySlug || ''

  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState(null)
  const [signs, setSigns] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/rules/signs?lang=${lang || 'uzl'}`)
      if (!res.ok) throw new Error('API xatolik')
      const data = await res.json()
      const cats = data.chapters || []
      const allSigns = data.items || []

      const cat = cats.find((c) => (c.image_folder || String(c.id)) === categorySlug)
      const list = allSigns.filter((s) => s.chapter_id === cat?.id).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

      setCategories(cats)
      setCategory(cat || { name: 'Kategoriya' })
      setSigns(list)
    } catch (e) {
      console.error('Belgilarni yuklashda xatolik:', e)
      setCategories([])
      setCategory({ name: 'Kategoriya' })
      setSigns([])
    } finally {
      setLoading(false)
    }
  }, [categorySlug, lang])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="bg-[#161c24] md:bg-slate-50 md:dark:bg-[#0f172a] text-white md:text-slate-900 md:dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">

      {/* HEADER */}
      <QoidalarHeader title={category?.name || 'Belgilar'} />

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
                const isActive = (cat.image_folder || String(cat.id)) === categorySlug
                return (
                  <Link
                    key={cat.id}
                    href={`/qoidalar/yol-belgilari/${cat.image_folder || cat.id}`}
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
        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto max-w-5xl mx-auto w-full">
          {loading ? (
            <div className="text-center py-12 text-[#9AA4B2] md:text-slate-400">Yuklanmoqda...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-24">
              {signs.map((s) => (
                <Link
                  key={s.id}
                  href={`/qoidalar/yol-belgilari/${categorySlug}/${s.id}`}
                  className="flex items-center gap-4 p-4 rounded-[20px] md:rounded-2xl bg-[#212936] md:bg-white md:dark:bg-[#1e293b] border border-[#313C50] md:border-slate-100 md:dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-500/30 md:hover:border-sky-500/30 transition-all group active:scale-[0.98]"
                >
                  <div className="relative w-16 h-16 rounded-[16px] md:rounded-xl bg-[#161c24] md:bg-slate-50 md:dark:bg-slate-800 shrink-0 overflow-hidden flex items-center justify-center border border-[#313C50] md:border-slate-100 md:dark:border-slate-700">
                    <img
                      src={getSignImageUrl(s.image)}
                      alt={s.name}
                      className="object-contain w-12 h-12 p-1 group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#161c24] md:bg-sky-50 md:dark:bg-sky-900/30 text-[#9AA4B2] md:text-sky-600 md:dark:text-sky-400 border border-[#313C50] md:border-none">{s.code}</span>
                    </div>
                    <p className="font-bold text-[15px] md:text-base text-white md:text-slate-900 md:dark:text-white truncate mb-1 group-hover:text-blue-500 md:group-hover:text-sky-500 transition-colors">{s.name}</p>
                    <p className="text-[12px] md:text-xs text-[#9AA4B2] md:text-slate-500 md:dark:text-slate-400 line-clamp-2 leading-relaxed">{s.content || s.description}</p>
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#161c24] md:bg-slate-50 md:dark:bg-slate-800 group-hover:bg-blue-600 md:group-hover:bg-sky-500 group-hover:text-white transition-colors text-[#9AA4B2] md:text-slate-400 shrink-0 border border-[#313C50] md:border-none">
                    <span className="material-icons-round text-lg">arrow_forward</span>
                  </div>
                </Link>
              ))}
              {signs.length === 0 && <p className="col-span-full text-center py-12 text-[#9AA4B2] md:text-slate-400">Belgilar topilmadi</p>}
            </div>
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
