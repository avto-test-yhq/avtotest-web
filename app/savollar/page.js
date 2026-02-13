'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

export default function SavollarPage() {
    const router = useRouter()
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [hasImage, setHasImage] = useState('all') // all, true, false
    const [sort, setSort] = useState('asc') // asc, desc
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState(search)
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500)
        return () => clearTimeout(timer)
    }, [search])

    const fetchQuestions = useCallback(async () => {
        setLoading(true)
        try {
            const query = new URLSearchParams({
                page,
                limit: 20,
                sort,
                lang: 'uzl', // Default lang, functionality to change can be added
            })

            if (debouncedSearch) query.append('search', debouncedSearch)
            if (hasImage !== 'all') query.append('hasImage', hasImage)

            const res = await fetch(`${API_URL}/api/tests?${query.toString()}`)
            if (res.ok) {
                const data = await res.json()
                // API returns { data, total, page, pages }
                if (data && Array.isArray(data.data)) {
                    setQuestions(data.data)
                    setTotalPages(data.pages)
                    setTotalCount(data.total)
                } else {
                    setQuestions([])
                }
            }
        } catch (e) {
            console.error("Fetch error:", e)
        } finally {
            setLoading(false)
        }
    }, [page, sort, hasImage, debouncedSearch, API_URL])

    useEffect(() => {
        fetchQuestions()
    }, [fetchQuestions])

    // Reset page on filter change
    useEffect(() => {
        setPage(1)
    }, [sort, hasImage, debouncedSearch])

    return (
        <div className="min-h-screen bg-[#161821] text-white font-sans flex flex-col">
            <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-[#1e2130] border-b border-white/5 shrink-0 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="w-9 h-9 rounded-lg bg-[#2a2d3e] hover:bg-[#35394b] flex items-center justify-center text-slate-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m7 7l-7-7 7-7" /></svg>
                    </Link>
                    <h1 className="text-lg font-bold text-white">Savollar Bazasi</h1>
                </div>
                <ThemeToggle size="sm" />
            </header>

            <div className="bg-[#1e2130] border-b border-white/5 p-4 sticky top-16 z-40 shadow-xl">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Qidirish (ID yoki matn)..."
                            className="w-full bg-[#2a2d3e] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan/50"
                        />
                        <svg className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                        <select
                            value={hasImage}
                            onChange={(e) => setHasImage(e.target.value)}
                            className="bg-[#2a2d3e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                        >
                            <option value="all">Barcha savollar</option>
                            <option value="true">Rasmli</option>
                            <option value="false">Rasmsiz</option>
                        </select>

                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="bg-[#2a2d3e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                        >
                            <option value="asc">ID: O&apos;sish (1-9)</option>
                            <option value="desc">ID: Kamayish (9-1)</option>
                        </select>
                    </div>
                </div>
            </div>

            <main className="flex-1 px-4 py-6 max-w-6xl mx-auto w-full">
                <div className="mb-4 text-slate-400 text-sm">
                    Jami: <span className="font-bold text-white">{totalCount}</span> ta savol topildi
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-400">Yuklanmoqda...</div>
                ) : questions.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">Savollar topilmadi</div>
                ) : (
                    <div className="space-y-8">
                        {questions.map((q) => (
                            <div key={q.id || q._id} className="bg-[#1e2130] rounded-2xl border border-white/5 overflow-hidden p-6 md:p-8">
                                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                                    {/* Question Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="bg-[#2a2d3e] text-slate-300 px-3 py-1 rounded-lg text-xs font-mono font-bold">
                                                ID: {q.id}
                                            </span>
                                            <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Savol</span>
                                        </div>
                                        <p className="text-lg md:text-xl font-medium text-white mb-6 leading-relaxed">
                                            {q.question}
                                        </p>

                                        {/* Image for Mobile (or if layout stack) */}
                                        {q.image && (
                                            <div className="md:hidden w-full relative h-48 rounded-xl overflow-hidden bg-black/20 border border-white/5 mb-6">
                                                <Image
                                                    src={q.image.startsWith('http') ? q.image : `${API_URL}/uploads/${q.image}`}
                                                    alt="Savol rasmi"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        )}

                                        <div className="grid gap-3">
                                            {q.options.map((opt, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`p-4 rounded-xl border flex items-center gap-3 ${opt.isCorrect || opt.is_correct
                                                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-100'
                                                            : 'bg-[#2a2d3e] border-transparent text-slate-400 opacity-60'
                                                        }`}
                                                >
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${name = opt.isCorrect || opt.is_correct ? 'border-emerald-500 text-emerald-500' : 'border-slate-600 text-slate-500'}`}>
                                                        {idx + 1}
                                                    </div>
                                                    <span className="text-sm md:text-base font-medium">{opt.text || opt.option || opt.answer}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Image Desktop */}
                                    {q.image && (
                                        <div className="hidden md:block w-72 lg:w-96 shrink-0">
                                            <div className="relative w-full h-full min-h-[200px] rounded-xl overflow-hidden bg-black/20 border border-white/5">
                                                <Image
                                                    src={q.image.startsWith('http') ? q.image : `${API_URL}/uploads/${q.image}`}
                                                    alt="Savol rasmi"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-10">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="w-10 h-10 rounded-lg bg-[#2a2d3e] hover:bg-[#35394b] flex items-center justify-center disabled:opacity-30 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <span className="text-slate-400 text-sm">
                            {page} / {totalPages}
                        </span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="w-10 h-10 rounded-lg bg-[#2a2d3e] hover:bg-[#35394b] flex items-center justify-center disabled:opacity-30 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}
