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

const Icon = ({ name, className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {name === 'ArrowLeft' && <path d="M19 12H5m7 7l-7-7 7-7" />}
    {name === 'Clock' && <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
  </svg>
)

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${d.padStart(2, '0')}.${m.padStart(2, '0')}.${y}`
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function getTypeLabel(type, t) {
  const map = { standart: 'tarix.typeStandart', haqiqiy: 'tarix.typeReal', favorites: 'tarix.typeFavorites', mistakes: 'tarix.typeMistakes', bilet: 'tarix.typeBilet' }
  return map[type] ? t(map[type]) : type
}

function StatusBadge({ status, t }) {
  if (status === 'otmadi') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-semibold">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        {t('tarix.statusFailed')}
      </span>
    )
  }
  if (status === 'bekor') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 text-[10px] font-semibold">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        {t('tarix.statusCancelled')}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
      {t('tarix.statusCompleted')}
    </span>
  )
}

export default function TarixPage() {
  const router = useRouter()
  const t = useI18n()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

  const [activeTab, setActiveTab] = useState('imtihonlar')
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')

  const filteredAttempts = attempts.map(group => {
    const filteredItems = group.items.filter(item => {
      if (filterType === 'all') return true
      return item.type === filterType
    })
    return { ...group, items: filteredItems }
  }).filter(group => group.items.length > 0)

  const fetchHistory = useCallback(
    async (uid) => {
      try {
        setLoading(true)
        const res = await fetch(`${API_URL}/api/exam-history/history/${uid}`)
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
    [API_URL]
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#161821] page-bg text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-200">
      <QoidalarSidebar />

      <div className="lg:ml-72 flex flex-col min-h-screen">
        <QoidalarHeader title={t('tarix.title')} />

        <header className="px-4 lg:px-8 bg-white dark:bg-[#1e2130] header-bg border-b border-slate-200 dark:border-white/5 shrink-0 py-3 flex items-center justify-between transition-colors duration-200">
          <div className="flex items-center gap-2">
            <Link href="/statistika" className="hidden md:block px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#2a2d3e] text-xs font-medium text-brand-cyan hover:bg-slate-200 dark:hover:bg-[#35394b] transition-colors">
              {t('tarix.stats')}
            </Link>
            <Link href="/statistika" className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-[#2a2d3e] text-brand-cyan hover:bg-slate-200 dark:hover:bg-[#35394b]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </Link>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="relative group z-30">
              <button className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#2a2d3e] border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors">
                {filterType === 'all' ? t('tarix.filterAll') : getTypeLabel(filterType, t)}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#2a2d3e] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden hidden group-hover:block transition-all z-50">
                {[
                  { label: t('tarix.filterAll'), value: 'all' },
                  { label: t('tarix.typeStandart'), value: 'standart' },
                  { label: t('tarix.typeReal'), value: 'haqiqiy' },
                  { label: t('tarix.typeBilet'), value: 'bilet' },
                  { label: t('tarix.typeFavorites'), value: 'favorites' },
                  { label: t('tarix.typeMistakes'), value: 'mistakes' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilterType(opt.value)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${filterType === opt.value ? 'text-brand-cyan bg-slate-50 dark:bg-white/5' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#1e2130] px-4 transition-colors duration-200">
          <button
            onClick={() => setActiveTab('imtihonlar')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'imtihonlar' ? 'border-brand-cyan text-brand-cyan dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            {t('tarix.tabExams')}
          </button>
          <button
            onClick={() => setActiveTab('savollar')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'savollar' ? 'border-brand-cyan text-brand-cyan dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            {t('tarix.tabQuestions')}
          </button>
        </div>

        <main className="flex-1 px-4 py-6 overflow-y-auto w-full max-w-5xl mx-auto">
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
              <div className="space-y-6">
                {filteredAttempts.map(({ date, items }) => (
                  <div key={date}>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 ml-1">{formatDate(date)}</h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <Link
                          key={item.id}
                          href={`/tarix/${item.id}`}
                          className="block rounded-xl bg-white dark:bg-[#1e2130] border border-slate-200 dark:border-white/5 p-4 hover:border-brand-cyan/30 transition-colors shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <StatusBadge status={item.status} t={t} />
                            <div className="text-right">
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{getTypeLabel(item.type, t)}</p>
                              <p className="text-xs text-slate-500">{item.time}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-slate-500 mb-1">{t('tarix.ball')}</p>
                              <p className="text-slate-900 dark:text-white font-semibold">{item.correct} / {item.total}</p>
                              <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-blue-500"
                                  style={{ width: `${item.total > 0 ? (item.correct / item.total) * 100 : 0}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">{t('tarix.duration')}</p>
                              <p className="text-slate-900 dark:text-white font-semibold flex items-center gap-1">
                                <Icon name="Clock" className="w-4 h-4 text-slate-400" />
                                {formatDuration(item.durationSeconds)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
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
