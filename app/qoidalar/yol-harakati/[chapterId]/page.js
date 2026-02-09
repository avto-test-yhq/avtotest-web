'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

export default function ChapterDetailPage() {
  const router = useRouter()
  const params = useParams()
  const chapterId = parseInt(params?.chapterId, 10) || 1

  const [chapter, setChapter] = useState(null)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/rules/traffic?lang=uzl`)
      if (!res.ok) throw new Error('API xatolik')
      const data = await res.json()
      const ch = (data.chapters || []).find((c) => c.id === chapterId)
      const arts = (data.articles || []).filter((a) => a.chapter_id === chapterId).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      setChapter(ch || { title: 'Bob', number: chapterId })
      setArticles(arts)
    } catch (e) {
      console.error('Ma\'lumot yuklashda xatolik:', e)
      setChapter({ title: 'Bob', number: chapterId })
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [chapterId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="min-h-screen bg-[#161821] text-white font-sans">
      <header className="h-16 flex items-center gap-4 px-4 lg:px-8 bg-[#1e2130] border-b border-white/5 shrink-0">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-[#2a2d3e] hover:bg-[#35394b] flex items-center justify-center text-slate-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m7 7l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-lg font-bold text-white">{chapter?.title || 'Bob'}</h1>
      </header>

      <main className="p-4 lg:p-8 max-w-2xl mx-auto pb-24">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Yuklanmoqda...</div>
        ) : (
          <div className="space-y-4">
            {articles.map((a) => (
              <div key={a.id} className="rounded-xl bg-[#1e2130] border border-white/5 p-4">
                <p className="text-sm font-bold text-brand-cyan mb-2">{a.number}-modda</p>
                <p className="text-white leading-relaxed whitespace-pre-wrap">{a.content || a.simplified || ''}</p>
                {a.exam_tips && (
                  <div className="mt-4 rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 flex gap-2">
                    <span className="text-amber-400 shrink-0">💡</span>
                    <div>
                      <p className="text-xs font-bold text-amber-400 uppercase mb-1">Imtihon uchun muhim</p>
                      <p className="text-sm text-slate-200">{a.exam_tips}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {articles.length === 0 && <p className="text-center py-12 text-slate-400">Moddalar topilmadi</p>}
          </div>
        )}
      </main>
    </div>
  )
}
