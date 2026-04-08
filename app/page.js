'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext'
import ThemeToggle from '@/components/ThemeToggle'
import {
  Menu, X, Check, Star, Sparkles, BookOpen,
  MessageCircle, BarChart3, LocateFixed, LogIn,
  Apple, Play, User
} from 'lucide-react'

export default function Home() {
  const { theme } = useTheme()
  const darkMode = theme === 'dark'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      title: "Imtihonlarga mustaqil tayyorlanish",
      desc: "Davlat imtihonlari standartlari asosida tuzilgan testlar to'plami.",
      icon: <BookOpen className="w-6 h-6 text-blue-500" />,
      bgColor: "bg-blue-50",
    },
    {
      title: "Xatolar ustida ishlash",
      desc: "Siz yo'l qo'ygan xatolarni tahlil qilib, ularni takrorlamaslikka yordam beramiz.",
      icon: <Check className="w-6 h-6 text-green-500" />,
      bgColor: "bg-green-50",
    },
    {
      title: "O'zlashtirishni nazorat qilish",
      desc: "Sizning o'sish dinamikangizni grafiklar va statistikalar orqali kuzatib boring.",
      icon: <BarChart3 className="w-6 h-6 text-orange-500" />,
      bgColor: "bg-orange-50",
    },
    {
      title: "YHQ qoidalarini o'rganish",
      desc: "Yo'l harakati qoidalarini interaktiv va tushunarli usulda o'rganing.",
      icon: <LocateFixed className="w-6 h-6 text-purple-500" />,
      bgColor: "bg-purple-50",
    }
  ]

  const testimonials = [
    {
      name: "Azizbek Karimov",
      role: "Tadbirkor",
      text: '"PravachiUZ orqali haydovchilik guvohnomasini 1-urinishda oldim. AI mentor juda foydali ekan, xatolarni tahlil qilib, qaysi mavzularda kuchli ekanimni ko\'rsatdi."',
      rating: 5,
    },
    {
      name: "Nilufar Rahimova",
      role: "Talaba",
      text: '"Darslar juda tushunarli va qiziqarli. Video darsliklar orqali murakkab qoidalarni oson o\'zlashtirdim. Jonli mentorlar har doim yordam berishdi."',
      rating: 5,
    },
    {
      name: "Rustam Toshev",
      role: "Buxgalter",
      text: '"Ish vaqtim cheklangan bo\'lsa-da, 24/7 ishlaydigan platforma tufayli o\'zimga qulay vaqtda o\'qishim mumkin bo\'ldi. Tavsiya etaman!"',
      rating: 5,
    }
  ]

  return (
    <div className={`${darkMode ? 'dark' : ''} font-sans transition-colors duration-300`}>
      <div className="min-h-screen bg-white dark:bg-night-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden">

        {/* --- NAVBAR --- */}
        <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-night-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link href="/" className="flex items-center gap-3 cursor-pointer group">
                <Image
                  src="/imgage/avtotest-logo.png"
                  alt="AvtoTest Logo"
                  width={60}
                  height={60}
                  className="h-10 w-auto object-contain filter group-hover:brightness-110 transition-all"
                  priority
                />
                <span className="font-heading font-bold text-2xl text-slate-900 dark:text-white">Pravachi</span>
              </Link>

              <div className="hidden lg:flex items-center space-x-10 text-sm font-medium text-slate-600 dark:text-slate-400">
                {['Biz haqimizda', 'Avtomaktablar', 'Avtodromlar', 'Instruktorlar', 'Savol javoblar', 'Aloqa'].map((item) => (
                  <a key={item} href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">{item}</a>
                ))}
              </div>

              <div className="flex items-center space-x-4">
                <ThemeToggle className="hover:bg-slate-100 dark:hover:bg-white/5" />
                <Link href="/login" className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2 group">
                  <LogIn className="w-4 h-4" />
                  Kirish
                </Link>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-slate-600 dark:text-slate-300">
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white dark:bg-night-900 border-t border-slate-100 dark:border-white/5 px-4 py-8 space-y-6">
              {['Biz haqimizda', 'Avtomaktablar', 'Avtodromlar', 'Instruktorlar', 'Savol javoblar', 'Aloqa'].map((item) => (
                <a key={item} href="#" className="block text-lg font-medium text-slate-700 dark:text-slate-300">{item}</a>
              ))}
              <Link href="/login" className="block w-full py-4 bg-blue-600 text-white text-center rounded-2xl font-bold">Kirish</Link>
            </div>
          )}
        </nav>

        {/* --- HERO SECTION --- */}
        <section className="relative pt-32 lg:pt-48 pb-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">AI Destakli Platforma</span>
                </div>
                <h1 className="font-heading text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
                  Kelajak <span className="text-blue-600">Haydovchilari</span> Uchun №1 Platforma
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg leading-relaxed">
                  Sun&apos;iy intellekt tahlili va interaktiv testlar orqali haydovchilik guvohnomasini birinchi urinishda oling.
                </p>
                <div className="flex flex-wrap gap-4 items-center">
                  <Link href="/login" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">
                    Boshlash
                  </Link>
                  <a href="#download" className="px-8 py-4 bg-white dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                    Ilovani yuklash
                  </a>
                </div>
              </div>
              <div className="relative mt-12 lg:mt-0 flex justify-center items-center">
                {/* Background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-600/20 via-purple-500/10 to-transparent blur-[80px] rounded-full pointer-events-none"></div>

                {/* Full-size Image container */}
                <div className="relative z-10 w-full max-w-md sm:max-w-xl lg:max-w-full lg:scale-110 xl:scale-[1.2] transform origin-center flex justify-center animate-float group">

                  <Image
                    src="/home.png"
                    width={1000}
                    height={1000}
                    alt="Pravachi App Home"
                    className="w-full h-auto object-contain group-hover:scale-[1.02] transition-transform duration-700 drop-shadow-2xl"
                    priority
                  />

                  {/* Decorative badge 1 */}
                  <div className="absolute -right-4  lg:right-0 xl:right-[-10%] top-[15%] bg-white/95 dark:bg-night-800/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl shadow-blue-900/10 border border-slate-100 dark:border-white/5 hidden md:flex items-center gap-3 hover:-translate-y-1 transition-transform cursor-default">
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-green-100 dark:bg-green-500/20">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap uppercase tracking-wider">Natija</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">100% Ishonchli</p>
                    </div>
                  </div>

                  {/* Decorative badge 2 */}
                  <div className="absolute -left-4 lg:left-0 xl:left-4 bottom-1/4 bg-white/95 dark:bg-night-800/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl shadow-blue-900/10 border border-slate-100 dark:border-white/5 hidden md:flex items-center gap-3 hover:-translate-y-1 transition-transform cursor-default">
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-orange-100 dark:bg-orange-500/20">
                      <Star className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap uppercase tracking-wider">Baholash</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">4.9 / 5.0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- WHY US SECTION (Image 1 & 2) --- */}
        <section className="py-24 bg-slate-50 dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="relative">
                <div className="relative z-10 bg-blue-600 rounded-[40px] p-12 overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                  <div className="relative h-[400px] flex items-center justify-center group">
                    <Image src="/mobile_test_bg.png" width={400} height={400} alt="AI Analysis" className="object-contain group-hover:scale-110 transition-transform duration-700 rounded-3xl shadow-2xl" />
                  </div>
                  <div className="absolute bottom-12 right-12 bg-white/90 dark:bg-night-900/90 backdrop-blur p-5 rounded-2xl shadow-2xl border border-white/50 animate-float translate-y-[-20%]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">AI Tahlil</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Real vaqt rejimi</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">Nima uchun <span className="text-blue-600">PravachiUZ?</span></h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 mb-12 leading-relaxed">Zamonaviy texnologiyalar va tajribali mentorlar birgalikda sizga eng samarali o&apos;quv tajribasini taqdim etadi.</p>
                <div className="space-y-8">
                  {[
                    { title: "AI Mentor", desc: "Sun'iy intellekt yordamida xatolar ustida samarali ishlash", icon: <Sparkles className="w-6 h-6" /> },
                    { title: "2000+ Test Savollari", desc: "To'liq yangilangan 2026-yil bazasi", icon: <BookOpen className="w-6 h-6" /> },
                    { title: "24/7 Qo'llab-quvvatlash", desc: "Istalgan vaqtda yordam olish imkoniyati", icon: <MessageCircle className="w-6 h-6" /> }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-6 group">
                      <div className="w-14 h-14 shrink-0 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">{item.icon}</div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{item.title}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- PLATFORM CAPABILITIES (Image 5) --- */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Platforma imkoniyatlari</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto italic">Bizning platformamiz sizga haydovchilik guvohnomasini olish yo&apos;lida barcha zarur vositalarni taqdim etadi.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, idx) => (
                <div key={idx} className="p-8 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[32px] hover:border-blue-500/50 transition-all duration-300 group shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
                  <div className={`w-14 h-14 ${feature.bgColor} dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>{feature.icon}</div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 leading-snug">{feature.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- TESTIMONIALS (Image 4) --- */}
        <section className="py-24 bg-slate-50 dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Mijozlar <span className="text-blue-600">Fikrlari</span></h2>
              <p className="text-slate-500 dark:text-slate-400">Bizning o&apos;quvchilarimizning muvaffaqiyat hikoyalari</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-white/5 p-8 rounded-[32px] border border-slate-100 dark:border-white/10 shadow-sm">
                  <div className="flex gap-1 mb-6">
                    {[...Array(item.rating)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <blockquote className="text-slate-600 dark:text-slate-300 italic mb-8 leading-relaxed">&quot;{item.text}&quot;</blockquote>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center"><User className="w-6 h-6 text-slate-400" /></div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                      <div className="text-xs text-slate-500">{item.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- PRICING SECTION --- */}
        <section id="pricing" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Qulay Tariflar</h2>
              <p className="text-slate-500 dark:text-slate-400">Yashirin to&apos;lovsiz, shaffof narxlar.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { title: "Start", price: "0", period: "", desc: "Platforma bilan tanishish uchun", features: ["100 ta test savoli", "Asosiy qoidalar", "AI Mentor yo'q"], cta: "Bepul Boshlash", featured: false },
                { title: "Pro Avto", price: "49k", period: "/oy", desc: "Kafolatlangan natija uchun", features: ["Barcha 2000+ savollar", "AI Mentor tahlili", "Imtihon Simulyatori", "Video Darsliklar"], cta: "A'zo Bo'lish", featured: true },
                { title: "Premium", price: "99k", period: "/3 oy", desc: "To'liq kurs va ustoz", features: ["Pro tarifining barchasi", "Jonli Mentor yordami", "Sertifikat"], cta: "Tanlash", featured: false }
              ].map((tier, idx) => (
                <div key={idx} className={`p-8 rounded-[40px] border shadow-xl transition-all duration-300 ${tier.featured ? 'border-blue-600 dark:border-blue-500 ring-4 ring-blue-600/10 scale-105' : 'border-slate-100 dark:border-white/10 hover:border-blue-500/30'}`}>
                  <h3 className={`text-xl font-bold mb-4 ${tier.featured ? 'text-blue-600' : 'text-slate-900 dark:text-white'}`}>{tier.title}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">{tier.price} so&apos;m</span>
                    <span className="text-slate-500 text-sm font-medium">{tier.period}</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-8">{tier.desc}</p>
                  <ul className="space-y-4 mb-10">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300"><Check className="w-5 h-5 text-green-500 shrink-0" />{f}</li>
                    ))}
                  </ul>
                  <button className={`w-full py-4 rounded-2xl font-bold transition-all ${tier.featured ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700' : 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-200'}`}>{tier.cta}</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- DOWNLOAD SECTION --- */}
        <section id="download" className="py-24 bg-blue-600 relative overflow-hidden mx-4 sm:mx-8 rounded-[40px] mb-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Mobilda O&apos;rganish Qulayroq</h2>
            <p className="text-blue-100 text-lg mb-12 max-w-2xl mx-auto">Ilovani yuklab oling va istalgan joyda, istalgan vaqtda tayyorgarlikni davom ettiring.</p>
            <div className="flex justify-center">
              <div className="flex bg-black rounded-[24px] items-center p-1.5 shadow-2xl border border-white/10">
                <a href="https://play.google.com/store/apps/details?id=uz.sheronov.avtotest" target="_blank" rel="noopener noreferrer" className="px-6 py-3 hover:opacity-80 transition-all">
                  <Image src="/imgage/android@2x.png" width={160} height={48} alt="Google Play" className="h-10 w-auto object-contain" />
                </a>
                <div className="w-px h-10 bg-white/20"></div>
                <a href="https://apps.apple.com/us/app/pravachi-avtotest/id6757332865" target="_blank" rel="noopener noreferrer" className="px-6 py-3 hover:opacity-80 transition-all">
                  <Image src="/imgage/ios@2x.png" width={160} height={48} alt="App Store" className="h-10 w-auto object-contain" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="bg-white dark:bg-night-950 pt-20 pb-10 border-t border-slate-100 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <Image
                    src="/imgage/avtotest-logo.png"
                    alt="AvtoTest Logo"
                    width={60}
                    height={60}
                    className="h-10 w-auto object-contain"
                  />
                  <span className="font-heading font-bold text-2xl text-slate-900 dark:text-white tracking-tight">Pravachi</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">Kelajak haydovchilari uchun xavfsiz va aqlli o&apos;quv platformasi. Biz bilan imtihonlarni ishonch bilan topshirasiz.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-6">Platforma</h4>
                <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                  {['Biz haqimizda', 'Tariflar', 'Mentorlar', 'Blog'].map(link => <li key={link}><a href="#" className="hover:text-blue-600 transition-colors">{link}</a></li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-6">Bog&apos;lanish</h4>
                <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                  {['Savol-javoblar', 'Qo\'llab-quvvatlash', 'Maxfiylik siyosati'].map(link => <li key={link}><a href="#" className="hover:text-blue-600 transition-colors">{link}</a></li>)}
                  <li><span className="text-blue-600 font-bold">+998 90 123 45 67</span></li>
                </ul>
              </div>
            </div>
            <div className="pt-10 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
              <p>© 2026 Pravachi Pro. Barcha huquqlar himoyalangan.</p>
              <div className="flex gap-8"><a href="#" className="hover:text-slate-600 transition-colors">Terms</a><a href="#" className="hover:text-slate-600 transition-colors">Privacy</a></div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}