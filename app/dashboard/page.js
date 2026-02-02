'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

// Icon komponentlari (kodni toza saqlash uchun)
const Icons = {
  Home: () => <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>,
  Book: () => <path d="M4 19.5A2.5 2.5 0 016.5 17H20"></path>, // Soddalashtirilgan
  Search: () => <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>,
  Settings: () => <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>,
  Car: () => <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 002 12v4c0 .6.4 1 1 1h2"></path>,
  Clock: () => <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>,
  Ticket: () => <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
}

const BILETLAR_STORAGE = 'biletlar_progress'

function getBiletlarProgress() {
  if (typeof window === 'undefined') return { completed: 0, totalCorrect: 0, percent: 0 }
  try {
    const raw = localStorage.getItem(BILETLAR_STORAGE)
    if (!raw) return { completed: 0, totalCorrect: 0, percent: 0 }
    const p = JSON.parse(raw)
    const completed = (p.completedTickets || []).length
    const totalCorrect = p.totalCorrectAnswers || 0
    const totalQuestions = 61 * 10
    const percent = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
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
  const [biletlarProgress, setBiletlarProgress] = useState(getBiletlarProgress)

  useEffect(() => {
    setBiletlarProgress(getBiletlarProgress())
  }, [pathname])

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
      } catch (error) {
        console.error("Token yangilashda xatolik:", error);
      }
    });

    return () => unsubscribe();
  }, [router])

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

  const startExam = (count) => {
    setExamModalOpen(false)
    router.push(`/exam?mode=real&count=${count}`)
  }

  // Sidebar item helper
  const SidebarItem = ({ icon, text, active = false, onClick }) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        active 
          ? 'bg-brand-blue/10 text-brand-cyan border border-brand-blue/20' 
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        {icon()}
      </svg>
      <span className="font-medium">{text}</span>
    </button>
  )

  const [stats, setStats] = useState({ solved: 0, total: 61, percent: 0 });

  useEffect(() => {
    // LocalStorage'dan ma'lumotni o'qish
    const savedData = localStorage.getItem('ticketProgress');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      const solvedCount = Object.values(parsed).filter(t => t.status === 'completed').length;
      // Jami biletlar soni (taxminan 1200 savol / 10 = 120 bilet, lekin rasmda 61 deyilgan)
      const totalTickets = 120; 
      
      setStats({
        solved: solvedCount,
        total: totalTickets,
        percent: Math.round((solvedCount / totalTickets) * 100)
      });
    }
  }, []);
  return (
    <div className="min-h-screen bg-night-950 flex font-sans text-slate-200">
      
      {/* 1. SIDEBAR (Desktop) - Chap tomon menyusi */}
      <aside className="hidden md:flex flex-col w-64 bg-night-900/50 border-r border-white/5 h-screen sticky top-0 backdrop-blur-xl z-50">
        <div className="p-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8">
               <Image 
                src="/imgage/avtotest-logo.png" 
                alt="Logo" 
                fill
                className="object-contain"
              />
            </div>
            <span className="font-heading font-bold text-xl text-white">
              Pravachi<span className="text-brand-cyan">UZ</span>
            </span>
          </Link>
        </div>

        <div className="flex-1 px-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">Menyu</p>
          <SidebarItem icon={Icons.Home} text="Bosh sahifa" active={true} />
          <SidebarItem icon={Icons.Book} text="Qoidalar" />
          <SidebarItem icon={Icons.Search} text="Qidirish" />
          
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-8">Tizim</p>
          <SidebarItem icon={Icons.Settings} text="Sozlamalar" />
        </div>

        <div className="p-4 border-t border-white/5">
           <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             <span>Chiqish</span>
           </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT (Asosiy qism) */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header (Desktop & Mobile) */}
        <header className="h-16 border-b border-white/5 bg-night-950/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center md:hidden">
             {/* Mobile Logo */}
             <Image src="/imgage/avtotest-logo.png" alt="Logo" width={28} height={28} className="mr-2" />
             <span className="font-heading font-bold text-lg text-white">Pravachi<span className="text-brand-cyan">UZ</span></span>
          </div>
          
          <div className="hidden md:block">
            <h1 className="text-lg text-white font-medium">Xush kelibsiz, {userName} 👋</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-xs text-brand-blue font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse mr-2"></span>
              Premium A&apos;zo
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-purple to-brand-blue p-[2px] cursor-pointer hover:shadow-lg hover:shadow-brand-blue/20 transition-all">
              <div className="w-full h-full rounded-full bg-night-900 flex items-center justify-center text-white text-sm font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
          
          {/* STATS ROW - Webda 3 ta alohida karta bo'ladi */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Karta 1 */}
            <div className="glass-card p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-night-900 to-night-800 relative overflow-hidden group hover:border-brand-blue/30 transition-all">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <span className="text-6xl">🚗</span>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Jami Savollar</p>
                  <h3 className="text-2xl md:text-3xl font-heading font-bold text-white">1,192</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue">
                  ?
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-emerald-400">
                <span>+12 ta yangi savol</span>
              </div>
            </div>

            {/* Karta 2 */}
            <div className="glass-card p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-night-900 to-night-800 relative overflow-hidden group hover:border-green-500/30 transition-all">
               <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <span className="text-6xl">⚙️</span>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Samaradorlik</p>
                  <h3 className="text-2xl md:text-3xl font-heading font-bold text-white">66%</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                  %
                </div>
              </div>
              <div className="mt-4 w-full bg-night-950 rounded-full h-1.5 overflow-hidden">
                <div className="bg-green-500 h-full rounded-full" style={{ width: '66%' }}></div>
              </div>
            </div>

            {/* Karta 3 */}
            <div className="glass-card p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-night-900 to-night-800 relative overflow-hidden group hover:border-amber-500/30 transition-all">
               <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <span className="text-6xl">🔥</span>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Davomiylik</p>
                  <h3 className="text-2xl md:text-3xl font-heading font-bold text-white">1 kun</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  ★
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-slate-400">
                <span>Ertaga ham kiring!</span>
              </div>
            </div>
          </section>

          {/* MAIN ACTIONS & CHARTS - Webda 2 ustun (Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* Chap tomon: Mashq turlari (2/3 qism) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-heading font-semibold text-white">Mashq qilish</h2>
                <button className="text-sm text-brand-cyan hover:underline">Barchasini ko&apos;rish</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Biletlar - Katta Card (rasmdagidek) */}
                <Link href="/biletlar" className="glass-card p-6 rounded-2xl border border-white/10 hover:border-brand-blue hover:bg-brand-blue/5 transition-all group text-left relative overflow-hidden block">
                  <div className="absolute right-0 top-0 p-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold">
                      61 bilet
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-brand-blue/20 flex items-center justify-center text-brand-cyan mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-white mb-1">Biletlar bo&apos;yicha</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">Har bir biletni alohida mashq qiling va bilimingizni mustahkamlang.</p>
                  <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                    <span>{biletlarProgress.completed}/61 yechilgan</span>
                    <span className="text-white font-semibold">{biletlarProgress.percent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-night-950 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-blue rounded-full transition-all" style={{ width: `${Math.min(100, biletlarProgress.percent)}%` }} />
                  </div>
                  <div className="mt-4 flex items-center font-bold text-white text-sm group-hover:text-brand-cyan transition-colors">
                    Biletlarni ko&apos;rish
                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </Link>

                {/* Imtihon - Katta Button */}
                <button 
                  onClick={() => setExamModalOpen(true)}
                  className="glass-card p-6 rounded-2xl border border-white/10 hover:border-orange-500 hover:bg-orange-500/5 transition-all group text-left relative overflow-hidden"
                >
                  <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><Icons.Clock /></svg>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-900/50 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><Icons.Clock /></svg>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-white mb-1">Haqiqiy Imtihon</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">20 ta savol, 20 daqiqa va ruxsat etilgan 2 ta xato.</p>
                </button>

                {/* Disabled Cards (Kichikroq ko'rinishda) */}
                <button className="sm:col-span-2 glass-card p-4 rounded-2xl border border-white/5 opacity-50 cursor-not-allowed flex items-center justify-between hover:opacity-60 transition-opacity">
                   <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">🔒</div>
                      <div className="text-left">
                        <div className="text-white font-medium">Mavzulashtirilgan</div>
                        <div className="text-xs text-slate-400">Tez kunda</div>
                      </div>
                   </div>
                   <span className="text-xs border border-white/10 px-2 py-1 rounded bg-night-900">Pro</span>
                </button>
              </div>
            </div>

            {/* O'ng tomon: Chart (1/3 qism) */}
            <div className="glass-card rounded-3xl p-6 border border-white/10 flex flex-col bg-night-900/40">
              <div className="mb-6">
                <p className="text-xs font-bold text-brand-cyan tracking-widest uppercase mb-1">Haftalik natija</p>
                <h3 className="text-2xl font-heading font-bold text-white">12 <span className="text-sm font-normal text-slate-400">javob</span></h3>
              </div>
              
              <div className="flex-1 flex items-end justify-between gap-3 min-h-[160px]">
                {['D', 'S', 'Ch', 'P', 'J', 'Sh', 'Y'].map((day, idx) => {
                  const heights = [30, 45, 25, 60, 20, 75, 40] // Foiz hisobida
                  const isToday = idx === 5
                  return (
                    <div key={day} className="flex flex-col items-center flex-1 group cursor-pointer">
                      <div className="relative w-full h-full flex items-end">
                         {/* Tooltip on hover */}
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-night-950 text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                           {heights[idx]}
                         </div>
                         <div
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            isToday ? 'bg-gradient-to-t from-brand-blue to-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]' : 'bg-slate-700/50 group-hover:bg-slate-600'
                          }`}
                          style={{ height: `${heights[idx]}%` }}
                        />
                      </div>
                      <span className={`mt-3 text-xs font-medium ${isToday ? 'text-white' : 'text-slate-500'}`}>{day}</span>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                 <span className="text-slate-400">Aniqlik: <span className="text-white font-bold">67%</span></span>
                 <Link href="/stats" className="text-brand-blue hover:text-brand-cyan transition-colors">To&apos;liq tarix &rarr;</Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAV - Faqat telefonda chiqadi */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-night-950/90 border-t border-white/10 backdrop-blur-xl z-50 pb-safe">
        <div className="flex items-center justify-around py-3 text-[10px] font-medium text-slate-400">
          <button className="flex flex-col items-center text-brand-cyan gap-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><Icons.Home/></svg>
            <span>Asosiy</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><Icons.Book/></svg>
            <span>Qoidalar</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><Icons.Search/></svg>
            <span>Qidirish</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><Icons.Settings/></svg>
            <span>Sozlama</span>
          </button>
        </div>
      </nav>

      {/* MODAL - Imtihon sozlamalari */}
      {examModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-card rounded-3xl p-8 w-full max-w-md border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
               <div className="w-16 h-16 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center mx-auto mb-4">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><Icons.Clock/></svg>
               </div>
               <h3 className="text-2xl font-heading font-bold text-white mb-2">Imtihon rejimi</h3>
               <p className="text-sm text-slate-400">
                 O'zingizni sinashga tayyormisiz? Kerakli savollar sonini tanlang.
               </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[10, 20, 50].map((count) => (
                <button
                  key={count}
                  onClick={() => startExam(count)}
                  className="flex flex-col items-center justify-center py-4 rounded-2xl bg-night-900 border border-white/10 text-white hover:border-brand-blue hover:bg-brand-blue/10 hover:shadow-lg hover:shadow-brand-blue/10 transition-all group"
                >
                  <span className="text-xl font-bold group-hover:text-brand-blue transition-colors">{count}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold mt-1">Savol</span>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setExamModalOpen(false)}
              className="w-full py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}
    </div>
  )
}