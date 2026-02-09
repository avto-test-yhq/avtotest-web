'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'

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
      setCategory(cat || { name: 'Belgi' })
      setSign(s || null)
      setAllSigns(sorted)
    } catch (e) {
      console.error('Belgini yuklashda xatolik:', e)
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
    <div className="min-h-screen bg-[#161821] text-white font-sans">
      <header className="h-16 flex items-center justify-between gap-4 px-4 lg:px-8 bg-[#1e2130] border-b border-white/5 shrink-0">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-[#2a2d3e] hover:bg-[#35394b] flex items-center justify-center text-slate-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m7 7l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-base font-bold text-white truncate flex-1 text-center">{category?.name || 'Belgi'}</h1>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm text-slate-500">{currentIndex >= 0 ? currentIndex + 1 : 0}/{total}</span>
          <button className="w-9 h-9 rounded-lg bg-[#2a2d3e] hover:bg-[#35394b] flex items-center justify-center text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
          </button>
          <button className="w-9 h-9 rounded-lg bg-[#2a2d3e] hover:bg-[#35394b] flex items-center justify-center text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          </button>
        </div>
      </header>

      <main className="p-4 lg:p-8 max-w-2xl mx-auto pb-24">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Yuklanmoqda...</div>
        ) : sign ? (
          <div className="space-y-6">
            <div className="flex justify-center py-6">
              <div className="relative w-40 h-40 rounded-xl bg-slate-800/50 flex items-center justify-center overflow-hidden border border-white/5">
                <Image
                  src={getSignImageUrl(sign.image)}
                  alt={sign.name}
                  fill
                  className="object-contain p-4"
                  unoptimized
                />
              </div>
            </div>
            <p className="text-brand-cyan text-sm">{sign.code}</p>
            <h2 className="text-xl font-bold text-white">{sign.name}</h2>
            <div className="rounded-xl bg-[#1e2130] border border-white/5 p-4">
              <p className="text-slate-300 leading-relaxed">{sign.description}</p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => prevSign && router.push(`/qoidalar/yol-belgilari/${categorySlug}/${prevSign.id}`)}
                disabled={!prevSign}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1e2130] border border-white/5 disabled:opacity-40 disabled:cursor-not-allowed hover:border-emerald-500/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                Oldingi
              </button>
              <button
                onClick={() => nextSign && router.push(`/qoidalar/yol-belgilari/${categorySlug}/${nextSign.id}`)}
                disabled={!nextSign}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1e2130] border border-white/5 disabled:opacity-40 disabled:cursor-not-allowed hover:border-emerald-500/30"
              >
                Keyingi
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center py-12 text-slate-400">Belgi topilmadi</p>
        )}
      </main>
    </div>
  )
}
