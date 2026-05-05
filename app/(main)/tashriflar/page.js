'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { apiFetch } from '@/lib/apiClient'

const Icon = ({ name, className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {name === 'ArrowLeft' && <path d="M19 12H5m7 7l-7-7 7-7" />}
    {name === 'Calendar' && <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
    {name === 'TrendingUp' && <path d="M23 6l-9.5 9.5-5-5L1 18" />}
  </svg>
)

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const opts = { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }
  return d.toLocaleDateString('uz-UZ', opts)
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' })
}

export default function TashriflarPage() {
  const router = useRouter()

  const [daily, setDaily] = useState([])
  const [weekly, setWeekly] = useState([])
  const [totalVisits, setTotalVisits] = useState(0)
  const [totalDays, setTotalDays] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchActivity = useCallback(
    async () => {
      try {
        setLoading(true)
        const res = await apiFetch(`/activity/`)
        if (!res.ok) throw new Error('API xatolik')
        const data = await res.json()
        setDaily(data.daily || [])
        setWeekly(data.weekly || [])
        setTotalVisits(data.totalVisits || 0)
        setTotalDays(data.totalDays || 0)
      } catch (e) {
        console.error('Tashriflarni yuklashda xatolik:', e)
        setDaily([])
        setWeekly([])
        setTotalVisits(0)
        setTotalDays(0)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    const userToken = localStorage.getItem('userToken')
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (!userToken || isLoggedIn !== 'true') {
      router.push('/login')
      return
    }
    fetchActivity()
  }, [router, fetchActivity])

  return (
    <div className="flex flex-col w-full h-full relative z-10">
      <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-[#1e2130] header-bg border-b border-white/5 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-lg bg-[#2a2d3e] hover:bg-[#35394b] flex items-center justify-center text-slate-300"
          >
            <Icon name="ArrowLeft" className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Image src="/imgage/avtotest-logo.png" alt="Logo" width={32} height={32} className="rounded-lg object-contain" />
            <div className="flex flex-col leading-tight">
              <h1 className="text-base md:text-lg font-bold text-white">Tashriflar tarixi</h1>
              <p className="text-[11px] md:text-xs text-slate-400">Qachon va necha marta kirdingiz</p>
            </div>
          </div>
        </div>
        <ThemeToggle size="sm" />
      </header>

      <main className="flex-1 px-4 lg:px-8 py-6 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">Yuklanmoqda...</div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Umumiy statistika */}
            <section className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#1e2130] border border-white/5 p-5 text-center">
                <div className="text-3xl font-bold text-white">{totalDays}</div>
                <p className="text-sm text-slate-400 mt-1">Kun tashrif</p>
              </div>
              <div className="rounded-2xl bg-[#1e2130] border border-white/5 p-5 text-center">
                <div className="text-3xl font-bold text-brand-cyan">{totalVisits}</div>
                <p className="text-sm text-slate-400 mt-1">Jami kirishlar</p>
              </div>
            </section>

            {/* Haftalik natijalar */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Icon name="TrendingUp" className="w-5 h-5 text-brand-cyan" />
                Haftalik natijalar
              </h2>
              {weekly.length === 0 ? (
                <div className="rounded-2xl bg-[#1e2130] border border-white/5 p-8 text-center text-slate-400">
                  Hali haftalik ma&apos;lumot yo&apos;q
                </div>
              ) : (
                <div className="space-y-3">
                  {weekly.map((w, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-[#1e2130] border border-white/5 p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {formatShortDate(w.weekStart)} – {formatShortDate(w.weekEnd)}
                        </p>
                        <p className="text-sm text-slate-400">{w.days} kun, {w.totalVisits} tashrif</p>
                      </div>
                      <div className="text-xl font-bold text-brand-cyan">{w.totalVisits}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Har kunlik tashriflar */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Icon name="Calendar" className="w-5 h-5 text-brand-cyan" />
                Qachon kirganlar
              </h2>
              {daily.length === 0 ? (
                <div className="rounded-2xl bg-[#1e2130] border border-white/5 p-8 text-center text-slate-400">
                  Hali tashrif yo&apos;q. Dashboardga kiring va mashq qilishni boshlang!
                </div>
              ) : (
                <div className="space-y-2">
                  {daily.map((v, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-[#1e2130] border border-white/5 px-4 py-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-white">{formatDate(v.date)}</p>
                        {v.lastVisitAt && (
                          <p className="text-xs text-slate-400">
                            Oxirgi kirish: {new Date(v.lastVisitAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                      <span className="px-3 py-1 rounded-full bg-brand-cyan/20 text-brand-cyan text-sm font-semibold">
                        {v.count} marta
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="pt-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"
              >
                Dashboardga qaytish
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
