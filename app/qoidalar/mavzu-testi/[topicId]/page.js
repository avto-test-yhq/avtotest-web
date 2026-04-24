'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ThemeToggle from '@/components/ThemeToggle'
import { useLanguage } from '@/context/LanguageContext'
import { apiFetch } from '@/lib/apiClient'

// topicId → test parametrlari (exam page uchun)
const topicExamMap = {
  rules: { topicType: 'traffic', baseHref: '/qoidalar/yol-harakati' },
  traffic: { topicType: 'traffic', baseHref: '/qoidalar/yol-harakati' },
  road_signs: { topicType: 'signs', baseHref: '/qoidalar/yol-belgilari' },
  signs: { topicType: 'signs', baseHref: '/qoidalar/yol-belgilari' },
  road_markings: { topicType: 'markings', baseHref: '/qoidalar/yol-chiziqlari' },
  markings: { topicType: 'markings', baseHref: '/qoidalar/yol-chiziqlari' },
  hazard_labels: { topicType: 'hazard_labels', baseHref: '/qoidalar/hazard-labels' },
  vehicle_signs: { topicType: 'vehicle_signs', baseHref: '/qoidalar/vehicle-signs' },
  speed_limits: { topicType: 'speed_limits', baseHref: '/qoidalar/tezlik-chegaralari' },
}

const examPriorityColors = {
  CRITICAL: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', label: 'Juda muhim' },
  HIGH: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', label: 'Muhim' },
  MEDIUM: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400', label: "O'rtacha" },
  LOW: { bg: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400', label: 'Past' },
}

export default function TopicChaptersPage() {
  const router = useRouter()
  const params = useParams()
  const { lang } = useLanguage()
  const topicId = params?.topicId || 'rules'

  const [topicInfo, setTopicInfo] = useState(null)
  const [chapters, setChapters] = useState([])
  const [testCounts, setTestCounts] = useState({}) // chapterId → count
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const examInfo = topicExamMap[topicId] || { topicType: 'traffic', baseHref: '/qoidalar/yol-harakati' }

  // Mavzu ma'lumotlari va boblarni yuklash
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      // Parallel: topics va chapters
      const [topicsRes, chaptersRes] = await Promise.all([
        apiFetch(`/rules/topics?lang=${lang || 'uzl'}`),
        apiFetch(`/rules/chapters-by-topic?topic=${topicId}&lang=${lang || 'uzl'}`),
      ])

      if (topicsRes.ok) {
        const topicsData = await topicsRes.json()
        const found = (topicsData.topics || []).find(t => t.id === topicId)
        setTopicInfo(found || null)
      }

      if (chaptersRes.ok) {
        const chaptersData = await chaptersRes.json()
        setChapters(chaptersData.chapters || [])
      }
    } catch (e) {
      console.error('Ma\'lumot yuklashda xatolik:', e)
    } finally {
      setLoading(false)
    }
  }, [topicId, lang])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Mavzu bo'yicha barcha boblar testlari sonini bitta so'rovda olish
  useEffect(() => {
    if (chapters.length === 0) return
    const fetchCounts = async () => {
      try {
        const res = await apiFetch(`/rules/stats/${examInfo.topicType}`)
        if (res.ok) {
          const data = await res.json()
          setTestCounts(data.stats || {})
        }
      } catch (e) {
        console.error('Test counts yuklashda xatolik:', e)
      }
    }
    fetchCounts()
  }, [chapters, examInfo.topicType])

  const filtered = chapters.filter(
    ch =>
      !search.trim() ||
      ch.name?.toLowerCase().includes(search.toLowerCase()) ||
      ch.code?.toString().includes(search)
  )

  const totalTests = Object.values(testCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="bg-[#161c24] md:bg-slate-50 md:dark:bg-[#0f172a] text-white md:text-slate-900 md:dark:text-slate-100 min-h-screen font-sans transition-colors duration-200">

      {/* DESKTOP SIDEBAR */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col z-50">
        <div className="p-6 flex flex-col h-full">
          <Link href="/dashboard" className="flex items-center gap-2 group mb-8">
            <div className="relative w-10 h-10">
              <Image src="/imgage/avtotest-logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white">PravachiUZ</span>
          </Link>

          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">Boblar</p>
          </div>

          <nav className="space-y-0.5 flex-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="px-3 text-sm text-slate-400">Yuklanmoqda...</div>
            ) : (
              chapters.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setSearch('')}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors group"
                >
                  <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold flex items-center justify-center shrink-0 group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400 transition-colors">
                    {ch.code}
                  </span>
                  <span className="text-sm line-clamp-1">
                    {typeof ch.name === 'object' ? ch.name.uzl : ch.name}
                  </span>
                </button>
              ))
            )}
          </nav>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-4 space-y-1">
            <Link href="/qoidalar/mavzu-testi" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
              <span className="material-icons-round text-[18px]">arrow_back</span>
              Mavzular ro'yxati
            </Link>
          </div>
        </div>
      </aside>

      <main className="lg:ml-72 min-h-screen pb-10">
        {/* HEADER */}
        <header className="sticky top-0 bg-[#161c24]/90 md:bg-white/80 md:dark:bg-[#1e293b]/80 backdrop-blur-md border-b border-[#313C50] md:border-slate-200 md:dark:border-slate-800 z-40">
          <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button onClick={() => router.push('/qoidalar/mavzu-testi')} className="p-2 text-white md:text-slate-500 hover:bg-[#313C50] md:hover:bg-slate-100 rounded-xl transition-colors shrink-0">
                <span className="material-icons-round">arrow_back</span>
              </button>
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-bold text-white md:text-slate-900 md:dark:text-white truncate leading-tight">
                  {topicInfo?.name || 'Mavzu yuklanmoqda...'}
                </h1>
                <p className="text-[11px] text-[#9AA4B2] md:text-slate-400 hidden md:block">
                  {chapters.length} ta bob • {totalTests} ta test
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {/* Barcha testlar - barcha boblar bo'yicha */}
              {totalTests > 0 && (
                <button
                  onClick={() => router.push(`/exam?mode=rule&topicType=${examInfo.topicType}&itemType=chapter&itemId=${chapters[0]?.id}&count=${Math.min(totalTests, 50)}`)}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-blue-600/20"
                >
                  <span className="material-icons-round text-[18px]">play_arrow</span>
                  Test Boshlash
                </button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 lg:p-10 max-w-5xl mx-auto">

          {/* Search */}
          <div className="mb-6 flex items-center gap-2 bg-[#212936] md:bg-white md:dark:bg-[#1e293b] border border-[#313C50] md:border-slate-200 md:dark:border-slate-800 rounded-2xl px-4 py-3 shadow-sm">
            <span className="material-icons-round text-[#9AA4B2] md:text-slate-400">search</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Bob nomi yoki raqami bilan qidiring..."
              className="flex-1 bg-transparent text-white md:text-slate-800 md:dark:text-white placeholder-[#9AA4B2] md:placeholder-slate-400 outline-none text-sm font-medium"
            />
          </div>

          {/* Chapters list */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-[#212936] md:bg-white md:dark:bg-[#1e293b] rounded-[20px] p-5 border border-[#313C50] md:border-slate-200 md:dark:border-slate-800 animate-pulse">
                  <div className="h-5 bg-[#313C50] md:bg-slate-200 rounded-lg mb-2 w-2/3" />
                  <div className="h-4 bg-[#313C50] md:bg-slate-200 rounded-lg w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((ch, idx) => {
                const priority = examPriorityColors[ch.exam_priority] || examPriorityColors.LOW
                const testCount = testCounts[ch.id]
                const chapterReadHref = `${examInfo.baseHref}/${ch.id}`
                const examHref = `/exam?mode=rule&topicType=${examInfo.topicType}&itemType=chapter&itemId=${ch.id}&count=${testCount || 20}`

                return (
                  <div
                    key={ch.id}
                    className="bg-[#212936] md:bg-white md:dark:bg-[#1e293b] rounded-[20px] border border-[#313C50] md:border-slate-200 md:dark:border-slate-800 hover:border-blue-500 md:hover:border-blue-400 transition-all duration-200 overflow-hidden group shadow-sm hover:shadow-md"
                  >
                    <div className="p-4 md:p-5 flex items-start gap-4">
                      {/* Bob raqami */}
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-blue-600/30">
                        {ch.code}
                      </div>

                      {/* Mazmun */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-bold text-white md:text-slate-900 md:dark:text-white text-[15px] md:text-base leading-tight">
                            {typeof ch.name === 'object' ? ch.name.uzl : ch.name}
                          </h3>
                          {ch.exam_priority && (
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${priority.bg} ${priority.text}`}>
                              {priority.label}
                            </span>
                          )}
                        </div>
                        {(ch.description || ch.description === '') && (
                          <p className="text-[13px] text-[#9AA4B2] md:text-slate-500 md:dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                            {typeof ch.description === 'object' ? ch.description.uzl : ch.description}
                          </p>
                        )}

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#9AA4B2] md:text-slate-400 mb-3">
                          <span className="flex items-center gap-1">
                            <span className="material-icons-round text-[14px]">article</span>
                            {ch.item_count || 0} ta band
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-icons-round text-[14px]">quiz</span>
                            {testCount !== undefined
                              ? testCount > 0 ? `${testCount} ta test` : 'Test yo\'q'
                              : 'Yuklanmoqda...'}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <Link
                            href={chapterReadHref}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#161c24] md:bg-slate-100 md:dark:bg-slate-800 text-[#9AA4B2] md:text-slate-600 md:dark:text-slate-300 font-semibold text-xs hover:opacity-80 transition-opacity"
                          >
                            <span className="material-icons-round text-[14px]">menu_book</span>
                            O'qish
                          </Link>
                          {testCount > 0 ? (
                            <button
                              onClick={() => router.push(examHref)}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-md shadow-blue-600/20"
                            >
                              <span className="material-icons-round text-[14px]">play_arrow</span>
                              Test Ishlash ({testCount})
                            </button>
                          ) : (
                            <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#161c24] md:bg-slate-100 md:dark:bg-slate-700 text-[#9AA4B2] md:text-slate-400 font-semibold text-xs opacity-60 cursor-not-allowed">
                              <span className="material-icons-round text-[14px]">lock</span>
                              Test yo'q
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {filtered.length === 0 && !loading && (
                <div className="text-center py-20 text-[#9AA4B2] md:text-slate-400">
                  <span className="material-icons-round text-4xl mb-2 opacity-30 block">search_off</span>
                  Natija topilmadi
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Mobile: Barcha testlar tugmasi */}
      {totalTests > 0 && !loading && (
        <div className="fixed bottom-6 left-0 right-0 px-4 lg:hidden z-50">
          <button
            onClick={() => router.push(`/exam?mode=rule&topicType=${examInfo.topicType}&itemType=chapter&itemId=${chapters[0]?.id}&count=${Math.min(totalTests, 50)}`)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-base rounded-2xl shadow-xl shadow-blue-600/30 transition-all"
          >
            <span className="material-icons-round text-[20px]">play_arrow</span>
            Test Boshlash • {totalTests} ta savol
          </button>
        </div>
      )}
    </div>
  )
}
