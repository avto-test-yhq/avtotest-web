'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ThemeToggle from '@/components/ThemeToggle'
import QoidalarHeader from '@/components/QoidalarHeader'
import ExamSettingsModal from '@/components/ExamSettingsModal'
import { useI18n } from '@/lib/i18n'
import { useExamSettings } from '@/context/ExamSettingsContext'
import { apiFetch } from '@/lib/apiClient'
import { ArrowLeft, Settings, ClipboardList, ChevronRight } from 'lucide-react'


const defaultProgress = { completedTickets: [], ticketResults: {}, totalCorrectAnswers: 0 }
const defaultStats = { totalTickets: 61, totalBiletQuestions: 610 }

export default function BiletlarPage() {
  const router = useRouter()
  const t = useI18n()
  const { settings, loading: settingsLoading } = useExamSettings()
  const [progress, setProgress] = useState(defaultProgress)
  const [stats, setStats] = useState(defaultStats)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  // Fetch logic extracted so we can call it after settings close
  const fetchStatsAndProgress = async (qCount) => {
    try {
      const [biletRes, masteryRes] = await Promise.all([
        apiFetch(`/bilet-progress/?qCount=${qCount || 10}`),
        apiFetch(`/mastery/`)
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
  }

  useEffect(() => {
    if (settingsLoading) return
    const userToken = localStorage.getItem('userToken')
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (!userToken || isLoggedIn !== 'true') {
      router.push('/login')
      return
    }
    setLoading(true)
    const qCount = settings?.questionCount || 10
    fetchStatsAndProgress(qCount)
  }, [router, settingsLoading, settings?.questionCount])

  // Refetch when settings modal closes
  useEffect(() => {
    if (!showSettings && !settingsLoading) {
      const userToken = localStorage.getItem('userToken')
      if (userToken) {
        const qCount = settings?.questionCount || 10
        fetchStatsAndProgress(qCount)
      }
    }
  }, [showSettings, settingsLoading, settings?.questionCount])

  const completedCount = progress.completedTickets.length
  const totalCorrect = progress.totalCorrectAnswers
  const totalTickets = stats.totalTickets
  const totalBiletQuestions = stats.totalBiletQuestions
  const ozlashtirishPercent = totalBiletQuestions > 0 ? Math.round((totalCorrect / totalBiletQuestions) * 100) : 0
  const promoUnlocked = settings?.promoUnlocked === true
  const unlockedCount = promoUnlocked ? totalTickets : Math.min(completedCount + 1, totalTickets)

  const isUnlocked = (ticketNum) => promoUnlocked || ticketNum <= unlockedCount

  // ticketResults: { 5: [ { correct, total, percent }, ... ] } yoki eski format { 5: { correct, total, percent } }
  const ticketResult = (ticketNum) => {
    const raw = progress.ticketResults[ticketNum] ?? progress.ticketResults[String(ticketNum)]
    if (!raw) return null
    const attempts = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' && !Array.isArray(raw) ? [raw] : [])
    if (attempts.length === 0) return null
    const last = attempts[attempts.length - 1]
    const best = attempts.reduce((prev, current) => (prev.percent > current.percent) ? prev : current, attempts[0])
    return { attempts, last, best, count: attempts.length }
  }

  if (loading) {
    return (
      <div className="biletlar-page min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <>
      {/* ---------- MOBILE VIEW ---------- */}
      <div className="md:hidden biletlar-page min-h-screen bg-[#161c24] text-white font-display">
        <div className="min-h-screen px-4 pb-20 max-w-2xl mx-auto">
          {/* Header */}
          <header className="flex items-center justify-between py-4 mb-2 sticky top-0 bg-[#161c24] z-10">
            <button onClick={() => router.back()} className="p-2 -ml-2 text-white hover:opacity-70 transition-opacity">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-[20px] font-bold text-white leading-none">Biletlar</h1>
            <button onClick={() => setShowSettings(true)} className="p-2 -mr-2 text-white hover:opacity-70 transition-opacity">
              <Settings className="w-6 h-6" />
            </button>
          </header>

          {/* Top Progress Card */}
          <div className="bg-[#212936] rounded-[24px] p-6 mb-5 flex items-center shadow-sm border border-[#313C50]">
            {/* Circular Progress */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center mr-5">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="#161b24" strokeWidth="6" fill="none" />
                <circle
                  cx="50" cy="50" r="45" stroke="#2563eb" strokeWidth="6" fill="none"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (100 > 0 ? (283 * ozlashtirishPercent) / 100 : 0)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <span className="text-2xl font-bold leading-none">{ozlashtirishPercent}</span>
                <span className="text-[10px]">%</span>
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-white text-[16px] font-bold mb-3">Oʻrganish jarayoni</h3>
              <div className="flex items-center gap-6 mb-4">
                <div>
                  <div className="text-green-500 text-[22px] font-bold leading-none">{completedCount}</div>
                  <div className="text-[11px] text-[#9AA4B2] font-semibold mt-1">Yakunlandi</div>
                </div>
                <div>
                  <div className="text-[#9AA4B2] text-[22px] font-bold leading-none">{stats.totalTickets - completedCount}</div>
                  <div className="text-[11px] text-[#9AA4B2] font-semibold mt-1">Qoldi</div>
                </div>
              </div>
              
              {/* Horizontal steps */}
              <div className="flex gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`flex-1 rounded-full ${ozlashtirishPercent >= (i - 1) * 25 + 1 ? 'bg-blue-500' : 'bg-blue-500/20'}`}></div>
                ))}
              </div>
            </div>
          </div>

          {/* Tickets List */}
          <div className="flex flex-col gap-3">
            {Array.from({ length: totalTickets }, (_, i) => i + 1).map((num) => {
              const unlocked = isUnlocked(num)
              const result = ticketResult(num)
              const percent = result?.last?.percent ?? 0
              const qCount = settings?.questionCount || 10
              
              const isCompleted = result?.last?.correct != null
              const correctStr = result?.last?.correct || 0
              const wrongStr = (result?.last && result?.last?.total) ? result.last.total - result.last.correct : 0

              return (
                <div key={num} className="relative">
                  <Link 
                    href={unlocked ? `/biletlar/${num}` : '#'} 
                    className={`bg-[#212936] rounded-[20px] p-4 flex items-center border border-[#313C50] overflow-hidden ${!unlocked ? 'opacity-60 grayscale-[0.5] pointer-events-none' : ''}`}
                  >
                    <div className="relative z-10 w-[46px] h-[46px] bg-[#161c24] border border-[#313C50] rounded-[14px] flex items-center justify-center mr-4 shrink-0 shadow-sm">
                      <ClipboardList className="w-[22px] h-[22px] text-blue-500" />
                    </div>
                    <div className="relative z-10 flex-1 pt-1 pb-2">
                      <div className="text-white font-bold text-[16px] mb-1">Bilet {num}</div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                        <span className="text-[#9AA4B2] font-semibold">{qCount} ta savol</span>
                        {isCompleted && (
                          <>
                            <div className="flex items-center gap-1.5">
                              <span className="text-green-500 font-bold flex items-center gap-0.5 bg-green-500/10 px-1.5 py-0.5 rounded-[6px]">
                                <span className="text-[10px]">✓</span>{result.best.correct}
                              </span>
                              <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-[6px] text-[10px] font-bold">
                                {result.best.percent}%
                              </span>
                            </div>
                            <span className="text-[#9AA4B2] bg-white/5 px-2 py-0.5 rounded-[6px] text-[10px] font-medium border border-[#313C50]">
                              {result.count} {t('bilet.progress.attempts')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="relative z-10 ml-2">
                      <ChevronRight className="w-5 h-5 text-[#9AA4B2] group-hover:text-blue-500 transition-colors" />
                    </div>
                    
                    {/* Progress Line */}
                    {isCompleted && (
                      <div className="absolute bottom-0 left-0 h-1 bg-transparent w-full">
                        <div className="h-full bg-blue-500" style={{ width: `${percent}%` }}></div>
                      </div>
                    )}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ---------- DESKTOP VIEW ---------- */}
    <div className="hidden md:block w-full h-full relative z-10">
      <div className="w-full max-w-full">
        <QoidalarHeader
          title={t('bilet.header.title')}
          beforeDashboard={
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center justify-center text-slate-600 dark:text-slate-400"
              aria-label="Sozlamalar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          }
        />

        <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-10 pb-20">
          {/* Stats */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="glass-card p-6 md:p-8 rounded-2xl text-center shadow-xl shadow-cyan-500/5">
              <div className="text-3xl md:text-4xl font-extrabold text-cyan-500 mb-1">{ozlashtirishPercent}%</div>
              <div className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm uppercase tracking-widest">
                {t('bilet.stats.mastery')}
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
                {t('bilet.stats.correct')}
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
                {t('bilet.stats.completed')}
              </div>
            </div>
          </section>

          {/* Biletlar ro'yxati */}
          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
              {t('bilet.section.title')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
              {t('bilet.section.desc')}
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
                        {t('bilet.locked')}
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
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden mb-1.5">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${result.best.percent >= 90 ? 'bg-emerald-500' : result.best.percent >= 70 ? 'bg-blue-500' : 'bg-amber-500'}`}
                              style={{ width: `${Math.max(5, Math.min(100, result.best.percent))}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">
                              {result.count} {t('bilet.progress.attempts')}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${result.best.percent >= 90 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                              BEST: {result.best.percent}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/biletlar/${num}`}
                      className={`w-full py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${result
                        ? 'bg-cyan-500 !text-white hover:opacity-90'
                        : 'bg-cyan-500 !text-white hover:opacity-90'
                        }`}
                    >
                      {result ? t('bilet.cta.continue') : t('bilet.cta.start')}
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

      <ExamSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
    </>
  )
}
