'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import ThemeToggle from '@/components/ThemeToggle'

export default function StatistikaPage() {
    const router = useRouter()
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
        <div className="min-h-screen bg-[#161821] text-white font-sans flex flex-col">
            <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-[#1e2130] border-b border-white/5 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-[#2a2d3e] hover:bg-[#35394b] flex items-center justify-center text-slate-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m7 7l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="text-lg font-bold text-white">Savollar Statistikasi</h1>
                </div>
                <ThemeToggle size="sm" />
            </header>

            <main className="flex-1 px-4 py-6 overflow-y-auto max-w-5xl mx-auto w-full">
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['date', 'attempts', 'accuracy'].map(key => (
                        <button
                            key={key}
                            onClick={() => handleSort(key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${sort === key ? 'bg-brand-cyan text-white' : 'bg-[#2a2d3e] text-slate-400 hover:text-white'}`}
                        >
                            {key === 'date' && 'Oxirgi urinish'}
                            {key === 'attempts' && 'Eng kop yechilgan'}
                            {key === 'accuracy' && 'Aniqlik'}
                            {sort === key && (order === 'asc' ? ' ↑' : ' ↓')}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-400">Yuklanmoqda...</div>
                ) : stats.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">Statistika topilmadi</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.map((stat) => (
                            <div key={stat.questionId} className="bg-[#1e2130] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-mono text-slate-500">ID: {stat.questionId}</span>
                                    <span className="text-xs text-slate-500">{new Date(stat.lastAttemptAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-2xl font-bold text-white mb-1">{stat.accuracy}%</p>
                                        <p className="text-xs text-slate-400">{stat.correct} to'g'ri / {stat.attempts} urinish</p>
                                    </div>
                                    <div className="h-10 w-1 bg-slate-700/50 rounded-full overflow-hidden relative">
                                        <div
                                            className={`absolute bottom-0 left-0 w-full ${stat.accuracy >= 80 ? 'bg-emerald-500' : stat.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
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
