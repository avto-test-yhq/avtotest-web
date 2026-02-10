'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

const DEFAULT_DAYS = [
  { label: 'Du', count: 0, percent: 0 },
  { label: 'Se', count: 0, percent: 0 },
  { label: 'Cho', count: 0, percent: 0 },
  { label: 'Pa', count: 0, percent: 0 },
  { label: 'Ju', count: 0, percent: 0 },
  { label: 'Sha', count: 0, percent: 0 },
  { label: 'Ya', count: 0, percent: 0 },
]

export default function WeeklyChart({ data: propData }) {
  const [fetchedData, setFetchedData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const hasValidPropData = Array.isArray(propData) && propData.length >= 7 && propData.some((d) => (d.count || 0) > 0 || (d.percent || 0) > 0)
    if (hasValidPropData) {
      setFetchedData(null)
      return
    }
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user?.uid) return
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/api/exam-history/weekly/${user.uid}`)
        const json = await res.json()
        if (json?.daily && Array.isArray(json.daily)) {
          setFetchedData(json.daily)
        }
      } catch (e) {
        console.error('WeeklyChart fetch:', e)
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [propData])

  const hasPropData = Array.isArray(propData) && propData.length >= 7
  const hasFetchedData = Array.isArray(fetchedData) && fetchedData.length >= 7
  const chartData = hasPropData ? propData : hasFetchedData ? fetchedData : DEFAULT_DAYS

  if (loading && !hasPropData && !hasFetchedData) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-[30px] border border-slate-100 dark:border-slate-700 shadow-sm w-full h-64 flex items-center justify-center">
        <span className="text-slate-400">Yuklanmoqda...</span>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-[30px] border border-slate-100 dark:border-slate-700 shadow-sm w-full">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Davomiylik (hafta bo&apos;yicha)</h3>
        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
          Bu hafta
        </span>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Kunlik maqsad: 50 ta savol = 100%</p>

      <div className="flex items-end justify-between gap-3 h-48">
        {chartData.map((day, index) => (
          <div key={index} className="flex flex-col items-center flex-1 h-48 group">
            <div className="relative w-full flex-1 min-h-[80px] bg-blue-50 dark:bg-blue-900/20 rounded-2xl overflow-hidden flex items-end group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors duration-300">
              <div
                className="w-full bg-blue-600 rounded-2xl transition-all duration-700 ease-out relative"
                style={{ height: `${(Number(day.percent) || 0) > 0 ? Math.max(Number(day.percent) || 0, 10) : 0}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 !text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  {day.count} savol
                </div>
              </div>
            </div>
            <span className="mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
