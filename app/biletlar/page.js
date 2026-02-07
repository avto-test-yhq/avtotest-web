'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

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
  const ticketResult = (ticketNum) => progress.ticketResults[ticketNum] || progress.ticketResults[String(ticketNum)] || null

  if (loading) {
    return (
      <div className="min-h-screen bg-[#161821] text-white flex items-center justify-center">
        <div className="text-slate-400">Yuklanmoqda...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#161821] text-white font-sans">
      <header className="h-16 border-b border-white/5 bg-[#1e2130] flex items-center justify-between px-4 md:px-8 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Image src="/imgage/avtotest-logo.png" alt="Logo" width={32} height={32} className="rounded-lg object-contain" />
            <span className="font-bold text-white hidden sm:inline">Pravachi<span className="text-brand-cyan">UZ</span></span>
          </Link>
          <h1 className="text-lg font-semibold text-white">Biletlar bo&apos;yicha mashq</h1>
        </div>
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">Dashboard</Link>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        {/* Stats: O'zlashtirish darajasi, To'g'ri javob, Tugallangan bilet */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1e2130] border border-white/5 rounded-2xl p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">{ozlashtirishPercent}%</div>
            <p className="text-sm text-slate-400">O&apos;zlashtirish darajasi</p>
          </div>
          <div className="bg-[#1e2130] border border-white/5 rounded-2xl p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">{totalCorrect}/{totalBiletQuestions}</div>
            <p className="text-sm text-slate-400">To&apos;g&apos;ri javob</p>
          </div>
          <div className="bg-[#1e2130] border border-white/5 rounded-2xl p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">{completedCount}/{totalTickets}</div>
            <p className="text-sm text-slate-400">Tugallangan bilet</p>
          </div>
        </section>

        {/* Har bir bilet bo'yicha tayyorlanish */}
        <section>
          <h2 className="text-xl font-bold text-white mb-2">Har bir bilet bo&apos;yicha tayyorlanish</h2>
          <p className="text-slate-400 text-sm mb-6">Har bir savolni chuqur o&apos;rganing! Vaqt cheklovi yo&apos;q, har bir javob uchun batafsil tushuntirish beriladi.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: totalTickets }, (_, i) => i + 1).map((num) => {
              const unlocked = isUnlocked(num)
              const result = ticketResult(num)
              return (
                <div
                  key={num}
                  className={`relative rounded-2xl border overflow-hidden transition-all ${
                    unlocked
                      ? 'bg-[#1e2130] border-white/10 hover:border-blue-500/50'
                      : 'bg-[#1a1d2d] border-white/5 opacity-80'
                  }`}
                >
                  {!unlocked && (
                    <div className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                  )}
                  <div className="p-5">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg mb-4">{num}</div>
                    <p className="text-slate-400 text-xs mb-1">
                      {result ? `Oxirgi natija: ${result.percent}%` : 'Boshlanmagan'}
                    </p>
                    <p className="text-slate-500 text-xs mb-4">{result ? '1 urinish' : '0 urinish'}</p>
                    {unlocked ? (
                      <Link
                        href={`/biletlar/${num}`}
                        className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
                      >
                        Boshlash
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                      </Link>
                    ) : (
                      <button disabled className="w-full py-2.5 rounded-xl bg-slate-700 text-slate-500 text-sm font-medium cursor-not-allowed">
                        Qulflangan
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
