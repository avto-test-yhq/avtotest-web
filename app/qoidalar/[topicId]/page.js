'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import QoidalarSidebar from '@/components/QoidalarSidebar'
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
      const resMeta = await fetch(`${API_URL}/api/v1/rules/topics?lang=${currentLang}`)
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
  
  const pageTitle = topicInfo?.name || data?.name || topicId

  return (
    <div className="bg-[#161c24] md:bg-slate-50 md:dark:bg-[#0f172a] text-white md:text-slate-900 md:dark:text-slate-100 min-h-screen transition-colors duration-200 font-sans">
      <QoidalarSidebar />

      <main className="lg:ml-72 min-h-screen pb-10">
        <QoidalarHeader title={pageTitle} backUrl="/qoidalar" />

        <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-[#9AA4B2] md:text-slate-400">Yuklanmoqda...</p>
             </div>
          ) : (
            <>
              {hasChapters ? (
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
                            {ch.name}
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
                           <img 
                            src={`${process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz'}/uploads/rules/${topicId}/${item.image}`} 
                            alt={item.name}
                            className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                          />
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
                        <h3 className="text-sm md:text-base font-bold text-white md:text-slate-900 md:dark:text-white leading-tight mb-2 line-clamp-1">{item.name}</h3>
                        <p className="text-[12px] md:text-[13px] text-[#9AA4B2] md:text-slate-500 md:dark:text-slate-400 leading-relaxed line-clamp-3">
                          {item.content || item.description || "Tavsif mavjud emas"}
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
