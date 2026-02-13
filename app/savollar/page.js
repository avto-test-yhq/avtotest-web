'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

export default function SavollarPage() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [hasImage, setHasImage] = useState('all')
  const [sort, setSort] = useState('asc')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [savedIds, setSavedIds] = useState([])
  const [currentUser, setCurrentUser] = useState(null)

  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', sort, lang: 'uzl' })
      if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim())
      if (hasImage !== 'all') params.append('hasImage', hasImage)

      const res = await fetch(`${API_URL}/api/tests?${params}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data?.message || 'Xatolik yuz berdi')
        setQuestions([])
        return
      }

      if (data && Array.isArray(data.data)) {
        setQuestions(data.data)
        setTotalPages(data.pages || 1)
        setTotalCount(data.total || 0)
      } else {
        setQuestions([])
      }
    } catch (e) {
      console.error('Fetch error:', e)
      setError('Serverga ulanib bo\'lmadi')
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }, [page, sort, hasImage, debouncedSearch])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  useEffect(() => {
    setPage(1)
  }, [sort, hasImage, debouncedSearch])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null)
      if (user) {
        fetch(`${API_URL}/api/favorites/${user.uid}`)
          .then((r) => r.ok ? r.json() : {})
          .then((d) => setSavedIds(Array.isArray(d?.questionIds) ? d.questionIds : []))
          .catch(() => setSavedIds([]))
      } else {
        setSavedIds([])
      }
    })
    return () => unsub()
  }, [API_URL])

  const toggleFavorite = async (questionId) => {
    if (!currentUser?.uid) return
    const numId = typeof questionId === 'number' ? questionId : Number(questionId)
    if (isNaN(numId)) return

    try {
      const res = await fetch(`${API_URL}/api/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: currentUser.uid, questionId: numId }),
      })
      const data = await res.json()
      if (data?.status === 'added') setSavedIds((prev) => [...prev, numId])
      else if (data?.status === 'removed') setSavedIds((prev) => prev.filter((id) => id !== numId))
    } catch (e) {
      console.error('Favorites error:', e)
    }
  }

  const getOptText = (opt) => opt?.text || opt?.option || opt?.answer || "Matn yo'q"
  const isOptCorrect = (opt) => !!(opt?.isCorrect === true || opt?.is_correct === true)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-white font-sans flex flex-col">
      <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white dark:bg-[#1e2130] border-b border-slate-200 dark:border-white/5 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#2a2d3e] hover:bg-slate-200 dark:hover:bg-[#35394b] flex items-center justify-center text-slate-500 dark:text-slate-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m7 7l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Qidirish</h1>
        </div>
        <ThemeToggle size="sm" />
      </header>

      <div className="bg-white dark:bg-[#1e2130] border-b border-slate-200 dark:border-white/5 p-4 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Savol raqami yoki matnini kiriting"
              className="w-full bg-slate-100 dark:bg-[#2a2d3e] border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-cyan/50 focus:bg-white dark:focus:bg-[#2a2d3e] transition-colors"
            />
            <svg className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { value: 'all', label: 'Barchasi' },
              { value: 'true', label: 'Rasmli' },
              { value: 'false', label: 'Rasmsiz' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setHasImage(value)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${hasImage === value
                    ? 'bg-brand-blue text-white'
                    : 'bg-slate-100 dark:bg-[#2a2d3e] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
                  }`}
              >
                {label}
              </button>
            ))}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="ml-auto bg-slate-100 dark:bg-[#2a2d3e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-500 dark:text-slate-400 focus:outline-none"
            >
              <option value="asc">ID ↑</option>
              <option value="desc">ID ↓</option>
            </select>
          </div>
        </div>
      </div>

      <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">{error}</div>
        )}

        <div className="mb-4 text-slate-500 dark:text-slate-400 text-sm">
          Jami: <span className="font-bold text-slate-900 dark:text-white">{totalCount}</span> ta savol
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 rounded-full border-2 border-brand-cyan/30 border-t-brand-cyan animate-spin" />
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-20 text-slate-400">Savollar topilmadi</div>
        ) : (
          <div className="space-y-6">
            {questions.map((q) => {
              const qId = q.id ?? q._id
              const isSaved = savedIds.includes(Number(qId))
              const imgSrc = q.image && (q.image.startsWith('http') ? q.image : `${API_URL}/uploads/${q.image}`)

              return (
                <div key={qId} className="bg-white dark:bg-[#1e2130] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-brand-cyan/10 dark:bg-brand-cyan/20 text-brand-cyan px-3 py-1.5 rounded-lg text-xs font-bold">
                        Savol #{qId}
                      </span>
                      <button
                        onClick={() => toggleFavorite(qId)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        aria-label={isSaved ? "O'chirish" : "Saqlash"}
                      >
                        <svg className={`w-5 h-5 ${isSaved ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                          <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>

                    <p className="text-base md:text-lg font-medium text-slate-800 dark:text-white mb-4 leading-relaxed">{q.question}</p>

                    {imgSrc && (
                      <div className="relative w-full h-48 md:h-56 rounded-xl overflow-hidden bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/5 mb-4">
                        <Image src={imgSrc} alt="Savol rasmi" fill className="object-contain" />
                      </div>
                    )}

                    <div className="space-y-2">
                      {(q.options || []).map((opt, idx) => {
                        const correct = isOptCorrect(opt)
                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border flex items-center gap-3 ${correct
                                ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-100'
                                : 'bg-slate-50 dark:bg-[#2a2d3e] border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400'
                              }`}
                          >
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${correct ? 'bg-emerald-100 dark:bg-emerald-600/50 text-emerald-700 dark:text-emerald-50' : 'bg-slate-200 dark:bg-[#35394b] text-slate-500 dark:text-slate-400'
                              }`}>
                              F{idx + 1}
                            </span>
                            <span className="text-sm md:text-base">{getOptText(opt)}</span>
                            {correct && (
                              <svg className="w-5 h-5 text-emerald-500 dark:text-emerald-400 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-10">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#2a2d3e] hover:bg-slate-200 dark:hover:bg-[#35394b] flex items-center justify-center disabled:opacity-30 transition-colors text-slate-600 dark:text-slate-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-slate-500 dark:text-slate-400 text-sm">{page} / {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#2a2d3e] hover:bg-slate-200 dark:hover:bg-[#35394b] flex items-center justify-center disabled:opacity-30 transition-colors text-slate-600 dark:text-slate-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
