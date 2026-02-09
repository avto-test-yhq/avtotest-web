'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import ThemeToggle from '@/components/ThemeToggle'
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
          } catch (e) {}
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
        }).catch(() => {})

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
        } catch (e) {}
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
      } catch (e) {}
    }
  }, []);

  const weekLabels = (weeklyStats.daily?.length ? weeklyStats.daily : [{ label: 'DUSH', percent: 0 }, { label: 'SESH', percent: 0 }, { label: 'CHOR', percent: 0 }, { label: 'PAY', percent: 0 }, { label: 'JUM', percent: 0 }, { label: 'SHA', percent: 0 }, { label: 'YAK', percent: 0 }]);

  return (
    <div className="dashboard-page min-h-screen page-bg flex font-display text-slate-900 overflow-x-hidden">
      <div className="dashboard-wrap flex flex-col lg:flex-row w-full min-h-screen">
        {/* CHAP USTUN */}
        <section className="dashboard-main w-full lg:w-1/2 h-full overflow-y-auto dashboard-section-pad">
          <header className="flex justify-between items-center mb-8 lg:mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
                <Car className="w-5 h-5 text-white" />
              </div>
              <Link href="/" className="text-2xl font-extrabold tracking-tight text-white">
                Pravachi<span className="text-primary">UZ</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle size="sm" />
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-800 ring-2 ring-white/20 shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          <div className="mb-8 lg:mb-10">
            <h2 className="dashboard-title text-white">
              Xush kelibsiz, <span className="text-primary">{userName}</span> 👋
            </h2>
            <p className="dashboard-subtitle">Bugungi mashg&apos;ulotlarni davom ettirishga tayyormisiz?</p>
          </div>

          {/* Oxirgi mashq – Biletlar */}
          <Link href="/biletlar" className="block relative group cursor-pointer mb-10 overflow-hidden rounded-3xl bg-blue-600 p-8 text-white shadow-xl shadow-blue-600/30">
              <div className="relative z-10">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider !text-white">Oxirgi mashq</span>
                <h3 className="text-3xl font-bold mt-4 mb-2 !text-white">Biletlar bo'yicha</h3>
                <p className="opacity-80 mb-6 text-sm max-w-sm !text-white">Har bir biletni alohida mashq qiling va bilimingizni mustahkamlang.</p>
                <div className="flex items-center justify-between bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                  <div className="flex flex-col">
                    <span className="text-xs opacity-70 !text-white">Progress</span>
                    <span className="text-xl font-bold !text-white">{biletlarProgress.completed}/{mastery.totalTickets} yechilgan ({biletlarProgress.percent}%)</span>
                  </div>
                  <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors">Davom etish</button>
                </div>
              </div>
              {/* Rasm placeholder (Dizayn buzilmasligi uchun) */}
              <img 
                 alt="Driving school car" 
                 className="absolute top-0 right-0 h-full w-1/3 object-cover opacity-20 pointer-events-none" 
                 src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuvFci29edPEcx4oinoYcCGcarH-JEy9ANOiKgLXzplMHJhZ9c-RZaT6unQXF2ReIkfXWyyxxAm6tmLSQ4s9-46wjH4tdiuQr7LQxyqQ8bmvXf4eodT5jHbpMgijzLhSOAUmZ0X6XZJsT44HeR8PGtdUsYF3wvrQXDgYRQePioj3dKq7TNxA3qIgyxf9kWBRuuQw-_wYdsNLCyf8jsv1y3ZszVRvuwEML8J6DNKpBXs5n20zu0udv0tMa6jHt1REEY7yAzQYopOpiR" 
              />
            </Link>

          {/* 4 ta activity card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 pb-24 lg:pb-12">
            <button
              onClick={() => { setExamModalType('standard'); setExamModalOpen(true); }}
              className="glass-card dashboard-activity-card hover:border-primary/30 group"
            >
              <div className="dashboard-icon-box dashboard-icon-box--primary">
                <Timer className="w-6 h-6" />
              </div>
              <h4 className="dashboard-card-title text-white">Standart imtihon</h4>
              <p className="dashboard-card-desc">10, 20 yoki 50 ta savol. Xato qilsangiz ham davom ettiring.</p>
              <span className="dashboard-card-cta text-primary">
                Boshlash <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </span>
            </button>
            <button
              onClick={() => { setExamModalType('real'); setExamModalOpen(true); }}
              className="glass-card dashboard-activity-card hover:border-orange-500/30 group"
            >
              <div className="dashboard-icon-box dashboard-icon-box--orange">
                <Timer className="w-6 h-6" />
              </div>
              <h4 className="dashboard-card-title text-white">Haqiqiy imtihon</h4>
              <p className="dashboard-card-desc">20 ta savol. 3 ta xato — imtihon to&apos;xtatiladi. Jiddiy sinov!</p>
              <span className="dashboard-card-cta text-orange-500">
                Boshlash <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </span>
            </button>
            <Link href="/mistakes" className="glass-card dashboard-activity-card hover:border-red-500/30 block group">
              <div className="dashboard-icon-box dashboard-icon-box--red">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="dashboard-card-title text-white">Xatolar rejimi</h4>
              <p className="dashboard-card-desc">Faqat noto&apos;g&apos;ri javob bergan savollaringiz ustida ishlang.</p>
              <span className="dashboard-card-cta text-red-400">
                O&apos;tish <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </span>
            </Link>
            <Link href="/favorites" className="glass-card dashboard-activity-card hover:border-amber-500/30 block group">
              <div className="dashboard-icon-box dashboard-icon-box--amber">
                <Star className="w-6 h-6" />
              </div>
              <h4 className="dashboard-card-title text-white">Sevimli savollar</h4>
              <p className="dashboard-card-desc">Siz belgilab qo&apos;ygan murakkab savollar jamlanmasi.</p>
              <span className="dashboard-card-cta text-amber-400">
                Ko&apos;rish <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </span>
            </Link>
          </div>
        </section>

        {/* O'NG USTUN – Statistika + gradient-bg */}
        <section className="w-full lg:w-1/2 h-full gradient-bg dashboard-section-pad overflow-y-auto">
          <div className="flex justify-between items-end mb-8 lg:mb-12">
            <div>
              <h2 className="dashboard-title text-white font-extrabold mb-1">Statistika</h2>
              <p className="dashboard-subtitle">Sizning haftalik yutuqlaringiz</p>
            </div>
            <Link href="/tarix" className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/20 px-4 lg:px-6 py-2 rounded-2xl text-sm font-bold hover:bg-white hover:text-black transition-colors text-white">
              Barcha hisobotlar
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-10">
            <div className="glass-card dashboard-stat-card">
              <div className="flex justify-between items-start mb-4">
                <HelpCircle className="w-6 h-6 text-primary" />
                <span className="text-xs font-bold text-emerald-500">+{mastery.percent}%</span>
              </div>
              <p className="dashboard-stat-value text-white">{mastery.totalQuestions.toLocaleString()}</p>
              <p className="dashboard-stat-label">Jami Savollar</p>
            </div>
            <div className="glass-card dashboard-stat-card">
              <div className="flex justify-between items-start mb-4">
                <Zap className="w-6 h-6 text-orange-500" />
                <span className="text-xs font-bold text-emerald-500">+{weeklyStats.changePercent || 0}%</span>
              </div>
              <p className="dashboard-stat-value text-white">{mastery.percent}%</p>
              <p className="dashboard-stat-label">Samaradorlik</p>
            </div>
            <Link href="/tashriflar" className="glass-card dashboard-stat-card block">
              <div className="flex justify-between items-start mb-4">
                <Flame className="w-6 h-6 text-yellow-500" />
                <span className="text-xs font-bold text-red-400">0</span>
              </div>
              <p className="dashboard-stat-value text-white">{activityDays} kun</p>
              <p className="dashboard-stat-label">Davomiylik</p>
            </Link>
          </div>
          <div className="glass-card dashboard-block p-6 lg:p-8 mb-8 lg:mb-10 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6 lg:mb-8">
                <h3 className="dashboard-title-sm text-white">Haftalik faollik</h3>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">BU HAFTA</span>
              </div>
              <div className="flex items-end justify-between gap-2 lg:gap-3 h-36 lg:h-40">
                {weekLabels.map((d, idx) => {
                  const pct = Math.min(100, (d.percent || 0) * 2)
                  const barH = pct ? `${Math.max(pct, 8)}%` : '8%'
                  return (
                    <div key={d.label} className="flex flex-col items-center flex-1">
                      <div className="w-full bg-primary/20 rounded-xl relative overflow-hidden flex items-end" style={{ minHeight: 150 }}>
                        <div className="absolute bottom-0 w-full bg-primary rounded-xl transition-all duration-500" style={{ height: barH }} />
                      </div>
                      <span className="text-[10px] mt-2 font-bold opacity-60 text-white">{d.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="glass-card dashboard-block p-6 lg:p-8 pb-24 lg:pb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="dashboard-title-sm text-white">Top Foydalanuvchilar</h3>
              <span className="text-primary text-sm font-bold cursor-pointer">Hammasini ko&apos;rish</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/10 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-slate-400 w-4 text-center">1</span>
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">AS</div>
                  <div>
                    <p className="font-bold text-sm text-white">Asadbek S.</p>
                    <p className="text-[10px] text-slate-500 uppercase">98% samaradorlik</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-primary">
                  <Medal className="w-4 h-4" />
                  <span className="text-xs font-bold">2,450 p</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/10 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-slate-400 w-4 text-center">2</span>
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">MK</div>
                  <div>
                    <p className="font-bold text-sm text-white">Madina K.</p>
                    <p className="text-[10px] text-slate-500 uppercase">95% samaradorlik</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-slate-500">
                  <Trophy className="w-4 h-4" />
                  <span className="text-xs font-bold">2,120 p</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-primary/10 border border-primary/20">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-primary w-4 text-center">—</span>
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-800 dark:text-slate-200 text-xs font-bold ring-2 ring-white">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">Siz ({userName})</p>
                    <p className="text-[10px] text-primary uppercase">O&apos;z natijangiz</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-primary">{mastery.masteredCount} p</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Pastki nav */}
      <nav className="dashboard-nav glass-card fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 lg:gap-8">
        <Link href="/dashboard" className="p-2 text-primary hover:scale-110">
          <Home className="dashboard-nav-icon !size-10" />
        </Link>
        <Link href="/biletlar" className="dashboard-nav-link p-2">
          <BookOpen className="dashboard-nav-icon !size-10" />
        </Link>
        <button type="button" className="dashboard-nav-link p-2">
          <Search className="dashboard-nav-icon !size-10" />
        </button>
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-card rounded-3xl p-8 w-full max-w-md border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
            {examModalType === 'standard' ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-brand-blue/20 text-brand-cyan flex items-center justify-center mx-auto mb-4">
                    <Timer className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-white mb-2">Standart imtihon</h3>
                  <p className="text-sm text-slate-400">
                    Savollar sonini tanlang. Xato qilsangiz ham imtihon tugamasin — barcha savollarni javoblang.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[10, 20, 50].map((count) => (
                    <button
                      key={count}
                      onClick={() => startStandardExam(count)}
                      className="flex flex-col items-center justify-center py-4 rounded-2xl bg-night-900 border border-white/10 text-white hover:border-brand-blue hover:bg-brand-blue/10 hover:shadow-lg hover:shadow-brand-blue/10 transition-all group"
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
                  <div className="w-16 h-16 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center mx-auto mb-4">
                    <Timer className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-white mb-2">Haqiqiy imtihon</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    20 ta savol. 3 ta xato qilsangiz imtihon to&apos;xtaydi va &quot;Imtihon o&apos;tolmading&quot; chiqadi.
                  </p>
                  <button
                    onClick={startRealExam}
                    className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors"
                  >
                    Boshlash
                  </button>
                </div>
              </>
            )}
            <button
              onClick={() => { setExamModalOpen(false); setExamModalType(null); }}
              className="w-full py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors mt-4"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}
    </div>
  )
}