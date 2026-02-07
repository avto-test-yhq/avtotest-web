'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
// Agar lucide-react o'rnatilmagan bo'lsa: npm install lucide-react
import { Sun, Moon, Menu, X, Check, Download, ChevronRight, Apple, Play } from 'lucide-react'

export default function Home() {
  const [darkMode, setDarkMode] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Tizim mavzusini o'qish yoki localStorage dan olish
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'light') {
      setDarkMode(false)
    } else {
      setDarkMode(true)
    }
  }, [])

  // Mavzuni o'zgartirish funksiyasi
  const toggleTheme = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('theme', newMode ? 'dark' : 'light')
  }

  return (
    // "dark" klassi qo'shilsa tun, olib tashlansa kun rejimi ishlaydi
    <div className={`${darkMode ? 'dark' : ''} font-sans transition-colors duration-300`}>
      <div className="min-h-screen bg-slate-50 dark:bg-night-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden">
        
        {/* Background Elements (Faqat Dark mode da ko'rinadi yoki Light da sal o'zgaradi) */}
        <div className="fixed inset-0 bg-[url('/imgage/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none z-0 opacity-20 dark:opacity-40"></div>
        <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-brand-blue/10 dark:bg-brand-blue/20 rounded-full blur-[128px] animate-pulse-glow pointer-events-none"></div>
        <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-purple/10 dark:bg-brand-purple/20 rounded-full blur-[128px] animate-pulse-glow pointer-events-none" style={{animationDelay: '2s'}}></div>

        {/* --- NAVBAR --- */}
        <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-white/70 dark:bg-night-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo */}
              <Link href="/" className="flex items-center cursor-pointer group">
                <div className="relative w-10 h-10 mr-3">
                   {/* Logo rasmingizni to'g'ri joylashtiring */}
                   <Image src="/imgage/avtotest-logo.png" alt="Logo" fill className="object-contain group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="font-heading font-bold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
                  Pravachi<span className="text-brand-cyan">UZ</span>
                </span>
              </Link>

              {/* Desktop Menu */}
              <div className="hidden lg:flex items-center space-x-8">
                {['Qanday ishlaydi', 'Mentorlar', 'Tariflar'].map((item) => (
                  <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-brand-blue dark:hover:text-white transition-colors relative group">
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-cyan transition-all group-hover:w-full"></span>
                  </a>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Theme Toggle */}
                <button 
                  onClick={toggleTheme} 
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-night-800 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-brand-blue dark:hover:text-white transition-all"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                
                <Link href="/login" className="hidden sm:block text-sm font-bold text-slate-700 dark:text-white hover:text-brand-cyan transition-colors">
                  Kirish
                </Link>
                <Link href="/login" className="bg-slate-900 dark:bg-white text-white dark:text-night-950 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-brand-cyan dark:hover:bg-brand-cyan hover:text-white transition-all shadow-lg hover:shadow-brand-cyan/50">
                  Boshlash
                </Link>
                
                {/* Mobile Menu Button */}
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-slate-600 dark:text-slate-300">
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-200 dark:border-white/5 bg-white dark:bg-night-900 absolute w-full left-0">
              <div className="px-4 py-6 space-y-4">
                 {['Qanday ishlaydi', 'Mentorlar', 'Tariflar'].map((item) => (
                  <a key={item} href="#" className="block text-base font-medium text-slate-600 dark:text-slate-400 hover:text-brand-blue dark:hover:text-white py-2 border-b border-slate-100 dark:border-white/5">
                    {item}
                  </a>
                ))}
                <Link href="/login" className="block text-base font-bold text-brand-blue py-2">Kirish</Link>
              </div>
            </div>
          )}
        </nav>

        {/* --- HERO SECTION --- */}
        <section className="relative pt-32 sm:pt-36 lg:pt-40 pb-20 overflow-hidden z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center">
              
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-night-800/80 backdrop-blur-md border border-brand-cyan/30 rounded-full px-5 py-2 mb-8 shadow-lg shadow-brand-cyan/10 animate-slide-up" style={{animationDelay: '0.1s'}}>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-cyan"></span>
                </span>
                <span className="text-xs font-heading font-bold text-brand-cyan tracking-wider uppercase">AI Mentor + Jonli Ustozlar</span>
              </div>

              {/* Headline */}
              <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-slate-900 dark:text-white leading-[1.1] mb-8 animate-slide-up" style={{animationDelay: '0.2s'}}>
                Haydovchilikni <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple">Kelajakda</span> O&apos;rganing
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-12 leading-relaxed animate-slide-up" style={{animationDelay: '0.3s'}}>
                Eski usullarni unuting. Sun&apos;iy intellekt tahlili, <span className="text-slate-900 dark:text-white font-semibold">real imtihon simulyatsiyasi</span> va tajribali mentorlar bilan guvohnomani 1-urinishda oling.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-5 mb-20 animate-slide-up" style={{animationDelay: '0.4s'}}>
                <Link href="/login" className="group relative px-8 py-4 bg-brand-blue text-white rounded-2xl font-bold text-lg overflow-hidden shadow-xl shadow-brand-blue/30 transition-all hover:scale-105">
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span>Sinovni Boshlash</span>
                </Link>
                
                <a href="https://play.google.com/store/apps/details?id=uz.sheronov.avtotest&hl=en" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white dark:bg-night-800/50 hover:bg-slate-50 dark:hover:bg-night-800 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 hover:border-brand-blue/30 rounded-2xl font-bold text-lg backdrop-blur-sm transition-all flex items-center justify-center shadow-lg dark:shadow-none">
                  <Download className="w-5 h-5 mr-2 opacity-70" />
                  Ilovani Yuklash
                </a>
              </div>

              {/* 3D DASHBOARD VISUALIZATION */}
              <div className="relative w-full max-w-5xl mx-auto perspective-1000 group animate-slide-up" style={{animationDelay: '0.5s'}}>
                <div className="absolute -inset-4 bg-gradient-to-r from-brand-cyan/20 to-brand-purple/20 rounded-[40px] blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-700"></div>
                
                <div className="relative bg-slate-900 dark:bg-night-900 border border-slate-200 dark:border-white/10 rounded-[32px] overflow-hidden shadow-2xl shadow-slate-900/20 dark:shadow-black/50 aspect-[16/9] md:aspect-[21/9]">
                   {/* Mac Style Header */}
                   <div className="absolute top-0 left-0 right-0 h-10 bg-white/5 backdrop-blur-md flex items-center px-4 border-b border-white/5 z-20">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                      </div>
                      <div className="mx-auto text-xs font-mono text-slate-400">AVTO_MENTOR_SIMULATOR_V2.4</div>
                   </div>

                   {/* Mockup Image */}
                   <div className="relative w-full h-full">
                      <Image src="/imgage/285.webp" alt="Simulator" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 dark:from-night-950 via-transparent to-transparent"></div>

                      {/* Mockup Interface UI (Hardcoded UI elements) */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[60%] bg-white/10 dark:bg-night-900/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-brand-blue/30 shadow-2xl">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold text-brand-blue bg-blue-500/10 px-2 py-1 rounded">Savol 14/20</span>
                            <span className="text-xs font-mono text-white">00:14:32</span>
                          </div>
                          <h3 className="text-lg md:text-xl font-bold text-white mb-6">Chorrahada qaysi transport vositasi birinchi bo&apos;lib harakatlanadi?</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-sm">A) Ko&apos;k avtomobil</div>
                              <div className="p-3 rounded-lg bg-brand-green/20 border border-brand-green/50 text-white text-sm shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                B) Tramvay <span className="float-right text-brand-green">✓</span>
                              </div>
                          </div>
                      </div>
                      
                      {/* AI Chat Bubble */}
                      <div className="absolute top-16 right-8 md:right-12 bg-white/90 dark:bg-night-800/90 backdrop-blur p-4 rounded-xl max-w-[200px] border-l-4 border-brand-purple shadow-lg animate-float hidden sm:block">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-brand-purple animate-pulse"></div>
                          <span className="text-[10px] font-bold text-brand-purple uppercase">AI Mentor</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">&quot;To&apos;g&apos;ri! Tramvay teng ahamiyatli yo&apos;llarda har doim ustunlikka ega.&quot;</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- KEY METRICS --- */}
        <section className="border-y border-slate-200 dark:border-white/5 bg-white/50 dark:bg-night-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { val: '15,000+', label: "O'quvchilar", color: 'group-hover:text-brand-cyan' },
                { val: '98%', label: "Muvaffaqiyat", color: 'group-hover:text-brand-blue' },
                { val: '24/7', label: "AI Yordam", color: 'group-hover:text-brand-purple' },
                { val: '2026', label: "Yangi Baza", color: 'group-hover:text-brand-accent' },
              ].map((stat, idx) => (
                <div key={idx} className="text-center group cursor-pointer">
                  <div className={`text-3xl font-heading font-bold text-slate-900 dark:text-white mb-1 transition-colors ${stat.color}`}>{stat.val}</div>
                  <div className="text-sm text-slate-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS --- */}
        <section id="how-it-works" className="py-24 relative z-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Ishlash <span className="text-brand-cyan">Tartibi</span></h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Murakkab jarayonni 3 ta oddiy qadamga aylantirdik.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-slate-200 via-brand-blue/50 to-slate-200 dark:from-slate-800 dark:to-slate-800 z-0"></div>

              {[
                { id: 1, title: 'Bilimni Aniqlash', desc: 'Qisqa test orqali darajangizni bilib oling va shaxsiy "Smart" o\'quv rejasini qo\'lga kiriting.', color: 'brand-blue' },
                { id: 2, title: 'AI Bilan Mashq', desc: 'Xatolar ustida ishlash uchun eng samarali usul. AI sizga qiyin mavzularni sodda tilda tushuntiradi.', color: 'brand-purple' },
                { id: 3, title: 'Imtihon Topshirish', desc: 'Tayyorgarlik darajasi 90% ga yetganda, GAI imtihoniga ishonch bilan boring va guvohnoma oling.', color: 'brand-cyan' }
              ].map((step) => (
                <div key={step.id} className="bg-white dark:bg-white/5 p-8 rounded-3xl relative z-10 border border-slate-200 dark:border-white/5 hover:border-brand-blue/50 dark:hover:border-brand-blue/50 shadow-xl dark:shadow-none transition-colors group">
                  <div className={`w-24 h-24 mx-auto bg-slate-50 dark:bg-night-900 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-4xl font-heading font-bold text-slate-900 dark:text-white mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300 relative`}>
                    {step.id}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-3">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm text-center leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- PRICING --- */}
        <section id="pricing" className="py-24 bg-slate-100 dark:bg-night-900 border-t border-slate-200 dark:border-white/5 relative overflow-hidden">
           {/* Glows */}
           <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none"></div>
           <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-brand-purple/5 rounded-full blur-[100px] pointer-events-none"></div>

           <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="text-center mb-16">
                 <h2 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Qulay <span className="text-brand-purple">Tariflar</span></h2>
                 <p className="text-slate-600 dark:text-slate-400">Yashirin to'lovsiz, shaffof narxlar.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                 {/* Free Tier */}
                 <div className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-slate-200 dark:border-white/5 hover:border-brand-blue/30 transition-all shadow-xl dark:shadow-none">
                    <h3 className="font-bold text-xl text-slate-700 dark:text-slate-300">Start</h3>
                    <div className="text-4xl font-bold text-slate-900 dark:text-white mt-4 mb-2">0 so'm</div>
                    <p className="text-sm text-slate-500 mb-8">Platforma bilan tanishish uchun</p>
                    <ul className="space-y-4 mb-8 text-sm text-slate-600 dark:text-slate-300">
                      <li className="flex items-center"><Check className="w-5 h-5 text-brand-green mr-3"/> 100 ta test savoli</li>
                      <li className="flex items-center"><Check className="w-5 h-5 text-brand-green mr-3"/> Asosiy qoidalar</li>
                      <li className="flex items-center opacity-50"><X className="w-5 h-5 mr-3"/> AI Mentor yo'q</li>
                    </ul>
                    <Link href="/login" className="block w-full py-3 rounded-xl border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-bold text-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Bepul Boshlash</Link>
                 </div>

                 {/* Pro Tier (Featured) */}
                 <div className="relative bg-gradient-to-b from-brand-blue/20 to-brand-purple/20 p-1 rounded-[26px]">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-blue to-brand-purple text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">ENG MASHHUR</div>
                    <div className="bg-white dark:bg-night-950/90 rounded-[22px] p-8 h-full border border-brand-blue/30 shadow-2xl">
                       <h3 className="font-bold text-xl text-brand-blue">Pro Avto</h3>
                       <div className="text-5xl font-bold text-slate-900 dark:text-white mt-4 mb-2">49k <span className="text-lg text-slate-500 font-normal">/oy</span></div>
                       <p className="text-sm text-slate-500 mb-8">Kafolatlangan natija uchun</p>
                       <ul className="space-y-4 mb-8 text-sm text-slate-700 dark:text-white font-medium">
                          <li className="flex items-center"><Check className="w-5 h-5 text-brand-cyan mr-3"/> Barcha 2000+ savollar</li>
                          <li className="flex items-center"><Check className="w-5 h-5 text-brand-cyan mr-3"/> AI Mentor tahlili</li>
                          <li className="flex items-center"><Check className="w-5 h-5 text-brand-cyan mr-3"/> Imtihon Simulyatori</li>
                          <li className="flex items-center"><Check className="w-5 h-5 text-brand-cyan mr-3"/> Video Darsliklar</li>
                       </ul>
                       <button className="block w-full py-4 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white font-bold text-center hover:shadow-lg transition-all transform hover:scale-[1.02]">A'zo Bo'lish</button>
                    </div>
                 </div>

                 {/* Premium Tier */}
                 <div className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-slate-200 dark:border-white/5 hover:border-brand-purple/30 transition-all shadow-xl dark:shadow-none">
                    <h3 className="font-bold text-xl text-brand-purple">Premium</h3>
                    <div className="text-4xl font-bold text-slate-900 dark:text-white mt-4 mb-2">99k <span className="text-lg text-slate-500 font-normal">/3 oy</span></div>
                    <p className="text-sm text-slate-500 mb-8">To'liq kurs va ustoz</p>
                    <ul className="space-y-4 mb-8 text-sm text-slate-600 dark:text-slate-300">
                      <li className="flex items-center"><Check className="w-5 h-5 text-brand-purple mr-3"/> Pro tarifining barchasi</li>
                      <li className="flex items-center"><Check className="w-5 h-5 text-brand-purple mr-3"/> Jonli Mentor yordami</li>
                      <li className="flex items-center"><Check className="w-5 h-5 text-brand-purple mr-3"/> Sertifikat</li>
                    </ul>
                    <button className="block w-full py-3 rounded-xl border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-bold text-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Tanlash</button>
                 </div>
              </div>
           </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="bg-slate-50 dark:bg-night-950 border-t border-slate-200 dark:border-white/5 pt-16 pb-8 relative z-10">
           <div className="max-w-7xl mx-auto px-4">
              <div className="grid md:grid-cols-4 gap-12 mb-12">
                 <div className="col-span-1">
                    <div className="flex items-center mb-6">
                       <Image src="/imgage/avtotest-logo.png" alt="Logo" width={32} height={32} className="mr-3" />
                       <span className="font-heading font-bold text-xl text-slate-900 dark:text-white">PravachiUZ</span>
                    </div>
                    <p className="text-slate-500 text-sm mb-6">Kelajak haydovchilari uchun №1 raqamli platforma.</p>
                 </div>
                 
                 {[
                   { header: 'Platforma', links: ['Biz haqimizda', 'Tariflar', 'Mentorlar'] },
                   { header: 'Yordam', links: ['Qo\'llab-quvvatlash', 'FAQ', 'Maxfiylik'] }
                 ].map((col, idx) => (
                   <div key={idx}>
                     <h4 className="font-bold text-slate-900 dark:text-white mb-4">{col.header}</h4>
                     <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                       {col.links.map(link => (
                         <li key={link}><a href="#" className="hover:text-brand-blue dark:hover:text-brand-cyan transition-colors">{link}</a></li>
                       ))}
                     </ul>
                   </div>
                 ))}
                 
                 <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-4">Ilovani Yuklang</h4>
                    <div className="space-y-3">
                       <a href="#" className="block bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 p-3 rounded-xl flex items-center hover:bg-slate-300 dark:hover:bg-white/10 transition-colors">
                          <Apple className="w-6 h-6 text-slate-900 dark:text-white mr-3" />
                          <div>
                             <div className="text-[10px] text-slate-500">Download on the</div>
                             <div className="text-sm font-bold text-slate-900 dark:text-white leading-none">App Store</div>
                          </div>
                       </a>
                       <a href="https://play.google.com/store/apps/details?id=uz.sheronov.avtotest&hl=en" target="_blank" rel="noopener noreferrer" className="block bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 p-3 rounded-xl flex items-center hover:bg-slate-300 dark:hover:bg-white/10 transition-colors">
                          <Play className="w-6 h-6 text-slate-900 dark:text-white mr-3" />
                          <div>
                             <div className="text-[10px] text-slate-500">GET IT ON</div>
                             <div className="text-sm font-bold text-slate-900 dark:text-white leading-none">Google Play</div>
                          </div>
                       </a>
                    </div>
                 </div>
              </div>
              <div className="border-t border-slate-200 dark:border-white/5 pt-8 text-center text-slate-500 text-sm">
                 &copy; 2026 AvtoMentor Pro. Barcha huquqlar himoyalangan.
              </div>
           </div>
        </footer>

      </div>
    </div>
  )
}