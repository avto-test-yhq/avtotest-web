'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

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
    <div className="min-h-screen bg-[#161821] text-white font-sans">
      <header className="h-16 flex items-center gap-4 px-4 lg:px-8 bg-[#1e2130] border-b border-white/5 shrink-0">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-[#2a2d3e] hover:bg-[#35394b] flex items-center justify-center text-slate-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m7 7l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-lg font-bold text-white">Yo&apos;l belgilari</h1>
      </header>

      <main className="p-4 lg:p-8 max-w-2xl mx-auto pb-24">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Yuklanmoqda...</div>
        ) : (
          <>
            <div className="space-y-2 mb-8">
              {categories.map((cat) => {
                const count = getCategorySignCount(cat.id)
                return (
                  <Link
                    key={cat.id}
                    href={`/qoidalar/yol-belgilari/${cat.folder || cat.id}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#1e2130] border border-white/5 hover:border-emerald-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center overflow-hidden">
                        {signs.find((s) => s.category_id === cat.id)?.image ? (
                          <Image
                            src={getSignImageUrl(signs.find((s) => s.category_id === cat.id).image)}
                            alt=""
                            width={40}
                            height={40}
                            className="object-contain"
                            unoptimized
                          />
                        ) : (
                          <span className="text-slate-400 text-lg">🛑</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{cat.name}</p>
                        <p className="text-xs text-slate-500">{count} ta belgi</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )
              })}
            </div>

            {popularSigns.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold text-white mb-3">
                  <span>🔥</span> Ommabop belgilar
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
                  {popularSigns.map((s) => (
                    <Link
                      key={s.id}
                      href={`/qoidalar/yol-belgilari/${categories.find((c) => c.id === s.category_id)?.folder || s.category_id}/${s.id}`}
                      className="shrink-0 w-28 rounded-xl bg-[#1e2130] border border-white/5 overflow-hidden hover:border-emerald-500/30 transition-all"
                    >
                      <div className="relative w-full h-20 bg-slate-800/50 flex items-center justify-center p-2">
                        <Image
                          src={getSignImageUrl(s.image)}
                          alt={s.name}
                          fill
                          className="object-contain p-2"
                          unoptimized
                        />
                      </div>
                      <p className="text-[10px] text-brand-cyan px-2 py-1">{s.code}</p>
                      <p className="text-xs text-slate-300 px-2 pb-2 line-clamp-2">{s.name}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
