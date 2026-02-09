'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

export default function YolHarakatiPage() {
  const router = useRouter()
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchChapters = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/rules/traffic?lang=uzl`)
      if (!res.ok) throw new Error('API xatolik')
      const data = await res.json()
      setChapters(data.chapters || [])
    } catch (e) {
      console.error('Qoidalarni yuklashda xatolik:', e)
      setChapters([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChapters()
  }, [fetchChapters])

  const filtered = chapters.filter(
    (c) =>
      !search.trim() ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.number?.includes(search)
  )

  return (
    <div className="min-h-screen bg-[#161821] text-white font-sans">
      <header className="h-16 flex items-center gap-4 px-4 lg:px-8 bg-[#1e2130] border-b border-white/5 shrink-0">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-[#2a2d3e] hover:bg-[#35394b] flex items-center justify-center text-slate-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m7 7l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-lg font-bold text-white">Yo&apos;l harakati qoidalari</h1>
      </header>

      <main className="p-4 lg:p-8 max-w-2xl mx-auto">
        <div className="relative mb-6">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Bob nomini kiriting"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1e2130] border border-white/5 text-white placeholder-slate-500 focus:border-blue-500/50 outline-none"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Yuklanmoqda...</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((ch) => (
              <Link
                key={ch.id}
                href={`/qoidalar/yol-harakati/${ch.id}`}
                className="flex items-center justify-between p-4 rounded-xl bg-[#1e2130] border border-white/5 hover:border-blue-500/30 transition-all group"
              >
                <div>
                  <p className="text-sm font-semibold text-brand-cyan">{ch.number}-bob</p>
                  <p className="font-medium text-white">{ch.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{ch.article_count} ta modda</p>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
            {filtered.length === 0 && <p className="text-center py-12 text-slate-400">Natija topilmadi</p>}
          </div>
        )}
      </main>
    </div>
  )
}
