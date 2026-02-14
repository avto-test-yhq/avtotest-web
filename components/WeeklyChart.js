'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

const DAY_LABELS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Ya']
const DEFAULT_DAYS = DAY_LABELS.map((label) => ({ label, count: 0, accuracy: 0 }))

/** Bar rang: aniqligi bo'yicha */
function getBarColor(accuracy) {
  if (accuracy >= 90) return 'bg-emerald-500 dark:bg-emerald-500'   // Green - Excellent
  if (accuracy >= 70) return 'bg-blue-500 dark:bg-blue-500'         // Blue - Good
  if (accuracy >= 50) return 'bg-amber-500 dark:bg-amber-500'       // Amber - Needs improvement
  return 'bg-red-500 dark:bg-red-500'
  // Red - Poor
}

export default function WeeklyChart({ data: propData }) {
  const [fetchedData, setFetchedData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const hasValidPropData = Array.isArray(propData) && propData.length >= 7 && propData.some((d) => (d.count || 0) > 0)
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
          Oxirgi 7 kun
        </span>
      </div>

      <div className="flex items-end justify-between gap-3 h-52 mt-6">
        {(() => {
          const maxCount = Math.max(...chartData.map((d) => d.count || 0), 10) // Min max 10 to avoid flat bars
          return chartData.map((day, index) => {
            const count = Number(day.count) || 0
            const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0
            const accuracy = Number(day.accuracy) || 0
            const barColor = getBarColor(accuracy)

            return (
              <div key={index} className="flex flex-col items-center flex-1 h-full group">
                {/* Count Label - Always visible at top */}
                <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 transition-all">
                  {count > 0 ? count : ''}
                </div>

                {/* Bar Track */}
                <div className="relative w-full flex-1 bg-slate-100 dark:bg-slate-700/40 rounded-2xl overflow-hidden flex items-end group-hover:bg-slate-200 dark:group-hover:bg-slate-600/40 transition-colors duration-300">
                  <div
                    className={`w-full ${barColor} rounded-2xl transition-all duration-700 ease-out relative`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    {/* Accuracy Tooltip (optional, inside or on hover) */}
                    {count > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-white/90 drop-shadow-md">{accuracy}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Day Label */}
                <span className={`mt-3 text-sm font-bold ${day.isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {day.label}
                </span>
              </div>
            )
          })
        })()}
      </div>
    </div>
  )
}
