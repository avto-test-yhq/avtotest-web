'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import ThemeToggle from '@/components/ThemeToggle'
import WeeklyChart from '@/components/WeeklyChart'
import {
  Car,
  Home,
  BookOpen,
  Search,
  Settings as SettingsIcon,
  Timer,
  ClipboardCheck,
  AlertCircle,
  Star,
  HelpCircle,
  Zap,
  Flame,
  Medal,
  Trophy,
  LogOut,
  ChevronRight,
  Play,
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.168.60.161:5001'

const fetchBiletlarProgress = async (uid) => {
  try {
    const [biletRes, statsRes] = await Promise.all([
      fetch(`${API_URL}/api/bilet-progress/${uid}`),
      fetch(`${API_URL}/api/mastery/stats/app`)
    ])
    if (!biletRes.ok) return { completed: 0, totalCorrect: 0, percent: 0 }
    const p = await biletRes.json()
    const completed = (p.completedTickets || []).length
    const totalCorrect = p.totalCorrectAnswers || 0
    let totalBiletQuestions = 610
    if (statsRes.ok) {
      const s = await statsRes.json()
      totalBiletQuestions = s.totalBiletQuestions || 610
    }
    const percent = totalBiletQuestions > 0 ? Math.round((totalCorrect / totalBiletQuestions) * 100) : 0
    return { completed, totalCorrect, percent }
  } catch {
    return { completed: 0, totalCorrect: 0, percent: 0 }
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [userName, setUserName] = useState('Foydalanuvchi')
  const [examModalOpen, setExamModalOpen] = useState(false)
  const [examModalType, setExamModalType] = useState(null) // 'standard' | 'real'
  const [biletlarProgress, setBiletlarProgress] = useState({ completed: 0, totalCorrect: 0, percent: 0 })
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [mistakesCount, setMistakesCount] = useState(0)
  const [mastery, setMastery] = useState({
    masteredCount: 0,
    totalQuestions: 1228,
    totalTickets: 61,
    totalBiletQuestions: 610,
    percent: 0
  })
  const [activityDays, setActivityDays] = useState(0)
  const [weeklyStats, setWeeklyStats] = useState({ javob: 0, aniqlik: 0, changePercent: 0, daily: [] })

  useEffect(() => {
    // Firebase auth state ni tekshiramiz
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Agar foydalanuvchi authenticated bo'lmasa, login pagega o'tkazamiz
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('loginMethod');
        localStorage.removeItem('phoneNumber');
        router.push('/login');
        return;
      }

      // Agar authenticated bo'lsa, tokenni yangilaymiz
      try {
        const token = await user.getIdToken();
        localStorage.setItem('userToken', token);
        localStorage.setItem('isLoggedIn', 'true');

        // User ma'lumotlarini o'rnatamiz
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const parsed = JSON.parse(userData);
            if (parsed.name) setUserName(parsed.name);
            else if (parsed.email) setUserName(parsed.email);
            else if (parsed.phone) setUserName(parsed.phone);
          } catch (e) { }
        } else {
          // Agar userData bo'lmasa, Firebase user ma'lumotlaridan olamiz
          if (user.displayName) setUserName(user.displayName);
          else if (user.email) setUserName(user.email);
          else if (user.phoneNumber) setUserName(user.phoneNumber);
        }

        // Tashrifni yozish (har safar kirganda)
        fetch(`${API_URL}/api/activity/record`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: user.uid })
        }).catch(() => { })

        // Sevimli savollar, bilet progress, xatolar va samaradorlikni API dan olamiz
        try {
          const [favRes, biletRes, mistakesRes, masteryRes, activityRes, weeklyRes] = await Promise.all([
            fetch(`${API_URL}/api/favorites/${user.uid}`),
            fetch(`${API_URL}/api/bilet-progress/${user.uid}`),
            fetch(`${API_URL}/api/mistakes/${user.uid}`),
            fetch(`${API_URL}/api/mastery/${user.uid}`),
            fetch(`${API_URL}/api/activity/${user.uid}`),
            fetch(`${API_URL}/api/exam-history/weekly/${user.uid}`)
          ])
          if (favRes.ok) {
            const { questionIds } = await favRes.json()
            setFavoritesCount(Array.isArray(questionIds) ? questionIds.length : 0)
          } else {
            setFavoritesCount(0)
          }
          if (mistakesRes.ok) {
            const { questionIds } = await mistakesRes.json()
            setMistakesCount(Array.isArray(questionIds) ? questionIds.length : 0)
          } else {
            setMistakesCount(0)
          }
          let masteryData = null
          if (masteryRes.ok) {
            masteryData = await masteryRes.json()
            setMastery({
              masteredCount: masteryData.masteredCount || 0,
              totalQuestions: masteryData.totalQuestions || 1228,
              totalTickets: masteryData.totalTickets || 61,
              totalBiletQuestions: masteryData.totalBiletQuestions || 610,
              percent: masteryData.percent || 0
            })
          } else {
            setMastery({ masteredCount: 0, totalQuestions: 1228, totalTickets: 61, totalBiletQuestions: 610, percent: 0 })
          }
          if (biletRes.ok) {
            const biletData = await biletRes.json()
            const completed = (biletData.completedTickets || []).length
            const totalCorrect = biletData.totalCorrectAnswers || 0
            const totalBiletQuestions = masteryData?.totalBiletQuestions || 610
            const percent = totalBiletQuestions > 0 ? Math.round((totalCorrect / totalBiletQuestions) * 100) : 0
            setBiletlarProgress({ completed, totalCorrect, percent, totalTickets: masteryData?.totalTickets || 61 })
          }
          if (activityRes.ok) {
            const actData = await activityRes.json()
            setActivityDays(actData.totalDays || 0)
          }
          if (weeklyRes.ok) {
            const w = await weeklyRes.json()
            setWeeklyStats({
              javob: w.javob || 0,
              aniqlik: w.aniqlik || 0,
              changePercent: w.changePercent || 0,
              daily: w.daily || []
            })
          }
        } catch (e) {
          console.error("Ma'lumotlarni yuklashda xatolik:", e)
          setFavoritesCount(0)
        }
      } catch (error) {
        console.error("Token yangilashda xatolik:", error);
      }
    });

    return () => unsubscribe();
  }, [router])

  useEffect(() => {
    const refreshData = async () => {
      const user = auth.currentUser
      if (user?.uid) {
        const data = await fetchBiletlarProgress(user.uid)
        setBiletlarProgress(data)
        try {
          const [mistakesRes, masteryRes] = await Promise.all([
            fetch(`${API_URL}/api/mistakes/${user.uid}`),
            fetch(`${API_URL}/api/mastery/${user.uid}`)
          ])
          if (mistakesRes.ok) {
            const { questionIds } = await mistakesRes.json()
            setMistakesCount(Array.isArray(questionIds) ? questionIds.length : 0)
          }
          if (masteryRes.ok) {
            const m = await masteryRes.json()
            setMastery({
              masteredCount: m.masteredCount || 0,
              totalQuestions: m.totalQuestions || 1228,
              totalTickets: m.totalTickets || 61,
              totalBiletQuestions: m.totalBiletQuestions || 610,
              percent: m.percent || 0
            })
          }
        } catch (e) { }
      }
    }
    refreshData()
  }, [pathname])

  const handleLogout = async () => {
    if (confirm('Hisobdan chiqishni xohlaysizmi?')) {
      try {
        // Firebase dan chiqamiz
        await signOut(auth);
      } catch (error) {
        console.error("Logout xatolik:", error);
      }

      // Barcha localStorage ma'lumotlarini tozalaymiz
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('loginMethod');
      localStorage.removeItem('phoneNumber');

      // Login pagega o'tkazamiz
      router.push('/login');
    }
  }

  const startStandardExam = (count) => {
    setExamModalOpen(false)
    setExamModalType(null)
    router.push(`/exam?mode=standard&count=${count}`)
  }

  const startRealExam = () => {
    setExamModalOpen(false)
    setExamModalType(null)
    router.push(`/exam?mode=real&count=20`)
  }

  const [stats, setStats] = useState({ solved: 0, total: 61, percent: 0 });

  useEffect(() => {
    const savedData = localStorage.getItem('ticketProgress');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const solvedCount = Object.values(parsed).filter(t => t.status === 'completed').length;
        setStats({ solved: solvedCount, total: 120, percent: Math.round((solvedCount / 120) * 100) });
      } catch (e) { }
    }
  }, []);

  return (
    <div className="dashboard-page dashboard-bg min-h-screen flex font-display text-slate-800 dark:text-slate-100 overflow-hidden">
      {/* SIDEBAR – desktop */}
      <aside className="dashboard-sidebar hidden md:flex flex-col flex-shrink-0 z-20">
        <div className="p-6 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-white/30 dark:border-slate-800 shadow-lg shadow-primary/20 overflow-hidden flex items-center justify-center">
              <Image
                src="/imgage/avtotest-logo.png"
                alt="PravachiUZ"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
              Pravachi<span className="text-primary font-extrabold text-2xl leading-none">UZ</span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 mt-4 px-4 space-y-2">
          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Menyu</p>
          <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-xl sidebar-item-active">
            <Home className="w-5 h-5" />
            <span>Bosh sahifa</span>
          </Link>
          <Link href="/qoidalar" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all text-slate-500 dark:text-slate-400">
            <BookOpen className="w-5 h-5" />
            <span>Qoidalar</span>
          </Link>
          <Link href="/biletlar" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all text-slate-500 dark:text-slate-400">
            <ClipboardCheck className="w-5 h-5" />
            <span>Biletlar</span>
          </Link>
          <Link href="/savollar" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all text-slate-500 dark:text-slate-400">
            <Search className="w-5 h-5" />
            <span>Savollar</span>
          </Link>
          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-8 mb-2">Tizim</p>
          <Link href="/" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all text-slate-500 dark:text-slate-400">
            <SettingsIcon className="w-5 h-5" />
            <span>Sozlamalar</span>
          </Link>
        </nav>
        <div className="p-4 mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-all font-medium">
            <LogOut className="w-5 h-5" />
            <span>Chiqish</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main-content">
        <header className="dashboard-sticky-header p-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800 dark:text-white">Xush kelibsiz, {userName} 👋</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle size="sm" />
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-primary text-sm font-semibold border border-blue-100 dark:border-blue-800">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Premium A&apos;zo</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 border-2 border-white dark:border-slate-800">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8 max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            {/* 3 ta stat karta + Barcha hisobotlar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Statistika</h2>
              <Link href="/tarix" className="text-primary text-sm font-semibold hover:underline">Barcha hisobotlar</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card bg-white/60 dark:bg-slate-800/40 p-5 rounded-2xl relative overflow-hidden group border border-white/20 dark:border-slate-700/50">
                <div className="relative z-10">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Jami Savollar</p>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white mt-1">{mastery.totalQuestions.toLocaleString()}</h2>
                  <p className="text-xs text-green-500 mt-2 font-medium">O&apos;zlashtirilgan: {mastery.masteredCount}</p>
                </div>
                <HelpCircle className="absolute -right-2 -bottom-2 w-12 h-12 text-primary/10 group-hover:scale-110 transition-transform" />
              </div>
              <div className="glass-card bg-white/60 dark:bg-slate-800/40 p-5 rounded-2xl relative overflow-hidden group border border-white/20 dark:border-slate-700/50">
                <div className="relative z-10">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Samaradorlik</p>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white mt-1">{mastery.percent}%</h2>
                  <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.min(100, mastery.percent)}%` }} />
                  </div>
                </div>
                <Zap className="absolute -right-2 -bottom-2 w-12 h-12 text-green-500/10 group-hover:scale-110 transition-transform" />
              </div>
              <Link href="/tarix" className="glass-card bg-white/60 dark:bg-slate-800/40 p-5 rounded-2xl relative overflow-hidden group border border-white/20 dark:border-slate-700/50 block">
                <div className="relative z-10">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Davomiylik</p>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white mt-1">{activityDays} kun</h2>
                  <span className="text-xs text-primary mt-3 font-medium flex items-center hover:underline">
                    Tashriflar tarixi <ChevronRight className="w-3 h-3 ml-1" />
                  </span>
                </div>
                <Flame className="absolute -right-2 -bottom-2 w-12 h-12 text-orange-500/10 group-hover:scale-110 transition-transform" />
              </Link>
            </div>

            {/* Mashq qilish – Biletlar (to'liq kenglik) */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Mashq qilish</h3>
                <Link href="/biletlar" className="text-primary text-sm font-semibold hover:underline">Barchasini ko&apos;rish</Link>
              </div>
              <Link href="/biletlar" className="block relative group cursor-pointer overflow-hidden rounded-3xl bg-primary p-6 md:p-8 text-white shadow-xl shadow-primary/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                      <BookOpen className="w-8 h-8 md:w-10 md:h-10 !text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-2xl font-bold !text-white">Biletlar bo&apos;yicha</h4>
                        <span className="bg-white/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider !text-white">{mastery.totalTickets} bilet</span>
                      </div>
                      <p className="text-white/80 max-w-md text-sm">Har bir biletni alohida mashq qiling va bilimingizni tizimli ravishda mustahkamlang.</p>
                    </div>
                  </div>
                  <div className="flex-1 max-w-xs space-y-3">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-white/80 uppercase tracking-tighter">{biletlarProgress.completed}/{mastery.totalTickets} yechilgan</span>
                      <span className="!text-white">{biletlarProgress.percent}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, biletlarProgress.percent)}%` }} />
                    </div>
                    <span className="inline-flex items-center justify-center gap-2 w-full mt-2 bg-white text-primary py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-slate-50 transition-colors">
                      <span>Davom ettirish</span>
                      <Play className="w-4 h-4" />
                    </span>
                  </div>
                </div>
                <img alt="Mashina" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuvFci29edPEcx4oinoYcCGcarH-JEy9ANOiKgLXzplMHJhZ9c-RZaT6unQXF2ReIkfXWyyxxAm6tmLSQ4s9-46wjH4tdiuQr7LQxyqQ8bmvXf4eodT5jHbpMgijzLhSOAUmZ0X6XZJsT44HeR8PGtdUsYF3wvrQXDgYRQePioj3dKq7TNxA3qIgyxf9kWBRuuQw-_wYdsNLCyf8jsv1y3ZszVRvuwEML8J6DNKpBXs5n20zu0udv0tMa6jHt1REEY7yAzQYopOpiR" className="absolute top-0 right-0 h-full w-1/3 object-cover opacity-20 pointer-events-none hidden md:block" />
              </Link>
            </div>

            {/* 4 ta activity card – pastdan kartalar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24 md:pb-8">
              <button
                onClick={() => { setExamModalType('standard'); setExamModalOpen(true); }}
                className="glass-card bg-white/60 dark:bg-slate-800/40 p-6 rounded-2xl group hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-slate-700/50 text-left"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                    <Timer className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</p>
                </div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Standart imtihon</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-10 line-clamp-2">10, 20 yoki 50 ta savol. Xato qilsangiz ham davom ettiring.</p>
                <span className="flex items-center justify-center gap-2 text-primary font-bold text-sm group-hover:translate-x-1 transition-transform">
                  Boshlash <ChevronRight className="w-4 h-4" />
                </span>
              </button>
              <button
                onClick={() => { setExamModalType('real'); setExamModalOpen(true); }}
                className="glass-card bg-white/60 dark:bg-slate-800/40 p-6 rounded-2xl group hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-slate-700/50 text-left"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-500">
                    <Timer className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Haqiqiy</p>
                </div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Haqiqiy imtihon</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">20 ta savol. 3 ta xato — imtihon to&apos;xtatiladi. Jiddiy sinov!</p>
                <span className="flex items-center justify-center gap-2 text-orange-500 font-bold text-sm group-hover:translate-x-1 transition-transform">
                  Boshlash <Zap className="w-4 h-4" />
                </span>
              </button>
              <Link href="/mistakes" className="glass-card bg-white/60 dark:bg-slate-800/40 p-6 rounded-2xl group hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-slate-700/50 block">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-500">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Xatolar</p>
                  <p className="text-sm font-bold text-rose-500">{mistakesCount} ta</p>
                </div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Xatolar bilan ishlash</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">Oldin xato qilgan savollaringizni qayta ko&apos;rib chiqing va o&apos;zlashtiring.</p>
                <span className="flex items-center justify-center gap-2 text-rose-500 font-bold text-sm group-hover:translate-x-1 transition-transform">
                  Xatolarni tozalash <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
              <Link href="/favorites" className="glass-card bg-white/60 dark:bg-slate-800/40 p-6 rounded-2xl group hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-slate-700/50 block">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-500">
                    <Star className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sevimli</p>
                  <p className="text-sm font-bold text-amber-500">{favoritesCount} ta</p>
                </div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Sevimli savollar</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">Siz belgilab qo&apos;ygan murakkab savollar jamlanmasi.</p>
                <span className="flex items-center justify-center gap-2 text-amber-500 font-bold text-sm group-hover:translate-x-1 transition-transform">
                  Ko&apos;rish <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>

          {/* O'ng ustun – Qoidalar + Eslatma */}
          <aside className="w-full lg:w-[420px] flex-shrink-0 flex flex-col gap-6">
            <div className="glass-card bg-white/40 dark:bg-slate-900/40 rounded-3xl p-6 border border-white/20 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Qoidalar</h3>
                <Link href="/qoidalar" className="text-primary text-xs font-semibold hover:underline">Hammasi</Link>
              </div>
              <div className="space-y-3">
                <Link href="/qoidalar/yol-harakati" className="p-3 glass-card bg-white/50 dark:bg-slate-800/50 rounded-xl flex items-center gap-3 hover:bg-white/80 dark:hover:bg-slate-700 transition-all border border-white/20 dark:border-slate-700/50">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center text-primary">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Yo&apos;l harakati qoidalari</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">30 bob mavjud</p>
                  </div>
                </Link>
                <Link href="/qoidalar/yol-belgilari" className="p-3 glass-card bg-white/50 dark:bg-slate-800/50 rounded-xl flex items-center gap-3 hover:bg-white/80 dark:hover:bg-slate-700 transition-all border border-white/20 dark:border-slate-700/50">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center text-emerald-500">
                    <Medal className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Yo&apos;l belgilari</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">7 kategoriya</p>
                  </div>
                </Link>
                <Link href="/qoidalar/yol-chiziqlari" className="p-3 glass-card bg-white/50 dark:bg-slate-800/50 rounded-xl flex items-center gap-3 hover:bg-white/80 dark:hover:bg-slate-700 transition-all border border-white/20 dark:border-slate-700/50">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-lg flex items-center justify-center text-orange-500">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Yo&apos;l chiziqlari</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Yotiq va tik chiziqlar</p>
                  </div>
                </Link>
                <Link href="/qoidalar/tezlik-chegaralari" className="p-3 glass-card bg-white/50 dark:bg-slate-800/50 rounded-xl flex items-center gap-3 hover:bg-white/80 dark:hover:bg-slate-700 transition-all border border-white/20 dark:border-slate-700/50">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center text-indigo-500">
                    <Timer className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Tezlik chegaralari</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Eng so&apos;nggi ma&apos;lumotlar</p>
                  </div>
                </Link>
                <Link href="/qoidalar" className="p-3 glass-card bg-white/50 dark:bg-slate-800/50 rounded-xl flex items-center gap-3 hover:bg-white/80 dark:hover:bg-slate-700 transition-all border border-white/20 dark:border-slate-700/50">
                  <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/40 rounded-lg flex items-center justify-center text-rose-500">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Boshqa qoidalar</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Video darslar va hujjatlar</p>
                  </div>
                </Link>
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-gradient-to-br from-primary to-blue-600 !text-white shadow-xl shadow-primary/30">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2 ">Eslatma</p>
              <p className="text-sm font-medium leading-relaxed">Qoidalar 2024-yildagi so&apos;nggi tahrirlar bilan to&apos;liq yangilangan.</p>
            </div>

            {/* Davomiylik – haftalik faollik (yechilgan savollar soniga asoslangan) */}
            <WeeklyChart data={weeklyStats.daily} />
          </aside>
        </div>
      </main>

      {/* Pastki nav – faqat mobil/planşet */}
      <nav className="dashboard-nav glass-card fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 lg:gap-8 lg:hidden">
        <Link href="/dashboard" className="p-2 text-primary hover:scale-110">
          <Home className="dashboard-nav-icon !size-10" />
        </Link>
        <Link href="/qoidalar" className="dashboard-nav-link p-2">
          <BookOpen className="dashboard-nav-icon !size-10" />
        </Link>
        <Link href="/biletlar" className="dashboard-nav-link p-2">
          <ClipboardCheck className="dashboard-nav-icon !size-10" />
        </Link>
        <Link href="/savollar" className="dashboard-nav-link p-2">
          <Search className="dashboard-nav-icon !size-10" />
        </Link>
        <Link href="/mistakes" className="dashboard-nav-link p-2">
          <Medal className="dashboard-nav-icon !size-10" />
        </Link>
        <Link href="/" className="dashboard-nav-link p-2">
          <SettingsIcon className="dashboard-nav-icon !size-10" />
        </Link>
      </nav>

      <div className="fixed top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" aria-hidden />
      <div className="fixed bottom-40 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" aria-hidden />

      {/* MODAL - Standart yoki Haqiqiy imtihon */}
      {examModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-8 w-full max-w-md border border-slate-200 dark:border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
            {examModalType === 'standard' ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-brand-blue/20 text-brand-blue dark:text-brand-cyan flex items-center justify-center mx-auto mb-4">
                    <Timer className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-2">Standart imtihon</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Savollar sonini tanlang. Xato qilsangiz ham imtihon tugamasin — barcha savollarni javoblang.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[10, 20, 50].map((count) => (
                    <button
                      key={count}
                      onClick={() => startStandardExam(count)}
                      className="flex flex-col items-center justify-center py-4 rounded-2xl bg-slate-50 dark:bg-night-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:border-brand-blue hover:bg-blue-50 dark:hover:bg-brand-blue/10 hover:shadow-lg hover:shadow-brand-blue/10 transition-all group"
                    >
                      <span className="text-xl font-bold group-hover:text-brand-blue transition-colors">{count}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold mt-1">Savol</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-500 flex items-center justify-center mx-auto mb-4">
                    <Timer className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-2">Haqiqiy imtihon</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    20 ta savol. 3 ta xato qilsangiz imtihon to&apos;xtaydi va &quot;Imtihon o&apos;tolmading&quot; chiqadi.
                  </p>
                  <button
                    onClick={startRealExam}
                    className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors shadow-lg shadow-orange-500/30"
                  >
                    Boshlash
                  </button>
                </div>
              </>
            )}
            <button
              onClick={() => { setExamModalOpen(false); setExamModalType(null); }}
              className="w-full py-3 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors mt-2"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}
    </div>
  )
}