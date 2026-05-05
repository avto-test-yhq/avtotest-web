'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import QoidalarHeader from '@/components/QoidalarHeader'
import { useI18n } from '@/lib/i18n'
import { useLanguage } from '@/context/LanguageContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz/api/v1';

export default function GenericTopicPage() {
  const router = useRouter()
  const params = useParams()
  const topicId = params?.topicId
  const { lang } = useLanguage()
  const t = useI18n()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [topicInfo, setTopicInfo] = useState(null)

  const fetchData = useCallback(async () => {
    if (!topicId) return
    try {
      setLoading(true)
      const currentLang = lang || 'uzl'

      // 1. Fetch Topic Metadata (to get the real name/color/icon)
      const resMeta = await fetch(`${API_URL}/rules/topics?lang=${currentLang}`)
      if (resMeta.ok) {
        const metaData = await resMeta.json()
        const currentMeta = metaData.topics?.find(t => t.id === topicId)
        setTopicInfo(currentMeta)
      }

      // 2. Fetch Topic Content
      const res = await fetch(`${API_URL}/rules/topic/${topicId}?lang=${currentLang}`)
      if (!res.ok) throw new Error('API xatolik')
      const topicData = await res.json()
      setData(topicData)
    } catch (e) {
      console.error('Mavzuni yuklashda xatolik:', e)
    } finally {
      setLoading(false)
    }
  }, [topicId, lang])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const chapters = data?.chapters || []
  const items = data?.items || []
  const hasChapters = chapters.length > 0

  const pageTitle = (function() {
    const name = topicInfo?.name || data?.name || topicId
    if (typeof name === 'object' && name !== null) {
      return name[lang || 'uzl'] || name['uzl'] || name[Object.keys(name)[0]] || ''
    }
    return name
  })()

  return (
    <div className="flex flex-col w-full h-full relative z-10">
      <main className="w-full max-w-full pb-10">
        <QoidalarHeader title={pageTitle} />

        <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-[#9AA4B2] md:text-slate-400">Yuklanmoqda...</p>
            </div>
          ) : (
            <>
              {topicId === 'speed_limits' ? (
                <div className="pb-20">
                  {/* UNIFIED RESPONSIVE GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {(function() {
                      // Prepare local data with overrides and injections
                      const extraChapters = [
                        { id: 2000, name: { uzl: "Maktab zonasi (300m)" }, icon: 'school', bg: 'bg-rose-50/60 dark:bg-rose-900/20', text: 'text-rose-500 dark:text-rose-400', border: 'border-rose-100/50 dark:border-rose-900/30' },
                        { id: 2001, name: { uzl: "Turar-joy dahasi" }, icon: 'home', bg: 'bg-orange-50/60 dark:bg-orange-900/20', text: 'text-orange-500 dark:text-orange-400', border: 'border-orange-100/50 dark:border-orange-900/30' }
                      ]

                      const styleMap = {
                        1000: { icon: 'location_city', bg: 'bg-blue-50/60 dark:bg-blue-900/20', text: 'text-blue-500 dark:text-blue-400', border: 'border-blue-100/50 dark:border-blue-900/30' },
                        1001: { icon: 'speed', bg: 'bg-emerald-50/60 dark:bg-emerald-900/20', text: 'text-emerald-500 dark:text-emerald-400', border: 'border-emerald-100/50 dark:border-emerald-900/30' },
                        1002: { icon: 'terrain', bg: 'bg-indigo-50/60 dark:bg-indigo-900/20', text: 'text-indigo-500 dark:text-indigo-400', border: 'border-indigo-100/50 dark:border-indigo-900/30' },
                        2000: extraChapters[0],
                        2001: extraChapters[1]
                      }

                      // Inject extra chapters at the beginning as shown in images
                      const allChapters = [...extraChapters, ...chapters].sort((a, b) => {
                        const order = { 1000: 1, 2000: 2, 2001: 3, 1001: 4, 1002: 5 }
                        return (order[a.id] || 99) - (order[b.id] || 99)
                      })

                      return allChapters.map((ch) => {
                        let chItems = items.filter(it => String(it.chapter_id) === String(ch.id))
                        
                        // Fake items for local-only chapters
                        if (ch.id === 2000) chItems = [{ id: 'fake_school', name: { uzl: 'Barcha transport - 30 km/s' }, image: 'car' }]
                        if (ch.id === 2001) chItems = [{ id: 'fake_home', name: { uzl: 'Barcha transport - 20 km/s' }, image: 'car' }]

                        if (chItems.length === 0 && !extraChapters.find(e => e.id === ch.id)) return null

                        const chapterName = typeof ch.name === 'object' ? (ch.name[lang || 'uzl'] || ch.name['uzl']) : ch.name
                        const style = styleMap[ch.id] || { icon: 'bookmark', bg: 'bg-slate-50 dark:bg-slate-800/40', text: 'text-slate-500 dark:text-slate-400', border: 'border-slate-100 dark:border-slate-800' }

                        return (
                          <div key={ch.id} className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden h-fit transition-all hover:shadow-2xl hover:shadow-blue-500/5">
                            {/* Section Header (Slightly larger) */}
                            <div className={`px-6 py-5 flex items-center gap-3.5 ${style.bg} border-b ${style.border}`}>
                              <div className={`w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-md ${style.text}`}>
                                <span className="material-icons-round text-2xl">{style.icon}</span>
                              </div>
                              <h2 className="text-[18px] font-black text-slate-800 dark:text-white tracking-tight">{chapterName}</h2>
                            </div>

                            {/* Items List (Slightly larger) */}
                            <div className="px-2 py-2">
                              {chItems.map((item) => {
                                const fullName = typeof item.name === 'object' ? (item.name[lang || 'uzl'] || item.name['uzl']) : item.name
                                let [label, speedPart] = fullName.split(' - ')
                                let speedValue = speedPart?.replace(/[^\d]/g, '') || '--'

                                // DATA OVERRIDES
                                if (ch.id === 1000) speedValue = '70'
                                if (ch.id === 1001) {
                                  if (label.includes('Yengil')) speedValue = '100'
                                  else speedValue = '90'
                                }
                                if (ch.id === 1002) {
                                  if (label.includes('Yengil')) speedValue = '100'
                                  else if (label.includes('Yuk')) speedValue = '80'
                                  else speedValue = '90'
                                }

                                const iconMap = { car: 'directions_car', truck: 'local_shipping', motorcycle: 'motorcycle', bus: 'directions_bus' }

                                return (
                                  <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                      <div className="text-slate-400 dark:text-slate-500/70">
                                        <span className="material-icons-round text-[28px]">{iconMap[item.image] || 'image'}</span>
                                      </div>
                                      <span className="text-[16px] font-bold text-slate-700 dark:text-slate-200">
                                        {label}
                                      </span>
                                    </div>
                                    <div className="text-right flex items-baseline gap-1">
                                      <span className="text-2xl font-black text-blue-600 dark:text-blue-500 tracking-tight">{speedValue}</span>
                                      <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">km/s</span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>
              ) : hasChapters ? (
                // CHAPTERS LIST (e.g. Traffic Rules)
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {chapters.map((ch) => (
                    <Link
                      key={ch.id}
                      href={`/qoidalar/${topicId}/${ch.id}`}
                      className="group flex items-center justify-between p-5 md:p-6 bg-[#212936] md:bg-white md:dark:bg-[#1e293b] rounded-[24px] border border-[#313C50] md:border-slate-200 md:dark:border-slate-800 hover:border-blue-500 md:hover:border-sky-500 shadow-sm md:hover:shadow-lg transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[16px] bg-blue-500/10 flex items-center justify-center text-blue-500">
                          <span className="material-icons-round text-2xl font-bold">
                            {topicId === 'traffic' ? 'menu_book' : 'bookmark'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-[16px] md:text-lg font-bold text-white md:text-slate-900 md:dark:text-white group-hover:text-blue-500 md:hover:text-sky-500 transition-colors">
                            {typeof ch.name === 'object' ? (ch.name[lang || 'uzl'] || ch.name['uzl']) : ch.name}
                          </h3>
                          {ch.code && <span className="text-[12px] text-[#9AA4B2] md:text-slate-500">{ch.code}-bob</span>}
                        </div>
                      </div>
                      <span className="material-icons-round text-[#9AA4B2] md:text-slate-300 md:group-hover:text-sky-500 group-hover:text-white transition-all">chevron_right</span>
                    </Link>
                  ))}
                </div>
              ) : (
                // ITEMS LIST (e.g. Signs, Hazard Labels)
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-[#212936] md:bg-white md:dark:bg-[#1e293b] rounded-[24px] border border-[#313C50] md:border-slate-100 md:dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      <div className="aspect-square bg-[#161c24] md:bg-slate-50 md:dark:bg-black/20 flex items-center justify-center p-6 border-b border-[#313C50] md:border-slate-100 md:dark:border-slate-800 relative">
                        {item.image ? (
                          item.image.includes('.') ? (
                            <img 
                              src={`${process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz'}/uploads/rules/${topicId}/${item.image}`} 
                              alt={typeof item.name === 'object' ? (item.name[lang || 'uzl'] || item.name['uzl']) : item.name}
                              className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <span className="material-icons-round text-4xl text-blue-500">
                              {item.image}
                            </span>
                          )
                        ) : (
                          <div className="text-slate-500 flex flex-col items-center gap-2">
                            <span className="material-icons-round text-4xl">image_not_supported</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">No Image</span>
                          </div>
                        )}
                        {item.code && (
                          <div className="absolute top-3 left-3 px-2 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg shadow-lg">
                            {item.code}
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="text-sm md:text-base font-bold text-white md:text-slate-900 md:dark:text-white leading-tight mb-2 line-clamp-1">
                          {typeof item.name === 'object' ? (item.name[lang || 'uzl'] || item.name['uzl']) : item.name}
                        </h3>
                        <p className="text-[12px] md:text-[13px] text-[#9AA4B2] md:text-slate-500 md:dark:text-slate-400 leading-relaxed line-clamp-3">
                          {(function() {
                            const val = item.content || item.description || "Tavsif mavjud emas"
                            if (typeof val === 'string') return val
                            if (typeof val === 'object' && val !== null) {
                              return val[lang || 'uzl'] || val['uzl'] || val[Object.keys(val)[0]] || ''
                            }
                            return String(val)
                          })()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!hasChapters && items.length === 0 && (
                <div className="text-center py-20 bg-[#212936] md:bg-white md:dark:bg-[#1e293b] rounded-[32px] border border-dashed border-[#313C50] md:border-slate-300 md:dark:border-slate-700">
                  <span className="material-icons-round text-6xl text-slate-300 mb-4">folder_off</span>
                  <h2 className="text-xl font-bold mb-2">Ma'lumot topilmadi</h2>
                  <p className="text-[#9AA4B2] md:text-slate-500">Ushbu bo'limda hali ma'lumot kiritilmagan.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
