'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import ThemeToggle from '@/components/ThemeToggle'
import { useLanguage } from '@/context/LanguageContext'
import { useI18n } from '@/lib/i18n'
import { apiFetch } from '@/lib/apiClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz'

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
    const map = {
        standart: 'tarix.typeStandart',
        haqiqiy: 'tarix.typeReal',
        favorites: 'tarix.typeFavorites',
        mistakes: 'tarix.typeMistakes',
        bilet: 'tarix.typeBilet',
    }
    return map[type] ? t(map[type]) : type
}

function StatusBadge({ status, t }) {
    if (status === 'otmadi' || status === 'bekor') {
        return (
            <span className="px-3 py-1 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-full flex items-center gap-1">
                <Icon name="Cancel" className="w-4 h-4" />
                {status === 'otmadi' ? t('tarix.statusFailed') : t('tarix.statusCancelled')}
            </span>
        )
    }
    return (
        <span className="px-3 py-1 bg-brand-cyan/10 dark:bg-brand-cyan/20 text-brand-cyan text-xs font-bold rounded-full flex items-center gap-1">
            <Icon name="CheckCircle" className="w-4 h-4" />
            {t('tarix.statusCompleted')}
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
        statusText = t('tarix.skipped')
        statusColor = 'text-[#9AA4B2]'
        statusBg = 'bg-[#212936] md:bg-slate-50 md:dark:bg-[#1e293b]'
        borderClass = 'border-l-4 border-[#313C50] md:border-slate-400'
        iconClass = 'border-[#313C50] md:border-slate-400 text-[#9AA4B2] md:text-slate-400'
    } else if (isCorrect) {
        statusText = `✓ ${t('tarix.correct')}`
        statusColor = 'text-green-500 md:text-emerald-500'
        statusBg = 'bg-[#212936] md:bg-white md:dark:bg-[#1e293b]'
        borderClass = 'border-l-4 border-green-500 md:border-emerald-500'
        iconClass = 'border-green-500 md:border-emerald-500 text-green-500 md:text-emerald-500'
    } else {
        statusText = `✕ ${t('tarix.incorrect')}`
        statusColor = 'text-rose-500'
        statusBg = 'bg-white dark:bg-[#1e293b]'
        borderClass = 'border-l-4 border-rose-500'
        iconClass = 'border-rose-500 text-rose-500'
    }

    return (
        <div className={`rounded-[20px] overflow-hidden shadow-sm border border-[#313C50] md:border-slate-200 md:dark:border-slate-800 transition-all ${statusBg} ${borderClass}`}>
            <div
                onClick={toggleOpen}
                className="p-4 flex items-center justify-between cursor-pointer border-b border-transparent data-[open=true]:border-[#313C50] md:data-[open=true]:border-slate-200 md:dark:data-[open=true]:border-slate-800"
                data-open={isOpen}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 flex items-center justify-center border-2 font-black rounded-full text-xs ${iconClass}`}>
                        {index + 1}
                    </div>
                    <div>
                        <h3 className="font-bold text-white md:text-slate-900 md:dark:text-white">
                            {t('tarix.questionLabel')} #{index + 1}
                        </h3>
                        <p className={`text-xs font-bold md:font-semibold ${statusColor}`}>{statusText}</p>
                    </div>
                </div>
                <Icon name={isOpen ? 'ExpandLess' : 'ExpandMore'} className="w-6 h-6 text-[#9AA4B2] md:text-slate-400" />
            </div>

            {isOpen && (
                <div className="p-6 space-y-6 sm:space-y-8 animate-in slide-in-from-top-2 duration-300">
                    {questionData?.media && questionData.media.name && (
                        <div className={`bg-black/40 md:bg-slate-50 md:dark:bg-slate-800/50 p-4 sm:p-6 rounded-[16px] border border-[#313C50] md:border-slate-100 md:dark:border-slate-700 flex flex-wrap justify-center gap-8 items-end`}>
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

                    <p className="text-[15px] sm:text-lg font-medium leading-relaxed text-white md:text-slate-800 md:dark:text-slate-100">
                        {questionData?.question?.replace(/<[^>]+>/g, '') || t('tarix.questionNoText')}
                    </p>

                    <div className="space-y-3">
                        {questionData?.options?.map((opt, optIdx) => {
                            const isSelected = userAnswer === optIdx
                            const isOptCorrect = correctAnswer === optIdx

                            let containerClass = "flex items-center gap-3 p-4 rounded-[14px] transition-all border "
                            let labelClass = "w-8 h-8 flex items-center justify-center rounded-[10px] text-[10px] font-bold uppercase shrink-0 "
                            let textClass = "font-medium text-white md:text-slate-700 md:dark:text-slate-300 "

                            if (isOptCorrect) {
                                containerClass += "bg-green-500/20 md:bg-emerald-500/10 border-green-500/50 md:border-emerald-500/30 md:dark:border-emerald-500/50"
                                labelClass += "bg-green-500 md:bg-emerald-500 text-white"
                                textClass = "font-bold text-green-400 md:text-emerald-700 md:dark:text-emerald-400"
                            } else if (isSelected && !isOptCorrect) {
                                containerClass += "bg-[#161c24] md:bg-rose-500/10 border-red-500/50 md:border-rose-500/30 md:dark:border-rose-500/50"
                                labelClass += "bg-red-500 md:bg-rose-500 text-white"
                                textClass = "font-bold text-red-500 md:text-rose-700 md:dark:text-rose-400"
                            } else {
                                containerClass += "bg-[#161c24] md:bg-slate-50 md:dark:bg-[#1e293b] border-[#313C50] md:border-slate-200 md:dark:border-slate-800"
                                labelClass += "bg-[#313C50] md:bg-slate-200 md:dark:bg-slate-700 text-[#9AA4B2] md:text-slate-600 md:dark:text-slate-400"
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
    const { lang } = useLanguage()
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
                    const res = await apiFetch(`/exam-history/attempt/${attemptId}`)
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

    // Til o'zgarganda: savol va variant matnlarini yangilash (javoblar va natija saqlanadi)
    const prevLangRef = useRef(lang)
    useEffect(() => {
        if (!attempt) return
        if (prevLangRef.current === lang) return
        prevLangRef.current = lang

        const safeLang = ['uzl', 'uzk', 'ru'].includes(lang) ? lang : 'uzl'

        const ids = Array.from(
            new Set(
                (attempt.details || [])
                    .map((d) => d?.questionData?.numeric_id ?? d?.questionData?.id ?? d?.questionData?._id)
                    .filter(Boolean)
            )
        )
        if (!ids.length) return

        const controller = new AbortController()

            ; (async () => {
                try {
                    const res = await fetch(
                        `${API_URL}/api/tests?lang=${safeLang}&ids=${ids.join(',')}`,
                        { cache: 'no-store', signal: controller.signal }
                    )
                    if (!res.ok) return
                    const data = await res.json()
                    if (!Array.isArray(data) || data.length === 0) return

                    const mapById = new Map()
                    data.forEach((item) => {
                        const key = (item.id ?? item._id)?.toString()
                        if (key) mapById.set(key, item)
                    })

                    setAttempt((prev) => {
                        if (!prev) return prev
                        const updatedDetails = (prev.details || []).map((detail) => {
                            const qId =
                                detail?.questionData?.numeric_id ??
                                detail?.questionData?.id ??
                                detail?.questionData?._id
                            const key = qId?.toString()
                            const fromApi = key ? mapById.get(key) : null
                            if (!fromApi) return detail

                            const apiOptions = Array.isArray(fromApi.options) ? fromApi.options : []
                            const newOptions = (detail.questionData?.options || []).map((opt, idx) => {
                                const apiOpt = apiOptions[idx] || {}
                                const text =
                                    apiOpt.text ||
                                    apiOpt.option ||
                                    apiOpt.answer ||
                                    opt.text ||
                                    opt.option ||
                                    opt.answer
                                return {
                                    ...opt,
                                    text,
                                    option: text,
                                }
                            })

                            return {
                                ...detail,
                                questionData: {
                                    ...detail.questionData,
                                    question: fromApi.question || detail.questionData?.question,
                                    explanation: fromApi.explanation ?? detail.questionData?.explanation,
                                    options: newOptions,
                                },
                            }
                        })

                        return { ...prev, details: updatedDetails }
                    })
                } catch (e) {
                    if (e.name !== 'AbortError') {
                        console.error('Tarix savollari tilini yangilashda xatolik:', e)
                    }
                }
            })()

        return () => controller.abort()
    }, [attempt, lang])

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
                {t('tarix.notFound')}
            </div>
        )
    }

    const { correct, total, durationSeconds, status, details, type } = attempt
    const isCanceled = status === 'otmadi' || status === 'bekor'
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0

    return (
        <div className="bg-[#161c24] md:bg-slate-50 md:dark:bg-[#0f172a] text-white md:text-slate-900 md:dark:text-slate-100 min-h-screen transition-colors duration-300 font-display flex flex-col pt-[72px] lg:pt-0">
            <header className="fixed lg:sticky top-0 left-0 right-0 z-50 bg-[#161c24]/90 md:bg-white/80 md:dark:bg-[#1e293b]/80 backdrop-blur-md border-b border-[#313C50] md:border-slate-200 md:dark:border-slate-800 px-4 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 -ml-2 text-white md:text-slate-600 md:dark:text-slate-300 hover:bg-[#313C50] md:hover:bg-slate-100 md:dark:hover:bg-slate-700 rounded-[12px] transition-colors">
                            <Icon name="ArrowLeft" className="w-6 h-6" />
                        </button>
                        <h1 className="text-[20px] font-bold tracking-tight text-white">{t('tarix.detailTitle')}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded uppercase tracking-wider">
                            {getTypeLabel(type, t)}
                        </span>
                        <Link
                            href="/dashboard"
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                        >
                            <span className="material-icons-round text-sm">dashboard</span>
                            <span>{t('nav.dashboard')}</span>
                        </Link>
                        <ThemeToggle size="sm" />
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Stats & Actions */}
                <div className="lg:col-span-5 space-y-6">
                    <section className="bg-[#212936] md:bg-white md:dark:bg-[#1e293b] p-6 rounded-[24px] shadow-sm border border-[#313C50] md:border-slate-200 md:dark:border-slate-800 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="flex justify-between items-start mb-6">
                            <StatusBadge status={status} t={t} />
                            <div className="text-right">
                                <p className="text-[11px] text-[#9AA4B2] md:text-slate-500 uppercase font-bold mb-1">
                                    {t('tarix.ball')}
                                </p>
                                <p className={`text-[32px] font-black ${isCanceled ? 'text-[#9AA4B2]' : 'text-blue-500'}`}>
                                    {isCanceled ? 0 : correct}
                                    <span className="text-[#9AA4B2] md:text-slate-400 text-xl font-medium mx-1">/{total}</span>
                                    <span className="text-sm text-blue-500/70 ml-1">
                                        {isCanceled ? '0%' : `${percentage}%`}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 text-center mt-8">
                            <div className="space-y-2">
                                <div className="w-12 h-12 mx-auto bg-green-500/20 md:bg-emerald-500/10 text-green-500 md:text-emerald-500 rounded-[14px] flex items-center justify-center">
                                    <Icon name="CheckCircle" className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-white md:text-slate-900 md:dark:text-white">{stats.correct}</p>
                                    <p className="text-[10px] text-[#9AA4B2] md:text-slate-500 uppercase font-bold mt-1">
                                        {t('tarix.correct')}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="w-12 h-12 mx-auto bg-red-500/20 md:bg-rose-500/10 text-red-500 md:text-rose-500 rounded-[14px] flex items-center justify-center">
                                    <Icon name="Cancel" className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-white md:text-slate-900 md:dark:text-white">{stats.incorrect}</p>
                                    <p className="text-[10px] text-[#9AA4B2] md:text-slate-500 uppercase font-bold mt-1">
                                        {t('tarix.incorrect')}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="w-12 h-12 mx-auto bg-[#313C50] md:bg-slate-500/10 text-[#9AA4B2] md:text-slate-400 rounded-[14px] flex items-center justify-center">
                                    <Icon name="HelpOutline" className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-white md:text-slate-900 md:dark:text-white">{stats.skipped}</p>
                                    <p className="text-[10px] text-[#9AA4B2] md:text-slate-500 uppercase font-bold mt-1">
                                        {t('tarix.skipped')}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="w-12 h-12 mx-auto bg-blue-500/20 md:bg-brand-cyan/10 text-blue-500 md:text-brand-cyan rounded-[14px] flex items-center justify-center">
                                    <Icon name="Schedule" className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-white md:text-slate-900 md:dark:text-white font-mono">
                                        {formatDuration(durationSeconds)}
                                    </p>
                                    <p className="text-[10px] text-[#9AA4B2] md:text-slate-500 uppercase font-bold mt-1">
                                        {t('tarix.time')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-[#212936] md:bg-white md:dark:bg-[#1e293b] p-6 rounded-[24px] shadow-sm border border-[#313C50] md:border-slate-200 md:dark:border-slate-800 animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
                        <h2 className="text-sm font-bold mb-5 uppercase tracking-wider text-[#9AA4B2] md:text-slate-500">
                            {t('tarix.questionsTab')}
                        </h2>
                        <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-5 gap-3">
                            {details.map((item, idx) => {
                                const isSkipped = item.userAnswer === null || item.userAnswer === undefined
                                let bgClass = "bg-[#161c24] md:bg-slate-100 md:dark:bg-slate-800 text-[#9AA4B2] md:text-slate-500"

                                if (item.isCorrect) bgClass = "bg-green-500 md:bg-emerald-500 text-white shadow-md shadow-green-500/20"
                                else if (!item.isCorrect && !isSkipped) bgClass = "bg-red-500 md:bg-rose-500 text-white shadow-md shadow-red-500/20"

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
                            className="flex flex-col md:flex-row items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-[20px] transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                        >
                            <Icon name="Refresh" className="w-5 h-5 mb-1 md:mb-0" />
                            {t('tarix.retry')}
                        </button>
                        <button
                            className="flex flex-col md:flex-row items-center justify-center gap-2 bg-[#212936] md:bg-white md:dark:bg-[#1e293b] border-2 border-[#313C50] md:border-slate-200 md:dark:border-slate-700 hover:border-blue-500/50 text-[#9AA4B2] md:text-slate-700 md:dark:text-slate-300 font-bold py-4 rounded-[20px] transition-all active:scale-95 text-center text-[12px] md:text-sm"
                        >
                            <Icon name="ErrorOutline" className="w-5 h-5 text-blue-500 mb-1 md:mb-0" />
                            <span>{t('tarix.workMistakes')} ({stats.incorrect})</span>
                        </button>
                    </div>
                </div>

                {/* Right Column: Answers List */}
                <div className="lg:col-span-7 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-200">

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-[72px] lg:top-20 z-40 bg-[#161c24]/95 md:bg-slate-50/95 md:dark:bg-[#0f172a]/95 py-4 backdrop-blur-md border-b border-[#313C50] md:border-transparent pb-3 sm:pb-4">
                        <h2 className="text-xl font-bold text-white md:text-slate-900 md:dark:text-white">
                            {t('tarix.viewAnswers')}
                        </h2>
                        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                            <button
                                onClick={() => setActiveFilter('all')}
                                className={`px-5 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${activeFilter === 'all' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-[#212936] md:bg-white md:dark:bg-[#1e293b] text-[#9AA4B2] md:text-slate-500 border border-[#313C50] md:border-slate-200 md:dark:border-slate-800'}`}
                            >
                                {t('tarix.filterAllCount')} ({details.length})
                            </button>
                            <button
                                onClick={() => setActiveFilter('correct')}
                                className={`px-5 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${activeFilter === 'correct' ? 'bg-green-500 text-white shadow-md shadow-green-500/20' : 'bg-[#212936] md:bg-white md:dark:bg-[#1e293b] text-[#9AA4B2] md:text-slate-500 border border-[#313C50] md:border-slate-200 md:dark:border-slate-800'}`}
                            >
                                {t('tarix.filterCorrect')} ({stats.correct})
                            </button>
                            <button
                                onClick={() => setActiveFilter('incorrect')}
                                className={`px-5 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${activeFilter === 'incorrect' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-[#212936] md:bg-white md:dark:bg-[#1e293b] text-[#9AA4B2] md:text-slate-500 border border-[#313C50] md:border-slate-200 md:dark:border-slate-800'}`}
                            >
                                {t('tarix.filterIncorrect')} ({stats.incorrect})
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
