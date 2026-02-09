'use client'

import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import ThemeToggle from '@/components/ThemeToggle'

const QUESTIONS_PER_TICKET = 10

const Icons = {
  ArrowLeft: () => <path d="M19 12H5m7 7l-7-7 7-7" />,
  ArrowRight: () => <path d="M5 12h14m-7 7l7-7-7-7" />,
  Bulb: () => <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548 5.478a1 1 0 01-.994.9h-4.286a1 1 0 01-.994-.9L5.5 12z" />,
  Check: () => <path d="M5 13l4 4L19 7" />,
  Close: () => <path d="M6 18L18 6M6 6l12 12" />,
  Correct: () => <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  Wrong: () => <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
}

const Icon = ({ name, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {Icons[name]()}
  </svg>
)

async function saveBiletResultToApi(apiUrl, uid, ticketId, correct, total) {
  try {
    const res = await fetch(`${apiUrl}/api/bilet-progress/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, ticketId, correct, total })
    })
    if (!res.ok) throw new Error('API xatolik')
  } catch (e) {
    console.error('Bilet natijasini saqlashda xatolik:', e)
  }
}

export default function BiletTicketPage() {
  const router = useRouter()
  const params = useParams()
  const ticketId = useMemo(() => parseInt(params?.ticketId, 10) || 1, [params?.ticketId])
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

  const [questions, setQuestions] = useState([])
  const [lang, setLang] = useState('uz-lotin')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isFinished, setIsFinished] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [resultSaved, setResultSaved] = useState(false)
  const [timerTick, setTimerTick] = useState(0)
  const [savedIds, setSavedIds] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const scrollRef = useRef(null)
  const startTimeRef = useRef(null)
  const endTimeRef = useRef(null)

  const getLangCode = (l) => {
    if (l === 'Uzb (kirill)') return 'uzk'
    if (l === 'Русский') return 'ru'
    return 'uzl'
  }

  const transformQuestion = (item) => {
    let imageUrl = ''
    if (item.image && item.image.trim() !== '') {
      imageUrl = item.image.startsWith('http') ? item.image : `${API_URL}/uploads/${item.image}`
    }
    return {
      id: (typeof item.id === 'number' ? item.id : item._id) || item.id || item._id,
      numeric_id: typeof item.id === 'number' ? item.id : (item.id ?? item._id),
      question: item.question,
      image: imageUrl,
      explanation: item.explanation || "Izoh mavjud emas.",
      options: item.options.map((opt) => ({
        option: opt.text || opt.option || opt.answer || "Matn yo'q",
        is_correct: (opt.isCorrect !== undefined) ? opt.isCorrect : (opt.is_correct !== undefined ? opt.is_correct : false),
      })),
    }
  }

  // Bilet yuklash (ticketId o'zgaganda)
  useEffect(() => {
    const fetchTests = async () => {
      setAnswers({})
      setResultSaved(false)
      try {
        const startId = (ticketId - 1) * QUESTIONS_PER_TICKET + 1
        const endId = ticketId * QUESTIONS_PER_TICKET
        const ids = []
        for (let i = startId; i <= endId; i++) ids.push(i)
        const idsString = ids.join(',')
        const langCode = getLangCode(lang)
        const url = `${API_URL}/api/tests?lang=${langCode}&ids=${idsString}`
        const res = await fetch(url)
        if (!res.ok) throw new Error('API xatolik')
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const transformedData = data.map(transformQuestion)
          setQuestions(transformedData)
          startTimeRef.current = Date.now()
        }
      } catch (err) {
        console.error("Xatolik:", err)
      }
    }
    fetchTests()
  }, [ticketId, API_URL])

  // Til o'zgarganda: faqat savol matnlarini yangilash (savollar va javoblar o'zgarmaydi)
  const idsRef = useRef([])
  useEffect(() => {
    if (questions.length === 0) return
    const startId = (ticketId - 1) * QUESTIONS_PER_TICKET + 1
    const endId = ticketId * QUESTIONS_PER_TICKET
    const ids = []
    for (let i = startId; i <= endId; i++) ids.push(i)
    idsRef.current = ids
  }, [ticketId, questions.length])

  // Til o'zgarganda: savollar va javoblar o'zgarmaydi, faqat matn (tarjima) yangilanadi
  const prevLangBiletRef = useRef(lang)
  useEffect(() => {
    if (prevLangBiletRef.current === lang || questions.length === 0) {
      prevLangBiletRef.current = lang
      return
    }
    prevLangBiletRef.current = lang
    const ids = idsRef.current.length > 0 ? idsRef.current : questions.map((q) => q.numeric_id ?? q.id).filter(Boolean)
    if (ids.length === 0) return
    const idsString = ids.join(',')
    const langCode = getLangCode(lang)
    fetch(`${API_URL}/api/tests?lang=${langCode}&ids=${idsString}`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return
        const transformed = data.map(transformQuestion)
        // Tartib va javoblarni saqlab, faqat savol/option/explanation matnlarini yangilaymiz
        setQuestions((prev) =>
          prev.map((q) => {
            const fromApi = transformed.find((x) => x.id == q.id || x.numeric_id == q.numeric_id)
            if (!fromApi) return q
            return {
              ...q,
              question: fromApi.question,
              explanation: fromApi.explanation,
              options: q.options.map((opt, j) => ({ ...opt, option: fromApi.options[j]?.option ?? opt.option })),
            }
          })
        )
      })
      .catch((err) => console.error('Til yangilashda xatolik:', err))
  }, [lang])

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  const resultElapsedSeconds = (endTimeRef.current != null && startTimeRef.current != null)
    ? Math.floor((endTimeRef.current - startTimeRef.current) / 1000)
    : 0
  const resultTimeStr = formatTime(resultElapsedSeconds)

  // User va saqlangan savollar ro'yxati
  const loadSavedIds = useCallback(
    async (uid) => {
      try {
        const res = await fetch(`${API_URL}/api/favorites/${uid}`)
        if (!res.ok) throw new Error('API xatolik')
        const { questionIds } = await res.json()
        if (Array.isArray(questionIds)) {
          setSavedIds(questionIds)
        } else {
          setSavedIds([])
        }
      } catch (e) {
        console.error("Saqlangan savollarni yuklashda xatolik:", e)
        setSavedIds([])
      }
    },
    [API_URL]
  )

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null)
      if (user) {
        loadSavedIds(user.uid)
      } else {
        setSavedIds([])
        router.push('/login')
      }
    })
    return () => unsubscribe()
  }, [loadSavedIds, router])

  useEffect(() => {
    if (questions.length === 0 || isFinished) return
    const id = setInterval(() => setTimerTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [questions.length, isFinished])

  useEffect(() => {
    if (scrollRef.current?.children[currentIndex]) {
      scrollRef.current.children[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
    setShowExplanation(false)
  }, [currentIndex])

  const currentQuestion = questions[currentIndex]
  const isCurrentFavorite = useMemo(() => {
    if (!currentQuestion) return false
    const qId = currentQuestion.numeric_id ?? currentQuestion.id
    if (qId == null) return false
    return savedIds.some((id) => Number(id) === Number(qId))
  }, [currentQuestion, savedIds])

  const toggleCurrentFavorite = async () => {
    if (!currentQuestion || !currentUser) return
    const questionId = currentQuestion.numeric_id ?? currentQuestion.id
    if (questionId == null) return
    const numId = Number(questionId)
    if (isNaN(numId)) return
    const alreadySaved = savedIds.some((id) => Number(id) === numId)

    setSavedIds((prev) =>
      alreadySaved ? prev.filter((id) => Number(id) !== numId) : [...prev, numId]
    )

    try {
      await fetch(`${API_URL}/api/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: currentUser.uid,
          questionId: numId,
        }),
      })
    } catch (e) {
      console.error("Sevimli saqlashda xatolik:", e)
      setSavedIds((prev) =>
        alreadySaved ? [...prev, numId] : prev.filter((id) => Number(id) !== numId)
      )
    }
  }
  const stats = useMemo(() => {
    let correct = 0, incorrect = 0
    Object.entries(answers).forEach(([qId, optIdx]) => {
      const q = questions.find(item => item.id == qId)
      if (q) q.options[optIdx]?.is_correct ? correct++ : incorrect++
    })
    return { correct, incorrect }
  }, [answers, questions])

  const answeredCount = Object.keys(answers).length
  const allAnswered = questions.length > 0 && answeredCount >= questions.length

  useEffect(() => {
    if (allAnswered && !isFinished) {
      endTimeRef.current = Date.now()
      setIsFinished(true)
    }
  }, [allAnswered, isFinished])

  useEffect(() => {
    if (isFinished && questions.length > 0 && !resultSaved) {
      const saveResult = async () => {
        if (currentUser?.uid) {
          await saveBiletResultToApi(API_URL, currentUser.uid, ticketId, stats.correct, questions.length)
          const elapsed = (endTimeRef.current && startTimeRef.current)
            ? Math.floor((endTimeRef.current - startTimeRef.current) / 1000) : 0
          fetch(`${API_URL}/api/exam-history/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: currentUser.uid,
              type: 'bilet',
              correct: stats.correct,
              total: questions.length,
              durationSeconds: elapsed,
              status: 'tugallangan',
              ticketId,
            }),
          }).catch(() => {})
        }
        setResultSaved(true)
      }
      saveResult()
    }
  }, [isFinished, questions.length, ticketId, stats.correct, resultSaved, currentUser?.uid, API_URL])

  const getNumericId = (questionId) => {
    const q = questions.find((item) => item.id == questionId || item.numeric_id == questionId)
    return q?.numeric_id ?? q?.id ?? questionId
  }

  const saveMistakeToApi = async (questionId) => {
    if (!currentUser?.uid) return
    const numericId = getNumericId(questionId)
    if (numericId == null) return
    try {
      await fetch(`${API_URL}/api/mistakes/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: currentUser.uid, questionId: numericId })
      })
    } catch (e) {
      console.error('Xatoni saqlashda xatolik:', e)
    }
  }

  const saveMasteryCorrect = async (questionId) => {
    if (!currentUser?.uid) return
    const numericId = getNumericId(questionId)
    if (numericId == null) return
    try {
      await fetch(`${API_URL}/api/mastery/correct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: currentUser.uid, questionId: numericId })
      })
    } catch (e) {
      console.error('Mastery saqlashda xatolik:', e)
    }
  }

  const saveMasteryIncorrect = async (questionId) => {
    if (!currentUser?.uid) return
    const numericId = getNumericId(questionId)
    if (numericId == null) return
    try {
      await fetch(`${API_URL}/api/mastery/incorrect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: currentUser.uid, questionId: numericId })
      })
    } catch (e) {
      console.error('Mastery yangilashda xatolik:', e)
    }
  }

  const selectAnswer = (questionId, optionIndex) => {
    if (isFinished || typeof answers[questionId] === 'number') return
    const isCorrect = questions.find(item => item.id == questionId)?.options[optionIndex]?.is_correct
    if (isCorrect) {
      saveMasteryCorrect(questionId)
    } else {
      saveMasteryIncorrect(questionId)
      saveMistakeToApi(questionId)
    }
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
    if (currentIndex < questions.length - 1) setTimeout(() => setCurrentIndex(prev => prev + 1), 400)
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-[#1e2130] text-slate-400 flex items-center justify-center">
        Yuklanmoqda...
      </div>
    )
  }

  const finishPercent = questions.length > 0 ? Math.round((stats.correct / questions.length) * 100) : 0

  if (isFinished) {
    return (
      <div className="min-h-screen bg-[#161821] text-white flex flex-col items-center justify-center p-6">
        <div className="bg-[#1e2130] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-white mb-2">Bilet #{ticketId} yakunlandi</h2>
          <p className="text-slate-400 mb-6">Barcha savollar javoblangan.</p>
          <div className="text-4xl font-bold text-white mb-1">{stats.correct}/{questions.length}</div>
          <p className="text-slate-400 mb-2">To&apos;g&apos;ri javob</p>
          <div className="text-3xl font-bold text-brand-cyan mb-2">{finishPercent}%</div>
          <p className="text-slate-400 text-sm mb-6">Sarflangan vaqt: <span className="text-white font-semibold">{resultTimeStr}</span></p>
          <Link
            href="/biletlar"
            className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium"
          >
            Biletlar ro&apos;yxatiga qaytish
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#161821] page-bg text-white overflow-hidden font-sans">
      <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-[#1e2130] header-bg border-b border-white/5 shrink-0 z-50">
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/biletlar" className="flex items-center space-x-2">
            <Image src="/imgage/avtotest-logo.png" alt="Logo" width={36} height={36} className="rounded-lg object-contain" />
            <div className="hidden sm:flex flex-col leading-tight">
              <h1 className="text-base md:text-lg font-bold text-white">Pravachi<span className="text-brand-cyan">UZ</span></h1>
              <p className="text-[11px] md:text-xs text-slate-400">Bilet #{ticketId}</p>
            </div>
          </Link>
          <div className="hidden md:flex bg-[#2a2d3e] p-1.5 rounded-lg shrink-0">
            {[
              { label: 'Uzb (lotin)', code: 'uzl' },
              { label: 'Uzb (kirill)', code: 'uzk' },
              { label: 'Русский', code: 'ru' }
            ].map((item) => (
              <button
                key={item.code}
                onClick={() => setLang(item.label)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  lang === item.label || (lang === 'uz-lotin' && item.code === 'uzl')
                    ? 'bg-[#3e4255] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <ThemeToggle size="sm" className="hidden md:flex" />
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-3 bg-[#2a2d3e] px-3 py-1.5 rounded-lg border border-white/5">
            <div className="flex items-center text-emerald-400 text-sm font-bold space-x-1">
              <Icon name="Correct" className="w-4 h-4" />
              <span>{stats.correct}</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center text-rose-400 text-sm font-bold space-x-1">
              <Icon name="Wrong" className="w-4 h-4" />
              <span>{stats.incorrect}</span>
            </div>
          </div>
          <button
            onClick={toggleCurrentFavorite}
            className={`hidden sm:flex items-center justify-center w-9 h-9 rounded-lg border transition-colors ${
              isCurrentFavorite
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-[#2a2d3e] border-white/10 text-slate-400 hover:text-white hover:border-amber-400'
            }`}
            title={isCurrentFavorite ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
          >
            <Icon name="Bulb" className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2a2d3e] border border-white/5">
            <span className="text-slate-400 text-xs">Vaqt</span>
            <span className="font-mono font-bold text-base text-white">{formatTime(timerTick)}</span>
          </div>
          <div className="text-xs text-slate-400">
            Savol: <span className="font-bold text-white text-base">{currentIndex + 1}</span>/{questions.length}
          </div>
        </div>
      </header>

      <div className="question-bar bg-blue-700 px-6 py-5 shadow-lg shrink-0 z-40 relative flex items-center min-h-[80px]">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:flex w-8 h-8 rounded-full bg-white/10 items-center justify-center border border-white/20">
          <span className="text-sm font-bold">?</span>
        </div>
        <h2 className="question-bar-text w-full text-center text-base md:text-xl font-medium text-white leading-relaxed max-w-5xl mx-auto">
          {currentQuestion.question}
        </h2>
      </div>

      <main className="flex-1 flex overflow-hidden relative">
        <aside className="options-panel w-full md:w-[400px] lg:w-[450px] bg-[#1a1d2d] flex flex-col border-r border-white/5 overflow-y-auto p-5 shrink-0 z-30">
          <div className="space-y-3 flex-1">
            {currentQuestion.options.map((opt, idx) => {
              const selected = answers[currentQuestion.id] === idx
              const isCorrect = opt.is_correct
              const hasAnswer = typeof answers[currentQuestion.id] === 'number'
              let containerClass = "group relative w-full text-left p-0 rounded-xl border transition-all duration-200 overflow-hidden flex items-stretch min-h-[56px] "
              let labelClass = "w-14 flex items-center justify-center text-base font-bold border-r "
              let textClass = "flex-1 px-5 py-3 text-base leading-snug flex items-center "
              if (hasAnswer || isFinished) {
                if (isCorrect) {
                  containerClass += "bg-emerald-500/10 border-emerald-500/50"
                  labelClass += "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  textClass += "text-emerald-100"
                } else if (selected && !isCorrect) {
                  containerClass += "bg-rose-500/10 border-rose-500/50"
                  labelClass += "bg-rose-500/20 text-rose-400 border-rose-500/30"
                  textClass += "text-rose-100"
                } else {
                  containerClass += "bg-[#252836] border-white/5 opacity-50"
                  labelClass += "bg-[#2d3042] text-slate-500 border-white/5"
                  textClass += "text-slate-400"
                }
              } else {
                if (selected) {
                  containerClass += "bg-blue-600/20 border-blue-500"
                  labelClass += "bg-blue-600 text-white border-blue-500"
                  textClass += "text-white"
                } else {
                  containerClass += "bg-[#252836] border-[#34374a] hover:border-slate-500 hover:bg-[#2f3345]"
                  labelClass += "bg-[#2d3042] text-slate-400 border-[#34374a] group-hover:text-white group-hover:bg-[#3e4255]"
                  textClass += "text-slate-300 group-hover:text-white"
                }
              }
              const isDisabled = hasAnswer || isFinished
              return (
                <button
                  key={idx}
                  onClick={() => selectAnswer(currentQuestion.id, idx)}
                  disabled={isDisabled}
                  className={`${containerClass} ${isDisabled ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'}`}
                >
                  <div className={labelClass}>F{idx + 1}</div>
                  <div className={textClass}>
                    <span className="flex-1">{opt.option}</span>
                    {hasAnswer && isCorrect && <Icon name="Check" className="w-5 h-5 text-emerald-400 ml-2 shrink-0" />}
                    {hasAnswer && selected && !isCorrect && <Icon name="Close" className="w-5 h-5 text-rose-400 ml-2 shrink-0" />}
                  </div>
                </button>
              )
            })}
          </div>
          <div className="mt-6 space-y-3 pt-4 border-t border-white/5">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className={`w-full py-3.5 rounded-xl flex items-center justify-between px-5 font-semibold text-sm transition-all shadow-lg ${showExplanation ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-500 shadow-amber-900/20'}`}
            >
              <span className="flex items-center">
                <Icon name="Bulb" className="mr-2.5 w-5 h-5" />
                Izohni {showExplanation ? 'yashirish' : "ko'rish"}
              </span>
            </button>
          </div>
        </aside>
        <section className="flex-1 bg-black/40 relative flex items-center justify-center p-6 lg:p-10">
          <div className="relative w-full h-full">
            <Image
              src={currentQuestion.image && currentQuestion.image.trim() !== '' ? currentQuestion.image : '/imgage/background.jpg'}
              alt="Savol rasmi"
              fill
              className="object-contain"
              priority
              unoptimized={currentQuestion.image?.startsWith?.('http')}
            />
            {showExplanation && currentQuestion.explanation && (
              <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-2xl bg-[#161821]/95 backdrop-blur-md text-white p-6 rounded-2xl border border-white/10 shadow-2xl z-10">
                <h4 className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">Tushuntirish</h4>
                <p className="text-base leading-relaxed text-slate-200">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="h-20 bg-[#1e2130] border-t border-white/5 shrink-0 flex items-center px-4 relative z-50">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#2a2d3e] text-slate-400 hover:text-white hover:bg-[#35394b] disabled:opacity-30 transition-colors mr-4"
        >
          <Icon name="ArrowLeft" className="w-6 h-6" />
        </button>
        <div ref={scrollRef} className="flex-1 flex items-center gap-2 overflow-x-auto px-2 mx-2 no-scrollbar scroll-smooth h-full py-4">
          {questions.map((q, idx) => {
            const answerIdx = answers[q.id]
            const isAnswered = typeof answerIdx === 'number'
            const isCurrent = idx === currentIndex
            const isCorrect = isAnswered && q.options[answerIdx]?.is_correct
            let btnClass = "min-w-[44px] h-11 rounded-lg text-base font-bold flex items-center justify-center border transition-all duration-300 "
            if (isCurrent) btnClass += "bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.6)] scale-110 z-10 ring-2 ring-blue-400/50"
            else if (isAnswered) {
              if (isCorrect) btnClass += "bg-emerald-600 border-emerald-500 text-white"
              else btnClass += "bg-rose-600 border-rose-500 text-white"
            } else btnClass += "bg-[#161821] border-[#2a2d3e] text-slate-500 hover:bg-[#2a2d3e] hover:text-slate-300"
            return (
              <button key={q.id} onClick={() => setCurrentIndex(idx)} className={btnClass}>
                {idx + 1}
              </button>
            )
          })}
        </div>
        <button
          onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
          disabled={currentIndex === questions.length - 1}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#2a2d3e] text-slate-400 hover:text-white hover:bg-[#35394b] disabled:opacity-30 transition-colors ml-4"
        >
          <Icon name="ArrowRight" className="w-6 h-6" />
        </button>
      </footer>
    </div>
  )
}
