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
import { apiFetch } from '@/lib/apiClient'
import QuickPinchZoom, { make3dTransformValue } from 'react-quick-pinch-zoom'
import { useRef } from 'react'

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
  const { lang } = useLanguage()

  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [zoomedImage, setZoomedImage] = useState(null)

  const imageRef = useRef(null)
  const onUpdate = useCallback(({ x, y, scale }) => {
    const { current: img } = imageRef
    if (img) {
      const value = make3dTransformValue({ x, y, scale })
      img.style.setProperty('transform', value)
    }
  }, [])

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiFetch(`/favorites/?t=${Date.now()}`, { cache: 'no-store' })
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
      if (!Array.isArray(data) || data.length === 0) {
        setQuestions([])
        return
      }
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
  }, [lang])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const userToken = localStorage.getItem('userToken');
      if (userToken) {
        fetchFavorites()
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
      await apiFetch(`/favorites/toggle`, {
        method: 'POST',
        body: JSON.stringify({
          uid: user.uid,
          questionId: numId,
        }),
      })
    } catch (e) {
      console.error("Sevimlilardan o'chirishda xatolik:", e)
      fetchFavorites() // Xato bo'lsa qaytarib yuklaymiz
    }
  }

  const handleStartPractice = () => {
    if (!count) return
    router.push('/exam?mode=favorites')
  }

  return (
    <div className="min-h-screen bg-[#161c24] md:bg-slate-50 md:dark:bg-[#161821] page-bg text-white md:text-slate-900 md:dark:text-white flex flex-col font-sans transition-colors duration-200">
      <QoidalarSidebar />

      <div className="lg:ml-72 min-h-screen flex flex-col">
        <QoidalarHeader title="Sevimli savollar" />

        <main className="flex-1 px-4 lg:px-8 py-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-bold text-white">Saqlangan savollar ro&apos;yxati</h2>
              <button
                onClick={handleStartPractice}
                disabled={!count}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[14px] bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all"
              >
                <Icon name="Star" className="w-4 h-4" />
                Mashqni boshlash
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-[#9AA4B2]">
                Yuklanmoqda...
              </div>
            ) : !count ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-[20px] bg-[#212936] md:bg-white md:dark:bg-[#1e2130] border border-dashed border-[#313C50] md:border-slate-300 md:dark:border-white/10 flex items-center justify-center mb-5">
                  <Icon name="Star" className="w-8 h-8 text-[#9AA4B2] md:text-slate-400 md:dark:text-slate-500" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Hozircha sevimli savollar yo&apos;q</h3>
                <p className="text-sm text-[#9AA4B2] mb-6 max-w-sm">
                  Imtihon yoki biletlar sahifasida savollar yonidagi belgi orqali ularni sevimlilarga saqlab oling va bu yerda mashq qiling.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-[16px] bg-[#313C50] hover:bg-[#3b475c] text-white text-sm font-bold transition-colors"
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
                    className="group rounded-[24px] bg-[#212936] md:bg-white md:dark:bg-[#1e2130] border border-[#313C50] md:border-slate-200 md:dark:border-white/10 hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer overflow-hidden flex flex-col"
                  >
                    <div className="relative w-full h-32 md:h-36 bg-[#161c24] md:bg-slate-100 md:dark:bg-black/40">
                      <Image
                        src={q.image || '/imgage/background.jpg'}
                        alt="Savol rasmi"
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized={q.image?.startsWith?.('http')}
                      />

                      <div className="absolute top-3 left-3 inline-flex items-center justify-center px-3 py-1 rounded-[8px] bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-bold shadow-sm">
                        #{idx + 1}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <p className="text-[15px] text-white md:text-slate-700 md:dark:text-slate-100 leading-relaxed font-medium">
                        {q.question.length > 80 ? q.question.substring(0, 80) + '...' : q.question}
                      </p>
                      <div className="mt-auto pt-4 flex items-center justify-between text-[13px] font-bold">
                        <span className="text-blue-500 transition-colors">Yechish</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFromFavorites(q.numeric_id ?? q.id)
                          }}
                          className="px-3 py-2 rounded-[12px] bg-[#313C50] hover:bg-red-500/20 text-[#9AA4B2] hover:text-red-400 transition-colors"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 px-2 py-4 sm:p-4 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white dark:bg-[#181b2b] border border-slate-200 dark:border-white/10 rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-[#1e2130]">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-600/30 text-blue-600 dark:text-blue-200 text-xs font-bold">
                    Fav
                  </span>
                  <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-slate-200">Saqlangan savol</h3>
                </div>
                <button
                  onClick={() => setSelectedQuestion(null)}
                  className="w-8 h-8 rounded-full bg-white dark:bg-[#252836] hover:bg-slate-200 dark:hover:bg-[#2f3345] border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-slate-300 transition-colors"
                >
                  <Icon name="Close" className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {selectedQuestion.image && (
                  <div className="relative w-full bg-slate-50 dark:bg-black flex items-center justify-center border-b border-slate-200 dark:border-white/5">
                    <div 
                      className="relative w-full h-[300px] sm:h-[400px] md:h-[550px] cursor-pointer"
                      onClick={() => setZoomedImage(selectedQuestion.image)}
                    >
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

                <div className="p-6 space-y-6">
                  <p className="text-lg md:text-xl font-medium text-slate-900 dark:text-slate-50 leading-relaxed">
                    {selectedQuestion.question}
                  </p>

                  {Array.isArray(selectedQuestion.options) && selectedQuestion.options.length > 0 && (
                    <div className="space-y-3">
                      {selectedQuestion.options.map((opt, idx) => {
                        const isCorrect = !!opt.is_correct

                        let containerClass = 'group w-full rounded-xl border px-5 py-3.5 text-base flex items-center transition-all duration-200 '
                        let labelClass = 'inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold mr-4 shrink-0 transition-colors '
                        let textClass = 'flex-1 text-left font-medium '

                        if (isCorrect) {
                          containerClass += 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/50 text-emerald-900 dark:text-white shadow-sm'
                          labelClass += 'bg-emerald-200 dark:bg-emerald-600 text-emerald-800 dark:text-white border border-emerald-300 dark:border-emerald-400'
                        } else {
                          containerClass += 'bg-slate-50 dark:bg-[#202335] border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-300 dark:opacity-60'
                          labelClass += 'bg-white dark:bg-[#272b3f] text-slate-400 dark:text-slate-400 border border-slate-200 dark:border-white/5 shadow-sm'
                        }

                        return (
                          <div key={idx} className={containerClass}>
                            <div className={labelClass}>F{idx + 1}</div>
                            <div className="flex-1 flex items-center justify-between gap-3">
                              <div className={textClass}>{opt.option}</div>
                              {isCorrect && (
                                <div className="flex items-center gap-2 shrink-0 animate-in fade-in slide-in-from-right-2">
                                  <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 uppercase tracking-wide">
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
                    <div className="mt-6 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-5 flex items-start gap-4">
                      <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg shrink-0 text-amber-600 dark:text-amber-400">
                        <Icon name="Bulb" className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold mb-1.5">
                          Izoh
                        </p>
                        <p className="text-base text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
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

        {/* IMAGE ZOOM MODAL */}
        {zoomedImage && (
          <div 
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300"
          >
            <button 
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 md:top-8 md:right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer z-[210]"
              title="Yopish"
            >
              <Icon name="Close" className="w-6 h-6" />
            </button>

            <div className="w-full h-full flex items-center justify-center p-4">
              <QuickPinchZoom onUpdate={onUpdate} tapZoomFactor={2} doubleTapZoomOutOnMaxScale>
                 <div ref={imageRef} className="relative w-[90vw] h-[90vh] md:w-[80vw] md:h-[80vh]">
                   <Image
                     src={zoomedImage}
                     alt="Zoomed Question Image"
                     fill
                     className="object-contain pointer-events-none"
                     unoptimized={zoomedImage?.startsWith?.('http')}
                   />
                 </div>
              </QuickPinchZoom>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}