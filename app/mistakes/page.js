'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import ThemeToggle from '@/components/ThemeToggle'

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
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [selectedQuestion, setSelectedQuestion] = useState(null)

  const fetchMistakes = useCallback(
    async (uid) => {
      try {
        setLoading(true)
        const res = await fetch(`${API_URL}/api/mistakes/${uid}`)
        if (!res.ok) throw new Error('API xatolik')
        const { questionIds } = await res.json()
        if (!Array.isArray(questionIds) || questionIds.length === 0) {
          setQuestions([])
          return
        }
        const idsString = questionIds.join(',')
        const testsRes = await fetch(`${API_URL}/api/tests?lang=uzl&ids=${idsString}`)
        if (!testsRes.ok) throw new Error('Tests API xatolik')
        const data = await testsRes.json()
        if (Array.isArray(data) && data.length > 0) {
          const transformed = data.map((item) => {
            let imageUrl = ''
            if (item.image && item.image.trim() !== '') {
              imageUrl = item.image.startsWith('http') ? item.image : `${API_URL}/uploads/${item.image}`
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
    [API_URL]
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
    <div className="min-h-screen bg-[#161821] page-bg text-white flex flex-col font-sans">
      <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-[#1e2130] header-bg border-b border-white/5 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-lg bg-[#2a2d3e] hover:bg-[#35394b] flex items-center justify-center text-slate-300"
          >
            <Icon name="ArrowLeft" className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Image src="/imgage/avtotest-logo.png" alt="Logo" width={32} height={32} className="rounded-lg object-contain" />
            <div className="flex flex-col leading-tight">
              <h1 className="text-base md:text-lg font-bold text-white">
                Xatolar rejimi
              </h1>
              <p className="text-[11px] md:text-xs text-slate-400">Noto&apos;g&apos;ri javob bergan savollardan mashq qiling</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle size="sm" />
          <div className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-xs text-rose-300">
            Jami: <span className="font-bold text-white">{count}</span>
          </div>
          <button
            onClick={handleStartPractice}
            disabled={!count}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold shadow-lg shadow-rose-900/30"
          >
            <Icon name="Wrong" className="w-4 h-4" />
            Mashqni boshlash
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 lg:px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold">Xatolik qilingan savollar</h2>
            <button
              onClick={handleStartPractice}
              disabled={!count}
              className="sm:hidden inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold shadow-lg shadow-rose-900/30"
            >
              <Icon name="Wrong" className="w-4 h-4" />
              Mashqni boshlash
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              Yuklanmoqda...
            </div>
          ) : !count ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-[#1e2130] border border-dashed border-white/10 flex items-center justify-center mb-4">
                <Icon name="Wrong" className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Hozircha xatolar yo&apos;q</h3>
              <p className="text-sm text-slate-400 mb-4 max-w-sm">
                Imtihon yoki biletlarda noto&apos;g&apos;ri javob berganingizda savol avtomatik ravishda shu ro&apos;yxatga qo&apos;shiladi va keyin mashq qilishingiz mumkin.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold"
              >
                Dashboardga qaytish
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {questions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  onClick={() => setSelectedQuestion(q)}
                  className="group rounded-2xl bg-[#1e2130] border border-rose-500/20 hover:border-rose-500/50 hover:shadow-lg hover:shadow-rose-900/20 transition-all cursor-pointer overflow-hidden flex flex-col"
                >
                  <div className="relative w-full h-32 md:h-36 bg-black/40">
                    <Image
                      src={q.image || '/imgage/background.jpg'}
                      alt="Savol rasmi"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized={q.image?.startsWith?.('http')}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute top-2 left-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-rose-600/80 text-[10px] font-semibold">
                      Xato #{idx + 1}
                    </div>
                  </div>
                  <div className="p-3 flex flex-col gap-2 flex-1">
                    <p className="text-sm md:text-[15px] text-slate-100 leading-relaxed line-clamp-3">
                      {q.question}
                    </p>
                    {/* {q.explanation && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5 line-clamp-2">
                        <Icon name="Bulb" className="w-3.5 h-3.5" />
                        {q.explanation}
                      </p>
                    )} */}
                    <div className="mt-2 flex items-center justify-end text-[11px] text-slate-500">
                      <span>To&apos;liq ko&apos;rish</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
          <div className="bg-[#181b2b] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-600/30 text-rose-200 text-xs font-bold">
                  Xato
                </span>
                <h3 className="text-sm md:text-base font-semibold">Noto&apos;g&apos;ri javob berilgan savol</h3>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="w-8 h-8 rounded-full bg-[#252836] hover:bg-[#2f3345] flex items-center justify-center text-slate-300"
              >
                <Icon name="Close" className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {selectedQuestion.image && (
                <div className="relative w-full h-72 md:h-80 bg-black">
                  <Image
                    src={selectedQuestion.image}
                    alt="Savol rasmi"
                    fill
                    className="object-contain"
                    unoptimized={selectedQuestion.image?.startsWith?.('http')}
                  />
                </div>
              )}
              <div className="p-5 space-y-4">
                <p className="text-base md:text-lg text-slate-50 leading-relaxed">
                  {selectedQuestion.question}
                </p>

                {Array.isArray(selectedQuestion.options) && selectedQuestion.options.length > 0 && (
                  <div className="space-y-2">
                    {selectedQuestion.options.map((opt, idx) => {
                      const isCorrect = !!opt.is_correct
                      let containerClass =
                        'w-full rounded-xl border px-4 py-2.5 text-sm md:text-base flex items-center '
                      let labelClass =
                        'inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold mr-3 '
                      let textClass = 'flex-1 text-left '

                      if (isCorrect) {
                        containerClass += 'bg-emerald-500/15 border-emerald-400 text-emerald-50 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        labelClass += 'bg-emerald-600/70 text-emerald-50 border border-emerald-300'
                      } else {
                        containerClass += 'bg-[#202335] border-white/10 text-slate-100'
                        labelClass += 'bg-[#272b3f] text-slate-300 border border-white/10'
                      }

                      return (
                        <div key={idx} className={containerClass}>
                          <div className={labelClass}>F{idx + 1}</div>
                          <div className="flex-1 flex items-center justify-between gap-2">
                            <div className={textClass}>{opt.option}</div>
                            {isCorrect && (
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/25 text-[10px] font-semibold text-emerald-50 border border-emerald-300/70">
                                  To&apos;g&apos;ri javob
                                </span>
                                <Icon name="Check" className="w-5 h-5 text-emerald-300" />
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {selectedQuestion.explanation && (
                  <div className="mt-4 rounded-xl bg-[#121422] border border-amber-500/40 px-4 py-3 flex items-start gap-2">
                    <Icon name="Bulb" className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-amber-400 font-semibold mb-1">
                        Izoh
                      </p>
                      <p className="text-sm text-slate-100 leading-relaxed">
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
  )
}
