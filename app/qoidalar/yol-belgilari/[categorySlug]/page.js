'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

function getSignImageUrl(imagePath) {
  if (!imagePath) return null
  const base = `${API_URL}/rules/images/signs`
  return imagePath.startsWith('http') ? imagePath : `${base}/${imagePath}`
}

export default function CategorySignsPage() {
  const router = useRouter()
  const params = useParams()
  const categorySlug = params?.categorySlug || ''

  const [category, setCategory] = useState(null)
  const [signs, setSigns] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/rules/signs?lang=uzl`)
      if (!res.ok) throw new Error('API xatolik')
      const data = await res.json()
      const cats = data.categories || []
      const allSigns = data.signs || []
      const cat = cats.find((c) => (c.folder || String(c.id)) === categorySlug)
      const list = allSigns.filter((s) => s.category_id === cat?.id).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      setCategory(cat || { name: 'Kategoriya' })
      setSigns(list)
    } catch (e) {
      console.error('Belgilarni yuklashda xatolik:', e)
      setCategory({ name: 'Kategoriya' })
      setSigns([])
    } finally {
      setLoading(false)
    }
  }, [categorySlug])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="min-h-screen bg-[#161821] text-white font-sans">
      <header className="h-16 flex items-center gap-4 px-4 lg:px-8 bg-[#1e2130] border-b border-white/5 shrink-0">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-[#2a2d3e] hover:bg-[#35394b] flex items-center justify-center text-slate-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m7 7l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-lg font-bold text-white">{category?.name || 'Belgilar'}</h1>
      </header>

      <main className="p-4 lg:p-8 max-w-2xl mx-auto pb-24">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Yuklanmoqda...</div>
        ) : (
          <div className="space-y-2">
            {signs.map((s, idx) => (
              <Link
                key={s.id}
                href={`/qoidalar/yol-belgilari/${categorySlug}/${s.id}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#1e2130] border border-white/5 hover:border-emerald-500/30 transition-all group"
              >
                <div className="relative w-14 h-14 rounded-lg bg-slate-800/50 shrink-0 overflow-hidden flex items-center justify-center">
                  <Image
                    src={getSignImageUrl(s.image)}
                    alt={s.name}
                    width={48}
                    height={48}
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-brand-cyan">{s.code}</p>
                  <p className="font-semibold text-white truncate">{s.name}</p>
                  <p className="text-xs text-slate-500 line-clamp-2">{s.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="w-9 h-9 rounded-lg bg-transparent hover:bg-white/5 flex items-center justify-center text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                  </button>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
            {signs.length === 0 && <p className="text-center py-12 text-slate-400">Belgilar topilmadi</p>}
          </div>
        )}
      </main>
    </div>
  )
}
