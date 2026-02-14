'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import ThemeToggle from '@/components/ThemeToggle'

const Icon = ({ name, className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {name === 'ArrowLeft' && <path d="M19 12H5m7 7l-7-7 7-7" />}
        {name === 'Check' && <path d="M5 13l4 4L19 7" />}
        {name === 'X' && <path d="M6 18L18 6M6 6l12 12" />}
    </svg>
)

export default function ExamDetailPage({ params }) {
    const router = useRouter()
    const attemptId = params.attemptId
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

    const [attempt, setAttempt] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const res = await fetch(`${API_URL}/api/exam-history/attempt/${attemptId}`)
                    if (res.ok) {
                        const data = await res.json()
                        setAttempt(data)
                    } else {
                        console.error('Failed to fetch attempt')
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
    }, [attemptId, router, API_URL])

    if (loading) {
        return <div className="min-h-screen bg-[#161821] flex items-center justify-center text-slate-400">Yuklanmoqda...</div>
    }

    if (!attempt) {
        return <div className="min-h-screen bg-[#161821] flex items-center justify-center text-slate-400">Ma'lumot topilmadi</div>
    }

    const { details, score, type, correct, total } = attempt

    return (
        <div className="min-h-screen bg-[#161821] text-white font-sans flex flex-col">
            <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-[#1e2130] border-b border-white/5 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-[#2a2d3e] hover:bg-[#35394b] flex items-center justify-center text-slate-300">
                        <Icon name="ArrowLeft" className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-base md:text-lg font-bold text-white">Imtihon natijalari</h1>
                        <p className="text-xs text-slate-400">{new Date(attempt.createdAt).toLocaleString('uz-UZ')}</p>
                    </div>
                </div>
                <ThemeToggle size="sm" />
            </header>

            <main className="flex-1 px-4 py-8 overflow-y-auto max-w-4xl mx-auto w-full">
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-[#1e2130] p-4 rounded-xl border border-white/5 text-center">
                        <p className="text-slate-400 text-sm mb-1">Natija</p>
                        <div className="text-2xl font-bold text-white">{correct} / {total}</div>
                        <div className="text-xs text-slate-500">{Math.round((correct / total) * 100)}%</div>
                    </div>
                    <div className="bg-[#1e2130] p-4 rounded-xl border border-white/5 text-center flex flex-col items-center justify-center">
                        <button className="bg-brand-cyan/10 text-brand-cyan px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-cyan/20 transition-colors">
                            Imtihonni qayta topshirish
                        </button>
                        {/* TODO: Implement Retry Logic via Query Params or Context */}
                    </div>
                </div>

                <div className="space-y-6">
                    {details?.map((item, index) => (
                        <div key={index} className="bg-[#1e2130] p-5 rounded-xl border border-white/5">
                            <div className="flex items-start gap-4">
                                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${item.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                    {index + 1}
                                </span>
                                <div className="flex-1">
                                    <p className="text-white text-base mb-4 font-medium">{item.questionData?.question?.replace(/<[^>]+>/g, '') || `Savol ID: ${item.questionId}`}</p>

                                    {item.questionData?.media && item.questionData.media.name && (
                                        <div className="mb-4 relative h-48 w-full max-w-md rounded-lg overflow-hidden bg-black/20">
                                            <Image
                                                src={`${API_URL}/uploads/${item.questionData.media.name}`}
                                                alt="Savol rasmi"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        {item.questionData?.options?.map((opt, optIdx) => {
                                            const isSelected = item.userAnswer === optIdx
                                            const isCorrect = item.correctAnswer === optIdx

                                            let bgClass = 'bg-[#2a2d3e] border-transparent'
                                            if (isCorrect) bgClass = 'bg-emerald-500/20 border-emerald-500/50'
                                            else if (isSelected && !isCorrect) bgClass = 'bg-rose-500/20 border-rose-500/50'

                                            return (
                                                <div key={optIdx} className={`p-3 rounded-lg border text-sm ${bgClass}`}>
                                                    <div className="flex items-center gap-2">
                                                        {isCorrect && <Icon name="Check" className="w-4 h-4 text-emerald-400" />}
                                                        {isSelected && !isCorrect && <Icon name="X" className="w-4 h-4 text-rose-400" />}
                                                        <span className={isCorrect ? 'text-emerald-100' : isSelected ? 'text-rose-100' : 'text-slate-300'}>
                                                            {opt.text}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}
