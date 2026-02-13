'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import ThemeToggle from '@/components/ThemeToggle'

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

function getTypeLabel(type) {
  const map = { standart: 'Standart imtihon', haqiqiy: 'Haqiqiy imtihon', favorites: 'Sevimlilar', mistakes: 'Xatolar', bilet: 'Bilet' }
  return map[type] || type
}

function StatusBadge({ status }) {
  if (status === 'otmadi') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-semibold">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        O&apos;TMADI
      </span>
    )
  }
  if (status === 'bekor') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 text-[10px] font-semibold">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        BEKOR QILINDI
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
      TUGALLANGAN
    </span>
  )
}

export default function TarixPage() {
  const router = useRouter()
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
    <div className="min-h-screen bg-[#161821] page-bg text-white flex flex-col font-sans">
      <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-[#1e2130] header-bg border-b border-white/5 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-[#2a2d3e] hover:bg-[#35394b] flex items-center justify-center text-slate-300">
            <Icon name="ArrowLeft" className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Image src="/imgage/avtotest-logo.png" alt="Logo" width={32} height={32} className="rounded-lg object-contain" />
            <h1 className="text-base md:text-lg font-bold text-white">Tarix</h1>
          </div>
          <Link href="/statistika" className="hidden md:block px-3 py-1.5 rounded-lg bg-[#2a2d3e] text-xs font-medium text-brand-cyan hover:bg-[#35394b] transition-colors">
            Saxvollar Statistikasi
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/statistika" className="md:hidden p-2 rounded-lg bg-[#2a2d3e] text-brand-cyan">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </Link>
          <ThemeToggle size="sm" />
          <div className="relative group z-50">
            <button className="px-3 py-1.5 rounded-lg bg-[#2a2d3e] border border-white/10 text-xs text-slate-400 flex items-center gap-1 hover:text-white transition-colors">
              {filterType === 'all' ? 'Barcha turlar' : getTypeLabel(filterType)}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#2a2d3e] border border-white/10 rounded-xl shadow-xl overflow-hidden hidden group-hover:block transition-all">
              {[
                { label: 'Barcha turlar', value: 'all' },
                { label: 'Standart imtihon', value: 'standart' },
                { label: 'Haqiqiy imtihon', value: 'haqiqiy' },
                { label: 'Biletlar', value: 'bilet' },
                { label: 'Sevimlilar', value: 'favorites' },
                { label: 'Xatolar', value: 'mistakes' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterType(opt.value)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${filterType === opt.value ? 'text-brand-cyan bg-white/5' : 'text-slate-400'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-white/5 bg-[#1e2130] px-4">
        <button
          onClick={() => setActiveTab('imtihonlar')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'imtihonlar' ? 'border-brand-cyan text-white' : 'border-transparent text-slate-400'
            }`}
        >
          Imtihonlar
        </button>
        <button
          onClick={() => setActiveTab('savollar')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'savollar' ? 'border-brand-cyan text-white' : 'border-transparent text-slate-400'
            }`}
        >
          Savollar
        </button>
      </div>

      <main className="flex-1 px-4 py-6 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">Yuklanmoqda...</div>
        ) : activeTab === 'imtihonlar' ? (
          attempts.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="mb-4">Hali imtihon natijalari yo&apos;q</p>
              <Link href="/dashboard" className="text-brand-cyan hover:underline">Dashboardga o&apos;tish</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAttempts.map(({ date, items }) => (
                <div key={date}>
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">{formatDate(date)}</h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <Link
                        key={item.id}
                        href={`/tarix/${item.id}`}
                        className="block rounded-xl bg-[#1e2130] border border-white/5 p-4 hover:border-brand-cyan/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <StatusBadge status={item.status} />
                          <div className="text-right">
                            <p className="text-sm text-white">{getTypeLabel(item.type)}</p>
                            <p className="text-xs text-slate-500">{item.time}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Ball</p>
                            <p className="text-white font-semibold">{item.correct} / {item.total}</p>
                            <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-700 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-blue-500"
                                style={{ width: `${item.total > 0 ? (item.correct / item.total) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Davomiylik</p>
                            <p className="text-white font-semibold flex items-center gap-1">
                              <Icon name="Clock" className="w-4 h-4" />
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
            <p>Savollar tarixi tez kunda</p>
          </div>
        )}
      </main>
    </div>
  )
}
