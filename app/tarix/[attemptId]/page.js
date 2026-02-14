'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import ThemeToggle from '@/components/ThemeToggle'
import { ChevronDown, ChevronUp, Clock, RotateCcw, AlertCircle, ArrowLeft } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

function formatDuration(seconds) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function StatusBadge({ status }) {
    if (status === 'otmadi') {
        return (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <AlertCircle className="w-3 h-3" />
                O&apos;TMADI
            </span>
        )
    }
    if (status === 'bekor') {
        return (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-500/20 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <AlertCircle className="w-3 h-3" />
                BEKOR QILINDI
            </span>
        )
    }
    return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            TUGALLANGAN
        </span>
    )
}

function QuestionItem({ item, index, isOpen, toggleOpen }) {
    const { questionData, userAnswer, correctAnswer, isCorrect } = item
    const isSkipped = userAnswer === null || userAnswer === undefined

    // Status icon/text for the header
    let statusText = ''
    let statusColor = ''
    if (isSkipped) {
        statusText = 'Javobsiz'
        statusColor = 'text-slate-400'
    } else if (isCorrect) {
        statusText = "To'g'ri"
        statusColor = 'text-emerald-400'
    } else {
        statusText = "Noto'g'ri"
        statusColor = 'text-rose-400'
    }

    return (
        <div className="bg-[#1e2130] rounded-2xl border border-white/5 overflow-hidden transition-all duration-200">
            <button
                onClick={toggleOpen}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 
                        ${isSkipped
                            ? 'border-slate-600 text-slate-400'
                            : isCorrect
                                ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                                : 'border-rose-500/30 text-rose-400 bg-rose-500/10'
                        }`}>
                        {index + 1}
                    </div>
                    <div className="text-left">
                        <p className="text-whitefont-medium text-sm text-slate-200">Savol #{index + 1}</p>
                        <div className={`flex items-center gap-1.5 text-xs font-medium ${statusColor}`}>
                            {isSkipped ? <AlertCircle className="w-3 h-3" /> : (isCorrect ? null : <span className="text-xs">✕</span>)}
                            {statusText}
                        </div>
                    </div>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </button>

            {isOpen && (
                <div className="p-5 pt-0 border-t border-white/5">
                    <p className="text-white text-base font-medium my-4 leading-relaxed">
                        {questionData?.question?.replace(/<[^>]+>/g, '') || `Savol matni mavjud emas`}
                    </p>

                    {questionData?.media && questionData.media.name && (
                        <div className="mb-5 relative h-52 w-full rounded-xl overflow-hidden bg-black/40 border border-white/5">
                            <Image
                                src={`${API_URL}/uploads/${questionData.media.name}`}
                                alt="Savol rasmi"
                                fill
                                className="object-contain"
                            />
                        </div>
                    )}

                    <div className="space-y-2.5">
                        {questionData?.options?.map((opt, optIdx) => {
                            const isSelected = userAnswer === optIdx
                            const isOptCorrect = correctAnswer === optIdx

                            let bgClass = 'bg-[#2a2d3e] border border-transparent hover:border-white/10'
                            let textClass = 'text-slate-300'

                            if (isOptCorrect) {
                                bgClass = 'bg-emerald-500/20 border border-emerald-500/50'
                                textClass = 'text-emerald-100'
                            } else if (isSelected && !isOptCorrect) {
                                bgClass = 'bg-rose-500/20 border border-rose-500/50'
                                textClass = 'text-rose-100'
                            }

                            return (
                                <div key={optIdx} className={`p-4 rounded-xl transition-all ${bgClass}`}>
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-bold
                                            ${isOptCorrect ? 'border-emerald-400 text-emerald-400' : isSelected ? 'border-rose-400 text-rose-400' : 'border-slate-500 text-slate-500'}`}>
                                            {['F1', 'F2', 'F3', 'F4'][optIdx]}
                                        </div>
                                        <span className={`text-sm ${textClass}`}>{opt.text}</span>
                                        {isOptCorrect && <div className="ml-auto bg-emerald-500 rounded-full p-0.5"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>}
                                        {isSelected && !isOptCorrect && <div className="ml-auto bg-rose-500 rounded-full p-0.5"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></div>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default function ExamDetailPage({ params }) {
    const router = useRouter()
    const attemptId = params.attemptId

    const [attempt, setAttempt] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState('all') // all, correct, incorrect, skipped
    const [openQuestions, setOpenQuestions] = useState({}) // { [index]: boolean }

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const res = await fetch(`${API_URL}/api/exam-history/attempt/${attemptId}`)
                    if (res.ok) {
                        const data = await res.json()
                        setAttempt(data)
                    }
                } catch (e) {
                    console.error('Error fetching attempt:', e)
                } finally {
                    setLoading(false)
                }
            } else {
                router.push('/login')
            }
        })
        return () => unsub()
    }, [attemptId, router])

    const stats = useMemo(() => {
        if (!attempt) return { correct: 0, incorrect: 0, skipped: 0 }
        let correct = 0, incorrect = 0, skipped = 0
        attempt.details.forEach(d => {
            if (d.userAnswer === null || d.userAnswer === undefined) skipped++
            else if (d.isCorrect) correct++
            else incorrect++
        })
        return { correct, incorrect, skipped }
    }, [attempt])

    const filteredQuestions = useMemo(() => {
        if (!attempt) return []
        return attempt.details.map((item, index) => ({ ...item, originalIndex: index })).filter(item => {
            if (activeFilter === 'all') return true
            if (activeFilter === 'correct') return item.isCorrect
            if (activeFilter === 'incorrect') return !item.isCorrect && (item.userAnswer !== null && item.userAnswer !== undefined)
            if (activeFilter === 'skipped') return item.userAnswer === null || item.userAnswer === undefined
            return true
        })
    }, [attempt, activeFilter])

    if (loading) return <div className="min-h-screen bg-[#161821] flex items-center justify-center text-slate-400">Yuklanmoqda...</div>
    if (!attempt) return <div className="min-h-screen bg-[#161821] flex items-center justify-center text-slate-400">Ma&apos;lumot topilmadi</div>

    const { correct, total, durationSeconds, status, details } = attempt

    return (
        <div className="min-h-screen bg-[#161821] text-white font-sans flex flex-col pb-10">
            {/* Header */}
            <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-4 lg:px-6 bg-[#1e2130]/80 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-[#2a2d3e] hover:bg-[#35394b] flex items-center justify-center text-slate-300 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold">Imtihon tafsilotlari</h1>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-[#2a2d3e] text-xs font-semibold text-slate-300">
                    Biletlar
                </div>
            </header>

            <main className="flex-1 px-4 py-6 w-full max-w-2xl mx-auto space-y-6">

                {/* Summary Card */}
                <div className="bg-[#1e2130] rounded-[24px] p-6 border border-white/5 relative overflow-hidden">
                    <div className="flex items-start justify-between mb-8">
                        <StatusBadge status={status} />
                        <div className="text-right">
                            <p className="text-slate-400 text-xs font-medium mb-0.5">Ball</p>
                            <div className="flex items-end justify-end gap-1.5">
                                <span className="text-3xl font-bold text-white">{correct}/{total}</span>
                                <span className="text-sm font-medium text-slate-500 mb-1.5">{Math.round((correct / total) * 100)}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <span className="text-lg font-bold text-emerald-400">{stats.correct}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">To&apos;g&apos;ri</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center mb-2">
                                <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </div>
                            <span className="text-lg font-bold text-rose-400">{stats.incorrect}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Noto&apos;g&apos;ri</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-slate-500/10 flex items-center justify-center mb-2">
                                <span className="text-slate-400 font-bold text-sm">?</span>
                            </div>
                            <span className="text-lg font-bold text-slate-400">{stats.skipped}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Javobsiz</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                                <Clock className="w-4 h-4 text-blue-500" />
                            </div>
                            <span className="text-lg font-bold text-white">{formatDuration(durationSeconds)}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Vaqt</span>
                        </div>
                    </div>
                </div>

                {/* Grid View */}
                <div className="bg-[#1e2130] rounded-[24px] p-6 border border-white/5">
                    <h3 className="text-sm font-bold text-white mb-4">Savollar</h3>
                    <div className="grid grid-cols-8 gap-2">
                        {details.map((item, idx) => {
                            const isSkipped = item.userAnswer === null || item.userAnswer === undefined
                            let bgClass = 'bg-[#2a2d3e] text-slate-400 border-transparent'
                            if (isSkipped) bgClass = 'bg-[#2a2d3e] text-slate-400 border-transparent hover:border-slate-500' // Skipped styling
                            else if (item.isCorrect) bgClass = 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                            else bgClass = 'bg-rose-500/10 text-rose-400 border border-rose-500/30'

                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setOpenQuestions({ ...openQuestions, [idx]: true })
                                        document.getElementById(`q-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                    }}
                                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${bgClass}`}
                                >
                                    {idx + 1}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {[
                        { id: 'all', label: `Barchasi (${details.length})` },
                        { id: 'correct', label: `To'g'ri (${stats.correct})` },
                        { id: 'incorrect', label: `Xato (${stats.incorrect})` },
                        { id: 'skipped', label: `Tashlab ketilgan (${stats.skipped})` }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveFilter(tab.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${activeFilter === tab.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-[#1e2130] text-slate-400 border border-white/5 hover:bg-[#2a2d3e]'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Question List */}
                <div className="space-y-4">
                    <h3 className="text-base font-bold text-white">Javoblarni ko&apos;rish</h3>
                    {filteredQuestions.map((item) => (
                        <div id={`q-${item.originalIndex}`} key={item.originalIndex}>
                            <QuestionItem
                                item={item}
                                index={item.originalIndex}
                                isOpen={openQuestions[item.originalIndex]}
                                toggleOpen={() => setOpenQuestions(prev => ({ ...prev, [item.originalIndex]: !prev[item.originalIndex] }))}
                            />
                        </div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                    <button className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl transition-colors">
                        <RotateCcw className="w-4 h-4" />
                        Qaytadan
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-[#1e2130] hover:bg-[#2a2d3e] border border-white/10 text-slate-300 font-bold py-3.5 px-4 rounded-xl transition-colors">
                        <AlertCircle className="w-4 h-4" />
                        Xatolarni ishlash ({stats.incorrect})
                    </button>
                </div>

            </main>
        </div>
    )
}
