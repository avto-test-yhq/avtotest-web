'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

const QUESTIONS_PER_TICKET = 10
const TOTAL_TICKETS = 61
const TOTAL_QUESTIONS = TOTAL_TICKETS * QUESTIONS_PER_TICKET // 610

const STORAGE_KEY = 'biletlar_progress'

function getProgress() {
  if (typeof window === 'undefined') return { completedTickets: [], ticketResults: {}, totalCorrectAnswers: 0 }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { completedTickets: [], ticketResults: {}, totalCorrectAnswers: 0 }
    return JSON.parse(raw)
  } catch {
    return { completedTickets: [], ticketResults: {}, totalCorrectAnswers: 0 }
  }
}

export default function BiletlarPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(getProgress())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push('/login')
    })
    return () => unsub()
  }, [router])

  useEffect(() => {
    if (!mounted) return
    setProgress(getProgress())
  }, [mounted])

  const completedCount = progress.completedTickets.length
  const totalCorrect = progress.totalCorrectAnswers
  const ozlashtirishPercent = TOTAL_QUESTIONS > 0 ? Math.round((totalCorrect / TOTAL_QUESTIONS) * 100) : 0
  const unlockedCount = Math.min(completedCount + 1, TOTAL_TICKETS)

  const isUnlocked = (ticketNum) => ticketNum <= unlockedCount
  const ticketResult = (ticketNum) => progress.ticketResults[ticketNum] || null

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
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">{totalCorrect}/{TOTAL_QUESTIONS}</div>
            <p className="text-sm text-slate-400">To&apos;g&apos;ri javob</p>
          </div>
          <div className="bg-[#1e2130] border border-white/5 rounded-2xl p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">{completedCount}/{TOTAL_TICKETS}</div>
            <p className="text-sm text-slate-400">Tugallangan bilet</p>
          </div>
        </section>

        {/* Har bir bilet bo'yicha tayyorlanish */}
        <section>
          <h2 className="text-xl font-bold text-white mb-2">Har bir bilet bo&apos;yicha tayyorlanish</h2>
          <p className="text-slate-400 text-sm mb-6">Har bir savolni chuqur o&apos;rganing! Vaqt cheklovi yo&apos;q, har bir javob uchun batafsil tushuntirish beriladi.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: TOTAL_TICKETS }, (_, i) => i + 1).map((num) => {
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
