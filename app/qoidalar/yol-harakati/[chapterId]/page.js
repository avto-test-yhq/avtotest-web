'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { useI18n } from '@/lib/i18n'
import { useLanguage } from '@/context/LanguageContext'
import UserProfileHeader from '@/components/UserProfileHeader'
import QoidalarHeader from '@/components/QoidalarHeader'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz'

export default function ChapterDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { lang } = useLanguage()
  const t = useI18n()
  const chapterId = parseInt(params?.chapterId, 10) || 1

  const [allChapters, setAllChapters] = useState([])
  const [currentChapter, setCurrentChapter] = useState(null)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [ruleTests, setRuleTests] = useState([])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/rules/traffic?lang=${lang || 'uzl'}`)
      if (!res.ok) throw new Error('API xatolik')
      const data = await res.json()

      const chapters = data.chapters || []
      const current = chapters.find((c) => c.id === chapterId)
      const arts = (data.items || [])
        .filter((a) => a.chapter_id === chapterId)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

      setAllChapters(chapters)
      setCurrentChapter(current || { name: `Bob ${chapterId}`, code: chapterId })
      setArticles(arts)
    } catch (e) {
      console.error('Ma\'lumot yuklashda xatolik:', e)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [chapterId, lang])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Fetch linked rule tests
  useEffect(() => {
    if (!chapterId) return
    fetch(`${API_URL}/api/rules/tests?topicType=traffic&itemType=chapter&itemId=${chapterId}`)
      .then(r => r.json())
      .then(d => setRuleTests(d.data || []))
      .catch(() => { })
  }, [chapterId])

  // Pagination Logic
  const currentIndex = allChapters.findIndex(c => c.id === chapterId)
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null

  return (
    <div className="bg-[#161c24] md:bg-slate-50 md:dark:bg-[#0f172a] text-white md:text-slate-900 md:dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">

      {/* HEADER */}
      <QoidalarHeader
        title={currentChapter?.name || 'Yuklanmoqda...'}
        backUrl={null}
        beforeDashboard={
          ruleTests.length > 0 ? (
            <button
              onClick={() => router.push(`/exam?mode=rule&topicType=traffic&itemType=chapter&itemId=${chapterId}&count=${ruleTests.length}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.97] text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/30"
            >
              <span className="material-icons-round text-[16px]">play_arrow</span>
              <span className="hidden sm:inline ">Test Ishlash</span>
              <span className="sm:hidden">Test</span>
              <span className="bg-white/20 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">{ruleTests.length}</span>
            </button>
          ) : null
        }
      />

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">

        {/* SIDEBAR (TOC) */}
        <aside className="hidden lg:block w-80 border-r border-slate-200 dark:border-slate-800 p-6 overflow-y-auto h-[calc(100vh-64px)] sticky top-16 custom-scrollbar bg-white dark:bg-[#1e293b]/50">
          <nav className="space-y-1">
            <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">Mavzular</span>
            </div>

            {loading && allChapters.length === 0 ? (
              <div className="px-3 text-sm text-slate-400">Yuklanmoqda...</div>
            ) : (
              allChapters.map(ch => (
                <Link
                  key={ch.id}
                  href={`/qoidalar/yol-harakati/${ch.id}`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all group ${ch.id === chapterId
                    ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  <span className={`material-icons-round text-[20px] ${ch.id === chapterId ? 'text-sky-500' : 'text-slate-400 group-hover:text-slate-500'
                    }`}>
                    {ch.id === 1 ? 'menu_book' : 'description'}
                  </span>
                  <span className="line-clamp-1">{ch.name}</span>
                </Link>
              ))
            )}

            <div className="pt-6 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">Imtihon</span>
            </div>
            <Link href="/biletlar" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group">
              <span className="material-icons-round text-[20px] text-slate-400 group-hover:text-slate-500">quiz</span>
              Test topshirish
            </Link>
          </nav>
        </aside>

        {/* MAIN CONTENT Area */}
        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-20 text-[#9AA4B2] md:text-slate-400">Yuklanmoqda...</div>
          ) : (
            <div className="space-y-6 md:space-y-8 pb-24">
              {articles.map((a) => (
                <article key={a.id} className="bg-[#212936] md:bg-white md:dark:bg-[#1e293b] rounded-[24px] p-5 md:p-8 shadow-sm border border-[#313C50] md:border-slate-100 md:dark:border-slate-800 hover:shadow-md transition-shadow duration-300">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#161c24] md:bg-sky-50 md:dark:bg-sky-900/30 text-blue-500 md:text-sky-600 md:dark:text-sky-400 font-bold text-[12px] md:text-sm mb-4">
                    {a.code}-band
                  </span>
                  <p className="text-white md:text-slate-700 md:dark:text-slate-300 leading-relaxed text-[15px] md:text-lg mb-6 whitespace-pre-wrap font-medium md:font-normal">
                    {a.content || a.metadata?.simplified || "Mazmun mavjud emas"}
                  </p>

                  {a.metadata?.exam_tips && (
                    <div className="bg-[#161c24] md:bg-amber-50 md:dark:bg-amber-900/20 border border-[#313C50] md:border-amber-100 md:dark:border-amber-900/30 rounded-[16px] p-4 md:p-5 flex gap-3 md:gap-4 mt-2">
                      <div className="flex-shrink-0">
                        <span className="material-icons-round text-yellow-500 md:text-amber-500 text-[20px] md:text-[24px]">lightbulb</span>
                      </div>
                      <div>
                        <h4 className="text-yellow-500 md:text-amber-800 md:dark:text-amber-400 font-bold text-[13px] md:text-sm uppercase tracking-wide mb-1">{t('rules.examImportant')}</h4>
                        <p className="text-[#9AA4B2] md:text-amber-900/70 md:dark:text-amber-200/60 text-[13px] md:text-sm">
                          {a.metadata.exam_tips}
                        </p>
                      </div>
                    </div>
                  )}
                </article>
              ))}

              {articles.length === 0 && (
                <div className="text-center py-20 bg-[#212936] md:bg-white md:dark:bg-[#1e293b] rounded-[24px] border border-dashed border-[#313C50] md:border-slate-300 md:dark:border-slate-700">
                  <p className="text-[#9AA4B2] md:text-slate-500">Ushbu bobda hozircha bandlar kiritilmagan.</p>
                </div>
              )}

              {/* Rule Tests Section */}
              {ruleTests.length > 0 && (
                <div className="mt-8 p-5 md:p-6 rounded-[24px] bg-gradient-to-br from-blue-600 to-blue-700 text-white relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <span className="material-icons-round text-white text-[20px]">quiz</span>
                      </div>
                      <div>
                        <div className="font-bold text-base">Bu bob bo'yicha test</div>
                        <div className="text-blue-100 text-xs">{ruleTests.length} ta savol tayyorlangan</div>
                      </div>
                    </div>
                    <p className="text-blue-100 text-sm mb-4">
                      Bobni o'qib bitirdingizmi? Bilimingizni sinab ko'ring!
                    </p>
                    <button
                      onClick={() => router.push(`/exam?mode=rule&topicType=traffic&itemType=chapter&itemId=${chapterId}&count=${ruleTests.length}`)}
                      className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition active:scale-[0.98]"
                    >
                      <span className="material-icons-round text-[18px]">play_arrow</span>
                      Testni Boshlash
                    </button>
                  </div>
                </div>
              )}

              {/* Visual Pagination */}
              <div className="mt-8 md:mt-12 flex items-center justify-between border-t border-[#313C50] md:border-slate-200 md:dark:border-slate-800 pt-6 md:pt-8 mb-10 md:mb-0">
                {prevChapter ? (
                  <Link href={`/qoidalar/yol-harakati/${prevChapter.id}`} className="flex items-center gap-2 text-[#9AA4B2] md:text-slate-500 md:dark:text-slate-400 hover:text-blue-500 md:hover:text-sky-600 md:dark:hover:text-sky-400 transition-colors group">
                    <div className="w-10 h-10 md:w-auto md:h-auto rounded-full bg-[#212936] md:bg-transparent flex items-center justify-center">
                      <span className="material-icons-round group-hover:-translate-x-1 transition-transform">chevron_left</span>
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="text-xs text-[#9AA4B2] md:text-slate-400">Oldingi bob</div>
                      <div className="font-bold md:font-medium text-white md:text-inherit line-clamp-1 max-w-[120px] md:max-w-[150px]">{prevChapter.name}</div>
                    </div>
                  </Link>
                ) : <span></span>}

                {/* Pages (Simplified visual) */}
                <div className="flex md:flex gap-2 text-sm font-bold md:font-medium text-[#9AA4B2] md:text-slate-400">
                  {currentIndex + 1} / {allChapters.length}
                </div>

                {nextChapter ? (
                  <Link href={`/qoidalar/yol-harakati/${nextChapter.id}`} className="flex items-center gap-2 text-white md:text-slate-900 md:dark:text-white hover:text-blue-500 md:hover:text-sky-600 md:dark:hover:text-sky-400 transition-colors font-bold md:font-medium group">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-[#9AA4B2] md:text-slate-400">Keyingi bob</div>
                      <div className="line-clamp-1 max-w-[120px] md:max-w-[150px]">{nextChapter.name}</div>
                    </div>
                    <div className="w-10 h-10 md:w-auto md:h-auto rounded-full bg-[#212936] md:bg-transparent flex items-center justify-center">
                      <span className="material-icons-round group-hover:translate-x-1 transition-transform">chevron_right</span>
                    </div>
                  </Link>
                ) : <span></span>}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Help FAB */}
      <button className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center hover:scale-105 transition-transform active:scale-95 z-50">
        <span className="material-icons-round">description</span>
      </button>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
      `}</style>
    </div>
  )
}
