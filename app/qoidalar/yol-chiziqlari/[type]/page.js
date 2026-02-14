'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import UserProfileHeader from '@/components/UserProfileHeader'
import QoidalarHeader from '@/components/QoidalarHeader'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'
const RULES_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

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

export default function MarkingsListPage() {
  const router = useRouter()
  const params = useParams()
  const type = params?.type || 'horizontal'

  const [markings, setMarkings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/rules/markings?lang=uzl`)
      if (!res.ok) throw new Error('API xatolik')
      const data = await res.json()
      const list = (data.markings || [])
        .filter((m) => m.marking_type === type && m.code && !['1', '2'].includes(m.code) && m.name !== 'Eslatma')
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      setMarkings(list)
    } catch (e) {
      console.error('Chiziqlarni yuklashda xatolik:', e)
      setMarkings([])
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">

      {/* HEADER */}
      <QoidalarHeader title={TYPE_LABELS[type] || 'Chiziqlar'} />

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
        {/* SIDEBAR */}
        <aside className="hidden lg:block w-80 border-r border-slate-200 dark:border-slate-800 p-6 h-[calc(100vh-64px)] sticky top-16 bg-white dark:bg-[#1e293b]/50">
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
        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto max-w-5xl mx-auto">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Yuklanmoqda...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-24">
              {markings.map((m) => (
                <Link
                  key={m.id}
                  href={`/qoidalar/yol-chiziqlari/${type}/${m.id}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-sky-500/30 transition-all group"
                >
                  <div className="relative w-20 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 shrink-0 overflow-hidden flex items-center justify-center border border-slate-100 dark:border-slate-700">
                    <img
                      src={getMarkingImageUrl(m.image)}
                      alt={m.name}
                      className="object-contain max-w-full max-h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-sky-500 mb-0.5">{m.code}</p>
                    <p className="font-bold text-slate-900 dark:text-white leading-tight mb-1">{m.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{m.description}</p>
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-sky-500 group-hover:text-white transition-colors text-slate-400">
                    <span className="material-icons-round text-lg">arrow_forward</span>
                  </div>
                </Link>
              ))}
              {markings.length === 0 && <p className="col-span-full text-center py-12 text-slate-400">Chiziqlar topilmadi</p>}
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
