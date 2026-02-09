'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

const DOC_ICONS = {
  file: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  ),
  id: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
  ),
  medical: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2-5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  ),
  graduation: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
  ),
}

export default function KerakliHujjatlarPage() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/rules/documents?lang=uzl`)
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
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const active = categories.find((c) => c.id === activeId) || categories[0]

  const getDocIcon = (icon) => DOC_ICONS[icon] || DOC_ICONS.file

  return (
    <div className="min-h-screen bg-[#161821] text-white font-sans">
      <header className="h-16 flex items-center gap-4 px-4 lg:px-8 bg-[#1e2130] border-b border-white/5 shrink-0">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-[#2a2d3e] hover:bg-[#35394b] flex items-center justify-center text-slate-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m7 7l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-lg font-bold text-white">Kerakli hujjatlar</h1>
      </header>

      <main className="p-4 lg:p-8 max-w-2xl mx-auto pb-24">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Yuklanmoqda...</div>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`shrink-0 px-4 py-2 rounded-xl font-medium transition-all ${
                    activeId === c.id
                      ? 'bg-white text-[#161821]'
                      : 'bg-[#1e2130] border border-white/5 text-slate-300 hover:border-white/10'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {active && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">&laquo;{active.title}&raquo;</h2>
                  <p className="text-sm text-slate-500">{active.subtitle}</p>
                </div>

                <div className="space-y-2">
                  {active.documents?.map((doc) => (
                    <div
                      key={doc.number}
                      className="flex items-start gap-4 p-4 rounded-xl bg-[#1e2130] border border-white/5"
                    >
                      <div className="w-8 h-8 rounded-full bg-brand-cyan/20 flex items-center justify-center shrink-0 text-brand-cyan font-bold text-sm">
                        {doc.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                          <span>{getDocIcon(doc.icon)}</span>
                          <span className="text-xs">{doc.tag}</span>
                        </div>
                        <p className="font-semibold text-white">{doc.title}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{doc.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {active.legal_basis && (
                  <div className="rounded-xl bg-[#1e2130] border border-white/5 p-4 flex gap-3">
                    <span className="text-slate-400 shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">HUQUQIY ASOS</p>
                      <p className="text-sm text-slate-300">{active.legal_basis.ref}</p>
                      <p className="text-sm text-slate-400">{active.legal_basis.text}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
