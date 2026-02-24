'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import ThemeToggle from '@/components/ThemeToggle'
import QoidalarSidebar from '@/components/QoidalarSidebar'
import QoidalarHeader from '@/components/QoidalarHeader'
import { useI18n } from '@/lib/i18n'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { uz } from 'date-fns/locale'
import { apiFetch } from '@/lib/apiClient'

const Icon = ({ name, className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {name === 'ArrowLeft' && <path d="M19 12H5m7 7l-7-7 7-7" />}
    {name === 'Clock' && <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
    {name === 'ChevronRight' && <path d="M9 5l7 7-7 7" />}
    {name === 'CheckCircle' && <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
    {name === 'Cancel' && <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />}
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
  if (type.startsWith('bilet (')) {
    const num = type.match(/\d+/)?.[0] || ''
    return `${t('tarix.typeBilet')} (${num})`
  }
  return map[type] ? t(map[type]) : type
}

function getDateLabel(dateStr, t) {
  const dateObj = parseISO(dateStr)
  if (isToday(dateObj)) return t('tarix.today')
  if (isYesterday(dateObj)) return t('tarix.yesterday')
  return format(dateObj, 'dd.MM.yyyy')
}

function StatusBadge({ status, t }) {
  if (status === 'otmadi' || status === 'bekor') {
    return (
      <span className="px-3 py-1 bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider">
        <Icon name="Cancel" className="w-4 h-4" />
        {status === 'otmadi' ? t('tarix.statusFailed') : t('tarix.statusCancelled')}
      </span>
    )
  }
  return (
    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider">
      <Icon name="CheckCircle" className="w-4 h-4" />
      {t('tarix.statusCompleted')}
    </span>
  )
}

export default function TarixPage() {
  const router = useRouter()
  const t = useI18n()

  const [activeTab, setActiveTab] = useState('imtihonlar')
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')

  const filteredAttempts = attempts.map(group => {
    const filteredItems = group.items.filter(item => {
      if (filterType === 'all') return true
      if (filterType === 'bilet' && item.type.startsWith('bilet')) return true;
      return item.type === filterType
    })
    return { ...group, items: filteredItems }
  }).filter(group => group.items.length > 0)

  const fetchHistory = useCallback(
    async (uid) => {
      try {
        setLoading(true)
        const res = await apiFetch(`/exam-history/history/${uid}`)
        if (!res.ok) throw new Error('API xatolik')
        const data = await res.json()
        setAttempts(data.attempts || [])
      } catch (e) {
        console.error('Tarix yuklashda xatolik:', e)
        setAttempts([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchHistory(user.uid)
      } else {
        router.push('/login')
      }
    })
    return () => unsubscribe()
  }, [router, fetchHistory])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-display transition-colors duration-200">
      <QoidalarSidebar />

      <div className="lg:ml-72 flex flex-col min-h-screen">
        <QoidalarHeader title={t('tarix.title')} />

        <header className="h-16 lg:h-20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md z-10 sticky top-0 transition-colors">
          <div className="flex items-center gap-4">
            {/* Invisible spacer since sidebar overlaps header text on desktop */}
            <div className="hidden lg:block"></div>
          </div>
          <div className="flex items-center gap-4 w-full justify-between lg:justify-end">
            <div className="relative z-30 ml-4 lg:ml-0 group w-full max-w-[200px] lg:w-auto">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none w-full bg-slate-100 dark:bg-[#1e293b] border-none rounded-xl px-4 py-2 pr-10 focus:ring-2 focus:ring-brand-cyan text-sm font-medium cursor-pointer text-slate-700 dark:text-slate-200 transition-colors"
                style={{ backgroundImage: "none" }}
              >
                <option value="all">{t('tarix.filterAll')}</option>
                <option value="standart">{t('tarix.typeStandart')}</option>
                <option value="haqiqiy">{t('tarix.typeReal')}</option>
                <option value="bilet">{t('tarix.typeBilet')}</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>

            <div className="flex-shrink-0">
              <ThemeToggle size="sm" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full max-w-5xl mx-auto p-4 lg:p-8">
          <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-[#1e293b] p-1 rounded-2xl w-fit transition-colors">
            <button
              onClick={() => setActiveTab('imtihonlar')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'imtihonlar'
                ? 'bg-brand-cyan text-white shadow-lg shadow-brand-cyan/20'
                : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
                }`}
            >
              {t('tarix.tabExams')}
            </button>
            <button
              onClick={() => setActiveTab('savollar')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'savollar'
                ? 'bg-brand-cyan text-white shadow-lg shadow-brand-cyan/20'
                : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
                }`}
            >
              {t('tarix.tabQuestions')}
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-brand-cyan animate-spin" />
            </div>
          ) : activeTab === 'imtihonlar' ? (
            attempts.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <p className="mb-4">{t('tarix.emptyExams')}</p>
                <Link href="/dashboard" className="text-brand-cyan hover:underline">{t('tarix.gotoDashboard')}</Link>
              </div>
            ) : (
              <div className="space-y-10">
                {filteredAttempts.map(({ date, items }) => (
                  <section key={date} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      {getDateLabel(date, t) === t('tarix.today') && (
                        <span className="w-2 h-2 bg-brand-cyan rounded-full animate-pulse" />
                      )}
                      {getDateLabel(date, t)}
                    </h2>
                    <div className="grid gap-4">
                      {items.map((item) => {
                        const isCanceled = item.status === 'otmadi' || item.status === 'bekor';
                        const percentage = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
                        const barWidth = isCanceled ? 0 : Math.max(5, percentage);

                        return (
                          <Link
                            href={`/tarix/${item.id || item._id}`}
                            key={item.id || item._id}
                            className={`bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all group cursor-pointer ${isCanceled ? 'opacity-60 hover:opacity-100 hover:shadow-xl hover:shadow-rose-500/5' : 'hover:shadow-xl hover:shadow-brand-cyan/5'
                              }`}
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                  <StatusBadge status={item.status} t={t} />
                                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                                    {getTypeLabel(item.type, t)}
                                  </span>
                                  <span className="text-sm text-slate-400 ml-auto md:ml-0 font-mono">{item.time}</span>
                                </div>
                                <div className="flex items-end gap-2 md:mb-2">
                                  <div className="flex flex-col w-24 flex-shrink-0">
                                    <span className="text-xs text-slate-400 font-medium uppercase tracking-tight mb-1">
                                      {t('tarix.ball')}
                                    </span>
                                    <div className="flex items-baseline gap-1 font-mono">
                                      <span className={`text-4xl font-bold ${isCanceled ? 'text-slate-400 dark:text-slate-500' : 'text-brand-cyan'}`}>
                                        {isCanceled ? 0 : item.correct}
                                      </span>
                                      <span className="text-xl text-slate-400">/ {item.total}</span>
                                    </div>
                                  </div>
                                  <div className="flex-1 ml-2 md:ml-6 mb-3">
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-1000 ${isCanceled ? 'bg-slate-300 dark:bg-slate-700' : 'bg-brand-cyan'}`}
                                        style={{ width: `${barWidth}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 md:px-6 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 border-t md:border-t-0 mt-2 md:mt-0">
                                <div className="text-right">
                                  <span className="block text-xs text-slate-400 uppercase font-semibold">
                                    {t('tarix.duration')}
                                  </span>
                                  <div className="flex items-center justify-end gap-2 mt-1">
                                    <Icon name="Clock" className="text-slate-400 text-lg w-5 h-5" />
                                    <span className="text-lg md:text-xl font-bold font-mono">{formatDuration(item.durationSeconds)}</span>
                                  </div>
                                </div>
                                <div className={`w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center transition-colors ${isCanceled ? 'group-hover:bg-rose-500 group-hover:text-white' : 'group-hover:bg-brand-cyan group-hover:text-white'
                                  }`}>
                                  <Icon name="ChevronRight" className="w-6 h-6 ml-0.5" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-16 text-slate-400">
              <p>{t('tarix.soon')}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
