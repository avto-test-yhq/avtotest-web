'use client'

import { useEffect, useState, useCallback } from 'react'
import ThemeToggle from '@/components/ThemeToggle'
import { useLanguage } from '@/context/LanguageContext'
import QoidalarHeader from '@/components/QoidalarHeader'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz'

function getImageUrl(topic, imagePath) {
  if (!imagePath) return null
  const base = (process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz').replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '')
  return `${base}/hazard_labels/${imagePath}`
}

export default function HazardLabelsPage() {
  const { lang } = useLanguage()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/v1/rules/hazard_labels?lang=${lang || 'uzl'}`)
      if (!res.ok) throw new Error('API xatolik')
      const data = await res.json()
      setItems(data.items || [])
    } catch (e) {
      console.error('Xavf belgilarini yuklashda xatolik:', e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [lang])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="bg-[#161c24] md:bg-slate-50 md:dark:bg-[#0f172a] text-white md:text-slate-900 md:dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">
      <QoidalarHeader title="Xavfli yuklar belgilari" />

      <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-6xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
            <p className="text-[#9AA4B2] md:text-slate-400">Yuklanmoqda...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-20">
            {items.map((item) => (
              <div
                key={item.id}
                className="group bg-[#212936] md:bg-white md:dark:bg-[#1e293b] rounded-[24px] border border-[#313C50] md:border-slate-100 md:dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-square bg-[#161c24] md:bg-slate-50 md:dark:bg-black/20 flex items-center justify-center p-6 border-b border-[#313C50] md:border-slate-100 md:dark:border-slate-800 relative">
                  <img
                    src={getImageUrl('hazard_labels', item.image)}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2 py-1 bg-rose-600 text-white text-[10px] font-black rounded-lg shadow-lg">
                    {item.code}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-sm md:text-base font-bold text-white md:text-slate-900 md:dark:text-white leading-tight mb-2 line-clamp-1">{item.name}</h3>
                  <p className="text-[12px] md:text-[13px] text-[#9AA4B2] md:text-slate-500 md:dark:text-slate-400 leading-relaxed line-clamp-3">
                    {item.content || item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
