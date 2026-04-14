'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import QoidalarHeader from '@/components/QoidalarHeader'
import { useI18n } from '@/lib/i18n'
import { useLanguage } from '@/context/LanguageContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz/api/v1';

export default function GenericChapterDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { topicId, chapterId: rawChapterId } = params
  const chapterId = parseInt(rawChapterId, 10)
  const { lang } = useLanguage()
  const t = useI18n()

  const [allChapters, setAllChapters] = useState([])
  const [currentChapter, setCurrentChapter] = useState(null)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [ruleTests, setRuleTests] = useState([])

  const fetchData = useCallback(async () => {
    if (!topicId || !chapterId) return
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/rules/topic/${topicId}?lang=${lang || 'uzl'}`)
      if (!res.ok) throw new Error('API xatolik')
      const data = await res.json()

      const chapters = data.chapters || []
      const current = chapters.find((c) => c.id === chapterId)
      const arts = (data.items || [])
        .filter((a) => String(a.chapter_id) === String(chapterId))
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

      setAllChapters(chapters)
      setCurrentChapter(current || { name: `Bob ${chapterId}`, code: chapterId })
      setArticles(arts)
    } catch (e) {
      console.error('Ma\'lumot yuklashda xatolik:', e)
    } finally {
      setLoading(false)
    }
  }, [topicId, chapterId, lang])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Fetch linked rule tests
  useEffect(() => {
    if (!topicId || !chapterId) return
    fetch(`${API_URL}/rules/tests?topicType=${topicId}&itemType=chapter&itemId=${chapterId}`)
      .then(r => r.json())
      .then(d => setRuleTests(d.data || []))
      .catch(() => { })
  }, [topicId, chapterId])

  // Pagination Logic
  const currentIndex = allChapters.findIndex(c => c.id === chapterId)
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null

  return (
    <div className="bg-[#161c24] md:bg-slate-50 md:dark:bg-[#0f172a] text-white md:text-slate-900 md:dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">

      {/* HEADER */}
      <QoidalarHeader
        title={currentChapter?.name || 'Yuklanmoqda...'}
        backUrl={`/qoidalar/${topicId}`}
        beforeDashboard={
          ruleTests.length > 0 ? (
            <button
              onClick={() => router.push(`/exam?mode=rule&topicType=${topicId}&itemType=chapter&itemId=${chapterId}&count=${ruleTests.length}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.97] text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/30"
            >
              <span className="material-icons-round text-[16px]">play_arrow</span>
              <span className="hidden sm:inline">Test Ishlash</span>
              <span className="bg-white/20 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md ml-1">{ruleTests.length}</span>
            </button>
          ) : null
        }
      />

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
        {/* SIDEBAR (TOC) - Desktop */}
        <aside className="hidden lg:block w-80 border-r border-slate-200 dark:border-slate-800 p-6 overflow-y-auto h-[calc(100vh-64px)] sticky top-16 custom-scrollbar bg-white dark:bg-[#1e293b]/50">
          <nav className="space-y-1">
            <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">Boblar</span>
            </div>
            {allChapters.map(ch => (
              <Link
                key={ch.id}
                href={`/qoidalar/${topicId}/${ch.id}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all group ${ch.id === chapterId
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <span className={`material-icons-round text-[20px] ${ch.id === chapterId ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'}`}>
                  description
                </span>
                <span className="line-clamp-1">{ch.name}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-20 text-[#9AA4B2] md:text-slate-400 animate-pulse">Yuklanmoqda...</div>
          ) : (
            <div className="space-y-6 md:space-y-8 pb-24">
              {articles.map((a) => (
                <article key={a.id} className="bg-[#212936] md:bg-white md:dark:bg-[#1e293b] rounded-[24px] p-5 md:p-8 shadow-sm border border-[#313C50] md:border-slate-100 md:dark:border-slate-800 hover:shadow-md transition-shadow duration-300">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    {a.code && (
                      <span className="px-3 py-1 rounded-full bg-[#161c24] md:bg-blue-50 md:dark:bg-blue-900/30 text-blue-500 md:text-blue-600 md:dark:text-blue-400 font-bold text-[12px] md:text-sm">
                        {a.code}-band
                      </span>
                    )}
                  </div>
                  <p className="text-white md:text-slate-700 md:dark:text-slate-300 leading-relaxed text-[15px] md:text-lg mb-6 whitespace-pre-wrap font-medium md:font-normal">
                    {a.content || a.description || "Mazmun mavjud emas"}
                  </p>

                  {/* Image Support */}
                  {a.image && (
                    <div className="mb-6 rounded-2xl overflow-hidden border border-[#313C50] md:border-slate-100 md:dark:border-slate-800 bg-black/20 p-4">
                      <img
                        src={`${(process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz').replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '')}/uploads/rules/${topicId}/${a.image}`}
                        alt={a.name}
                        className="max-h-[400px] mx-auto object-contain"
                      />
                    </div>
                  )}

                  {a.metadata?.exam_tips && (
                    <div className="bg-[#161c24] md:bg-amber-50 md:dark:bg-amber-900/20 border border-[#313C50] md:border-amber-100 md:dark:border-amber-900/30 rounded-[16px] p-4 md:p-5 flex gap-3 md:gap-4">
                      <span className="material-icons-round text-yellow-500 md:text-amber-500">lightbulb</span>
                      <div>
                        <h4 className="text-yellow-500 md:text-amber-800 md:dark:text-amber-400 font-bold text-[13px] md:text-sm uppercase tracking-wide mb-1">Imtihon uchun muhim</h4>
                        <p className="text-[#9AA4B2] md:text-amber-900/70 md:dark:text-amber-200/60 text-[13px] md:text-sm">{a.metadata.exam_tips}</p>
                      </div>
                    </div>
                  )}
                </article>
              ))}

              {articles.length === 0 && (
                <div className="text-center py-20 bg-[#212936] md:bg-white md:dark:bg-[#1e293b] rounded-[24px] border border-dashed border-[#313C50] md:border-slate-300 md:dark:border-slate-700">
                  <p className="text-[#9AA4B2] md:text-slate-500">Ushbu bobda hali bandlar kiritilmagan.</p>
                </div>
              )}

              {/* Pagination */}
              <div className="mt-8 flex items-center justify-between border-t border-[#313C50] md:border-slate-200 md:dark:border-slate-800 pt-6 mb-10">
                {prevChapter ? (
                  <Link href={`/qoidalar/${topicId}/${prevChapter.id}`} className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors group">
                    <span className="material-icons-round group-hover:-translate-x-1 transition-transform">chevron_left</span>
                    <div className="hidden sm:block">
                      <div className="text-[10px] uppercase">Oldingi</div>
                      <div className="text-sm font-bold truncate max-w-[150px]">{prevChapter.name}</div>
                    </div>
                  </Link>
                ) : <span />}

                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {currentIndex + 1} / {allChapters.length}
                </div>

                {nextChapter ? (
                  <Link href={`/qoidalar/${topicId}/${nextChapter.id}`} className="flex items-center gap-2 text-white md:text-slate-900 md:dark:text-white hover:text-blue-500 transition-colors group">
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] uppercase">Keyingi</div>
                      <div className="text-sm font-bold truncate max-w-[150px]">{nextChapter.name}</div>
                    </div>
                    <span className="material-icons-round group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </Link>
                ) : <span />}
              </div>
            </div>
          )}
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
      `}</style>
    </div>
  )
}
