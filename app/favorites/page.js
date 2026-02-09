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
  Star: () => <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />,
  Close: () => <path d="M6 18L18 6M6 6l12 12" />,
  Check: () => <path d="M5 13l4 4L19 7" />,
}

const Icon = ({ name, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {Icons[name] ? Icons[name]() : null}
  </svg>
)

export default function FavoritesPage() {
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [selectedQuestion, setSelectedQuestion] = useState(null)

  const fetchFavorites = useCallback(async (uid) => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/favorites/${uid}?t=${Date.now()}`, { cache: 'no-store' })
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
      if (!Array.isArray(data) || data.length === 0) {
        setQuestions([])
        return
      }
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
            is_correct: opt.isCorrect !== undefined ? opt.isCorrect : (opt.is_correct !== undefined ? opt.is_correct : false),
          })),
        }
      })
      setQuestions(transformed)
    } catch (e) {
      console.error("Sevimli savollarni yuklashda xatolik:", e)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }, [API_URL])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        await fetchFavorites(currentUser.uid)
      } else {
        router.push('/login')
      }
    })
    return () => unsubscribe()
  }, [router, fetchFavorites])

  const count = questions.length

  const removeFromFavorites = async (questionId) => {
    if (!user) return
    const numId = typeof questionId === 'number' ? questionId : Number(questionId)
    if (isNaN(numId)) return

    setQuestions((prev) => prev.filter((q) => Number(q.numeric_id ?? q.id) !== numId))
    
    try {
      await fetch(`${API_URL}/api/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          questionId: numId,
        }),
      })
    } catch (e) {
      console.error("Sevimlilardan o'chirishda xatolik:", e)
      fetchFavorites(user.uid) // Xato bo'lsa qaytarib yuklaymiz
    }
  }

  const handleStartPractice = () => {
    if (!count) return
    router.push('/exam?mode=favorites')
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
                Sevimli savollar
              </h1>
              <p className="text-[11px] md:text-xs text-slate-400">Saqlangan savollardan mashq qiling</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle size="sm" />
          <div className="px-3 py-1.5 rounded-lg bg-[#2a2d3e] border border-white/5 text-xs text-slate-300">
            Jami: <span className="font-bold text-white">{count}</span>
          </div>
          <button
            onClick={handleStartPractice}
            disabled={!count}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold shadow-lg shadow-blue-900/30"
          >
            <Icon name="Star" className="w-4 h-4" />
            Mashqni boshlash
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 lg:px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold">Saqlangan savollar ro&apos;yxati</h2>
            <button
              onClick={handleStartPractice}
              disabled={!count}
              className="sm:hidden inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold shadow-lg shadow-blue-900/30"
            >
              <Icon name="Star" className="w-4 h-4" />
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
                <Icon name="Star" className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Hozircha sevimli savollar yo&apos;q</h3>
              <p className="text-sm text-slate-400 mb-4 max-w-sm">
                Imtihon yoki biletlar sahifasida savollar yonidagi belgi orqali ularni sevimlilarga saqlab oling va bu yerda mashq qiling.
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
                  className="group rounded-2xl bg-[#1e2130] border border-white/10 hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-900/30 transition-all cursor-pointer overflow-hidden flex flex-col"
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
                    <div className="absolute top-2 left-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-blue-600/80 text-[10px] font-semibold">
                      #{idx + 1}
                    </div>
                  </div>
                  <div className="p-3 flex flex-col gap-2 flex-1">
                    <p className="text-sm md:text-[15px] text-slate-100 leading-relaxed line-clamp-3">
                      {q.question}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>To&apos;liq ko&apos;rish</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFromFavorites(q.numeric_id ?? q.id)
                        }}
                        className="px-2 py-1 rounded-lg bg-[#252836] hover:bg-[#2f3345] border border-white/10 text-[10px] text-slate-300"
                      >
                        O&apos;chirish
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-2 py-4 sm:p-4 backdrop-blur-sm">
          <div className="bg-[#181b2b] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#1e2130]">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-600/30 text-blue-200 text-xs font-bold">
                  Fav
                </span>
                <h3 className="text-sm md:text-base font-semibold text-slate-200">Saqlangan savol</h3>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="w-8 h-8 rounded-full bg-[#252836] hover:bg-[#2f3345] flex items-center justify-center text-slate-300 transition-colors"
              >
                <Icon name="Close" className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {selectedQuestion.image && (
                <div className="relative w-full bg-black flex items-center justify-center border-b border-white/5">
                  <div className="relative w-full h-[300px] sm:h-[400px] md:h-[550px]">
                    <Image
                      src={selectedQuestion.image}
                      alt="Savol rasmi"
                      fill
                      className="object-contain"
                      unoptimized={selectedQuestion.image?.startsWith?.('http')}
                    />
                  </div>
                </div>
              )}

              <div className="p-5 space-y-5">
                <p className="text-base md:text-xl font-medium text-slate-50 leading-relaxed">
                  {selectedQuestion.question}
                </p>

                {Array.isArray(selectedQuestion.options) && selectedQuestion.options.length > 0 && (
                  <div className="space-y-3">
                    {selectedQuestion.options.map((opt, idx) => {
                      const isCorrect = !!opt.is_correct
                      
                      let containerClass = 'group w-full rounded-xl border px-4 py-3 text-base flex items-center transition-all duration-200 '
                      let labelClass = 'inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold mr-4 shrink-0 transition-colors '
                      let textClass = 'flex-1 text-left font-medium '

                      if (isCorrect) {
                        containerClass += 'bg-emerald-500/20 border-emerald-500/50 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                        labelClass += 'bg-emerald-600 text-white border border-emerald-400'
                      } else {
                        containerClass += 'bg-[#202335] border-white/5 text-slate-300 opacity-60'
                        labelClass += 'bg-[#272b3f] text-slate-400 border border-white/5'
                      }

                      return (
                        <div key={idx} className={containerClass}>
                          <div className={labelClass}>F{idx + 1}</div>
                          <div className="flex-1 flex items-center justify-between gap-3">
                            <div className={textClass}>{opt.option}</div>
                            {isCorrect && (
                              <div className="flex items-center gap-2 shrink-0 animate-in fade-in slide-in-from-right-2">
                                <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-emerald-500/20 text-[11px] font-bold text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                                  To&apos;g&apos;ri javob
                                </span>
                                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/40">
                                   <Icon name="Check" className="w-4 h-4 stroke-[3]" />
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
                  <div className="mt-6 rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-start gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
                      <Icon name="Bulb" className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-amber-400 font-bold mb-1">
                        Izoh
                      </p>
                      <p className="text-sm md:text-base text-slate-200 leading-relaxed">
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