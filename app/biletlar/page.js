'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import ThemeToggle from '@/components/ThemeToggle'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

const defaultProgress = { completedTickets: [], ticketResults: {}, totalCorrectAnswers: 0 }
const defaultStats = { totalTickets: 61, totalBiletQuestions: 610 }

export default function BiletlarPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(defaultProgress)
  const [stats, setStats] = useState(defaultStats)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login')
        return
      }
      setLoading(true)
      try {
        const [biletRes, masteryRes] = await Promise.all([
          fetch(`${API_URL}/api/bilet-progress/${user.uid}`),
          fetch(`${API_URL}/api/mastery/${user.uid}`)
        ])
        if (biletRes.ok) {
          const data = await biletRes.json()
          setProgress({
            completedTickets: data.completedTickets || [],
            ticketResults: data.ticketResults || {},
            totalCorrectAnswers: data.totalCorrectAnswers || 0
          })
        } else {
          setProgress(defaultProgress)
        }
        if (masteryRes.ok) {
          const m = await masteryRes.json()
          setStats({
            totalTickets: m.totalTickets || 61,
            totalBiletQuestions: m.totalBiletQuestions || 610
          })
        } else {
          setStats(defaultStats)
        }
      } catch (e) {
        console.error('Ma\'lumot yuklashda xatolik:', e)
        setProgress(defaultProgress)
        setStats(defaultStats)
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [router])

  const completedCount = progress.completedTickets.length
  const totalCorrect = progress.totalCorrectAnswers
  const totalTickets = stats.totalTickets
  const totalBiletQuestions = stats.totalBiletQuestions
  const ozlashtirishPercent = totalBiletQuestions > 0 ? Math.round((totalCorrect / totalBiletQuestions) * 100) : 0
  const unlockedCount = Math.min(completedCount + 1, totalTickets)

  const isUnlocked = (ticketNum) => ticketNum <= unlockedCount

  // ticketResults: { 5: [ { correct, total, percent }, ... ] } yoki eski format { 5: { correct, total, percent } }
  const ticketResult = (ticketNum) => {
    const raw = progress.ticketResults[ticketNum] ?? progress.ticketResults[String(ticketNum)]
    if (!raw) return null
    const attempts = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' && !Array.isArray(raw) ? [raw] : [])
    if (attempts.length === 0) return null
    const last = attempts[attempts.length - 1]
    return { attempts, last, count: attempts.length }
  }

  if (loading) {
    return (
      <div className="biletlar-page min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">Yuklanmoqda...</div>
      </div>
    )
  }

  return (
    <div className="biletlar-page min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m7 7-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                <span className="text-sm font-bold text-cyan-500">BT</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Biletlar bo&apos;yicha mashq
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/exam/settings"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Imtihon sozlamalari"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11.983 4.5a1.5 1.5 0 012.916 0l.149.894a1.5 1.5 0 001.04 1.175l.842.281a1.5 1.5 0 01.83 2.16l-.448.777a1.5 1.5 0 000 1.5l.448.777a1.5 1.5 0 01-.83 2.16l-.842.281a1.5 1.5 0 00-1.04 1.175l-.149.894a1.5 1.5 0 01-2.916 0l-.149-.894a1.5 1.5 0 00-1.04-1.175l-.842-.281a1.5 1.5 0 01-.83-2.16l.448-.777a1.5 1.5 0 000-1.5l-.448-.777a1.5 1.5 0 01.83-2.16l.842-.281a1.5 1.5 0 001.04-1.175l.149-.894z"
                />
                <circle cx="12" cy="12" r="2.25" />
              </svg>
            </Link>
            <ThemeToggle size="sm" />
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white dark:!text-black  !text-white dark:text-slate-900 text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-10 pb-20">
        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass-card p-6 md:p-8 rounded-2xl text-center shadow-xl shadow-cyan-500/5">
            <div className="text-3xl md:text-4xl font-extrabold text-cyan-500 mb-1">{ozlashtirishPercent}%</div>
            <div className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm uppercase tracking-widest">
              O&apos;zlashtirish
            </div>
          </div>
          <div className="glass-card p-6 md:p-8 rounded-2xl text-center shadow-xl shadow-emerald-500/5">
            <div className="text-3xl md:text-4xl font-extrabold mb-1">
              <span className="text-emerald-500">{totalCorrect}</span>
              <span className="text-slate-300 dark:text-slate-600 text-base md:text-xl font-semibold">
                /{totalBiletQuestions}
              </span>
            </div>
            <div className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm uppercase tracking-widest">
              To&apos;g&apos;ri javob
            </div>
          </div>
          <div className="glass-card p-6 md:p-8 rounded-2xl text-center shadow-xl shadow-blue-500/5">
            <div className="text-3xl md:text-4xl font-extrabold mb-1">
              <span className="text-blue-500">{completedCount}</span>
              <span className="text-slate-300 dark:text-slate-600 text-base md:text-xl font-semibold">
                /{totalTickets}
              </span>
            </div>
            <div className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm uppercase tracking-widest">
              Tugallangan
            </div>
          </div>
        </section>

        {/* Biletlar ro'yxati */}
        <section>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
            Har bir bilet bo&apos;yicha tayyorlanish
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
            Vaqt cheklovi yo&apos;q. Har bir javob uchun batafsil tushuntirish beriladi.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {Array.from({ length: totalTickets }, (_, i) => i + 1).map((num) => {
              const unlocked = isUnlocked(num)
              const result = ticketResult(num)
              const percent = result?.last?.percent ?? 0

              if (!unlocked) {
                return (
                  <div
                    key={num}
                    className="ticket-card glass-card p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 opacity-60 relative overflow-hidden grayscale-[0.5]"
                  >
                    <div className="absolute top-3 right-3">
                      <svg
                        className="w-4 h-4 text-slate-300 dark:text-slate-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <div className="flex items-start mb-6 opacity-60">
                      <span className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-lg text-slate-500 dark:text-slate-400">
                        {num}
                      </span>
                    </div>
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 font-bold text-sm cursor-not-allowed"
                    >
                      Qulflangan
                    </button>
                  </div>
                )
              }

              return (
                <div
                  key={num}
                  className="ticket-card glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-6">
                    <span className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-cyan-500">{num}</span>
                    </span>
                    {result && (
                      <div className="flex-1 ml-4 text-right">
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-1">
                          <div
                            className="h-full bg-cyan-500 rounded-full"
                            style={{ width: `${Math.max(5, Math.min(100, percent))}%` }}
                          />
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                          {percent}% • {result.count} urinish
                        </div>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/biletlar/${num}`}
                    className={`w-full py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      result
                        ? 'bg-cyan-500 !text-white hover:opacity-90'
                        : 'bg-cyan-500 !text-white hover:opacity-90'
                    }`}
                  >
                    {result ? 'Davom etish' : 'Boshlash'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
