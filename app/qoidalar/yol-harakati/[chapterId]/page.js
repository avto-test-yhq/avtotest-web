'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { useI18n } from '@/lib/i18n'
import { useLanguage } from '@/context/LanguageContext'
import UserProfileHeader from '@/components/UserProfileHeader'
import QoidalarHeader from '@/components/QoidalarHeader'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/rules/traffic?lang=${lang || 'uzl'}`)
      if (!res.ok) throw new Error('API xatolik')
      const data = await res.json()

      const chapters = data.chapters || []
      const current = chapters.find((c) => c.id === chapterId)
      const arts = (data.articles || [])
        .filter((a) => a.chapter_id === chapterId)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

      setAllChapters(chapters)
      setCurrentChapter(current || { title: `Bob ${chapterId}`, number: chapterId })
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

  // Pagination Logic
  const currentIndex = allChapters.findIndex(c => c.id === chapterId)
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null

  return (
    <div className="bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">

      {/* HEADER */}
      <QoidalarHeader title={currentChapter?.title || 'Yuklanmoqda...'} />

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
                  <span className="line-clamp-1">{ch.title}</span>
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
            <div className="text-center py-20 text-slate-400">Yuklanmoqda...</div>
          ) : (
            <div className="space-y-8 pb-24">
              {articles.map((a) => (
                <article key={a.id} className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow duration-300">
                  <span className="inline-block px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-bold text-sm mb-4">
                    {a.number}-modda
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg mb-6 whitespace-pre-wrap">
                    {a.content || a.simplified || "Mazmun mavjud emas"}
                  </p>

                  {a.exam_tips && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-5 flex gap-4">
                      <div className="flex-shrink-0">
                        <span className="material-icons-round text-amber-500">lightbulb</span>
                      </div>
                      <div>
                        <h4 className="text-amber-800 dark:text-amber-400 font-bold text-sm uppercase tracking-wide mb-1">{t('rules.examImportant')}</h4>
                        <p className="text-amber-900/70 dark:text-amber-200/60 text-sm">
                          {a.exam_tips}
                        </p>
                      </div>
                    </div>
                  )}
                </article>
              ))}

              {articles.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-[#1e293b] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <p className="text-slate-500">Ushbu bobda hozircha moddalar kiritilmagan.</p>
                </div>
              )}

              {/* Visual Pagination */}
              <div className="mt-12 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-8">
                {prevChapter ? (
                  <Link href={`/qoidalar/yol-harakati/${prevChapter.id}`} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors group">
                    <span className="material-icons-round group-hover:-translate-x-1 transition-transform">chevron_left</span>
                    <div className="text-left hidden sm:block">
                      <div className="text-xs text-slate-400">Oldingi bob</div>
                      <div className="font-medium line-clamp-1 max-w-[150px]">{prevChapter.title}</div>
                    </div>
                  </Link>
                ) : <span></span>}

                {/* Pages (Simplified visual) */}
                <div className="hidden md:flex gap-2 text-sm font-medium text-slate-400">
                  {currentIndex + 1} / {allChapters.length}
                </div>

                {nextChapter ? (
                  <Link href={`/qoidalar/yol-harakati/${nextChapter.id}`} className="flex items-center gap-2 text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-medium group">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-slate-400">Keyingi bob</div>
                      <div className="font-medium line-clamp-1 max-w-[150px]">{nextChapter.title}</div>
                    </div>
                    <span className="material-icons-round group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </Link>
                ) : <span></span>}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Help FAB */}
      <button className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-sky-500 text-white rounded-full shadow-lg shadow-sky-500/30 flex items-center justify-center hover:scale-105 transition-transform active:scale-95 z-50">
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
