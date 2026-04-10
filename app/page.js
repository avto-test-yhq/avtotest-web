'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext'
import ThemeToggle from '@/components/ThemeToggle'
import {
  Menu, X, Check, Star, Sparkles, BookOpen,
  MessageCircle, BarChart3, LocateFixed, LogIn,
  Apple, Play, User, Swords, Database, Zap,
  GraduationCap, MessageSquareText, ChevronDown
} from 'lucide-react'
import { translations } from '@/utils/translations'

export default function Home() {
  const { theme } = useTheme()
  const darkMode = theme === 'dark'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  const languages = [
    { code: 'uz-latn', label: "O'zbekcha", subLabel: 'Uzbek (Latin)', flag: '🇺🇿' },
    { code: 'uz-cyrl', label: 'Ўзбекча', subLabel: 'Uzbek (Cyrillic)', flag: '🇺🇿' },
    { code: 'ru', label: 'Русский', subLabel: 'Russian', flag: '🇷🇺' },
    { code: 'kaa', label: 'Qaraqalpaqsha', subLabel: 'Karakalpak', flag: '🇺🇿' },
  ]
  const [selectedLang, setSelectedLang] = useState(languages[0])

  const t = (key) => translations[selectedLang.code]?.[key] || translations['uz-latn'][key] || key;

  const navLinks = [
    { label: t('nav_why'), href: '#why-us' },
    { label: t('nav_features'), href: '#features' },
    { label: t('nav_testimonials'), href: '#testimonials' },
    { label: t('nav_pricing'), href: '#pricing' }
  ]

  const features = [
    {
      title: t('feat_1_title'),
      desc: t('feat_1_desc'),
      icon: <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      bgColor: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600",
      glowColor: "group-hover:shadow-blue-500/10"
    },
    {
      title: t('feat_2_title'),
      desc: t('feat_2_desc'),
      icon: <MessageSquareText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600",
      glowColor: "group-hover:shadow-emerald-500/10"
    },
    {
      title: t('feat_3_title'),
      desc: t('feat_3_desc'),
      icon: <Database className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
      bgColor: "bg-rose-50 dark:bg-rose-500/10",
      iconColor: "text-rose-600",
      glowColor: "group-hover:shadow-rose-500/10"
    },
    {
      title: t('feat_4_title'),
      desc: t('feat_4_desc'),
      icon: <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      bgColor: "bg-amber-50 dark:bg-amber-500/10",
      iconColor: "text-amber-600",
      glowColor: "group-hover:shadow-amber-500/10"
    },
    {
      title: t('feat_5_title'),
      desc: t('feat_5_desc'),
      icon: <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      bgColor: "bg-indigo-50 dark:bg-indigo-500/10",
      iconColor: "text-indigo-600",
      glowColor: "group-hover:shadow-indigo-500/10"
    }
  ]

  const testimonials = [
    {
      name: "Azizbek Karimov",
      role: t('test_role1'),
      text: '"PravachiUZ orqali haydovchilik guvohnomasini 1-urinishda oldim. AI mentor juda foydali ekan, xatolarni tahlil qilib, qaysi mavzularda kuchli ekanimni ko\'rsatdi."',
      rating: 5,
    },
    {
      name: "Nilufar Rahimova",
      role: t('test_role2'),
      text: '"Darslar juda tushunarli va qiziqarli. Video darsliklar orqali murakkab qoidalarni oson o\'zlashtirdim. Jonli mentorlar har doim yordam berishdi."',
      rating: 5,
    },
    {
      name: "Rustam Toshev",
      role: t('test_role3'),
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

              <div className="hidden lg:flex items-center space-x-8 text-sm font-bold text-slate-600 dark:text-slate-300">
                {navLinks.map((item) => (
                  <a key={item.href} href={item.href} className="hover:text-blue-600 dark:hover:text-white transition-colors">{item.label}</a>
                ))}
              </div>

              <div className="flex items-center space-x-3">
                {/* Language Selector */}
                <div className="relative">
                  <button
                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                    onBlur={() => setTimeout(() => setLangMenuOpen(false), 200)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-700 dark:text-slate-300"
                  >
                    <span className="text-lg">{selectedLang.flag}</span>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>

                  {langMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-night-900 border border-slate-100 dark:border-white/10 rounded-[20px] shadow-2xl xl:shadow-blue-900/10 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setSelectedLang(lang)
                            setLangMenuOpen(false)
                          }}
                          className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${selectedLang.code === lang.code
                            ? 'bg-blue-50 dark:bg-blue-500/10'
                            : 'hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{lang.flag}</span>
                            <div className="text-left">
                              <div className={`text-sm font-bold ${selectedLang.code === lang.code ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                                {lang.label}
                              </div>
                              <div className="text-[11px] text-slate-500">{lang.subLabel}</div>
                            </div>
                          </div>
                          {selectedLang.code === lang.code && <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <ThemeToggle className="hover:bg-slate-100 dark:hover:bg-white/5" />
                <Link href="/login" className="hidden sm:flex bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all items-center gap-2 group">
                  <LogIn className="w-4 h-4 group-hover:text-white" />
                  {t('login')}
                </Link>
                <Link href="/login?mode=register" className="hidden sm:flex bg-emerald-500 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 items-center gap-2 group">
                  <User className="w-4 h-4" />
                  {t('register')}
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
              {navLinks.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-slate-700 dark:text-slate-300">{item.label}</a>
              ))}
              <Link href="/login" className="block w-full py-4 bg-blue-600 text-white text-center rounded-2xl font-bold">{t('login')}</Link>
            </div>
          )}
        </nav>

        {/* --- HERO SECTION --- */}
        <section className="relative pt-32 lg:pt-48 pb-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div data-aos="fade-right" data-aos-duration="800">
                <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{t('hero_badge')}</span>
                </div>
                <h1 className="font-heading text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
                  {t('hero_title')}
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg leading-relaxed">
                  {t('hero_desc')}
                </p>
                <div className="flex flex-wrap gap-4 items-center">
                  <Link href="/login" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">
                    {t('hero_btn_start')}
                  </Link>
                  <a href="#download" className="px-8 py-4 bg-white dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                    {t('hero_btn_download')}
                  </a>
                </div>
              </div>
              <div className="relative mt-12 lg:mt-0 flex justify-center items-center" data-aos="fade-left" data-aos-duration="800" data-aos-delay="100">
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
                  <div className="absolute -right-4 lg:right-0 xl:right-[-10%] top-[15%] bg-white/95 dark:bg-night-800/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl shadow-blue-900/10 border border-slate-100 dark:border-white/5 hidden md:flex items-center gap-3 hover:-translate-y-1 transition-transform cursor-default">
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-green-100 dark:bg-green-500/20">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap uppercase tracking-wider">{t('hero_stats_result')}</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">{t('hero_stats_reliable')}</p>
                    </div>
                  </div>

                  {/* Decorative badge 2 */}
                  <div className="absolute -left-4 lg:left-0 xl:left-4 bottom-1/4 bg-white/95 dark:bg-night-800/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl shadow-blue-900/10 border border-slate-100 dark:border-white/5 hidden md:flex items-center gap-3 hover:-translate-y-1 transition-transform cursor-default">
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-orange-100 dark:bg-orange-500/20">
                      <Star className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap uppercase tracking-wider">{t('hero_stats_rating')}</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">4.9 / 5.0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- WHY US SECTION --- */}
        <section id="why-us" className="py-24 bg-slate-50 dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="relative" data-aos="fade-right" data-aos-duration="700">
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
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{t('why_ai_analysis')}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{t('why_realtime')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div data-aos="fade-left" data-aos-duration="700" data-aos-delay="100">
                <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">{t('why_title')}</h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 mb-12 leading-relaxed">{t('why_desc')}</p>
                <div className="space-y-8">
                  {[
                    { title: t('why_item1_title'), desc: t('why_item1_desc'), icon: <Sparkles className="w-6 h-6" /> },
                    { title: t('why_item2_title'), desc: t('why_item2_desc'), icon: <BookOpen className="w-6 h-6" /> },
                    { title: t('why_item3_title'), desc: t('why_item3_desc'), icon: <MessageCircle className="w-6 h-6" /> }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-6 group" data-aos="fade-up" data-aos-delay={idx * 100}>
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

        {/* --- PLATFORM CAPABILITIES --- */}
        <section id="features" className="py-32 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03),transparent_70%)] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20" data-aos="fade-up" data-aos-duration="600">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 mb-6">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{t('feat_badge')}</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">{t('feat_title')}</h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                {t('feat_desc')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  data-aos="fade-up"
                  data-aos-delay={idx * 80}
                  data-aos-duration="600"
                  className={`group relative p-10 bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/10 rounded-[40px] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${feature.glowColor} backdrop-blur-sm`}
                >
                  <div className={`relative w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm group-hover:shadow-md`}>
                    <div className="relative z-10">
                      {feature.icon}
                    </div>
                  </div>

                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h4>

                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                    {feature.desc}
                  </p>

                  <div className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    {t('feat_btn')} <Check className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- TESTIMONIALS --- */}
        <section id="testimonials" className="py-24 bg-slate-50 dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-aos="fade-up" data-aos-duration="600">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('test_title')}</h2>
              <p className="text-slate-500 dark:text-slate-400">{t('test_desc')}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((item, idx) => (
                <div key={idx} data-aos="fade-up" data-aos-delay={idx * 100} data-aos-duration="600" className="bg-white dark:bg-white/5 p-8 rounded-[32px] border border-slate-100 dark:border-white/10 shadow-sm hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex gap-1 mb-6">
                    {[...Array(item.rating)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <blockquote className="text-slate-600 dark:text-slate-300 italic mb-8 leading-relaxed">{item.text}</blockquote>
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
        <section id="pricing" className="py-32 bg-slate-50/50 dark:bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20" data-aos="fade-up" data-aos-duration="600">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 mb-6">
                <Star className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{t('price_badge')}</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">{t('price_title')}</h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                {t('price_desc')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
              {[
                {
                  title: "Start",
                  price: "0",
                  period: "",
                  desc: t('price_1_desc'),
                  features: [t('price_1_f1'), t('price_1_f2'), t('price_1_f3'), t('price_1_f4')],
                  cta: t('price_1_btn'),
                  featured: false
                },
                {
                  title: "Pro Avto",
                  price: "39 000",
                  period: t('price_mo'),
                  desc: t('price_2_desc'),
                  features: [t('price_2_f1'), t('price_2_f2'), t('price_2_f3'), t('price_2_f4'), t('price_2_f5')],
                  cta: t('price_2_btn'),
                  featured: true
                },
                {
                  title: "Premium",
                  price: "59 000",
                  period: t('price_3mo'),
                  desc: t('price_3_desc'),
                  features: [t('price_3_f1'), t('price_3_f2'), t('price_3_f3'), t('price_3_f4')],
                  cta: t('price_3_btn'),
                  featured: false
                }
              ].map((tier, idx) => (
                <div
                  key={idx}
                  data-aos="fade-up"
                  data-aos-delay={idx * 100}
                  data-aos-duration="600"
                  className={`relative p-10 rounded-[48px] border transition-all duration-500 hover:-translate-y-3 ${tier.featured
                    ? 'bg-white dark:bg-night-900 border-blue-600 dark:border-blue-500 shadow-2xl shadow-blue-500/20 lg:scale-110 z-10'
                    : 'bg-white/50 dark:bg-white/[0.03] border-slate-100 dark:border-white/10 hover:border-blue-500/30'
                    }`}
                >
                  {tier.featured && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-6 py-2 rounded-full shadow-lg whitespace-nowrap">
                      {t('price_popular')}
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className={`text-xl font-bold mb-4 ${tier.featured ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>{tier.title}</h3>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-5xl font-extrabold text-slate-900 dark:text-white">{tier.price}</span>
                      <span className="text-slate-500 font-medium whitespace-nowrap">{t('price_currency')}{tier.period}</span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{tier.desc}</p>
                  </div>

                  <div className="w-full h-px bg-slate-100 dark:bg-white/10 mb-8"></div>

                  <ul className="space-y-5 mb-10">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${tier.featured ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
                          <Check className="w-3 h-3" />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button className={`w-full py-5 rounded-[24px] font-bold transition-all duration-300 ${tier.featured
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-600/40 scale-[1.02]'
                    : 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20'
                    }`}>
                    {tier.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- DOWNLOAD SECTION --- */}
        <section id="download" className="relative mx-4 sm:mx-8 mb-24">
          {/* Background card - overflow hidden so mobile is contained */}
          <div className="absolute inset-0 rounded-[40px] overflow-hidden bg-gradient-to-br from-[#FFF8EE] via-[#E6FAFA] to-[#F1E8FD] dark:from-slate-900 dark:via-sky-950 dark:to-slate-900 border border-slate-100 dark:border-white/5">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

              {/* LEFT: Text + Buttons */}
              <div className="text-center lg:text-left py-12 lg:py-24" data-aos="fade-right" data-aos-duration="700">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 dark:bg-blue-500/10 border border-blue-600/20 dark:border-blue-500/20 mb-6 backdrop-blur-md">
                  <Apple className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest">{t('dl_badge')}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#202A44] dark:text-white mb-5 leading-tight">
                  {t('dl_title').split('\n')[0]}{' '}
                  <span className="text-blue-600">{t('dl_title').split('\n')[1]}</span>
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                  {t('dl_desc')}
                </p>
                <div className="flex flex-row flex-wrap justify-center lg:justify-start gap-3 sm:gap-4">
                  <a href="https://apps.apple.com/us/app/pravachi-avtotest/id6757332865" target="_blank" rel="noopener noreferrer" className="hover:-translate-y-1 transition-transform">
                    <Image src="/button-appstore.svg" width={160} height={50} alt="App Store" className="h-12 sm:h-14 w-auto object-contain drop-shadow-md" />
                  </a>
                  <a href="https://play.google.com/store/apps/details?id=uz.sheronov.avtotest" target="_blank" rel="noopener noreferrer" className="hover:-translate-y-1 transition-transform">
                    <Image src="/button-google-play.svg" width={160} height={50} alt="Google Play" className="h-12 sm:h-14 w-auto object-contain drop-shadow-md" />
                  </a>
                </div>

                {/* Mobile-only image — shown below buttons, hidden on desktop */}
                <div className="mt-10 flex justify-center lg:hidden" data-aos="fade-up" data-aos-delay="100">
                  <div className="relative w-[85%] max-w-sm">
                    <div className="absolute inset-0 -bottom-4 bg-blue-400/10 dark:bg-blue-500/15 blur-3xl rounded-full"></div>
                    <Image
                      src="/devices6.png"
                      width={600}
                      height={600}
                      alt="Pravachi Mobile App"
                      className="relative w-full h-auto object-contain drop-shadow-2xl"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT: Desktop-only large overflowing image */}
              <div className="relative hidden lg:flex justify-center items-center h-full z-20 pointer-events-none">
                <div className="relative w-[140%] max-w-3xl -right-[-5%] transform hover:-translate-y-2 transition-transform duration-700 pointer-events-auto">
                  <Image
                    src="/devices6.png"
                    width={800}
                    height={800}
                    alt="Pravachi Mobile App"
                    className="w-full h-auto object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
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