'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { useI18n } from '@/lib/i18n'
import QoidalarHeader from '@/components/QoidalarHeader'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz'
const RULES_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz'

function getSignImageUrl(imagePath) {
  if (!imagePath) return null
  const base = `${RULES_BASE}/uploads/rules/signs`
  if (imagePath.startsWith('http')) {
    try {
      const url = new URL(imagePath)
      const p = url.pathname.replace(/^\/rules\/images\/signs\//, '').replace(/^\/uploads\/rules\/signs\//, '')
      return p ? `${base}/${p}` : base
    } catch { return `${base}/${imagePath}` }
  }
  return `${base}/${imagePath}`
}

export default function SignDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { lang } = useLanguage()
  const t = useI18n()
  const categorySlug = params?.categorySlug || ''
  const signId = parseInt(params?.signId, 10) || 0

  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState(null)
  const [sign, setSign] = useState(null)
  const [allSigns, setAllSigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [ruleTests, setRuleTests] = useState([])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/rules/signs?lang=${lang || 'uzl'}`)
      if (!res.ok) throw new Error('API xatolik')
      const data = await res.json()
      const cats = data.chapters || []
      const list = data.items || []

      const cat = cats.find((c) => (c.image_folder || String(c.id)) === categorySlug)
      const s = list.find((x) => x.id === signId)
      const sorted = list.filter((x) => x.chapter_id === cat?.id).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

      setCategories(cats)
      setCategory(cat || { name: 'Belgi' })
      setSign(s || null)
      setAllSigns(sorted)
    } catch (e) {
      console.error('Belgini yuklashda xatolik:', e)
      setCategories([])
      setCategory({ name: 'Belgi' })
      setSign(null)
      setAllSigns([])
    } finally {
      setLoading(false)
    }
  }, [categorySlug, signId, lang])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!signId) return
    fetch(`${API_URL}/api/rules/tests?topicType=signs&itemType=item&itemId=${signId}`)
      .then(r => r.json())
      .then(d => setRuleTests(d.data || []))
      .catch(() => {})
  }, [signId])

  const currentIndex = allSigns.findIndex((s) => s.id === signId)
  const prevSign = currentIndex > 0 ? allSigns[currentIndex - 1] : null
  const nextSign = currentIndex >= 0 && currentIndex < allSigns.length - 1 ? allSigns[currentIndex + 1] : null
  const total = allSigns.length

  return (
    <div className="bg-[#0b0f15] md:bg-slate-50 md:dark:bg-[#070b14] text-white md:text-slate-900 md:dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-300">

      {/* HEADER */}
      <QoidalarHeader title={category?.name || "Yo'l belgisi"} />

      <div className="flex flex-1 max-w-[1440px] mx-auto w-full">
        {/* SIDEBAR - Desktop only */}
        <aside className="hidden lg:block w-72 border-r border-slate-200 dark:border-slate-800/50 p-6 h-[calc(100vh-64px)] sticky top-16 bg-white dark:bg-[#0d121d] overflow-y-auto custom-scrollbar">
          <nav className="space-y-1.5">
            <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/50">
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-3">Guruhlar</span>
            </div>
            {loading && categories.length === 0 ? (
              <div className="px-3 text-sm text-slate-400">Yuklanmoqda...</div>
            ) : (
              categories.map(cat => {
                const isActive = (cat.image_folder || String(cat.id)) === categorySlug
                return (
                  <Link
                    key={cat.id}
                    href={`/qoidalar/yol-belgilari/${cat.image_folder || cat.id}`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group ${isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                  >
                    <span className={`material-icons-round text-[18px] ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`}>
                      {isActive ? 'folder_open' : 'folder'}
                    </span>
                    <span className="text-[14px] line-clamp-1">{cat.name}</span>
                  </Link>
                )
              })
            )}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-8 lg:p-16 overflow-y-auto max-w-5xl mx-auto w-full relative">
          
          {/* Subtle Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-blue-600/5 blur-[120px] pointer-events-none rounded-full" />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="text-[#9AA4B2] md:text-slate-400 font-medium">Ma'lumotlar yuklanmoqda...</div>
            </div>
          ) : sign ? (
            <div className="space-y-10 md:space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* IMAGE SECTION */}
              <div className="flex justify-center group">
                <div className="relative w-56 h-56 md:w-80 md:h-80">
                  {/* Decorative backgrounds */}
                  <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-purple-500/5 rounded-[40px] blur-2xl group-hover:scale-105 transition-transform duration-700 opacity-50 dark:opacity-100" />
                  
                  <div className="relative w-full h-full rounded-[32px] md:rounded-[48px] bg-white dark:bg-[#121926] border border-white/50 dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center p-8 md:p-12 transition-all duration-500 group-hover:shadow-[0_30px_60px_rgba(59,130,246,0.15)] overflow-hidden">
                    
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                    </div>

                    <img
                      src={getSignImageUrl(sign.image)}
                      alt={sign.name}
                      className="object-contain max-w-full max-h-full drop-shadow-2xl translate-y-1 group-hover:-translate-y-2 transition-transform duration-500 ease-out"
                    />
                    
                    {/* Category/Code badge */}
                    <div className="absolute top-6 right-6 flex items-center gap-2">
                       <span className="bg-blue-600 text-white px-2.5 py-1 rounded-lg text-[10px] md:text-[11px] font-black tracking-wider uppercase shadow-md shadow-blue-500/20">
                        {sign.code}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TEXT SECTION */}
              <div className="space-y-8 md:space-y-10 max-w-3xl mx-auto">
                <div className="text-center space-y-3">
                  <h2 className="text-[24px] md:text-4xl font-black text-white md:text-slate-900 md:dark:text-white leading-[1.1] tracking-tight">{sign.name}</h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full" />
                </div>

                {/* Content Card */}
                <div className="relative group/card">
                   <div className="absolute -inset-px bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-[28px] md:rounded-[36px] blur-sm opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                   
                   <div className="relative rounded-[28px] md:rounded-[36px] bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-white dark:border-white/5 p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <span className="material-icons-round text-[22px]">auto_stories</span>
                      </div>
                      <span className="text-[12px] md:text-sm font-black uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400">{t('rules.signs.explanation')}</span>
                    </div>
                    
                    <p className="text-[16px] md:text-[19px] text-white md:text-slate-700 md:dark:text-slate-200 leading-[1.7] md:leading-[1.8] font-medium md:font-normal text-justify md:text-left">
                      {sign.content || sign.description}
                    </p>

                    {/* Decorative quote icon */}
                    <div className="absolute bottom-6 right-8 opacity-[0.05] dark:opacity-[0.1] select-none pointer-events-none">
                       <span className="material-icons-round text-[80px]">format_quote</span>
                    </div>
                  </div>
                </div>

                {/* Rule Tests Action Card */}
                {ruleTests.length > 0 && (
                  <div className="relative p-1 rounded-[24px] md:rounded-[32px] bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/20 overflow-hidden group/test">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                          <span className="material-icons-round text-white text-[28px]">rocket_launch</span>
                        </div>
                        <div>
                          <div className="font-bold text-lg text-white">Bu belgi bo'yicha testlarni yeching</div>
                          <div className="text-blue-100 text-sm opacity-80">{ruleTests.length} ta maxsus savol tayyor</div>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/exam?mode=rule&topicType=signs&itemType=item&itemId=${signId}&count=${ruleTests.length}`)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-white text-blue-600 font-black text-sm px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all active:scale-[0.97] shadow-xl hover:shadow-2xl"
                      >
                        TESTNI BOSHLASH
                        <span className="material-icons-round text-[18px]">play_arrow</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* NAVIGATION FOOTER */}
              <div className="flex items-center justify-between pt-12 border-t border-slate-200 dark:border-slate-800/50 sticky bottom-0 bg-transparent backdrop-blur-sm pb-8 z-10">
                <button
                  onClick={() => prevSign && router.push(`/qoidalar/yol-belgilari/${categorySlug}/${prevSign.id}`)}
                  disabled={!prevSign}
                  className="group flex items-center gap-3 disabled:opacity-20 transition-all active:scale-90"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white dark:bg-[#121926] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-blue-500 group-hover:border-blue-500/50 transition-all shadow-lg shadow-black/5">
                    <span className="material-icons-round">chevron_left</span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="block text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Oldingi</span>
                    <span className="block text-sm font-bold opacity-60 group-hover:opacity-100">Belgi</span>
                  </div>
                </button>

                <div className="px-5 py-2 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 text-[12px] font-black tracking-widest text-slate-500">
                  {currentIndex + 1} / {total}
                </div>

                <button
                  onClick={() => nextSign && router.push(`/qoidalar/yol-belgilari/${categorySlug}/${nextSign.id}`)}
                  disabled={!nextSign}
                  className="group flex items-center gap-3 disabled:opacity-20 transition-all active:scale-90"
                >
                  <div className="hidden sm:block text-right">
                    <span className="block text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Keyingi</span>
                    <span className="block text-sm font-bold opacity-60 group-hover:opacity-100">Belgi</span>
                  </div>
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-600 flex items-center justify-center text-white group-hover:bg-blue-700 group-hover:scale-110 transition-all shadow-xl shadow-blue-500/20">
                    <span className="material-icons-round">chevron_right</span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center">
              <span className="material-icons-round text-6xl text-slate-200 dark:text-slate-800 mb-4">search_off</span>
              <p className="text-xl text-slate-400">Belgi topilmadi</p>
            </div>
          )}
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e133;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #33415555;
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-from-bottom {
          from { transform: translateY(20px); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
