'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import ThemeToggle from '@/components/ThemeToggle'
import QoidalarSidebar from '@/components/QoidalarSidebar'
import QoidalarHeader from '@/components/QoidalarHeader'
import { useLanguage } from '@/context/LanguageContext'
import { useI18n } from '@/lib/i18n'
import { apiFetch } from '@/lib/apiClient'

const Icons = {
  ArrowLeft: () => <path d="M19 12H5m7 7l-7-7 7-7" />,
  Bulb: () => <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548 5.478a1 1 0 01-.994.9h-4.286a1 1 0 01-.994-.9L5.5 12z" />,
  Wrong: () => <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  Close: () => <path d="M6 18L18 6M6 6l12 12" />,
  Check: () => <path d="M5 13l4 4L19 7" />,
}

const Icon = ({ name, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {Icons[name] ? Icons[name]() : null}
  </svg>
)

export default function MistakesPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const t = useI18n()

  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [selectedQuestion, setSelectedQuestion] = useState(null)

  const fetchMistakes = useCallback(
    async (uid) => {
      try {
        setLoading(true)
        const res = await apiFetch(`/mistakes/${uid}`)
        if (!res.ok) throw new Error('API xatolik')
        const { questionIds } = await res.json()
        if (!Array.isArray(questionIds) || questionIds.length === 0) {
          setQuestions([])
          return
        }
        const idsString = questionIds.join(',')
        const testsRes = await apiFetch(`/tests?lang=${lang || 'uzl'}&ids=${idsString}`)
        if (!testsRes.ok) throw new Error('Tests API xatolik')
        const data = await testsRes.json()
        if (Array.isArray(data) && data.length > 0) {
          const transformed = data.map((item) => {
            let imageUrl = ''
            if (item.image && item.image.trim() !== '') {
              imageUrl = item.image.startsWith('http') ? item.image : `${process.env.NEXT_PUBLIC_API_URL || 'https://api.pravachi.uz'}/uploads/${item.image}`
            }
            return {
              id: item._id || item.id,
              numeric_id: item.id ?? item._id,
              question: item.question,
              image: imageUrl,
              explanation: item.explanation || "Izoh mavjud emas.",
              options: (item.options || []).map((opt) => ({
                option: opt.text || opt.option || opt.answer || "Matn yo'q",
                is_correct:
                  opt.isCorrect !== undefined
                    ? opt.isCorrect
                    : opt.is_correct !== undefined
                      ? opt.is_correct
                      : false,
              })),
            }
          })
          setQuestions(transformed)
        } else {
          setQuestions([])
        }
      } catch (e) {
        console.error("Xatolarni yuklashda xatolik:", e)
        setQuestions([])
      } finally {
        setLoading(false)
      }
    },
    [lang]
  )

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        await fetchMistakes(currentUser.uid)
      } else {
        router.push('/login')
      }
    })
    return () => unsubscribe()
  }, [router, fetchMistakes])

  const count = questions.length

  const handleStartPractice = () => {
    if (!count) return
    router.push('/exam?mode=mistakes')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#161821] page-bg text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-200">
      <QoidalarSidebar />

      <div className="lg:ml-72 min-h-screen flex flex-col">
        <QoidalarHeader
          title={t('mistakes.title')}
          beforeDashboard={
            !loading && count > 0 ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-sm font-semibold border border-rose-200 dark:border-rose-800/50">
                {count} {t('mistakes.countBadge')}
              </span>
            ) : null
          }
        />

        <main className="flex-1 px-4 lg:px-8 py-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">{t('mistakes.pageTitle')}</h2>
              <button
                onClick={handleStartPractice}
                disabled={!count}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-lg shadow-rose-900/20 transition-all hover:shadow-rose-900/40"
              >
                <Icon name="Wrong" className="w-4 h-4" />
                {t('mistakes.startPractice')}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-400">
                {t('common.loading')}
              </div>
            ) : !count ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-[#1e2130] border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center mb-4">
                  <Icon name="Wrong" className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">{t('mistakes.emptyTitle')}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-sm">
                  {t('mistakes.emptyDesc')}
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-500/30"
                >
                  {t('mistakes.gotoDashboard')}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    onClick={() => setSelectedQuestion(q)}
                    className="group rounded-2xl bg-white dark:bg-[#1e2130] border border-slate-200 dark:border-rose-500/20 hover:border-rose-500/50 hover:shadow-lg hover:shadow-rose-900/20 transition-all cursor-pointer overflow-hidden flex flex-col"
                  >
                    <div className="relative w-full h-32 md:h-36 bg-slate-100 dark:bg-black/40">
                      <Image
                        src={q.image || '/imgage/background.jpg'}
                        alt="Savol rasmi"
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized={q.image?.startsWith?.('http')}
                      />

                      <div className="absolute top-2 left-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-rose-600/90 text-white text-[10px] font-semibold shadow-sm">
                        {t('mistakes.errorLabel')} #{idx + 1}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <p className="text-sm md:text-[15px] text-slate-700 dark:text-slate-100 leading-relaxed line-clamp-3 font-medium">
                        {q.question}
                      </p>
                      <div className="mt-auto pt-2 flex items-center justify-end text-[11px] text-slate-400 dark:text-slate-500 font-medium group-hover:text-rose-500 transition-colors">
                        <span>{t('mistakes.viewFull')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* MODAL: Savol va javoblari */}
        {selectedQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/75 px-4 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white dark:bg-[#181b2b] border border-slate-200 dark:border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-600/30 text-rose-600 dark:text-rose-200 text-xs font-bold">
                    <Icon name="Wrong" className="w-4 h-4" />
                  </span>
                  <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">{t('mistakes.modalTitle')}</h3>
                </div>
                <button
                  onClick={() => setSelectedQuestion(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#252836] hover:bg-slate-200 dark:hover:bg-[#2f3345] flex items-center justify-center text-slate-500 dark:text-slate-300 transition-colors"
                >
                  <Icon name="Close" className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {selectedQuestion.image && (
                  <div className="relative w-full h-64 md:h-80 bg-slate-50 dark:bg-black border-b border-slate-100 dark:border-white/5">
                    <Image
                      src={selectedQuestion.image}
                      alt="Savol rasmi"
                      fill
                      className="object-contain"
                      unoptimized={selectedQuestion.image?.startsWith?.('http')}
                    />
                  </div>
                )}
                <div className="p-6 space-y-6">
                  <p className="text-lg md:text-xl font-medium text-slate-900 dark:text-slate-50 leading-relaxed">
                    {selectedQuestion.question}
                  </p>

                  {Array.isArray(selectedQuestion.options) && selectedQuestion.options.length > 0 && (
                    <div className="space-y-3">
                      {selectedQuestion.options.map((opt, idx) => {
                        const isCorrect = !!opt.is_correct
                        let containerClass =
                          'w-full rounded-xl border px-5 py-3 text-sm md:text-base flex items-center transition-colors '
                        let labelClass =
                          'inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold mr-4 shrink-0 '
                        let textClass = 'flex-1 text-left font-medium '

                        if (isCorrect) {
                          containerClass += 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-400 text-emerald-800 dark:text-emerald-50 shadow-sm'
                          labelClass += 'bg-emerald-100 dark:bg-emerald-600/70 text-emerald-700 dark:text-emerald-50 border border-emerald-200 dark:border-emerald-300'
                        } else {
                          containerClass += 'bg-slate-50 dark:bg-[#202335] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-100'
                          labelClass += 'bg-white dark:bg-[#272b3f] text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-white/10 shadow-sm'
                        }

                        return (
                          <div key={idx} className={containerClass}>
                            <div className={labelClass}>F{idx + 1}</div>
                            <div className="flex-1 flex items-center justify-between gap-3">
                              <div className={textClass}>{opt.option}</div>
                              {isCorrect && (
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/25 text-[10px] font-bold text-emerald-600 dark:text-emerald-50 border border-emerald-200 dark:border-emerald-300/70 uppercase tracking-wide">
                                    {t('exam.correctAnswer')}
                                  </span>
                                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                    <Icon name="Check" className="w-3.5 h-3.5 stroke-[3]" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {selectedQuestion.explanation && (
                    <div className="mt-4 rounded-xl bg-amber-50 dark:bg-[#121422] border border-amber-200 dark:border-amber-500/40 p-4 flex items-start gap-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg shrink-0 text-amber-600 dark:text-amber-400">
                        <Icon name="Bulb" className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-amber-600 dark:text-amber-400 font-bold mb-1">
                          {t('mistakes.explanation')}
                        </p>
                        <p className="text-sm md:text-base text-slate-700 dark:text-slate-100 leading-relaxed">
                          {selectedQuestion.explanation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
