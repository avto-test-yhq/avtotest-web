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

function getMarkingImageUrl(imagePath) {
  if (!imagePath) return null
  const base = `${RULES_BASE}/uploads/rules/markings`
  if (imagePath.startsWith('http')) {
    try {
      const url = new URL(imagePath)
      const p = url.pathname.replace(/^\/rules\/images\/markings\//, '').replace(/^\/uploads\/rules\/markings\//, '')
      return p ? `${base}/${p}` : base
    } catch { return `${base}/${imagePath}` }
  }
  return `${base}/${imagePath}`
}

const TYPE_LABELS = { horizontal: 'Yotiq chiziqlar', vertical: 'Tik chiziqlar' }
const TYPE_ICONS = { horizontal: 'more_horiz', vertical: 'more_vert' }

const categories = [
  { id: 'horizontal', name: 'Yotiq chiziqlar' },
  { id: 'vertical', name: 'Tik chiziqlar' }
]

export default function MarkingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { lang } = useLanguage()
  const type = params?.type || 'horizontal'
  const markingId = parseInt(params?.markingId, 10) || 0

  const [marking, setMarking] = useState(null)
  const [allMarkings, setAllMarkings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/rules/markings?lang=${lang || 'uzl'}`)
      if (!res.ok) throw new Error('API xatolik')
      const data = await res.json()
      const chapters = data.chapters || []
      const chapter = chapters.find(c => c.code === type || c.image_folder === type)
      const list = (data.items || [])
        .filter((m) => m.chapter_id === chapter?.id && m.code && !['1', '2'].includes(m.code) && m.name !== 'Eslatma')
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      const m = list.find((x) => x.id === markingId)
      setMarking(m || null)
      setAllMarkings(list)
    } catch (e) {
      console.error('Chiziqni yuklashda xatolik:', e)
      setMarking(null)
      setAllMarkings([])
    } finally {
      setLoading(false)
    }
  }, [type, markingId, lang])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const currentIndex = allMarkings.findIndex((m) => m.id === markingId)
  const prevMarking = currentIndex > 0 ? allMarkings[currentIndex - 1] : null
  const nextMarking = currentIndex >= 0 && currentIndex < allMarkings.length - 1 ? allMarkings[currentIndex + 1] : null
  const total = allMarkings.length

  return (
    <div className="bg-[#161c24] md:bg-slate-50 md:dark:bg-[#0f172a] text-white md:text-slate-900 md:dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">

      {/* HEADER */}
      <QoidalarHeader title="Chiziq tafsilotlari" />

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
        {/* SIDEBAR */}
        <aside className="hidden lg:block w-80 border-r border-slate-200 dark:border-slate-800 p-6 h-[calc(100vh-64px)] sticky top-16 bg-white dark:bg-[#1e293b]/50 overflow-y-auto custom-scrollbar">
          <nav className="space-y-1">
            <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">Turlar</span>
            </div>
            {categories.map((cat) => {
              const isActive = cat.id === type
              return (
                <Link
                  key={cat.id}
                  href={`/qoidalar/yol-chiziqlari/${cat.id}`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isActive
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  <span className={`material-icons-round text-[20px] ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-500'}`}>
                    {TYPE_ICONS[cat.id]}
                  </span>
                  <span className="line-clamp-1">{cat.name}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto max-w-4xl mx-auto w-full">
          {loading ? (
            <div className="text-center py-12 text-[#9AA4B2] md:text-slate-400">Yuklanmoqda...</div>
          ) : marking ? (
            <div className="space-y-6 md:space-y-8 pb-24">
              <div className="flex justify-center py-6 md:py-8">
                <div className="relative w-64 h-48 md:w-80 md:h-64 rounded-[24px] md:rounded-3xl bg-[#212936] md:bg-white md:dark:bg-[#1e293b] flex items-center justify-center shadow-lg shadow-slate-200/5 md:shadow-slate-200 dark:shadow-none border border-[#313C50] md:border-slate-100 md:dark:border-slate-800 p-6">
                  <img
                    src={getMarkingImageUrl(marking.image)}
                    alt={marking.name}
                    className="object-contain max-w-full max-h-full"
                  />
                  <div className="absolute top-4 right-4 bg-[#161c24] md:bg-slate-100 md:dark:bg-slate-800 px-2 py-1 rounded-[8px] md:rounded-md text-[11px] md:text-xs font-bold text-[#9AA4B2] md:text-slate-500 md:dark:text-slate-400 border border-[#313C50] md:border-slate-200 md:dark:border-slate-700">
                    {marking.code}
                  </div>
                </div>
              </div>

              <div className="text-center max-w-2xl mx-auto space-y-3 md:space-y-4 px-2">
                <h2 className="text-[20px] md:text-3xl font-bold text-white md:text-slate-900 md:dark:text-white leading-tight">{marking.name}</h2>
              </div>

              <div className="rounded-[24px] md:rounded-3xl bg-[#212936] md:bg-white md:dark:bg-[#1e293b] border border-[#313C50] md:border-slate-100 md:dark:border-slate-800 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 text-blue-500 md:text-sky-500">
                  <span className="material-icons-round text-[20px] md:text-[24px]">info</span>
                  <span className="text-[13px] md:text-sm font-bold uppercase tracking-wider">Tavsif</span>
                </div>
                <p className="text-[15px] md:text-lg text-white md:text-slate-600 md:dark:text-slate-300 leading-relaxed font-medium md:font-normal">{marking.content || marking.description}</p>
              </div>

              <div className="flex items-center justify-between pt-6 md:pt-8 border-t border-[#313C50] md:border-slate-100 md:dark:border-slate-800">
                <button
                  onClick={() => prevMarking && router.push(`/qoidalar/yol-chiziqlari/${type}/${prevMarking.id}`)}
                  disabled={!prevMarking}
                  className="flex items-center justify-center w-12 h-12 md:w-auto md:h-auto md:px-6 md:py-3 rounded-[16px] md:rounded-xl bg-[#212936] md:bg-white md:dark:bg-[#1e293b] border border-[#313C50] md:border-slate-200 md:dark:border-slate-800 text-white md:text-slate-700 md:dark:text-slate-300 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#313C50] md:hover:bg-slate-50 md:dark:hover:bg-slate-800 transition-colors shadow-sm active:scale-[0.96] md:active:scale-100 gap-3"
                >
                  <span className="material-icons-round">arrow_back</span>
                  <div className="text-left hidden sm:block">
                    <span className="block text-[10px] text-[#9AA4B2] md:text-slate-400 uppercase font-bold">Oldingi</span>
                    <span className="block text-[13px] md:text-sm">Chiziq</span>
                  </div>
                </button>

                <div className="text-center">
                  <span className="text-[13px] md:text-sm font-bold text-[#9AA4B2] md:text-slate-400">{currentIndex + 1} / {total}</span>
                </div>

                <button
                  onClick={() => nextMarking && router.push(`/qoidalar/yol-chiziqlari/${type}/${nextMarking.id}`)}
                  disabled={!nextMarking}
                  className="flex items-center justify-center w-12 h-12 md:w-auto md:h-auto md:px-6 md:py-3 rounded-[16px] md:rounded-xl bg-blue-600 md:bg-sky-500 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 md:hover:bg-sky-600 transition-colors shadow-lg shadow-blue-600/20 md:shadow-sky-500/20 active:scale-[0.96] md:active:scale-100 gap-3"
                >
                  <div className="text-right hidden sm:block">
                    <span className="block text-[10px] text-blue-100 md:text-sky-100 uppercase font-bold">Keyingi</span>
                    <span className="block text-[13px] md:text-sm">Chiziq</span>
                  </div>
                  <span className="material-icons-round">arrow_forward</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center py-12 text-[#9AA4B2] md:text-slate-400">Chiziq topilmadi</p>
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
