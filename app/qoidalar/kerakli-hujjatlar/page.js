'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'
import { useLanguage } from '@/context/LanguageContext'
import UserProfileHeader from '@/components/UserProfileHeader'
import QoidalarHeader from '@/components/QoidalarHeader'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz'

const mapDocIcon = (iconName) => {
  switch (iconName) {
    case 'file': return 'description'
    case 'id': return 'badge'
    case 'medical': return 'medical_services'
    case 'graduation': return 'school'
    default: return 'article'
  }
}

export default function KerakliHujjatlarPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const [categories, setCategories] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/rules/documents?lang=${lang || 'uzl'}`)
      if (!res.ok) throw new Error('API xatolik')
      const data = await res.json()
      const list = data.categories || []
      setCategories(list)
      if (list.length > 0) setActiveId((prev) => prev || list[0].id)
    } catch (e) {
      console.error('Hujjatlarni yuklashda xatolik:', e)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [lang])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const active = categories.find((c) => c.id === activeId) || categories[0]

  return (
    <div className="bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">

      {/* HEADER */}
      <QoidalarHeader title="Kerakli hujjatlar" />

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
        {/* SIDEBAR */}
        <aside className="hidden lg:block w-80 border-r border-slate-200 dark:border-slate-800 p-6 h-[calc(100vh-64px)] sticky top-16 bg-white dark:bg-[#1e293b]/50 overflow-y-auto custom-scrollbar">
          <nav className="space-y-1">
            <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">Hujjat turlari</span>
            </div>
            {loading && categories.length === 0 ? (
              <div className="px-3 text-sm text-slate-400">Yuklanmoqda...</div>
            ) : (
              categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all text-left mb-1 group ${activeId === c.id
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  <span className={`material-icons-round text-[20px] ${activeId === c.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-500'}`}>
                    folder_open
                  </span>
                  <span className="line-clamp-1">{c.label}</span>
                </button>
              ))
            )}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Yuklanmoqda...</div>
          ) : (
            <>
              {/* Mobile Tabs */}
              <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-6 -mx-4 px-4 custom-scrollbar">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={`shrink-0 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${activeId === c.id
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                      : 'bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {active && (
                <div className="space-y-8 pb-24">
                  <div className="bg-sky-500/5 border border-sky-500/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{active.title}</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{active.subtitle}</p>
                  </div>

                  <div className="grid gap-4">
                    {active.documents?.map((doc) => (
                      <div
                        key={doc.number}
                        className="flex items-start gap-5 p-6 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center shrink-0 text-sky-600 dark:text-sky-400 font-bold text-lg">
                          {doc.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <span className="material-icons-round text-sm">{mapDocIcon(doc.icon)}</span>
                            <span className="text-xs font-semibold uppercase tracking-wider">{doc.tag}</span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{doc.title}</h3>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{doc.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {active.legal_basis && (
                    <div className="rounded-2xl bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-6 flex gap-4">
                      <span className="text-slate-400 shrink-0">
                        <span className="material-icons-round text-2xl">gavel</span>
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">HUQUQIY ASOS</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{active.legal_basis.ref}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">&quot;{active.legal_basis.text}&quot;</p>
                      </div>
                    </div>
                  )}
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
