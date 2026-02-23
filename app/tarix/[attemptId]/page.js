'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import ThemeToggle from '@/components/ThemeToggle'
import { useI18n } from '@/lib/i18n'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

const Icon = ({ name, className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {name === 'ArrowLeft' && <path d="M19 12H5m7 7l-7-7 7-7" />}
        {name === 'CheckCircle' && <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
        {name === 'Cancel' && <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />}
        {name === 'HelpOutline' && <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
        {name === 'Schedule' && <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
        {name === 'Refresh' && <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />}
        {name === 'ErrorOutline' && <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
        {name === 'ExpandLess' && <path d="M5 15l7-7 7 7" />}
        {name === 'ExpandMore' && <path d="M19 9l-7 7-7-7" />}
    </svg>
)

function formatDuration(seconds) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function getTypeLabel(type, t) {
    const map = { standart: 'tarix.typeStandart', haqiqiy: 'tarix.typeReal', favorites: 'tarix.typeFavorites', mistakes: 'tarix.typeMistakes', bilet: 'Biletlar' }
    return map[type] ? t(map[type]) : type
}

function StatusBadge({ status }) {
    if (status === 'otmadi' || status === 'bekor') {
        return (
            <span className="px-3 py-1 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-full flex items-center gap-1">
                <Icon name="Cancel" className="w-4 h-4" />
                {status === 'otmadi' ? "YIQILDI" : "BEKOR QILINDI"}
            </span>
        )
    }
    return (
        <span className="px-3 py-1 bg-brand-cyan/10 dark:bg-brand-cyan/20 text-brand-cyan text-xs font-bold rounded-full flex items-center gap-1">
            <Icon name="CheckCircle" className="w-4 h-4" />
            YAKUNLANDI
        </span>
    )
}

function QuestionItem({ item, index, isOpen, toggleOpen, t }) {
    const { questionData, userAnswer, correctAnswer, isCorrect } = item
    const isSkipped = userAnswer === null || userAnswer === undefined

    let statusText = ''
    let statusColor = ''
    let statusBg = ''
    let borderClass = ''
    let iconClass = ''

    if (isSkipped) {
        statusText = "Javobsiz"
        statusColor = 'text-slate-500'
        statusBg = 'bg-slate-50 dark:bg-[#1e293b]'
        borderClass = 'border-l-4 border-slate-400'
        iconClass = 'border-slate-400 text-slate-400'
    } else if (isCorrect) {
        statusText = "✓ To'g'ri"
        statusColor = 'text-emerald-500'
        statusBg = 'bg-white dark:bg-[#1e293b]'
        borderClass = 'border-l-4 border-emerald-500'
        iconClass = 'border-emerald-500 text-emerald-500'
    } else {
        statusText = "✕ Noto'g'ri"
        statusColor = 'text-rose-500'
        statusBg = 'bg-white dark:bg-[#1e293b]'
        borderClass = 'border-l-4 border-rose-500'
        iconClass = 'border-rose-500 text-rose-500'
    }

    return (
        <div className={`rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 transition-all ${statusBg} ${borderClass}`}>
            <div
                onClick={toggleOpen}
                className="p-4 flex items-center justify-between cursor-pointer border-b border-transparent data-[open=true]:border-slate-200 dark:data-[open=true]:border-slate-800"
                data-open={isOpen}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 flex items-center justify-center border-2 font-black rounded-full text-xs ${iconClass}`}>
                        {index + 1}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Savol #{index + 1}</h3>
                        <p className={`text-xs font-semibold ${statusColor}`}>{statusText}</p>
                    </div>
                </div>
                <Icon name={isOpen ? 'ExpandLess' : 'ExpandMore'} className="w-6 h-6 text-slate-400" />
            </div>

            {isOpen && (
                <div className="p-6 space-y-6 sm:space-y-8 animate-in slide-in-from-top-2 duration-300">
                    {questionData?.media && questionData.media.name && (
                        <div className={`bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-wrap justify-center gap-8 items-end`}>
                            <div className="relative w-full max-w-sm h-48 sm:h-56 mx-auto">
                                <Image
                                    src={`${API_URL}/uploads/${questionData.media.name}`}
                                    alt={t('tarix.questionImage')}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    )}

                    <p className="text-base sm:text-lg font-semibold leading-relaxed text-slate-800 dark:text-slate-100">
                        {questionData?.question?.replace(/<[^>]+>/g, '') || t('tarix.questionNoText')}
                    </p>

                    <div className="space-y-3">
                        {questionData?.options?.map((opt, optIdx) => {
                            const isSelected = userAnswer === optIdx
                            const isOptCorrect = correctAnswer === optIdx

                            let containerClass = "flex items-center gap-3 p-4 rounded-xl transition-all border "
                            let labelClass = "w-8 h-8 flex items-center justify-center rounded-md text-[10px] font-black uppercase shrink-0 "
                            let textClass = "font-medium text-slate-700 dark:text-slate-300 "

                            if (isOptCorrect) {
                                containerClass += "bg-emerald-500/10 border-emerald-500/30 dark:border-emerald-500/50"
                                labelClass += "bg-emerald-500 text-white"
                                textClass = "font-bold text-emerald-700 dark:text-emerald-400"
                            } else if (isSelected && !isOptCorrect) {
                                containerClass += "bg-rose-500/10 border-rose-500/30 dark:border-rose-500/50"
                                labelClass += "bg-rose-500 text-white"
                                textClass = "font-bold text-rose-700 dark:text-rose-400"
                            } else {
                                containerClass += "bg-slate-50 dark:bg-[#1e293b] border-slate-200 dark:border-slate-800"
                                labelClass += "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                            }

                            return (
                                <div key={optIdx} className={containerClass}>
                                    <span className={labelClass}>F{optIdx + 1}</span>
                                    <span className={`${textClass} flex-1`}>{opt.text || opt.option || opt.answer}</span>
                                    {isOptCorrect && <Icon name="CheckCircle" className="w-6 h-6 text-emerald-500 shrink-0" />}
                                    {isSelected && !isOptCorrect && <Icon name="Cancel" className="w-6 h-6 text-rose-500 shrink-0" />}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default function ExamDetailPage() {
    const router = useRouter()
    const params = useParams()
    const t = useI18n()
    const attemptId = params?.attemptId

    const [attempt, setAttempt] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState('all')
    const [openQuestions, setOpenQuestions] = useState({})

    useEffect(() => {
        if (!attemptId) return

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
        attempt.details.forEach((d) => {
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

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-brand-cyan animate-spin" />
            </div>
        )
    }

    if (!attempt) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center text-slate-500">
                Topilmadi
            </div>
        )
    }

    const { correct, total, durationSeconds, status, details, type } = attempt
    const isCanceled = status === 'otmadi' || status === 'bekor'
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0

    return (
        <div className="bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300 font-display">
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-300">
                            <Icon name="ArrowLeft" className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold tracking-tight">Imtihon tafsilotlari</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded uppercase tracking-wider">
                            {getTypeLabel(type, t)}
                        </span>
                        <ThemeToggle size="sm" />
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Stats & Actions */}
                <div className="lg:col-span-5 space-y-6">
                    <section className="bg-white dark:bg-[#1e293b] p-6 rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="flex justify-between items-start mb-6">
                            <StatusBadge status={status} />
                            <div className="text-right">
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Ball</p>
                                <p className={`text-4xl font-black ${isCanceled ? 'text-slate-400' : 'text-brand-cyan'}`}>
                                    {isCanceled ? 0 : correct}
                                    <span className="text-slate-400 text-xl font-medium mx-1">/{total}</span>
                                    <span className="text-lg text-brand-cyan/70 ml-1">{isCanceled ? '0%' : `${percentage}%`}</span>
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 text-center mt-8">
                            <div className="space-y-2">
                                <div className="w-12 h-12 mx-auto bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                                    <Icon name="CheckCircle" className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-slate-900 dark:text-white">{stats.correct}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">To'g'ri</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="w-12 h-12 mx-auto bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center">
                                    <Icon name="Cancel" className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-slate-900 dark:text-white">{stats.incorrect}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Noto'g'ri</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="w-12 h-12 mx-auto bg-slate-500/10 text-slate-400 rounded-full flex items-center justify-center">
                                    <Icon name="HelpOutline" className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-slate-900 dark:text-white">{stats.skipped}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Javobsiz</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="w-12 h-12 mx-auto bg-brand-cyan/10 text-brand-cyan rounded-full flex items-center justify-center">
                                    <Icon name="Schedule" className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-slate-900 dark:text-white font-mono">{formatDuration(durationSeconds)}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Vaqt</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-[#1e293b] p-6 rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
                        <h2 className="text-sm font-bold mb-5 uppercase tracking-wider text-slate-500">Savollar</h2>
                        <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-5 gap-3">
                            {details.map((item, idx) => {
                                const isSkipped = item.userAnswer === null || item.userAnswer === undefined
                                let bgClass = "bg-slate-100 dark:bg-slate-800 text-slate-500"

                                if (item.isCorrect) bgClass = "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                else if (!item.isCorrect && !isSkipped) bgClass = "bg-rose-500 text-white shadow-md shadow-rose-500/20"

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setOpenQuestions({ ...openQuestions, [idx]: true })
                                            document.getElementById(`q-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                        }}
                                        className={`aspect-square flex items-center justify-center font-bold rounded-xl text-sm transition-all hover:scale-110 active:scale-95 ${bgClass}`}
                                    >
                                        {idx + 1}
                                    </button>
                                )
                            })}
                        </div>
                    </section>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <button
                            onClick={() => router.push(type === 'bilet' ? `/biletlar/${attempt.ticketId || 1}` : '/exam')}
                            className="flex items-center justify-center gap-2 bg-brand-cyan hover:bg-brand-cyan/90 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-brand-cyan/20"
                        >
                            <Icon name="Refresh" className="w-5 h-5" />
                            Qaytadan
                        </button>
                        <button
                            className="flex items-center justify-center gap-2 bg-white dark:bg-[#1e293b] border-2 border-slate-200 dark:border-slate-700 hover:border-brand-cyan/50 text-slate-700 dark:text-slate-300 font-bold py-4 rounded-2xl transition-all active:scale-95"
                        >
                            <Icon name="ErrorOutline" className="w-5 h-5 text-brand-cyan" />
                            Xatolarni ({stats.incorrect})
                        </button>
                    </div>
                </div>

                {/* Right Column: Answers List */}
                <div className="lg:col-span-7 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-200">

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-[72px] lg:top-20 z-40 bg-slate-50/95 dark:bg-[#0f172a]/95 py-4 backdrop-blur-md">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Javoblarni ko'rish</h2>
                        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                            <button
                                onClick={() => setActiveFilter('all')}
                                className={`px-5 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${activeFilter === 'all' ? 'bg-brand-cyan text-white shadow-md shadow-brand-cyan/20' : 'bg-white dark:bg-[#1e293b] text-slate-500 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                Barchasi ({details.length})
                            </button>
                            <button
                                onClick={() => setActiveFilter('correct')}
                                className={`px-5 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${activeFilter === 'correct' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-white dark:bg-[#1e293b] text-slate-500 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                To'g'ri ({stats.correct})
                            </button>
                            <button
                                onClick={() => setActiveFilter('incorrect')}
                                className={`px-5 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${activeFilter === 'incorrect' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'bg-white dark:bg-[#1e293b] text-slate-500 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                Xato ({stats.incorrect})
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4 pb-20">
                        {filteredQuestions.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                                {t('tarix.emptyExams')}
                            </div>
                        ) : (
                            filteredQuestions.map((item) => (
                                <div id={`q-${item.originalIndex}`} key={item.originalIndex} className="scroll-mt-32">
                                    <QuestionItem
                                        item={item}
                                        index={item.originalIndex}
                                        isOpen={openQuestions[item.originalIndex]}
                                        toggleOpen={() => setOpenQuestions(prev => ({ ...prev, [item.originalIndex]: !prev[item.originalIndex] }))}
                                        t={t}
                                    />
                                </div>
                            ))
                        )}
                    </div>

                </div>

            </main>
        </div>
    )
}
