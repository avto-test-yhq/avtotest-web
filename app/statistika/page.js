'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import ThemeToggle from '@/components/ThemeToggle'
import { useI18n } from '@/lib/i18n'

export default function StatistikaPage() {
    const router = useRouter()
    const t = useI18n()
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

    const [stats, setStats] = useState([])
    const [loading, setLoading] = useState(true)
    const [sort, setSort] = useState('date') // date, attempts, accuracy
    const [order, setOrder] = useState('desc')

    const fetchStats = async (uid) => {
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/api/stats/questions/${uid}?sort=${sort}&order=${order}`)
            if (res.ok) {
                const data = await res.json()
                setStats(data)
            }
        } catch (e) {
            console.error("Error loading stats", e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchStats(user.uid)
            } else {
                router.push('/login')
            }
        })
        return () => unsub()
    }, [sort, order])

    const handleSort = (key) => {
        if (sort === key) {
            setOrder(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSort(key)
            setOrder('desc')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-white font-sans flex flex-col transition-colors duration-200">
            <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white dark:bg-[#1e2130] border-b border-slate-200 dark:border-white/5 shrink-0 transition-colors duration-200">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#2a2d3e] hover:bg-slate-200 dark:hover:bg-[#35394b] flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m7 7l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">{t('stats.title')}</h1>
                </div>
                <ThemeToggle size="sm" />
            </header>

            <main className="flex-1 px-4 py-6 overflow-y-auto max-w-5xl mx-auto w-full">
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    {['date', 'attempts', 'accuracy'].map(key => (
                        <button
                            key={key}
                            onClick={() => handleSort(key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${sort === key ? 'bg-brand-cyan text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-200 dark:bg-[#2a2d3e] text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-[#35394b]'}`}
                        >
                            {key === 'date' && t('stats.sortDate')}
                            {key === 'attempts' && t('stats.sortAttempts')}
                            {key === 'accuracy' && t('stats.sortAccuracy')}
                            {sort === key && (order === 'asc' ? ' ↑' : ' ↓')}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-slate-400">
                        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-brand-cyan animate-spin" />
                    </div>
                ) : stats.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">{t('stats.noData')}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.map((stat) => (
                            <div key={stat.questionId} className="bg-white dark:bg-[#1e2130] p-4 rounded-xl border border-slate-200 dark:border-white/5 hover:border-brand-cyan/30 dark:hover:border-white/10 transition-all shadow-sm hover:shadow-md">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">ID: {stat.questionId}</span>
                                    <span className="text-xs text-slate-400 dark:text-slate-500">{new Date(stat.lastAttemptAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">{stat.accuracy}%</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.correct} {t('stats.correctAttempts')} / {stat.attempts} {t('stats.attemptsLabel')}</p>
                                    </div>
                                    <div className="h-10 w-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden relative">
                                        <div
                                            className={`absolute bottom-0 left-0 w-full rounded-full transition-all duration-500 ${stat.accuracy >= 80 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : stat.accuracy >= 50 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]'}`}
                                            style={{ height: `${stat.accuracy}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
