'use client'

import { useEffect, useState, useMemo, useRef, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import ThemeToggle from '@/components/ThemeToggle'

// Ikonkalar (O'zgarishsiz)
const Icons = {
  ArrowLeft: () => <path d="M19 12H5m7 7l-7-7 7-7" />,
  ArrowRight: () => <path d="M5 12h14m-7 7l7-7-7-7" />,
  Bulb: () => <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548 5.478a1 1 0 01-.994.9h-4.286a1 1 0 01-.994-.9L5.5 12z" />,
  Play: () => <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />,
  Save: () => <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />,
  Check: () => <path d="M5 13l4 4L19 7" />,
  Close: () => <path d="M6 18L18 6M6 6l12 12" />,
  Correct: () => <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  Wrong: () => <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  Refresh: () => <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
}

const Icon = ({ name, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {Icons[name] ? Icons[name]() : null}
  </svg>
)

function ExamContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const countParam = searchParams.get('count') || '20'
  const mode = searchParams.get('mode') || 'standard' // 'standard', 'real' yoki 'favorites'

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001';

  const questionCount = useMemo(() => {
    const n = parseInt(countParam, 10)
    return isNaN(n) || n <= 0 ? 20 : n > 100 ? 100 : n
  }, [countParam])

  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isFinished, setIsFinished] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [lang, setLang] = useState('uz-lotin')
  
  const [showFailModal, setShowFailModal] = useState(false)
  const [showTimeUp, setShowTimeUp] = useState(false) // Vaqt tugaganda
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const [timerTick, setTimerTick] = useState(0) // Har soniya yangilash uchun
  const [savedIds, setSavedIds] = useState([]) // API dan kelgan saqlangan savol IDlari
  const [favoritesEmpty, setFavoritesEmpty] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  const currentIdsRef = useRef([])
  const scrollRef = useRef(null)
  const startTimeRef = useRef(null)
  const endTimeRef = useRef(null)
  const langRef = useRef(lang)
  const initialFetchDoneRef = useRef(false)
  const examAttemptSavedRef = useRef(false)

  useEffect(() => {
    AOS.init({ duration: 800, once: true })
  }, [])

  // Userni aniqlash va saqlangan savollar ro'yxatini olish
  const loadSavedIds = useCallback(
    async (uid) => {
      try {
        const res = await fetch(`${API_URL}/api/favorites/${uid}`)
        if (!res.ok) throw new Error('API xatolik')
        const { questionIds } = await res.json()
        setSavedIds(Array.isArray(questionIds) ? questionIds : [])
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
      }
    })
    return () => unsubscribe()
  }, [loadSavedIds])

  const getLangCode = useCallback((l) => {
    if (l === 'Uzb (kirill)') return 'uzk'
    if (l === 'Русский') return 'ru'
    return 'uzl'
  }, [])

  const transformQuestion = useCallback((item) => {
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
  }, [API_URL])

  // Til o'zgarganda: savollar va javoblar o'zgarmaydi, faqat matn (tarjima) yangilanadi
  const refreshQuestionsLanguage = useCallback(async (newLang) => {
    const ids = currentIdsRef.current
    if (ids.length === 0) return
    const langCode = getLangCode(newLang)
    try {
      const idsString = ids.join(',')
      const res = await fetch(`${API_URL}/api/tests?lang=${langCode}&ids=${idsString}`)
      if (!res.ok) return
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) return
      const transformedData = data.map(transformQuestion)
      // Tartib va javoblarni saqlab, faqat savol/option/explanation matnlarini yangilaymiz
      setQuestions((prev) =>
        prev.map((q) => {
          const fromApi = transformedData.find((x) => x.id == q.id || x.numeric_id == q.numeric_id)
          if (!fromApi) return q
          return {
            ...q,
            question: fromApi.question,
            explanation: fromApi.explanation,
            options: q.options.map((opt, j) => ({ ...opt, option: fromApi.options[j]?.option ?? opt.option })),
          }
        })
      )
    } catch (err) {
      console.error('Til yangilashda xatolik:', err)
    }
  }, [API_URL, getLangCode, transformQuestion])

  // API dan testlarni olish funksiyasi (to'liq yuklash - qayta boshlash)
  const fetchTests = useCallback(async (skipReset = false) => {
    if (!skipReset) {
      setAnswers({})
      setCurrentIndex(0)
      setIsFinished(false)
      setShowFailModal(false)
      setShowTimeUp(false)
      setShowExplanation(false)
      setQuestions([])
      endTimeRef.current = null
      setTimerTick(0)
      setFavoritesEmpty(false)
    }

    try {
      const currentLang = langRef.current
      const langCode = getLangCode(currentLang)

      let data = []

      if (mode === 'favorites') {
        // Favorites mode: faqat user saqlagan savollar (mistakes kabi)
        if (!currentUser) {
          setFavoritesEmpty(true)
          return
        }
        const favRes = await fetch(`${API_URL}/api/favorites/${currentUser.uid}`)
        if (!favRes.ok) throw new Error('API xatolik')
        const { questionIds } = await favRes.json()
        if (!Array.isArray(questionIds) || questionIds.length === 0) {
          setFavoritesEmpty(true)
          return
        }
        const idsString = questionIds.join(',')
        const testsRes = await fetch(`${API_URL}/api/tests?lang=${langCode}&ids=${idsString}`)
        if (!testsRes.ok) throw new Error('API xatolik')
        const rawData = await testsRes.json()
        if (!Array.isArray(rawData) || rawData.length === 0) {
          setFavoritesEmpty(true)
          return
        }
        data = [...rawData].sort(() => Math.random() - 0.5)
      } else if (mode === 'mistakes') {
        // Mistakes mode: faqat xato qilingan savollar
        if (!currentUser) {
          setFavoritesEmpty(true)
          return
        }
        const mistakesRes = await fetch(`${API_URL}/api/mistakes/${currentUser.uid}`)
        if (!mistakesRes.ok) throw new Error('API xatolik')
        const { questionIds } = await mistakesRes.json()
        if (!Array.isArray(questionIds) || questionIds.length === 0) {
          setFavoritesEmpty(true)
          return
        }
        const idsString = questionIds.join(',')
        const testsRes = await fetch(`${API_URL}/api/tests?lang=${langCode}&ids=${idsString}`)
        if (!testsRes.ok) throw new Error('API xatolik')
        const rawData = await testsRes.json()
        if (!Array.isArray(rawData) || rawData.length === 0) {
          setFavoritesEmpty(true)
          return
        }
        data = [...rawData].sort(() => Math.random() - 0.5)
      } else {
        // Oddiy rejimlar: count bo'yicha yoki avvalgi IDlar bo'yicha
        let url = `${API_URL}/api/tests?lang=${langCode}`
        if (reloadTrigger === 0 && currentIdsRef.current.length > 0) {
          const idsString = currentIdsRef.current.join(',')
          url += `&ids=${idsString}`
        } else {
          url += `&count=${questionCount}`
        }
        const res = await fetch(url)
        if (!res.ok) throw new Error('API xatolik')
        data = await res.json()
      }

      if (Array.isArray(data) && data.length > 0) {
        const transformedData = data.map(transformQuestion)
        currentIdsRef.current = transformedData.map((q) => q.numeric_id).filter(Boolean)
        setQuestions(transformedData)
        if (!skipReset) startTimeRef.current = Date.now()
      }
    } catch (err) {
      console.error("Xatolik:", err)
    }
  }, [API_URL, getLangCode, transformQuestion, questionCount, reloadTrigger, mode, currentUser])

  useEffect(() => {
    langRef.current = lang
  }, [lang])

  // Testga kirganda backendga bir marta murojaat (qayta urinish bosilganda qayta fetch)
  useEffect(() => {
    if (mode === 'favorites' || mode === 'mistakes') {
      if (!currentUser) return
    }
    if (initialFetchDoneRef.current) return
    initialFetchDoneRef.current = true
    fetchTests(false)
  }, [fetchTests, mode, currentUser])

  // Til o'zgarganda: savollar o'zgarmaydi, faqat tarjima yangilanadi
  const prevLangRef = useRef(lang)
  useEffect(() => {
    if (prevLangRef.current !== lang && questions.length > 0 && currentIdsRef.current.length > 0) {
      prevLangRef.current = lang
      refreshQuestionsLanguage(lang)
    } else {
      prevLangRef.current = lang
    }
  }, [lang, questions.length, refreshQuestionsLanguage])

  // Taymer: Haqiqiy = 25:00 dan orqaga, Standart = 0 dan yuqoriga; vaqt tugasa (real) imtihon yopiladi
  const REAL_EXAM_SECONDS = 25 * 60
  useEffect(() => {
    if (questions.length === 0 || isFinished || showFailModal) return
    const id = setInterval(() => {
      setTimerTick((t) => t + 1)
      if (mode === 'real' && startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        if (elapsed >= REAL_EXAM_SECONDS) {
          setIsFinished(true)
          setShowTimeUp(true)
        }
      }
    }, 1000)
    return () => clearInterval(id)
  }, [questions.length, isFinished, showFailModal, mode])

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  const elapsedSeconds = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0
  const displayTime = mode === 'real'
    ? formatTime(Math.max(0, REAL_EXAM_SECONDS - elapsedSeconds))
    : formatTime(elapsedSeconds)

  // Scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      const activeBtn = scrollRef.current.children[currentIndex]
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
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

  // Statistikani hisoblash
  const stats = useMemo(() => {
    let correct = 0
    let incorrect = 0
    Object.entries(answers).forEach(([qId, optIdx]) => {
      const q = questions.find(item => item.id == qId)
      if (q) {
        if (q.options[optIdx]?.is_correct) correct++
        else incorrect++
      }
    })
    return { correct, incorrect }
  }, [answers, questions])

  const answeredCount = Object.keys(answers).length
  const allAnswered = questions.length > 0 && answeredCount >= questions.length

  // Yakunlash mantiqi
  useEffect(() => {
    if (allAnswered && !isFinished && !showFailModal) {
      endTimeRef.current = Date.now()
      setIsFinished(true)
    }
  }, [allAnswered, isFinished, showFailModal])

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

  const removeMistakeFromApi = async (questionId) => {
    if (!currentUser?.uid) return
    const numericId = getNumericId(questionId)
    if (numericId == null) return
    try {
      await fetch(`${API_URL}/api/mistakes/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: currentUser.uid, questionId: numericId })
      })
    } catch (e) {
      console.error('Xatolardan olib tashlashda xatolik:', e)
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

  // Javobni tanlash va XATOLIKNI TEKSHIRISH
  const selectAnswer = (questionId, optionIndex) => {
    if (isFinished || showFailModal) return
    if (typeof answers[questionId] === 'number') return

    // Hozirgi tanlangan javob to'g'rimi?
    const isCurrentCorrect = questions[currentIndex].options[optionIndex].is_correct
    
    // Javobni saqlaymiz
    const newAnswers = { ...answers, [questionId]: optionIndex }
    setAnswers(newAnswers)

    if (isCurrentCorrect) {
      saveMasteryCorrect(questionId)
      if (mode === 'mistakes') removeMistakeFromApi(questionId)
    } else {
      saveMasteryIncorrect(questionId)
      saveMistakeToApi(questionId)
    }

    // Haqiqiy imtihonda: noto'g'ri bo'lsa limitni tekshiramiz (3 xato → to'xtaydi)
    // Standart imtihonda: xatoga qaramay davom etadi
    if (mode === 'real' && !isCurrentCorrect) {
      let currentIncorrectCount = 0
      Object.entries(newAnswers).forEach(([qId, optIdx]) => {
        const q = questions.find(item => item.id == qId)
        if (q && !q.options[optIdx].is_correct) currentIncorrectCount++
      })
      // Haqiqiy imtihon: 20 ta savol, 3 ta xatoda to'xtaydi (limit = 2, ya'ni 3-xatoda)
      const limit = 2
      if (currentIncorrectCount > limit) {
        setTimeout(() => setShowFailModal(true), 800)
        return
      }
    }

    // Keyingi savolga o'tish (favorites va mistakes rejimida avtomatik o'tmaydi)
    if (mode !== 'favorites' && mode !== 'mistakes' && currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 400)
    }
  }

  const finishExam = () => {
    endTimeRef.current = Date.now()
    setIsFinished(true)
  }

  // Imtihon natijasini Tarix uchun saqlash
  const saveExamAttempt = useCallback(async (status) => {
    if (!currentUser?.uid || examAttemptSavedRef.current) return
    const total = questions.length
    if (total === 0) return
    const elapsed = (endTimeRef.current && startTimeRef.current)
      ? Math.floor((endTimeRef.current - startTimeRef.current) / 1000) : 0
    const typeMap = { standard: 'standart', real: 'haqiqiy', favorites: 'favorites', mistakes: 'mistakes' }
    try {
      await fetch(`${API_URL}/api/exam-history/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: currentUser.uid,
          type: typeMap[mode] || 'standart',
          correct: stats.correct,
          total,
          durationSeconds: elapsed,
          status,
        }),
      })
      examAttemptSavedRef.current = true
    } catch (e) {
      console.error('Tarix saqlashda xatolik:', e)
    }
  }, [API_URL, currentUser, mode, questions.length, stats.correct])

  // Qayta boshlash funksiyasi
  const restartExam = () => {
    examAttemptSavedRef.current = false
    initialFetchDoneRef.current = false
    currentIdsRef.current = []
    setReloadTrigger((prev) => prev + 1)
  }

  useEffect(() => {
    if (!currentUser?.uid || examAttemptSavedRef.current) return
    if (showFailModal) {
      saveExamAttempt('otmadi')
    } else if (showTimeUp) {
      saveExamAttempt('bekor')
    } else if (isFinished && questions.length > 0) {
      saveExamAttempt('tugallangan')
    }
  }, [showFailModal, showTimeUp, isFinished, questions.length, currentUser?.uid, saveExamAttempt])

  if (!questions.length) {
    if (mode === 'favorites' && favoritesEmpty) {
      return (
        <div className="min-h-screen bg-[#1e2130] text-slate-300 flex items-center justify-center px-4 text-center">
          Sevimli savollar topilmadi. Avval testlarda savollarni saqlab oling.
        </div>
      )
    }
    if (mode === 'mistakes' && favoritesEmpty) {
      return (
        <div className="min-h-screen bg-[#1e2130] text-slate-300 flex items-center justify-center px-4 text-center">
          Xatolar topilmadi. Imtihon yoki biletlarda noto&apos;g&apos;ri javob berganingizda savollar shu yerga qo&apos;shiladi.
        </div>
      )
    }
    return <div className="min-h-screen bg-[#1e2130] text-slate-400 flex items-center justify-center">Yuklanmoqda...</div>
  }

  const finishPercent = questions.length > 0 ? Math.round((stats.correct / questions.length) * 100) : 0
  const elapsedSecondsForResult = (endTimeRef.current != null && startTimeRef.current != null)
    ? Math.floor((endTimeRef.current - startTimeRef.current) / 1000)
    : 0
  const resultTimeStr = `${String(Math.floor(elapsedSecondsForResult / 60)).padStart(2, '0')}:${String(elapsedSecondsForResult % 60).padStart(2, '0')}`

  if (isFinished) {
    if (showTimeUp) {
      return (
        <div className="min-h-screen bg-[#161821] text-white flex flex-col items-center justify-center p-6 font-sans">
          <div className="bg-[#1e2130] border border-rose-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <h2 className="text-xl font-bold text-rose-500 mb-2">Vaqtingiz tugadi</h2>
            <p className="text-slate-400 mb-6">Haqiqiy imtihon vaqti (25 daqiqa) tugadi. Imtihon yopildi.</p>
            <div className="flex flex-col gap-3">
              <button onClick={restartExam} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors flex items-center justify-center gap-2">
                <Icon name="Refresh" className="w-5 h-5" /> Qayta urinish
              </button>
              <Link href="/dashboard" className="w-full py-3 rounded-xl bg-[#2a2d3e] hover:bg-[#35394b] text-white font-medium border border-white/10 transition-colors text-center block">
                Bosh sahifaga
              </Link>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="min-h-screen bg-[#161821] text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-[#1e2130] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-2">Test yakunlandi</h2>
          <p className="text-slate-400 mb-4">Natijangiz quyida.</p>
          <div className="text-4xl font-bold text-white mb-1">{stats.correct}/{questions.length}</div>
          <p className="text-slate-400 mb-1">To&apos;g&apos;ri javob</p>
          <div className={`text-3xl font-bold mb-4 ${finishPercent >= 85 ? 'text-emerald-400' : 'text-rose-400'}`}>{finishPercent}%</div>
          <p className="text-slate-500 text-sm mb-1">Noto&apos;g&apos;ri: {stats.incorrect} ta</p>
          <p className="text-slate-400 text-sm mb-6">Sarflangan vaqt: <span className="text-white font-semibold">{resultTimeStr}</span></p>
          <div className="flex flex-col gap-3">
            <button onClick={restartExam} className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors">
              Qayta ishlash
            </button>
            <Link href="/dashboard" className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-[#2a2d3e] hover:bg-[#35394b] text-white font-medium border border-white/10 transition-colors">
              Dashboardga qaytish
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#161821] page-bg text-white overflow-hidden font-sans relative">

      {/* FAIL MODAL (POPUP) */}
      {showFailModal && (
        <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#1e2130] border border-rose-500/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
               <Icon name="Wrong" className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold text-rose-500 mb-2">Imtihon o&apos;tolmading</h2>
            <p className="text-slate-400 mb-6">
              3 ta xato qildingiz. Haqiqiy imtihonda ruxsat etilgan xatolar limitidan oshib ketdingiz.
            </p>
            
            <div className="bg-[#161821] rounded-xl p-4 mb-6 border border-white/5">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">To'g'ri javoblar:</span>
                    <span className="text-emerald-400 font-bold">{stats.correct}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Xatolar:</span>
                    <span className="text-rose-400 font-bold">{stats.incorrect}</span>
                </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={restartExam}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center justify-center gap-2"
              >
                <Icon name="Refresh" className="w-5 h-5" />
                Qayta urinish
              </button>
              <Link
                href="/dashboard"
                className="w-full py-3 rounded-xl bg-[#2a2d3e] hover:bg-[#35394b] text-slate-300 font-medium transition-colors"
              >
                Bosh sahifaga qaytish
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-[#1e2130] header-bg border-b border-white/5 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Image
              src="/imgage/avtotest-logo.png"
              alt="PravachiUZ"
              width={36}
              height={36}
              className="rounded-lg object-contain"
            />
            <div className="hidden sm:flex flex-col leading-tight">
              <h1 className="text-base md:text-lg font-bold text-white">
                Pravachi<span className="text-brand-cyan">UZ</span>
              </h1>
              <p className="text-[11px] md:text-xs text-slate-400">Haydovchilik testi</p>
            </div>
          </Link>

          <div className="hidden md:flex bg-[#2a2d3e] p-1.5 rounded-lg">
            {[
              { label: 'Uzb (lotin)', code: 'uzl' },
              { label: 'Uzb (kirill)', code: 'uzk' },
              { label: 'Русский', code: 'ru' }
            ].map((item) => (
              <button
                key={item.code}
                onClick={() => setLang(item.label)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  lang === item.label || (lang === 'uz-lotin' && item.code === 'uzl')
                    ? 'bg-[#3e4255] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <ThemeToggle size="sm" />
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-3 bg-[#2a2d3e] px-3 py-1.5 rounded-lg border border-white/5">
            <div className="flex items-center text-emerald-400 text-sm font-bold space-x-1">
              <Icon name="Correct" className="w-4 h-4" />
              <span>{stats.correct}</span>
            </div>
            <div className="w-px h-4 bg-white/10"></div>
            <div className="flex items-center text-rose-400 text-sm font-bold space-x-1">
              <Icon name="Wrong" className="w-4 h-4" />
              <span>{stats.incorrect}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Savol:</span>
            <span className="font-bold text-white text-base">{currentIndex + 1}<span className="text-slate-500 text-xs font-normal">/{questions.length}</span></span>
          </div>

          {/* Sevimli savol tugmasi */}
          <button
            onClick={toggleCurrentFavorite}
            className={`hidden sm:flex items-center justify-center w-9 h-9 rounded-lg border transition-colors ${
              isCurrentFavorite
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-[#2a2d3e] border-white/10 text-slate-400 hover:text-white hover:border-amber-400'
            }`}
            title={isCurrentFavorite ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
          >
            <Icon name="Save" className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2a2d3e] border border-white/5">
            <span className="text-slate-400 text-xs">{mode === 'real' ? 'Qolgan vaqt' : 'Vaqt'}</span>
            <span className={`font-mono font-bold text-base ${mode === 'real' && elapsedSeconds >= REAL_EXAM_SECONDS - 60 ? 'text-rose-400' : 'text-white'}`}>
              {displayTime}
            </span>
          </div>

          <button
            onClick={finishExam}
            className="hidden md:flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
          >
            {isFinished ? 'Natijalar' : "Tugatish"}
          </button>
        </div>
      </header>

      {/* QUESTION BAR */}
      <div className="question-bar bg-blue-700 px-6 py-5 shadow-lg shrink-0 z-40 relative flex items-center min-h-[80px]">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:flex w-8 h-8 rounded-full bg-white/10 items-center justify-center border border-white/20">
          <span className="text-sm font-bold">?</span>
        </div>
        <h2 className="question-bar-text w-full text-center text-base md:text-xl font-medium text-white leading-relaxed max-w-5xl mx-auto">
          {currentQuestion.question}
        </h2>
      </div>

      {/* MAIN CONTENT */}
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

              if (hasAnswer || isFinished || showFailModal) {
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

              const isDisabled = hasAnswer || isFinished || showFailModal

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
              disabled={showFailModal}
              className={`w-full py-3.5 rounded-xl flex items-center justify-between px-5 font-semibold text-sm transition-all shadow-lg ${showExplanation
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                  : 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-500 shadow-amber-900/20'
                }`}
            >
              <span className="flex items-center">
                <Icon name="Bulb" className="mr-2.5 w-5 h-5" />
                Izohni {showExplanation ? 'yashirish' : "ko'rish"}
              </span>
              <kbd className="hidden md:inline-block px-2 py-0.5 bg-black/20 rounded text-[10px] uppercase opacity-70">Enter</kbd>
            </button>
          </div>
        </aside>

        <section className="flex-1 bg-black/40 relative flex items-center justify-center p-6 lg:p-10">
          <div className="relative w-full h-full">
            <Image
              src={
                currentQuestion.image && currentQuestion.image.trim() !== ''
                  ? currentQuestion.image
                  : '/imgage/background.jpg'
              }
              alt="Savol rasmi"
              fill
              className="object-contain"
              priority
              unoptimized={currentQuestion.image?.startsWith('http')} 
            />
            {showExplanation && currentQuestion.explanation && (
              <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-2xl bg-[#161821]/95 backdrop-blur-md text-white p-6 rounded-2xl border border-white/10 shadow-2xl animate-in slide-in-from-bottom-10 z-10">
                <h4 className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">Tushuntirish</h4>
                <p className="text-base leading-relaxed text-slate-200">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER NAV */}
      <footer className="h-20 bg-[#1e2130] border-t border-white/5 shrink-0 flex items-center px-4 relative z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0 || showFailModal}
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

            if (isCurrent) {
              btnClass += "bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.6)] scale-110 z-10 ring-2 ring-blue-400/50"
            } else if (isAnswered) {
              if (isCorrect) {
                btnClass += "bg-emerald-600 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              } else {
                btnClass += "bg-rose-600 border-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.3)]"
              }
            } else {
              btnClass += "bg-[#161821] border-[#2a2d3e] text-slate-500 hover:bg-[#2a2d3e] hover:text-slate-300"
            }

            return (
              <button
                key={q.id}
                onClick={() => !showFailModal && setCurrentIndex(idx)}
                disabled={showFailModal}
                className={btnClass}
              >
                {idx + 1}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
          disabled={currentIndex === questions.length - 1 || showFailModal}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#2a2d3e] text-slate-400 hover:text-white hover:bg-[#35394b] disabled:opacity-30 transition-colors ml-4"
        >
          <Icon name="ArrowRight" className="w-6 h-6" />
        </button>
      </footer>
    </div>
  )
}

export default function ExamPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1e2130] text-slate-400 flex items-center justify-center">Yuklanmoqda...</div>}>
      <ExamContent />
    </Suspense>
  )
}