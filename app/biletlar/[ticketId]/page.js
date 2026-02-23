'use client'

import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import ThemeToggle from '@/components/ThemeToggle'
import { useExamSettings } from '@/context/ExamSettingsContext'
import { useLanguage } from '@/context/LanguageContext'
import { useI18n } from '@/lib/i18n'
import ExamSettingsModal from '@/components/ExamSettingsModal'
import ExamResult from '@/components/ExamResult'
import FeedbackModal from '@/components/FeedbackModal'

const QUESTIONS_PER_TICKET = 10

const Icons = {
  ArrowLeft: () => <path d="M19 12H5m7 7l-7-7 7-7" />,
  ArrowRight: () => <path d="M5 12h14m-7 7l7-7-7-7" />,
  Bulb: () => <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548 5.478a1 1 0 01-.994.9h-4.286a1 1 0 01-.994-.9L5.5 12z" />,
  Check: () => <path d="M5 13l4 4L19 7" />,
  Close: () => <path d="M6 18L18 6M6 6l12 12" />,
  Flag: () => <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />,
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

  const { settings } = useExamSettings()
  const { lang: globalLang, setLang: setGlobalLang } = useLanguage()
  const t = useI18n()
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  const [questions, setQuestions] = useState([])
  const [lang, setLang] = useState(globalLang) // globalLang bilan sinxron (uzl, uzk, ru)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
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

  const getLangCode = (l) => (['uzl', 'uzk', 'ru'].includes(l) ? l : 'uzl')

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
      options: item.options.map((opt, idx) => ({
        option: opt.text || opt.option || opt.answer || "Matn yo'q",
        is_correct: !!(opt.isCorrect === true || opt.is_correct === true || opt.correct === true),
        _oi: idx,
      })),
    }
  }

  // Global til o'zgarganda bilet tilini yangilash
  useEffect(() => {
    if (globalLang && globalLang !== lang) setLang(globalLang)
  }, [globalLang])

  // Bilet sahifada til o'zgarganda global tilni yangilash
  const handleSetLang = (code) => {
    setLang(code)
    setGlobalLang(code)
  }

  // Bilet yuklash (ticketId yoki lang o'zgaganda)
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
          const sorted = [...data].sort((a, b) => (a.id ?? a._id ?? 0) - (b.id ?? b._id ?? 0))
          let transformedData = sorted.map(transformQuestion)

          if (settings.shuffleOptions) {
            transformedData = transformedData.map(q => ({
              ...q,
              options: [...q.options].sort(() => Math.random() - 0.5),
            }))
          }

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
        const sorted = [...data].sort((a, b) => (a.id ?? a._id ?? 0) - (b.id ?? b._id ?? 0))
        const transformed = sorted.map(transformQuestion)
        // Tartib va javoblarni saqlab, faqat savol/option/explanation matnlarini yangilaymiz
        setQuestions((prev) =>
          prev.map((q) => {
            const fromApi = transformed.find((x) => x.id == q.id || x.numeric_id == q.numeric_id)
            if (!fromApi) return q
            return {
              ...q,
              question: fromApi.question,
              explanation: fromApi.explanation,
              options: q.options.map((opt) => {
                const origIdx = opt._oi ?? 0
                return { ...opt, option: fromApi.options[origIdx]?.option ?? opt.option }
              }),
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
    // Agar settings.showExplanation bo'lsa, har yangi savolda ochiq qolishi mumkin, 
    // lekin odatda yangi savolga o'tganda yopiladi, faqat javob berganda ochiladi.
    // Lakin user "Izohni ko'rsatish"ni yoqib qo'ygan bo'lsa, har doim ochiq turishini xohlasa:
    if (!settings.showExplanation) {
      setShowExplanation(false)
    }
  }, [currentIndex, settings.showExplanation])

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
        try {
          if (currentUser?.uid) {
            await saveBiletResultToApi(API_URL, currentUser.uid, ticketId, stats.correct, questions.length)
            const elapsed = (endTimeRef.current && startTimeRef.current)
              ? Math.floor((endTimeRef.current - startTimeRef.current) / 1000) : 0

            // Prepare details
            const details = questions.map(q => {
              const qId = q.numeric_id || q.id;
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === undefined ? false : q.options[userAnswer]?.is_correct;
              const correctAnswer = q.options.findIndex(o => o.is_correct);

              return {
                questionId: qId,
                userAnswer: userAnswer,
                correctAnswer: correctAnswer,
                isCorrect: isCorrect,
                questionData: {
                  question: q.question,
                  options: q.options,
                  media: { name: q.image ? q.image.split('/').pop() : null }
                }
              };
            });

            const saveRes = await fetch(`${API_URL}/api/exam-history/save`, {
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
                details: details
              }),
            })
            if (!saveRes.ok) console.error('Bilet natijasi saqlanmadi:', saveRes.status)
          }
        } catch (e) {
          console.error('Bilet saqlashda xatolik:', e)
        } finally {
          setResultSaved(true)
        }
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

    // Auto Next setting
    if (settings.autoNext && currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 400)
    }

    // Show Explanation setting
    if (settings.showExplanation) {
      setShowExplanation(true)
    }
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#161821] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-brand-cyan/30 border-t-brand-cyan animate-spin mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  const finishPercent = questions.length > 0 ? Math.round((stats.correct / questions.length) * 100) : 0

  const handleNextTicket = () => {
    // 70 is arbitrary total, usually ticket index increases
    router.push(`/biletlar/${ticketId + 1}`)
  }

  const handleRetryTicket = () => {
    // Refresh current ticket
    window.location.reload()
  }

  if (isFinished) {
    return (
      <ExamResult
        questions={questions}
        answers={answers}
        stats={stats}
        timeSpent={resultElapsedSeconds}
        mode="bilet"
        onRetry={handleRetryTicket}
        onNextTicket={ticketId < 70 ? handleNextTicket : null}
        title={`Bilet #${ticketId} Natijalari`}
        subtitle="Biletlar"
        ticketNumber={ticketId}
      />
    )
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-white overflow-hidden font-sans">
      <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white dark:bg-[#1e2130] border-b border-slate-200 dark:border-white/5 shrink-0 z-50">
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/biletlar" className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#2a2d3e] hover:bg-slate-200 dark:hover:bg-[#35394b] flex items-center justify-center text-slate-500 dark:text-slate-300 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m7 7l-7-7 7-7" /></svg>
          </Link>
          <div className="flex items-center gap-2">
            <Image src="/imgage/avtotest-logo.png" alt="Logo" width={32} height={32} className="rounded-lg object-contain" />
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">Bilet #{ticketId}</h1>
              <p className="text-[11px] text-slate-500">{t('exam.question')} {currentIndex + 1}/{questions.length}</p>
            </div>
          </div>
          <div className="hidden md:flex bg-slate-100 dark:bg-[#2a2d3e] p-1.5 rounded-lg shrink-0">
            {[
              { label: 'Uzb (lotin)', code: 'uzl' },
              { label: 'Uzb (kirill)', code: 'uzk' },
              { label: 'Русский', code: 'ru' }
            ].map((item) => (
              <button
                key={item.code}
                onClick={() => handleSetLang(item.code)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${lang === item.code
                  ? 'bg-white dark:bg-[#3e4255] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <ThemeToggle size="sm" className="hidden md:flex" />
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-[#2a2d3e] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-3 bg-slate-100 dark:bg-[#2a2d3e] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5">
            <div className="flex items-center text-emerald-500 dark:text-emerald-400 text-sm font-bold space-x-1">
              <Icon name="Correct" className="w-4 h-4" />
              <span>{stats.correct}</span>
            </div>
            <div className="w-px h-4 bg-slate-300 dark:bg-white/10" />
            <div className="flex items-center text-rose-500 dark:text-rose-400 text-sm font-bold space-x-1">
              <Icon name="Wrong" className="w-4 h-4" />
              <span>{stats.incorrect}</span>
            </div>
          </div>
          <button
            onClick={toggleCurrentFavorite}
            className={`hidden sm:flex items-center justify-center w-9 h-9 rounded-lg border transition-colors ${isCurrentFavorite
              ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-400 text-amber-600 dark:text-amber-300'
              : 'bg-slate-100 dark:bg-[#2a2d3e] border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:border-amber-400'
              }`}
            title={isCurrentFavorite ? t('exam.favoriteRemove') : t('exam.favoriteAdd')}
          >
            <Icon name="Bulb" className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#2a2d3e] border border-slate-200 dark:border-white/5">
            <span className="text-slate-400 text-xs">{t('tarix.time')}</span>
            <span className="font-mono font-bold text-base text-slate-900 dark:text-white">{formatTime(timerTick)}</span>
          </div>
          <div className="hidden sm:block text-xs text-slate-400">
            <span className="font-bold text-slate-900 dark:text-white">{currentIndex + 1}</span>/{questions.length}
          </div>
        </div>
      </header>

      <div className="bg-white dark:bg-[#1e2130] border-b border-slate-200 dark:border-white/5 px-6 py-5 shrink-0 z-40 relative flex items-center min-h-[80px]">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:flex w-9 h-9 rounded-xl bg-brand-cyan/10 dark:bg-brand-cyan/20 items-center justify-center">
          <span className="text-brand-cyan font-bold">?</span>
        </div>
        <h2 className="w-full text-center text-base md:text-lg font-medium text-slate-800 dark:text-white leading-relaxed max-w-4xl mx-auto px-10">
          {currentQuestion.question}
        </h2>
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#2a2d3e] text-slate-400 hover:text-brand-cyan transition-colors"
          title={t('feedback.title')}
        >
          <Icon name="Flag" className="w-4 h-4" />
        </button>
      </div>

      <main className="flex-1 flex overflow-hidden relative">
        <aside className="w-full md:w-[400px] lg:w-[450px] bg-white dark:bg-[#1e2130] flex flex-col border-r border-slate-200 dark:border-white/5 overflow-y-auto p-5 shrink-0 z-30">
          <div className="space-y-3 flex-1">
            {currentQuestion.options.map((opt, idx) => {
              const selected = answers[currentQuestion.id] === idx
              const isCorrect = opt.is_correct
              const hasAnswer = typeof answers[currentQuestion.id] === 'number'
              let containerClass = "group relative w-full text-left p-0 rounded-xl border transition-all duration-200 overflow-hidden flex items-stretch min-h-[56px] "
              let labelClass = "w-14 flex items-center justify-center text-base font-bold border-r "
              let textClass = "flex-1 px-5 py-3 text-base leading-snug flex items-center "
              if (hasAnswer || isFinished) {
                const showCorrectAnswer = settings?.showCorrect !== false
                if (isCorrect && (selected || showCorrectAnswer)) {
                  containerClass += "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/40"
                  labelClass += "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                  textClass += "text-emerald-800 dark:text-emerald-100"
                } else if (selected && !isCorrect) {
                  containerClass += "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/40"
                  labelClass += "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30"
                  textClass += "text-rose-800 dark:text-rose-100"
                } else {
                  containerClass += "bg-slate-50 dark:bg-[#2a2d3e] border-slate-100 dark:border-white/5 opacity-60"
                  labelClass += "bg-slate-100 dark:bg-[#35394b] text-slate-400 dark:text-slate-500 border-slate-200 dark:border-white/5"
                  textClass += "text-slate-400"
                }
              } else {
                if (selected) {
                  containerClass += "bg-brand-cyan/10 dark:bg-brand-cyan/20 border-brand-cyan/50"
                  labelClass += "bg-brand-cyan/20 dark:bg-brand-cyan/30 text-brand-cyan border-brand-cyan/40"
                  textClass += "text-slate-900 dark:text-white"
                } else {
                  containerClass += "bg-slate-50 dark:bg-[#2a2d3e] border-slate-200 dark:border-white/5 hover:border-brand-cyan/30 hover:bg-slate-100 dark:hover:bg-[#35394b]"
                  labelClass += "bg-slate-100 dark:bg-[#35394b] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5 group-hover:text-brand-cyan"
                  textClass += "text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
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
                    {hasAnswer && isCorrect && (selected || settings?.showCorrect !== false) && <Icon name="Check" className="w-5 h-5 text-emerald-500 dark:text-emerald-400 ml-2 shrink-0" />}
                    {hasAnswer && selected && !isCorrect && <Icon name="Close" className="w-5 h-5 text-rose-500 dark:text-rose-400 ml-2 shrink-0" />}
                  </div>
                </button>
              )
            })}
          </div>
          <div className="mt-6 space-y-3 pt-4 border-t border-slate-200 dark:border-white/5">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className={`w-full py-3.5 rounded-xl flex items-center justify-between px-5 font-semibold text-sm transition-all ${showExplanation ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/40' : 'bg-amber-50 dark:bg-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/40'}`}
            >
              <span className="flex items-center">
                <Icon name="Bulb" className="mr-2.5 w-5 h-5" />
                {showExplanation ? t('exam.hideExplanation') : t('exam.viewExplanation')}
              </span>
            </button>
          </div>
        </aside>
        <section className="flex-1 bg-slate-50 dark:bg-black/40 relative flex items-center justify-center p-6 lg:p-10">
          <div className="relative w-full h-full">
            <Image
              src={currentQuestion.image && currentQuestion.image.trim() !== '' ? currentQuestion.image : '/imgage/background.jpg'}
              alt={t('tarix.questionImage')}
              fill
              className="object-contain"
              priority
              unoptimized={currentQuestion.image?.startsWith?.('http')}
            />
            {showExplanation && currentQuestion.explanation && (
              <div className="question-explanation absolute bottom-0 left-0 right-0 mx-auto max-w-2xl bg-white/95 dark:bg-[#161821]/95 backdrop-blur-md text-slate-800 dark:text-white p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl z-10">
                <h4 className="text-amber-500 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">{t('exam.explanation')}</h4>
                <p className="!text-base leading-relaxed text-slate-700 dark:text-slate-200">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="h-20 bg-white dark:bg-[#1e2130] border-t border-slate-200 dark:border-white/5 shrink-0 flex items-center px-4 relative z-50">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-[#2a2d3e] text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#35394b] disabled:opacity-30 transition-colors mr-4"
        >
          <Icon name="ArrowLeft" className="w-6 h-6" />
        </button>
        <div ref={scrollRef} className="flex-1 flex items-center gap-2 overflow-x-auto px-2 mx-2 no-scrollbar scroll-smooth h-full py-4">
          {questions.map((q, idx) => {
            const answerIdx = answers[q.id]
            const isAnswered = typeof answerIdx === 'number'
            const isCurrent = idx === currentIndex
            const isCorrect = isAnswered && q.options[answerIdx]?.is_correct
            let btnClass = "min-w-[44px] h-11 rounded-xl text-base font-bold flex items-center justify-center border transition-all duration-300 "
            if (isCurrent) btnClass += "bg-brand-cyan border-brand-cyan text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-110 z-10 ring-2 ring-brand-cyan/50"
            else if (isAnswered) {
              if (isCorrect) btnClass += "bg-emerald-600 border-emerald-500 text-white"
              else btnClass += "bg-rose-600 border-rose-500 text-white"
            } else btnClass += "bg-slate-100 dark:bg-[#161821] border-slate-200 dark:border-[#2a2d3e] text-slate-500 hover:bg-slate-200 dark:hover:bg-[#2a2d3e] hover:text-slate-700 dark:hover:text-slate-300"
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
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-[#2a2d3e] text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#35394b] disabled:opacity-30 transition-colors ml-4"
        >
          <Icon name="ArrowRight" className="w-6 h-6" />
        </button>
      </footer>
      <ExamSettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        context={{
          questionId: currentQuestion?.numeric_id || currentQuestion?.id,
          ticketId: ticketId,
          questionText: currentQuestion?.question
        }}
      />
    </div>
  )
}

