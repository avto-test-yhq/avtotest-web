'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import QoidalarHeader from '@/components/QoidalarHeader'
import { useLanguage } from '@/context/LanguageContext'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz'

export default function SavollarPage() {
  const { lang } = useLanguage()
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

  const transformQuestion = useCallback((item) => {
    let imageUrl = ''
    if (item.image && item.image.trim() !== '') {
      imageUrl = item.image.startsWith('http') ? item.image : `${API_URL}/uploads/${item.image}`
    }
    return {
      id: (typeof item.id === 'number' ? item.id : item._id) || item.id || item._id,
      numeric_id: typeof item.id === 'number' ? item.id : (item.id ?? item._id),
      question: item.question,
      image: imageUrl,
      explanation: item.explanation || "Izoh mavjud emas.",
      options: item.options.map((opt, idx) => ({
        option: opt.text || opt.option || opt.answer || "Matn yo'q",
        is_correct: !!(opt.isCorrect === true || opt.is_correct === true || opt.correct === true),
        _oi: idx,
      })),
    }
  }, [])

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', sort, lang: lang || 'uzl' })
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
        setQuestions(data.data.map(transformQuestion))
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
  }, [page, sort, hasImage, debouncedSearch, lang, transformQuestion])

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
        fetch(`${API_URL}/api/favorites/`)
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
        body: JSON.stringify({ questionId: numId }),
      })
      const data = await res.json()
      if (data?.status === 'added') setSavedIds((prev) => [...prev, numId])
      else if (data?.status === 'removed') setSavedIds((prev) => prev.filter((id) => id !== numId))
    } catch (e) {
      console.error('Favorites error:', e)
    }
  }



  return (
    <div className="flex flex-col w-full h-full relative z-10">
      <div className="w-full max-w-full">
        <QoidalarHeader title="Savollar" />

        <div className="bg-[#161c24] md:bg-white md:dark:bg-[#1e2130] border-b border-[#313C50] md:border-slate-200 md:dark:border-white/5 p-4 sticky top-16 z-40">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Savol raqami yoki matnini kiriting"
                className="w-full bg-[#212936] md:bg-slate-100 md:dark:bg-[#2a2d3e] border border-[#313C50] md:border-slate-200 md:dark:border-white/10 rounded-[16px] pl-11 pr-4 py-3.5 text-white placeholder-[#9AA4B2] focus:outline-none focus:border-blue-500 transition-colors"
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
                  className={`px-4 py-2 rounded-[14px] text-sm font-bold transition-all ${hasImage === value
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-[#212936] text-[#9AA4B2] border border-[#313C50]'
                    }`}
                >
                  {label}
                </button>
              ))}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="ml-auto bg-[#212936] md:bg-slate-100 md:dark:bg-[#2a2d3e] border border-[#313C50] md:border-slate-200 md:dark:border-white/10 rounded-[14px] px-3 py-2 text-xs font-bold text-[#9AA4B2] focus:outline-none"
              >
                <option value="asc">ID ↑</option>
                <option value="desc">ID ↓</option>
              </select>
            </div>
          </div>
        </div>

        <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">
          {error && (
            <div className="mb-4 p-4 rounded-[16px] bg-red-500/10 border border-red-500/30 text-red-500 text-sm">{error}</div>
          )}

          <div className="mb-4 text-[#9AA4B2] text-sm font-medium pl-1">
            Jami: <span className="font-bold text-white">{totalCount}</span> ta savol
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
                const qId = q.numeric_id || q.id
                const isSaved = savedIds.includes(Number(qId))

                return (
                  <div key={qId} className="bg-[#212936] md:bg-white md:dark:bg-[#1e2130] rounded-[24px] border border-[#313C50] md:border-slate-200 md:dark:border-white/5 overflow-hidden shadow-sm">
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-blue-500/20 text-blue-500 px-3 py-1.5 rounded-xl text-[13px] font-bold">
                          Savol #{qId}
                        </span>
                        <button
                          onClick={() => toggleFavorite(qId)}
                          className="p-2 w-10 h-10 flex items-center justify-center rounded-full bg-[#161c24] border border-[#313C50] text-[#9AA4B2] hover:bg-[#313C50] transition-colors"
                          aria-label={isSaved ? "O'chirish" : "Saqlash"}
                        >
                          <svg className={`w-5 h-5 ${isSaved ? 'fill-amber-500 text-amber-500' : 'text-[#9AA4B2]'}`} viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                      </div>

                      <p className="text-[16px] md:text-lg font-medium text-white md:text-slate-800 md:dark:text-white mb-5 leading-relaxed">{q.question}</p>

                      {q.image && (
                        <div className="relative w-full h-48 md:h-56 rounded-[16px] overflow-hidden bg-black/40 border border-[#313C50] mb-5">
                          <Image
                            src={q.image}
                            alt="Savol rasmi"
                            fill
                            className="object-contain"
                            unoptimized={q.image?.startsWith('http')}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        {(q.options || []).map((opt, idx) => {
                          return (
                            <div
                              key={idx}
                              className={`p-3.5 rounded-[16px] border flex items-center gap-3 ${opt.is_correct
                                ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                : 'bg-[#161c24] border-[#313C50] text-[#9AA4B2]'
                                }`}
                            >
                              <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${opt.is_correct ? 'bg-green-500 text-white' : 'bg-[#313C50] text-[#9AA4B2]'
                                }`}>
                                F{idx + 1}
                              </span>
                              <span className="text-sm md:text-base">{opt.option}</span>
                              {opt.is_correct && (
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
    </div>
  )
}
